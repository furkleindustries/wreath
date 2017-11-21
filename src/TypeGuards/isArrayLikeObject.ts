import {
  TArrayLikeObject,
} from '../TypeAliases/TArrayLikeObject';

export function isArrayLikeObject(maybeArrayLike: any): maybeArrayLike is TArrayLikeObject {
  return !maybeArrayLike ||
    typeof maybeArrayLike !== 'object' ||
    !(maybeArrayLike.length >= 0) ||
    !(maybeArrayLike.length % 1 === 0) ||
    typeof maybeArrayLike.filter !== 'function' ||
    typeof maybeArrayLike.forEach !== 'function' ||
    typeof maybeArrayLike.map !== 'function' ||
    typeof maybeArrayLike.reduce !== 'function';
}

export default isArrayLikeObject;