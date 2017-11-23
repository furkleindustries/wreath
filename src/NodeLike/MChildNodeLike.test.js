import {
  isIChildNodeLike,
} from '../TypeGuards/isIChildNodeLike';
jest.mock('../TypeGuards/isIChildNodeLike');
import {
  isIDocumentLike,
} from '../TypeGuards/isIDocumentLike';
jest.mock('../TypeGuards/isIDocumentLike');
import {
  isIParentNodeLike,
} from '../TypeGuards/isIParentNodeLike';
jest.mock('../TypeGuards/isIParentNodeLike');
import {
  strings,
  MChildNodeLike,
} from './MChildNodeLike';

describe('MChildNodeLike.before unit tests.', () => {
  const ctor = MChildNodeLike(Function.constructor);
  const getMixinSafe = () => {
    const mixin = new ctor();
    mixin.ownerDocument = { createTextNode: jest.fn(), };
    mixin.parentNode = { insertBefore: jest.fn(), };
    return mixin;
  };

  beforeEach(() => {
    isIChildNodeLike.mockClear();
    isIChildNodeLike.mockReturnValue(true);
    isIDocumentLike.mockClear();
    isIDocumentLike.mockReturnValue(true);
    isIParentNodeLike.mockClear();
    isIParentNodeLike.mockReturnValue(true);
  });

  it('Throws if the implementing object does not meet the isIChildNodeLike type guard.', () => {
    isIChildNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    expect(mixin.before).toThrow(strings.BEFORE_THIS_INVALID);
  });
  
  it('Throws if the implementing object does not have an ownerDocument property which meets the isIDocumentLike type guard.', () => {
    isIDocumentLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.before.call(mixin);
    expect(func).toThrow(strings.BEFORE_THIS_OWNER_DOCUMENT_INVALID);
  });

  it('Throws if the implementing object does not have a parentNode property which meets the isIParentNodeLike type guard.', () => {
    isIParentNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.before.call(mixin);
    expect(func).toThrow(strings.BEFORE_THIS_PARENT_NODE_INVALID);
  });

  it('Does not throw if there are no contents.', () => {
    const mixin = getMixinSafe();
    const func = () => mixin.before.call(mixin);
    expect(func).not.toThrow();
  });

  it('Converts strings into text nodes.', () => {
    const mixin = getMixinSafe();
    mixin.before('foo', 'bar', 'baz');
    expect(mixin.ownerDocument.createTextNode.mock.calls).toEqual([
      [ 'foo', ],
      [ 'bar', ],
      [ 'baz', ],
    ]);
  });

  it('Inserts new nodes into the parent after the child.', () => {
    const mixin = getMixinSafe();
    mixin.ownerDocument.createTextNode.mockImplementation((aa) => aa);
    const keyOne = Symbol('one');
    const keyTwo = 'two';
    const keyThree = Symbol('three');
    mixin.before(keyOne, keyTwo, keyThree);
    expect(mixin.parentNode.insertBefore.mock.calls).toEqual([
      [ keyOne, mixin, ],
      [ keyTwo, mixin, ],
      [ keyThree, mixin, ],
    ]);
  });
  
  it('Returns nothing.', () => {
    expect(getMixinSafe().before()).toBe(undefined);
  });
});

describe('MChildNodeLike.after unit tests.', () => {
  const ctor = MChildNodeLike(Function.constructor);
  const getMixinSafe = () => {
    const mixin = new ctor();
    mixin.ownerDocument = { createTextNode: jest.fn(), };
    mixin.parentNode = { insertBefore: jest.fn(), };
    return mixin;
  };

  beforeEach(() => {
    isIChildNodeLike.mockClear();
    isIChildNodeLike.mockReturnValue(true);
    isIDocumentLike.mockClear();
    isIDocumentLike.mockReturnValue(true);
    isIParentNodeLike.mockClear();
    isIParentNodeLike.mockReturnValue(true);
  });

  it('Throws if the implementing object does not meet the isIChildNodeLike type guard.', () => {
    isIChildNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    expect(mixin.after).toThrow(strings.AFTER_THIS_INVALID);
  });
  
  it('Throws if the implementing object does not have an ownerDocument property which meets the isIDocumentLike type guard.', () => {
    isIDocumentLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.after.call(mixin);
    expect(func).toThrow(strings.AFTER_THIS_OWNER_DOCUMENT_INVALID);
  });

  it('Throws if the implementing object does not have a parentNode property which meets the isIParentNodeLike type guard.', () => {
    isIParentNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.after.call(mixin);
    expect(func).toThrow(strings.AFTER_THIS_PARENT_NODE_INVALID);
  });

  it('Does not throw if there are no contents.', () => {
    const mixin = getMixinSafe();
    const func = () => mixin.after.call(mixin);
    expect(func).not.toThrow();
  });

  it('Converts strings into text nodes.', () => {
    const mixin = getMixinSafe();
    mixin.after('foo', 'bar', 'baz');
    expect(mixin.ownerDocument.createTextNode.mock.calls).toEqual([
      [ 'foo', ],
      [ 'bar', ],
      [ 'baz', ],
    ]);
  });
  
  it('Inserts new nodes into the parent.', () => {
    const mixin = getMixinSafe();
    const keyOne = Symbol('testOne');
    const keyTwo = Symbol('testTwo');
    const keyThree = Symbol('testThree');
    mixin.nextSibling = Symbol('nextSibling');
    mixin.after(keyOne, keyTwo, keyThree);
    expect(mixin.parentNode.insertBefore.mock.calls).toEqual([
      [ keyOne, mixin.nextSibling, ],
      [ keyTwo, mixin.nextSibling, ],
      [ keyThree, mixin.nextSibling, ],
    ]);
  });

  it('Returns nothing.', () => {
    expect(getMixinSafe().after()).toBe(undefined);
  });
});

