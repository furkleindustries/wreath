import {
  DetectionModes,
  Formats,
} from '../constants';
import {
  TPassageIgnores,
} from '../TypeAliases/TPassageIgnores';

export interface ILinterOptions {
  detectionMode:       DetectionModes;
  documentConstructor: Function;
  format:              Formats;
  passageIgnores:      TPassageIgnores;
  runInIsolation:      boolean;
  version:             string;
}

export default ILinterOptions;