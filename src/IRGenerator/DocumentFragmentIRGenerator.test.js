import {
  DocumentFragmentIRGenerator,
} from './DocumentFragmentIRGenerator';
import {
  isArrayLikeObject,
} from '../TypeGuards/isArrayLikeObject';
jest.mock('../TypeGuards/isArrayLikeObject');
import {
  isIDocumentLike,
} from '../TypeGuards/isIDocumentLike';
jest.mock('../TypeGuards/isIDocumentLike');
import {
  storyDataFactory,
} from '../modules/storyDataFactory';
jest.mock('../modules/storyDataFactory');

describe('DocumentFragmentIRGenerator.generate unit tests.', () => {
  beforeEach(() => {
    isArrayLikeObject.mockClear();
    isArrayLikeObject.mockReturnValue(true);
    isIDocumentLike.mockClear();
    isIDocumentLike.mockReturnValue(true);
    storyDataFactory.mockClear();
  });

  it('Throw if the options argument is falsy.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const func = () => gen.generate([ 'foo', ]);
    expect(func).toThrow(
      DocumentFragmentIRGenerator.strings.GENERATE_OPTIONS_INVALID);
  });

  it('Throws if passages does not meet the isArrayLikeObject .', () => {
    isArrayLikeObject.mockReturnValue(false);
    const gen = new DocumentFragmentIRGenerator();
    const func = () => gen.generate();
    expect(func).toThrow(
      DocumentFragmentIRGenerator.strings.GENERATE_PASSAGES_INVALID);
  });

  it('Throws if passages is an empty arraylike object.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const func = () => gen.generate([]);
    expect(func).toThrow(
      DocumentFragmentIRGenerator.strings.GENERATE_PASSAGES_EMPTY);
  });

  it('Calls the documentFactory property of the options argument, if it is a function.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const append = jest.fn();
    const createDocumentFragment = jest.fn(() => ({
      append,
    }));

    const documentFactory = jest.fn(() => ({
      createDocumentFragment,
    }));

    gen.generate([ 'test', ], { documentFactory, });
    expect(documentFactory.mock.calls).toEqual([
      [],
    ]);
  });
  
  it('Calls the documentFactory property of the options argument, if it is a function.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const append = jest.fn();
    const createDocumentFragment = jest.fn(() => ({
      append,
    }));

    const documentFactory = jest.fn(() => ({
      createDocumentFragment,
    }));

    gen.generate([ 'test', ], { documentFactory, });
    expect(documentFactory.mock.calls).toEqual([
      [],
    ]);
  });

  it('Throws if there is no options.documentFactory function.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const func = () => gen.generate([ 'test', ], {});
    expect(func).toThrow(
      DocumentFragmentIRGenerator.strings.GENERATE_DOCUMENT_FACTORY_INVALID);
  });

  it('Throws if the product of options.documentFactory does not meet the isIDocumentLike type guard.', () => {
    isIDocumentLike.mockReturnValue(false);
    const gen = new DocumentFragmentIRGenerator();
    const options = { documentFactory: jest.fn(), };
    const func = () => gen.generate([ 'foo', ], options);
    expect(func).toThrow(
      DocumentFragmentIRGenerator.strings.GENERATE_DOCUMENT_INVALID);
  });

  it('Creates a document fragment from the document.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const append = jest.fn();
    const createDocumentFragment = jest.fn(() => ({
      append,
    }));

    const documentFactory = jest.fn(() => ({
      createDocumentFragment,
    }));

    gen.generate([ 'test', ], { documentFactory, });
    expect(createDocumentFragment.mock.calls).toEqual([
      [],
    ]);
  });

  it('Calls storyDataFactory to generate a storyData element from the passages and document.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const append = jest.fn();
    const createDocumentFragment = jest.fn(() => ({ append, }));
    const doc = { createDocumentFragment, };
    const documentFactory = jest.fn(() => doc);
    const passages = [ 'test', ];
    gen.generate(passages, { documentFactory, });
    expect(storyDataFactory.mock.calls).toEqual([
      [ passages, doc, ],
    ]);
  });

  it('Appends the computed storyData to the created document fragment.', () => {
    storyDataFactory.mockReturnValue('__test');
    const gen = new DocumentFragmentIRGenerator();
    const append = jest.fn();
    const createDocumentFragment = jest.fn(() => ({ append, }));
    const documentFactory = jest.fn(() => ({ createDocumentFragment, }));
    const passages = [ 'test', ];
    gen.generate(passages, { documentFactory, });
    expect(append.mock.calls).toEqual([
      [ '__test', ],
    ]);
  });

  it('Returns the created document fragment.', () => {
    const gen = new DocumentFragmentIRGenerator();
    const append = jest.fn();
    const docFrag = { append, };
    const createDocumentFragment = jest.fn(() => docFrag);
    const documentFactory = jest.fn(() => ({ createDocumentFragment, }));
    const passages = [ 'test', ];
    expect(gen.generate(passages, { documentFactory, })).toEqual(docFrag);
  });
});