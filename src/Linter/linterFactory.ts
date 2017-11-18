import {
  DetectionModes,
  Formats,
} from '../constants';
import {
  detectFormat,
} from '../modules/detectFormat';
import {
  detectVersion,
} from '../modules/detectVersion';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  ILinter,
} from './ILinter';
import {
  ILinterOptionsArgument,
} from './ILinterOptionsArgument';
import {
  IParser,
} from '../Parser/IParser';
import {
  Linter,
} from './Linter';
import {
  parserFactory,
} from '../Parser/parserFactory';

export function linterFactory(
  storyData:       IElementLike,
  options:         ILinterOptionsArgument = {},
  formatDetector:  Function = detectFormat,
  versionDetector: Function = detectVersion): ILinter
{
  let parser: IParser;
  const opts = options || {};
  let format = opts.format;
  if (!format) {
    if (opts.detectionMode === 'auto') {
      format = formatDetector(storyData);
    } else {
      throw new Error('No format was provided, but the detection mode ' +
                      'was manual.');
    }
  }

  if (!format) {
    throw new Error('No format could be detected.');
  }

  format = <Formats>format;
  
  let version = opts.version;
  if (!version) {
    if (opts.detectionMode === 'auto') {
      version = versionDetector(storyData);
    } else {
      throw new Error('No version was provided, but the detection mode ' +
                      'was manual.');
    }
  }

  if (!version) {
    throw new Error('No version could be detected.');
  }

  version = <string>version;
  parser = parserFactory(format);
  opts.format = format;
  opts.version = version;
  opts.detectionMode = <DetectionModes>(options.detectionMode || 'manual');
  opts.documentGetter = options.documentGetter;
  return new Linter(parser, opts);
}

export default linterFactory;