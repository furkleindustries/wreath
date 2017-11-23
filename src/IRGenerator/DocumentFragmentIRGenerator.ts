import {
  IDocumentFragmentLike,
} from '../NodeLike/ParentNodeLike/DocumentFragmentLike/IDocumentFragmentLike';
import {
  IDocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/IDocumentLike';
import {
  IIRGenerator,
} from './IIRGenerator';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  isArrayLikeObject,
} from '../TypeGuards/isArrayLikeObject';
import {
  isIDocumentLike,
} from '../TypeGuards/isIDocumentLike';
import {
  storyDataFactory,
} from '../modules/storyDataFactory';
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';
import {
  TStringMap,
} from '../TypeAliases/TStringMap';

export class DocumentFragmentIRGenerator implements IIRGenerator {
  static strings: TStringMap = {
    GENERATE_PASSAGES_INVALID:
      'The passages argument did not meet the requirements for the ' +
      'isArrayLikeObject type guard.',

    GENERATE_PASSAGES_EMPTY:
      'The passages argument was an arraylike object, but it was empty.',

    GENERATE_OPTIONS_INVALID:
      'The options argument was not an object.',

    GENERATE_DOCUMENT_FACTORY_INVALID:
      'The options argument did not have a documentFactory function.',

    GENERATE_DOCUMENT_INVALID:
      'The options.documentFactory function did not produce a valid ' +
      'document.',
  };

  generate(
    passages: Array<IPassage>,
    options:  TIndexableObject): IDocumentFragmentLike
  {
    if (!isArrayLikeObject(passages)) {
      throw new Error(
        DocumentFragmentIRGenerator.strings.GENERATE_PASSAGES_INVALID);
    } else if (passages.length === 0) {
      throw new Error(
        DocumentFragmentIRGenerator.strings.GENERATE_PASSAGES_EMPTY);
    } else if (!options || typeof options !== 'object') {
      throw new Error(
        DocumentFragmentIRGenerator.strings.GENERATE_OPTIONS_INVALID);
    }

    let doc: IDocumentLike | null = null;
    if (typeof options.documentFactory === 'function') {
      doc = options.documentFactory();
    } else {
      throw new Error(
        DocumentFragmentIRGenerator.strings.GENERATE_DOCUMENT_FACTORY_INVALID);
    }
  
    if (!isIDocumentLike(doc)) {
      throw new Error(
        DocumentFragmentIRGenerator.strings.GENERATE_DOCUMENT_INVALID);
    }
  
    const docFragment = doc.createDocumentFragment();
    const storyData = storyDataFactory(passages, doc);
    docFragment.append(storyData);
    return docFragment;
  }
}

export default DocumentFragmentIRGenerator;