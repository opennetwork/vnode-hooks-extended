import {
  Fragment,
  FragmentVNode,
  isFragmentVNode,
  isSourceReference,
  SourceReference,
  VNode
} from "@opennetwork/vnode";
import { IsFunction, ReferenceIsResult, isReferencedVNode } from "./is";

export type ReferenceIs<ReferencedVNode extends VNode = VNode> = IsFunction<VNode, ReferencedVNode>;
export interface ReferenceOn<ReferencedVNode extends VNode = VNode> {
  (node: ReferencedVNode): void | Promise<void>;
}

export const ReferenceFragment = Symbol("Reference Fragment");

// Right now child will be the only mode for reference, but this allows further expansion later on
export type ReferenceMode = "child";

export interface ReferenceFragmentVNode<ReferencedVNode extends VNode = VNode> extends FragmentVNode {
  source: typeof ReferenceFragment;
  options: {
    is: ReferenceIs<ReferencedVNode>;
    on: ReferenceOn<ReferencedVNode>;
    mode: ReferenceMode
  };
}

export function isReferenceFragmentVNode(node: VNode): node is ReferenceFragmentVNode<VNode> {
  function isReferenceFragmentVNodeLike(node: VNode): node is FragmentVNode & { options: { is?: unknown, on?: unknown } } {
    return isFragmentVNode(node) && !!node.options;
  }
  return (
    isReferenceFragmentVNodeLike(node) &&
    typeof node.options.is === "function" &&
    typeof node.options.on === "function"
  );
}

export function isReferenceFragmentVNodeForVNode<ReferencedVNode extends VNode>(node: VNode, referencedNode: ReferencedVNode): node is ReferenceFragmentVNode<ReferencedVNode> {
  return (
    isReferenceFragmentVNode(node) &&
    node.options.is(referencedNode)
  );
}

// export type OnParameters<ReferencedVNode extends VNode, S extends SourceReference> =
//   | [ReferenceOn<VNode>]
//   | [ReferenceOn<VNode>, ReferenceFrom | undefined]
//   | [S, ReferenceOn<ReferenceIsResult<S>>]
//   | [S, ReferenceOn<ReferenceIsResult<S>>, ReferenceFrom | undefined]
//   | [ReferenceIs<ReferencedVNode>, ReferenceOn<ReferencedVNode>]
//   | [ReferenceIs<ReferencedVNode>, ReferenceOn<ReferencedVNode>, ReferenceFrom | undefined];

export function on(onFn: ReferenceOn<VNode>, mode?: ReferenceMode): ReferenceFragmentVNode<VNode>;
export function on<S extends SourceReference>(is: S, onFn: ReferenceOn<ReferenceIsResult<S>>, mode?: ReferenceMode): ReferenceFragmentVNode<ReferenceIsResult<S>>;
export function on<ReferencedVNode extends VNode>(isFn: ReferenceIs<ReferencedVNode>, onFn: ReferenceOn<ReferencedVNode>, mode?: ReferenceMode): ReferenceFragmentVNode<ReferencedVNode>;
export function on<ReferencedVNode extends VNode = VNode, S extends SourceReference = SourceReference>(...args: any[]): ReferenceFragmentVNode<ReferencedVNode> {

  if (args.length >= 2 && typeof args[0] === "function" && typeof args[1] === "function") {
    return resolvedOn(args[0], args[1], getMode(args[2]));
  }

  if (args.length >= 2 && isSourceReference(args[0]) && typeof args[1] === "function") {
    return resolvedOn(isReferencedVNode.bind(undefined, args[0]), args[1], getMode(args[2]));
  }

  if (args.length >= 1 && typeof args[0] === "function") {
    return resolvedOn((node): node is ReferencedVNode => true, args[0], getMode(args[1]));
  }

  throw new Error("Unexpected arguments");

  function getMode(value: unknown): ReferenceMode {
    if (value === "child") {
      return value;
    }
    return "child";
  }

  function resolvedOn<ReferencedVNode extends VNode>(isFn: ReferenceIs<ReferencedVNode>, onFn: ReferenceOn<ReferencedVNode>, mode: ReferenceMode): ReferenceFragmentVNode<ReferencedVNode> {
    return {
      reference: Fragment,
      source: ReferenceFragment,
      options: {
        is: isFn,
        on: onFn,
        mode
      }
    };
  }
}
