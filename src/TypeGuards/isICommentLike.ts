import {
  ICommentLike,
} from '../NodeLike/CharacterDataLike/CommentLike/ICommentLike';

export function isICommentLike(node: any): node is ICommentLike {
  return node && node.nodeType === 8;
}

export default isICommentLike;