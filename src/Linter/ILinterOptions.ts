import {
  DetectionModes,
  Formats,
} from '../constants';
import {
  IIgnores,
} from '../Ignores/IIgnores';

export interface ILinterOptions {
  detectionMode:   DetectionModes;
  documentFactory: Function;
  format:          Formats;
  ignores:         IIgnores;
  mergeOptions?:   Function;
  runInIsolation:  boolean;
  version:         string;
}

export default ILinterOptions;