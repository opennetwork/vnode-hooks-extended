import { FragmentVNode, isFragmentVNode, VNode } from "@opennetwork/vnode";

export const IsolatedFragment = Symbol("Isolated Fragment");

export interface IsolatedFragmentVNode extends FragmentVNode {
  source: typeof IsolatedFragment;
}

export function isIsolatedFragmentVNode(node: VNode): node is IsolatedFragmentVNode {
  return (
    isFragmentVNode(node) &&
    node.source === IsolatedFragment
  );
}
