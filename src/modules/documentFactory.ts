import {
  DocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/DocumentLike';
import {
  IDocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/IDocumentLike';

export function documentFactory(): IDocumentLike {
  // @ts-ignore
  if (typeof document === 'object' && document) {
    const deepCopy = false;
    // @ts-ignore
    return document.cloneNode(deepCopy);
  } else {
    return new DocumentLike();
  }
}

export default documentFactory;