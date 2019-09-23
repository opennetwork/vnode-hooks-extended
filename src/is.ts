import { SourceReference, VNode } from "@opennetwork/vnode";

export interface IsFunction<Given, Value extends Given> {
  (given: Given): given is Value;
}

export type ReferenceIsResult<S extends SourceReference> = VNode & { reference: S };

export function isReferencedVNode<S extends SourceReference>(given: S, value: VNode): value is ReferenceIsResult<S> {
  return value.reference === given;
}
