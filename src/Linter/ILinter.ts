import {
  IDocumentFragmentLike,
} from '../NodeLike/ParentNodeLike/DocumentFragmentLike/IDocumentFragmentLike';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  IIntermediateRepresentationGeneratorOptions,
} from '../IntermediateRepresentationGenerator/IIntermediateRepresentationGeneratorOptions';
import {
  ILinterOptions,
} from './ILinterOptions';
import {
  ILinterOptionsArgument,
} from './ILinterOptionsArgument';
import {
  IParser,
} from '../Parser/IParser';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  ITask,
} from '../Task/ITask';

export interface ILinter {
  readonly parser:  IParser;
  readonly options: ILinterOptions;

  lint(
    storyData: IElementLike,
    tasks:     Array<ITask>,
    options:   ILinterOptionsArgument): Array<ITask>;

  generateILStageOne(
    storyData: IElementLike,
    options:   IIntermediateRepresentationGeneratorOptions): Array<IPassage>;

  generateILStageTwo(
    passages:  Array<IPassage>,
    options:   IIntermediateRepresentationGeneratorOptions): IDocumentFragmentLike;
}

export default ILinter;