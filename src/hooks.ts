import { hooks, VNodeHook, VNodeHooks, VNodeChildrenHooks } from "@opennetwork/vnode-hooks";
import { Fragment, FragmentVNode, VNode } from "@opennetwork/vnode";
import { isMutationFragmentVNode, isMutationFragmentVNodeForVNode, MutationFragmentVNode } from "./mutation";
import { isReferenceFragmentVNode, isReferenceFragmentVNodeForVNode, ReferenceFragmentVNode } from "./reference";
import { asyncHooks } from "iterable";

export function hookFragments(fragments: FragmentVNode[] = []): VNodeHook {
  return hooks(fragmentHooks(fragments), fragmentChildrenHooks(fragments));
}

function fragmentHooks(fragments: FragmentVNode[]): VNodeHooks & { yield: unknown } {
  return {
    yield(node) {
      if (isMutationFragmentVNode(node) || isReferenceFragmentVNode(node)) {
        if (!node.children) {
          // We will never utilise the fragments, so we can ignore them for now
          return { reference: Fragment };
        }
        const nextHook = asyncHooks(fragmentChildrenHooks(fragments.concat(node)));
        return {
          reference: Fragment,
          children: nextHook(node.children)
        };
      }
      // Do something with our
      return run(node, fragments);
    }
  };
}

function fragmentChildrenHooks(fragments: FragmentVNode[]): VNodeChildrenHooks & { yield: unknown } {
  return {
    yield(children) {
      // Will "just work", in this case we have a list of children, rather than updates for the same VNode
      return hookFragments(fragments)(children);
    }
  };
}

async function run<V extends VNode = VNode>(node: V, fragments: FragmentVNode[]): Promise<VNode> {
  if (!fragments.length) {
    return node;
  }

  const mutators = fragments.filter(isMutationFragmentVNode);
  const references = fragments.filter(isReferenceFragmentVNode);

  // Reference before we mutate
  await reference(node, references);

  const mutated = await mutate(node, mutators);

  // If _any_ change is made then we will re-invoke our references
  // This is a very important point that we may invoke reference fragments multiple times with the same vnode
  //
  // The implementation will need to track whether the reference was found before
  //
  // Mutators should only be returning a new node instance if they have a change!
  if (mutated !== node) {
    await reference(mutated, references);
  }

  return mutated;

  function reference<V extends VNode>(node: V, fragments: ReferenceFragmentVNode[]) {
    // Invoke all at once
    return Promise.all(
      fragments
        .filter(
          (fragment): fragment is ReferenceFragmentVNode<V> => isReferenceFragmentVNodeForVNode(fragment, node)
        )
        .map(fragment => fragment.options.on(node))
    );
  }

  async function mutate(node: VNode, mutators: MutationFragmentVNode[]): Promise<VNode> {
    if (!mutators.length) {
      return node;
    }
    const currentMutators = mutators.slice();
    const nextMutator = currentMutators.shift();
    if (!isMutationFragmentVNodeForVNode(nextMutator, node)) {
      return mutate(node, currentMutators);
    }
    const nextValue = await nextMutator.options.mutate(node);
    return mutate(nextValue, mutators);
  }
}
