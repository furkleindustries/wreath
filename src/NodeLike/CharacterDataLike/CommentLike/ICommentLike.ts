import {
  ICharacterDataLike,
} from '../ICharacterDataLike';

export interface ICommentLike extends ICharacterDataLike {
  cloneNode(deep?: boolean): ICommentLike;
}

export default ICommentLike;