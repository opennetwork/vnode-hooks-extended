import { Fragment, FragmentVNode, isFragmentVNode, SourceReference, VNode } from "@opennetwork/vnode";
import { IsFunction, isReferencedVNode, ReferenceIsResult } from "./is";

export const MutationFragment = Symbol("Mutation Fragment");

export type MutationIs<ReferencedVNode extends VNode = VNode> = IsFunction<VNode, ReferencedVNode>;
export interface MutationOn<ReferencedVNode extends VNode = VNode, MutatedVNode extends VNode = VNode> {
  (node: ReferencedVNode): MutatedVNode | Promise<MutatedVNode>;
}

// Right now child will be the only mode for mutation, but this allows further expansion later on
export type MutationMode = "child";

export interface MutationFragmentVNode<ReferencedVNode extends VNode = VNode, MutatedVNode extends VNode = VNode> extends FragmentVNode {
  source: typeof MutationFragment;
  options: {
    is: MutationIs<ReferencedVNode>;
    mutate: MutationOn<ReferencedVNode, MutatedVNode>;
    mode: MutationMode
  };
}

export function isMutationFragmentVNode(node: VNode): node is MutationFragmentVNode<VNode> {
  function isMutationFragmentVNodeLike(node: VNode): node is FragmentVNode & { options: { is?: unknown, mutate?: unknown } } {
    return isFragmentVNode(node) && !!node.options;
  }
  return (
    isMutationFragmentVNodeLike(node) &&
    typeof node.options.is === "function" &&
    typeof node.options.mutate === "function"
  );
}

export function isMutationFragmentVNodeForVNode<ReferencedVNode extends VNode>(node: VNode, referencedNode: ReferencedVNode): node is MutationFragmentVNode<ReferencedVNode> {
  return (
    isMutationFragmentVNode(node) &&
    node.options.is(referencedNode)
  );
}

export function mutate<MutatedVNode extends VNode>(mutate: MutationOn<VNode, MutatedVNode>, mode?: MutationMode): MutationFragmentVNode<VNode, MutatedVNode>;
export function mutate<S extends SourceReference, MutatedVNode extends VNode>(is: S, mutate: MutationOn<ReferenceIsResult<S>, MutatedVNode>, mode?: MutationMode): MutationFragmentVNode<ReferenceIsResult<S>, MutatedVNode>;
export function mutate<ReferencedVNode extends VNode, MutatedVNode extends VNode>(is: MutationIs<ReferencedVNode>, mutate: MutationOn<ReferencedVNode, MutatedVNode>, mode?: MutationMode): MutationFragmentVNode<ReferencedVNode, MutatedVNode>;
export function mutate<ReferencedVNode extends VNode = VNode, MutatedVNode extends VNode = VNode>(...args: any[]): MutationFragmentVNode<ReferencedVNode, VNode> {

  if (args.length >= 2 && typeof args[0] === "function" && typeof args[1] === "function") {
    return resolvedMutate(args[0], args[1], getMode(args[2]));
  }

  if (args.length >= 2 && typeof args[0] === "string" && typeof args[1] === "function") {
    return resolvedMutate(isReferencedVNode.bind(undefined, args[0]), args[1], getMode(args[2]));
  }

  if (args.length >= 1 && typeof args[0] === "function") {
    return resolvedMutate((node): node is ReferencedVNode => true, args[0], getMode(args[1]));
  }

  throw new Error("Unexpected arguments");

  function getMode(value: unknown): MutationMode {
    if (value === "child") {
      return value;
    }
    return "child";
  }

  function resolvedMutate<ReferencedVNode extends VNode, MutatedVNode extends VNode>(isFn: MutationIs<ReferencedVNode>, mutateFn: MutationOn<ReferencedVNode, MutatedVNode>, mode: MutationMode): MutationFragmentVNode<ReferencedVNode, MutatedVNode> {
    return {
      reference: Fragment,
      source: MutationFragment,
      options: {
        is: isFn,
        mutate: mutateFn,
        mode
      }
    };
  }
}
