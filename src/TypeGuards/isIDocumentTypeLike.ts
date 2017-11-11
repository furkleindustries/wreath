import {
  IDocumentTypeLike,
} from '../NodeLike/DocumentTypeLike/IDocumentTypeLike';

export function isIDocumentTypeLike(node: any): node is IDocumentTypeLike {
  return node && node.nodeType === 10;
}

export default isIDocumentTypeLike;