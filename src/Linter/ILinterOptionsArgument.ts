import {
  DetectionModes,
  Formats,
} from '../constants';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  IIgnores,
} from '../Ignores/IIgnores';

export interface ILinterOptionsArgument {
  detectionMode?:  DetectionModes;
  documentGetter?: Function;
  format?:         Formats;
  ignores?:        IIgnores;
  mergeOptions?:   Function; 
  storyData?:      IElementLike;
  runInIsolation?: boolean;
  version?:        string;
}

export default ILinterOptionsArgument;