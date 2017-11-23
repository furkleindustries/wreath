import {
  IDocumentFragmentLike,
} from '../NodeLike/ParentNodeLike/DocumentFragmentLike/IDocumentFragmentLike';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  ILinterOptions,
} from './ILinterOptions';
import {
  ILinterOptionsArgument,
} from './ILinterOptionsArgument';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  ITask,
} from '../Task/ITask';
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export interface ILinter {
  readonly options: ILinterOptions;

  lint(
    storyData: IElementLike,
    tasks:     Array<ITask>,
    options:   ILinterOptionsArgument): Array<ITask>;

  generateIRStageOne(
    storyData: Array<IElementLike>,
    options:   TIndexableObject):       Array<IPassage>;

  generateIRStageTwo(
    storyData: Array<IPassage>,
    options:   TIndexableObject):       IDocumentFragmentLike;
}

export default ILinter;