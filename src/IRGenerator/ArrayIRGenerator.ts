import {
  Formats,
  Versions,
} from '../constants';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  IIRGenerator,
} from './IIRGenerator';
import {
  ILinterOptionsArgument,
} from '../Linter/ILinterOptionsArgument';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  isIElementLike,
} from '../TypeGuards/isIElementLike';
import {
  parserFactory,
} from '../Parser/parserFactory';
import {
  satisfies,
  valid,
} from 'semver';
import {
  TStringMap,
} from '../TypeAliases/TStringMap';


export class ArrayIRGenerator implements IIRGenerator {
  static strings: TStringMap = {
    GENERATE_STORY_DATA_INVALID:
      'The storyData argument did not meet the isIElementLike type guard.',

    GENERATE_CONTEXT_FORMAT_INVALID:
      'The format property of the context argument was not a string with ' +
      'content.',

    GENERATE_CONTEXT_FORMAT_UNRECOGNIZED:
      'The format property of the context argument was not a value in ' +
      'constants.Formats.',

    GENERATE_CONTEXT_VERSION_INVALID:
      'The version property of the context argument was not a string with ' +
      'content.',

    GENERATE_CONTEXT_VERSION_NOT_SEMANTIC:
      'The version property of the context argument was not a valid ' +
      'semantic version.',

    GENERATE_CONTEXT_VERSION_UNRECOGNIZED:
      'The version property of the context argument did not satisfy the ' +
      'requirements of any of the configured versions.',

    GENERATE_NO_OUTPUT:
      'There was no output from the parser.',

    GENERATE_INVALID_PASSAGE_NAME:
      'The passage name could not be detected from the current passage.',
  };

  generate(
    storyData: Array<IElementLike>,
    context:   ILinterOptionsArgument = {}): Array<IPassage>
  {
    if (!isIElementLike(storyData)) {
      throw new Error(ArrayIRGenerator.strings.GENERATE_STORY_DATA_INVALID);
    }

    const ctx = context || {};
    const format = ctx.format;
    if (!format || typeof format !== 'string') {
      throw new Error(ArrayIRGenerator.strings.GENERATE_CONTEXT_FORMAT_INVALID);
    } else if (Object.values(Formats).indexOf(format) === -1) {
      throw new Error(
        ArrayIRGenerator.strings.GENERATE_CONTEXT_FORMAT_UNRECOGNIZED);
    }

    const version = ctx.version;
    if (!version || typeof version !== 'string') {
      throw new Error(
        ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_INVALID);
    } else if (!valid(version)) {
      throw new Error(
        ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_NOT_SEMANTIC);
    }

    const requirementVOne = Versions['^1'];
    const requirementVTwo = Versions['^2'];
    let majorVersion;
    if (satisfies(version, requirementVOne)) {
      majorVersion = '1';
    } else if (satisfies(version, requirementVTwo)) {
      majorVersion = '2';
    } else {
      throw new Error(
        ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_UNRECOGNIZED);
    }

    const parser = parserFactory(format);
    const passages: Array<IPassage> = [];
    const children = storyData.children;

    for (let ii = 0; ii < children.length; ii += 1) {
      const child = children[ii];
      const abstractSyntaxTree = parser.parse(child.textContent);
      if (!abstractSyntaxTree || !abstractSyntaxTree.length) {
        throw new Error(ArrayIRGenerator.strings.GENERATE_NO_OUTPUT);
      }

      let passageName;
      if (majorVersion === '1') {
        passageName = child.getAttribute('tiddler');
      } else {
        passageName = child.getAttribute('name');
      }

      if (!passageName) {
        throw new Error(
          ArrayIRGenerator.strings.GENERATE_INVALID_PASSAGE_NAME);
      }

      /* Don't lint any passages that match on a passage tag. */
      const tags = (child.getAttribute('tags') || '')
        .split(' ')
        .filter((aa) => aa);

      passages.push({
        abstractSyntaxTree,
        passageName,
        tags,
      });
    }

    return passages;
  }
}

export default ArrayIRGenerator;