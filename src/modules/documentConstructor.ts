import {
  DocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/DocumentLike';
import {
  IDocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/IDocumentLike';

export function documentGetter(): IDocumentLike {
  // @ts-ignore
  if (typeof document === 'function') {
    // @ts-ignore
    return document;
  } else {
    return new DocumentLike();
  }
}

export default documentGetter;