describe('MChildNodeLike.replaceWith unit tests.', () => {
  const ctor = MChildNodeLike(Function.constructor);
  const getMixinSafe = () => {
    const mixin = new ctor();
    mixin.ownerDocument = { createTextNode: jest.fn(), };
    mixin.parentNode = {
      insertBefore: jest.fn(),
      removeChild: jest.fn(),
    };

    return mixin;
  };

  beforeEach(() => {
    isIChildNodeLike.mockClear();
    isIChildNodeLike.mockReturnValue(true);
    isIDocumentLike.mockClear();
    isIDocumentLike.mockReturnValue(true);
    isIParentNodeLike.mockClear();
    isIParentNodeLike.mockReturnValue(true);
  });

  it('Throws if the implementing object does not meet the isIChildNodeLike type guard.', () => {
    isIChildNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    expect(mixin.replaceWith).toThrow(strings.REPLACE_WITH_THIS_INVALID);
  });

  it('Throws if the implementing object does not have an ownerDocument property which meets the isIDocumentLike type guard.', () => {
    isIDocumentLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.replaceWith.call(mixin);
    expect(func).toThrow(strings.REPLACE_WITH_THIS_OWNER_DOCUMENT_INVALID);
  });

  it('Throws if the implementing object does not have a parentNode property which meets the isIParentNodeLike type guard.', () => {
    isIParentNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.replaceWith.call(mixin);
    expect(func).toThrow(strings.REPLACE_WITH_THIS_PARENT_NODE_INVALID);
  });

  it('Does not throw if there are no contents.', () => {
    const mixin = getMixinSafe();
    const func = () => mixin.replaceWith.call(mixin);
    expect(func).not.toThrow();
  });

  it('Removes the implementing node from its parent node.', () => {
    const mixin = getMixinSafe();
    mixin.replaceWith();
    expect(mixin.parentNode.removeChild.mock.calls).toEqual([
      [ mixin, ],
    ]);
  });

  it('Converts strings into text nodes.', () => {
    const mixin = getMixinSafe();
    mixin.replaceWith('foo', 'bar', 'baz');
    expect(mixin.ownerDocument.createTextNode.mock.calls).toEqual([
      [ 'foo', ],
      [ 'bar', ],
      [ 'baz', ],
    ]);
  });

  it('Inserts new nodes into the parent.', () => {
    const mixin = getMixinSafe();
    const keyOne = Symbol('testOne');
    const keyTwo = Symbol('testTwo');
    const keyThree = Symbol('testThree');
    mixin.nextSibling = Symbol('nextSibling');
    mixin.replaceWith(keyOne, keyTwo, keyThree);
    expect(mixin.parentNode.insertBefore.mock.calls).toEqual([
      [ keyOne, mixin.nextSibling, ],
      [ keyTwo, mixin.nextSibling, ],
      [ keyThree, mixin.nextSibling, ],
    ]);
  });

  it('Returns nothing.', () => {
    expect(getMixinSafe().replaceWith()).toBe(undefined);
  });
});

describe('MChildNodeLike.remove unit tests.', () => {
  const ctor = MChildNodeLike(Function.constructor);
  const getMixinSafe = () => {
    const mixin = new ctor();
    mixin.ownerDocument = { createTextNode: jest.fn(), };
    mixin.parentNode = { removeChild: jest.fn(), };
    return mixin;
  };

  beforeEach(() => {
    isIChildNodeLike.mockClear();
    isIChildNodeLike.mockReturnValue(true);
    isIParentNodeLike.mockClear();
    isIParentNodeLike.mockReturnValue(true);
  });

  it('Throws if the implementing object does not meet the isIChildNodeLike type guard.', () => {
    isIChildNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    expect(mixin.remove).toThrow(strings.REMOVE_THIS_INVALID);
  });

  it('Throws if the implementing object does not have a parentNode property which meets the isIParentNodeLike type guard.', () => {
    isIParentNodeLike.mockReturnValue(false);
    const mixin = getMixinSafe();
    const func = () => mixin.remove.call(mixin);
    expect(func).toThrow(strings.REMOVE_THIS_PARENT_NODE_INVALID);
  });

  it('Does not throw if there are no contents.', () => {
    const mixin = getMixinSafe();
    const func = () => mixin.remove.call(mixin);
    expect(func).not.toThrow();
  });

  it('Removes the implementing node from its parent node.', () => {
    const mixin = getMixinSafe();
    mixin.remove();
    expect(mixin.parentNode.removeChild.mock.calls).toEqual([
      [ mixin, ],
    ]);
  });

  it('Returns nothing.', () => {
    expect(getMixinSafe().remove()).toBe(undefined);
  });
});