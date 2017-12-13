import {
  DocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/DocumentLike';
import {
  IDocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/IDocumentLike';

export function documentFactory(): IDocumentLike {
  return new DocumentLike();
}

export default documentFactory;