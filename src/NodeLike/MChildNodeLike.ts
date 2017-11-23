import {
  IChildNodeLike,
} from './IChildNodeLike';
import {
  INonDocumentTypeChildNodeLike,
 } from './INonDocumentTypeChildNodeLike';
import {
  isIChildNodeLike,
} from '../TypeGuards/isIChildNodeLike';
import {
  isIDocumentLike,
} from '../TypeGuards/isIDocumentLike';
import {
  isIParentNodeLike,
} from '../TypeGuards/isIParentNodeLike';
import {
  TConstructor,
} from '../TypeAliases/TConstructor';
import {
  TStringMap,
} from '../TypeAliases/TStringMap';

export const strings: TStringMap = {
  BEFORE_THIS_INVALID:
    'The object implementing the MChildNodeLike mixin does not pass the ' +
    'isIChildNodeLike type guard.',

  BEFORE_THIS_OWNER_DOCUMENT_INVALID:
    'The object implementing the MChildNodeLike mixin does not have an ' +
    'ownerDocument property which meets the isIDocumentLike type guard.',

  BEFORE_THIS_PARENT_NODE_INVALID:
    'The object implementing the MChildNodeLike mixin does not have a ' +
    'parentNode property which meets the isIParentNodeLike type guard.',

  AFTER_THIS_INVALID:
    'The object implementing the MChildNodeLike mixin does not pass the ' +
    'isIChildNodeLike type guard.',

  AFTER_THIS_OWNER_DOCUMENT_INVALID:
    'The object implementing the MChildNodeLike mixin does not have an ' +
    'ownerDocument property which meets the isIDocumentLike type guard.',

  AFTER_THIS_PARENT_NODE_INVALID:
    'The object implementing the MChildNodeLike mixin does not have a ' +
    'parentNode property which meets the isIParentNodeLike type guard.',

  REPLACE_WITH_THIS_INVALID:
    'The object implementing the MChildNodeLike mixin does not pass the ' +
    'isIChildNodeLike type guard.',

  REPLACE_WITH_THIS_OWNER_DOCUMENT_INVALID:
    'The object implementing the MChildNodeLike mixin does not have an ' +
    'ownerDocument property which meets the isIDocumentLike type guard.',

  REPLACE_WITH_THIS_PARENT_NODE_INVALID:
    'The object implementing the MChildNodeLike mixin does not have a ' +
    'parentNode property which meets the isIParentNodeLike type guard.',

  REMOVE_THIS_INVALID:
    'The object implementing the MChildNodeLike mixin does not pass the ' +
    'isIChildNodeLike type guard.',

  REMOVE_THIS_PARENT_NODE_INVALID:
    'The object implementing the MChildNodeLike mixin does not have a ' +
    'parentNode property which meets the isIParentNodeLike type guard.',
};

export function MChildNodeLike<T extends TConstructor<object>>(Base: T) {
  class MChildNodeLike extends Base {
    before(...contents: Array<IChildNodeLike | string>): void {
      if (!isIChildNodeLike(this)) {
        throw new Error(strings.BEFORE_THIS_INVALID);
      }

      const _this: IChildNodeLike = this;
      
      const ownerDocument = _this.ownerDocument;
      if (!isIDocumentLike(ownerDocument)) {
        throw new Error(strings.BEFORE_THIS_OWNER_DOCUMENT_INVALID);
      }
      
      const parent = _this.parentNode;
      if (!isIParentNodeLike(parent)) {
        throw new Error(strings.BEFORE_THIS_PARENT_NODE_INVALID);
      }

      contents.forEach((value: IChildNodeLike | string) => {
        let newNode = value;
        if (typeof value === 'string') {
          newNode = ownerDocument.createTextNode(value);
        }

        newNode = <IChildNodeLike>newNode;
        parent.insertBefore(newNode, _this);
      });
    }

    after(...contents: Array<INonDocumentTypeChildNodeLike | string>): void {
      if (!isIChildNodeLike(this)) {
        throw new Error(strings.AFTER_THIS_INVALID);
      }

      const _this: IChildNodeLike = this;
      
      const ownerDocument = _this.ownerDocument;
      if (!isIDocumentLike(ownerDocument)) {
        throw new Error(strings.AFTER_THIS_OWNER_DOCUMENT_INVALID);
      }
      
      const parent = _this.parentNode;
      if (!isIParentNodeLike(parent)) {
        throw new Error(strings.AFTER_THIS_PARENT_NODE_INVALID);
      }

      const referenceNode = _this.nextSibling;
      contents.forEach((value: INonDocumentTypeChildNodeLike | string) => {
        let newNode = value;
        if (typeof value === 'string') {
          newNode = ownerDocument.createTextNode(value);
        }

        newNode = <INonDocumentTypeChildNodeLike>newNode;
        parent.insertBefore(newNode, referenceNode);
      });
    }

    replaceWith(...contents: Array<IChildNodeLike | string>) {
      if (!isIChildNodeLike(this)) {
        throw new Error(strings.REPLACE_WITH_THIS_INVALID);
      }

      const _this: IChildNodeLike = this;

      const ownerDocument = _this.ownerDocument;
      if (!isIDocumentLike(ownerDocument)) {
        throw new Error(strings.REPLACE_WITH_THIS_OWNER_DOCUMENT_INVALID);
      }

      const parent = _this.parentNode;
      if (!isIParentNodeLike(parent)) {
        throw new Error(strings.REPLACE_WITH_THIS_PARENT_NODE_INVALID);
      }

      const referenceNode = _this.nextSibling;
      parent.removeChild(_this);
      contents.forEach((value: IChildNodeLike | string) => {
        let newNode = value;
        if (typeof value === 'string') {
          newNode = ownerDocument.createTextNode(value);
        }

        newNode = <IChildNodeLike>newNode;
        parent.insertBefore(newNode, referenceNode);
      });
    }

    remove() {
      if (!isIChildNodeLike(this)) {
        throw new Error(strings.REMOVE_THIS_INVALID);
      }

      const _this: IChildNodeLike = this;
      const parent = _this.parentNode;
      if (!isIParentNodeLike(parent)) {
        throw new Error(strings.REMOVE_THIS_PARENT_NODE_INVALID);
      }

      parent.removeChild(_this);
    }
  }

  return MChildNodeLike;
}

export default MChildNodeLike;