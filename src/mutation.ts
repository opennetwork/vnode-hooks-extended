import {
  createNode,
  isSourceReference,
  SourceReference,
  TokenVNodeBase,
  VNode,
  createToken
} from "@opennetwork/vnode";
import { IsFunction, isReferencedVNode, ReferenceIsResult } from "./is";

export type MutationIs<ReferencedVNode extends VNode = VNode> = IsFunction<VNode, ReferencedVNode> | SourceReference;
export interface MutationOn<ReferencedVNode extends VNode = VNode, MutatedVNode extends VNode = VNode> {
  (node: ReferencedVNode): MutatedVNode | Promise<MutatedVNode>;
}

export const MutationSymbol = Symbol("Mutation");
export interface MutationOptions<ReferencedVNode extends VNode = VNode, MutatedVNode extends VNode = VNode> {
  is?: MutationIs<ReferencedVNode>;
  mutate: MutationOn<ReferencedVNode, MutatedVNode>;
}
export type MutationToken<ReferencedVNode extends VNode = VNode, MutatedVNode extends VNode = VNode> = TokenVNodeBase<typeof MutationSymbol, MutationOptions<ReferencedVNode, MutatedVNode>>;
export const Mutation: MutationToken = createToken(MutationSymbol);
