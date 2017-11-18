import {
  DetectionModes,
  Formats,
  ignores,
} from '../constants';
import {
  ArrayIntermediateRepresentationGenerator,
} from '../IntermediateRepresentationGenerator/ArrayIntermediateRepresentationGenerator';
import {
  detectFormat,
} from '../modules/detectFormat';
import {
  detectVersion,
} from '../modules/detectVersion';
import {
  documentGetter,
} from '../modules/documentGetter';
import {
  DocumentFragmentIntermediateRepresentationGenerator,
} from '../IntermediateRepresentationGenerator/DocumentFragmentIntermediateRepresentationGenerator';
import {
  IDocumentFragmentLike,
} from '../NodeLike/ParentNodeLike/DocumentFragmentLike/IDocumentFragmentLike';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  IIgnores,
} from '../Ignores/IIgnores';
import {
  ILinter,
} from './ILinter';
import {
  ILinterOptions,
} from './ILinterOptions';
import {
  ILinterOptionsArgument,
} from './ILinterOptionsArgument';
import {
  Map,
} from 'immutable';
import {
  INodeLike,
} from '../NodeLike/INodeLike';
import {
  INonDocumentTypeChildNodeLike,
} from '../NodeLike/INonDocumentTypeChildNodeLike';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  isIDocumentLike,
} from '../TypeGuards/isIDocumentLike';
import {
  isIElementLike,
} from '../TypeGuards/isIElementLike';
import {
  isIIgnores,
} from '../TypeGuards/isIIgnores';
import {
  ITask,
} from '../Task/ITask';
import {
  Recurser,
} from '../Recurser/Recurser';    
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';
import {
  TStringMap,
} from '../TypeAliases/TStringMap';

const semver = require('semver');

export class Linter implements ILinter {
  readonly options: ILinterOptions = <ILinterOptions>{};
  static strings: TStringMap = {
    CONSTRUCTOR_OPTIONS_INVALID:
      'The options argument to the Linter constructor was not an object.',

    LINT_STORY_DATA_EMPTY_STRING:
      'The storyData argument was an empty string.',

    LINT_DOCUMENT_GETTER_INVALID:
      'The documentGetter option was not a function.',

    LINT_STORY_DATA_INVALID:
      'The storyData argument passed to this Linter\'s lint method was not ' +
      'an element or string with content.',

    LINT_TASKS_INVALID:
      'The tasks argument passed to this Linter\'s lint method was not an ' +
      'array.',

    LINT_TASKS_EMPTY:
      'The tasks argument passed to this Linter\'s lint method was empty.',

    LINT_TASK_INVALID:
      'One of the items in the tasks argument passed to this Linter\'s lint ' +
      'method was falsy or not an object.',

    LINT_TASK_NO_EXECUTE_METHOD:
      'One of the items in the tasks argument passed to this Linter\'s lint ' +
      'method had neither an execute nor executeMicrotask method.',

    MERGE_OPTIONS_ARGS_DETECTION_MODE_INVALID:
      'The detectionMode property was present in the options argument, but ' +
      'it was not a string with content.',

    MERGE_OPTIONS_ARGS_DETECTION_MODE_UNRECOGNIZED:
      'The detectionMode property was present in the options argument, but ' +
      'it was not a value of constants.DetectionModes.',
 
    MERGE_OPTIONS_THIS_DETECTION_MODE_INVALID:
      'The options.detectionMode property of this Linter was defined but ' +
      'was not a function.',
    
    MERGE_OPTIONS_THIS_DETECTION_MODE_UNRECOGNIZED:
      'The detectionMode property was not present in the options argument, and ' +
      'the options.detectionMode property of this Linter was not a value of ' +
      'constants.DetectionModes.',

    MERGE_OPTIONS_ARGS_DOCUMENT_GETTER_INVALID:
      'The documentGetter property was present in the options argument, but ' +
      'it was not a function.',

    MERGE_OPTIONS_THIS_DOCUMENT_GETTER_INVALID:
      'The options.documentGetter property of this Linter was not a function.',

    MERGE_OPTIONS_ARGS_FORMAT_INVALID:
      'The format property was present in the options argument, but it was ' +
      'not a string with content.',

    MERGE_OPTIONS_ARGS_FORMAT_UNRECOGNIZED:
      'The options.format property on this Linter is not contained in ' +
      'constants.Formats.',

    MERGE_OPTIONS_THIS_FORMAT_INVALID:
      'The format property was present in the options property of this ' +
      'Linter, but it was not a string with content.',

    MERGE_OPTIONS_THIS_FORMAT_UNRECOGNIZED:
      'The options.format property on this Linter is not contained in ' +
      'constants.Formats.',

    MERGE_OPTIONS_ARGS_STORY_DATA_INVALID:
      'The detectionMode was auto, but there is no valid storyData option.',

    MERGE_OPTIONS_ARGS_IGNORES_INVALID:
      'The ignores property was present in the options argument, but it did ' +
      'not match the shape of the Ignores interface.',

    MERGE_OPTIONS_THIS_IGNORES_INVALID:
      'The ignores property was present in the options property of this ' +
      'Linter, but it did not match the shape of the Ignores interface.',

    MERGE_OPTIONS_ARGS_RUN_IN_ISOLATION_INVALID:
      'The runInIsolation property was present in the options argument, but ' +
      'it was not a boolean.',

    MERGE_OPTIONS_THIS_RUN_IN_ISOLATION_INVALID:
      'The runInIsolation property was present in the options property of ' +
      'this Linter, but it was not a boolean.',

    MERGE_OPTIONS_ARGS_VERSION_INVALID:
      'The version property was present in the options argument, but it was ' +
      'not a string with content.',

    MERGE_OPTIONS_ARGS_VERSION_NOT_SEMANTIC:
      'The version property was present in the options argument, but it was ' +
      'not a valid semantic version.',
      
    MERGE_OPTIONS_THIS_VERSION_INVALID:
      'The version property was present in the options property of this ' +
      'Linter, but it was not a string with content.',

    MERGE_OPTIONS_THIS_VERSION_NOT_SEMANTIC:
      'The version property was present in the options property of this ' +
      'Linter, but it was not a valid semantic version.',

    FILTER_CHILD_NODES_STORY_DATA_INVALID:
      'The storyData argument did not match the isIElementLike type guard.',

    RUN_TASKS_IN_PARALLEL_STORY_DATA_INVALID:
      'The documentFragment argument did not contain a tw-storydata element.',

    RUN_TASKS_IN_ISOLATION_STORY_DATA_INVALID:
      'One of the document fragments in the isolationChambers argument did ' +
      'not contain a tw-storydata element.',
    
    RUN_TASKS_IN_ISOLATION_TASK_INVALID:
      'One of the tasks in the task argument has neither an execute nor an ' +
      'executeMicrotask argument.',
  };

  constructor(options: ILinterOptionsArgument) {
    if (!options || typeof options !== 'object') {
      throw new Error(Linter.strings.CONSTRUCTOR_OPTIONS_INVALID);
    }

    if (typeof options.mergeOptions === 'function') {
      this.options = options.mergeOptions(options);
    } else {
      this.options = this.mergeOptions(options);
    }
  }

  lint(
    storyData: IElementLike | string,
    tasks:     Array<ITask>,
    options:   ILinterOptionsArgument = {}): Array<ITask>
  {
    const tempOpts = options || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    let _storyData = storyData;
    let copy = <ILinterOptions>opts.toObject();
    if (typeof storyData === 'string') {
      if (!storyData) {
        throw new Error(Linter.strings.LINT_STORY_DATA_EMPTY_STRING);
      } else if (typeof copy.documentGetter !== 'function') {
        throw new Error(Linter.strings.LINT_DOCUMENT_GETTER_INVALID);
      }

      const doc = copy.documentGetter();
      if (!isIDocumentLike(doc)) {
        throw new Error(Linter.strings.LINT_DOCUMENT_INVALID);
      }

      let elem;
      if (doc.documentElement) {
        elem = doc.documentElement;
      } else {
        elem = doc.createElement('html');
      }

      elem.innerHTML = storyData;
      _storyData = elem.querySelector('tw-storydata');
    }
    
    if (!isIElementLike(_storyData)) {
      throw new Error(Linter.strings.LINT_STORY_DATA_INVALID);
    }

    const storyDataElem = _storyData;

    if (!tasks || /* tasks is falsy. */
      /* tasks is not an object (nor null given the before). */
      typeof tasks !== 'object' ||
      /* tasks.length does not have a length property which is a number 
       * greater than or equal to 0. */
      !(tasks.length >= 0) ||
      /* tasks.length is not an integer. */
      tasks.length % 1 !== 0 ||
      /* tasks.forEach is not a function. */
      typeof tasks.forEach !== 'function' ||
      /* tasks.filter is not a function. */
      typeof tasks.filter !== 'function' ||
      /* tasks.map is not a function. */
      typeof tasks.map !== 'function' ||
      /* tasks.reduce is not a function. */
      typeof tasks.reduce !== 'function')
    {
      throw new Error(Linter.strings.LINT_TASKS_INVALID);
    } else if (tasks.length === 0) {
      throw new Error(Linter.strings.LINT_TASKS_EMPTY);
    }

    tasks.forEach((task) => {
      if (!task || typeof task !== 'object') {
        throw new Error(Linter.strings.LINT_TASK_INVALID);
      } if (typeof task.execute !== 'function' &&
        typeof task.executeMicrotask !== 'function')
      {
        throw new Error(Linter.strings.LINT_TASK_NO_EXECUTE_METHOD);
      }
    });

    copy = <ILinterOptions>opts.toObject();    
    const children = this.filterChildNodes(storyDataElem, copy)
      .filter<IElementLike>((node): node is IElementLike => {
        return isIElementLike(node);
      });

    copy = <ILinterOptions>opts.toObject();
    const passages = this.generateIRStageOne(children, copy);
    let len = 1;
    if (copy.runInIsolation === true) {
      len = tasks.length;
    }

    copy = <ILinterOptions>opts.toObject();
    const docFrag = this.generateIRStageTwo(passages, copy);
    const isolationChambers: Array<IDocumentFragmentLike> = [ docFrag, ];
    for (let ii = 1; ii < len; ii += 1) {
      isolationChambers.push(docFrag.cloneNode());
    }

    copy = <ILinterOptions>opts.toObject();
    return this.runTasks(tasks, isolationChambers, copy);
  }

  protected mergeOptions(args?: ILinterOptionsArgument): ILinterOptions {
    /* Copy the options object. */
    const opt = <ILinterOptionsArgument>Map(this.options).toObject();
    const opts = <ILinterOptions>opt;
    const argOpts = args && typeof args === 'object' ? args : {};
    if ('detectionMode' in argOpts) {
      if (!argOpts.detectionMode ||
        typeof argOpts.detectionMode !== 'string')
      {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_ARGS_DETECTION_MODE_INVALID);
      }

      opts.detectionMode = <DetectionModes>argOpts.detectionMode.toLowerCase();
      const values = Object.values(DetectionModes);
      if (values.indexOf(opts.detectionMode) === -1) {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_ARGS_DETECTION_MODE_UNRECOGNIZED);
      }
    } else if ('detectionMode' in opts) {
      if (!opts.detectionMode || typeof opts.detectionMode !== 'string') {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_THIS_DETECTION_MODE_INVALID);
      }

      opts.detectionMode = <DetectionModes>opts.detectionMode.toLowerCase();
      const values = Object.values(DetectionModes);
      if (values.indexOf(opts.detectionMode) === -1) {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_THIS_DETECTION_MODE_UNRECOGNIZED);
      }
    } else {
      opts.detectionMode = DetectionModes.Manual;
    }

    if ('documentGetter' in argOpts) {
      if (typeof argOpts.documentGetter !== 'function') {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_ARGS_DOCUMENT_GETTER_INVALID);
      }

      opts.documentGetter = argOpts.documentGetter;
    } else if ('documentGetter' in opts) {
      if (typeof opts.documentGetter !== 'function') {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_THIS_DOCUMENT_GETTER_INVALID);
      }
    } else {
      opts.documentGetter = documentGetter;
    }

    if ('format' in argOpts) {
      if (!argOpts.format || typeof argOpts.format !== 'string') {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_FORMAT_INVALID);
      }

      opts.format = <Formats>argOpts.format.toLowerCase();
      const values = Object.values(Formats);
      if (values.indexOf(opts.format) === -1) {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_FORMAT_UNRECOGNIZED);
      }
    } else if ('format' in opts) {
      if (!opts.format || typeof opts.format !== 'string') {
        throw new Error(Linter.strings.MERGE_OPTIONS_THIS_FORMAT_INVALID);
      }

      opts.format = <Formats>opts.format.toLowerCase();
      const values = Object.values(Formats);
      if (values.indexOf(opts.format) === -1) {
        throw new Error(Linter.strings.MERGE_OPTIONS_THIS_FORMAT_UNRECOGNIZED);
      }
    } else {
      if (!argOpts.storyData ||
        (typeof argOpts.storyData !== 'string' &&
          !isIElementLike(argOpts.storyData)))
      {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_STORY_DATA_INVALID);
      }

      const storyData = <string | IElementLike>argOpts.storyData;
      opts.format = <Formats>detectFormat(storyData, opts.detectionMode);
    }

    if ('ignores' in argOpts) {
      if (!isIIgnores(argOpts.ignores)) {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_IGNORES_INVALID);
      }

      opts.ignores = argOpts.ignores;
    } else if ('ignores' in opts) {
      if (!isIIgnores(opts.ignores)) {
        throw new Error(Linter.strings.MERGE_OPTIONS_THIS_IGNORES_INVALID);
      }
    } else {
      opts.ignores = <IIgnores>ignores;
    }

    if ('runInIsolation' in argOpts) {
      if (typeof argOpts.runInIsolation !== 'boolean') {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_ARGS_RUN_IN_ISOLATION_INVALID);
      }

      opts.runInIsolation = argOpts.runInIsolation;
    } else if ('runInIsolation' in opts) {
      if (typeof opts.runInIsolation !== 'boolean') {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_THIS_RUN_IN_ISOLATION_INVALID);
      }
    } else {
      opts.runInIsolation = false;
    }

    if ('version' in argOpts) {
      if (!argOpts.version || typeof argOpts.version !== 'string') {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_VERSION_INVALID);
      } else if (!semver.valid(argOpts.version)) {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_VERSION_NOT_SEMANTIC);
      }

      opts.version = argOpts.version;
    } else if ('version' in opts) {
      if (!opts.version || typeof opts.version !== 'string') {
        throw new Error(Linter.strings.MERGE_OPTIONS_THIS_VERSION_INVALID);
      } else if (!semver.valid(opts.version)) {
        throw new Error(
          Linter.strings.MERGE_OPTIONS_THIS_VERSION_NOT_SEMANTIC);
      }
    } else {
      if (!argOpts.storyData ||
        (typeof argOpts.storyData !== 'string' &&
          !isIElementLike(argOpts.storyData)))
      {
        throw new Error(Linter.strings.MERGE_OPTIONS_ARGS_STORY_DATA_INVALID);
      }

      const storyData = <string | IElementLike>argOpts.storyData;
      opts.version = <Formats>detectVersion(storyData, opts.detectionMode);
    }

    return opts;
  }

  protected filterChildNodes(
    storyData: IElementLike | Array<IElementLike>,
    options:   ILinterOptionsArgument = {}): Array<INonDocumentTypeChildNodeLike>
  {
    if (!storyData) {
      throw new Error(Linter.strings.FILTER_CHILD_NODES_STORY_DATA_INVALID);
    }

    let childNodes: Array<INonDocumentTypeChildNodeLike>;
    if ((<Array<IElementLike>>storyData).length >= 0) {
      childNodes = <Array<IElementLike>>storyData;
    } else if (isIElementLike(storyData)) {
      childNodes = storyData.childNodes;
    } else {
      throw new Error(Linter.strings.FILTER_CHILD_NODES_STORY_DATA_INVALID);
    }

    const tempOpts = options || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    let copy: ILinterOptions;

    return Array.from(childNodes).filter((childNode) => {
      copy = <ILinterOptions>opts.toObject();
      /* Skip nodes whose types are ignored. */
      if (copy.ignores.nodeTypes.indexOf(childNode.nodeType) !== -1) {
        return false;
      }

      if (isIElementLike(childNode)) {
        const tagName = childNode.tagName.toLowerCase();
        if (copy.ignores.elementTags.indexOf(tagName) !== -1) {
          return false;
        } else if (tagName !== 'tw-passagedata') {
          return true;
        }

        const passageName = (childNode.getAttribute('name') || '').toLowerCase();

        /* Don't lint any passages that match a passage name. */
        if (copy.ignores.passageNames.indexOf(passageName) !== -1) {
          return false;
        }

        /* Don't lint any passages that match on a passage tag. */
        const tags = (childNode.getAttribute('tags') || '')
          .split(' ')
          .filter((aa) => aa !== '');
    
        let found = false;
        for (let ii = 0; ii < tags.length; ii += 1) {
          const tag = tags[ii];
          if (copy.ignores.passageTags.indexOf(tag) !== -1) {
            found = true;
            break;
          }
        }
    
        /* Skip the passage if a tag matched an ignore rule. */
        if (found) {
          return false;
        }
      }

      return true;
    });
  }

  generateIRStageOne(
    storyData: Array<IElementLike>,
    options:   TIndexableObject): Array<IPassage>
  {
    const tempOpts = options || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    const copy = <ILinterOptions>opts.toObject();
    const gen = new ArrayIntermediateRepresentationGenerator();
    return gen.generate(storyData, copy);
  }

  generateIRStageTwo(
    passages: Array<IPassage>,
    options:  TIndexableObject): IDocumentFragmentLike
  {
    const tempOpts = options || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    const copy = <ILinterOptions>opts.toObject();
    const gen = new DocumentFragmentIntermediateRepresentationGenerator();
    return gen.generate(passages, copy);
  }

  protected runTasks(
    tasks:             Array<ITask>,
    isolationChambers: Array<IDocumentFragmentLike>,
    linterOptions:     ILinterOptionsArgument = {},
    taskOptions:       TIndexableObject = {}): Array<ITask>
  {
    const tempOpts = linterOptions || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    const copy = <ILinterOptions>opts.toObject();

    const tempTaskOpts = taskOptions || {};
    const taskOpts = Map<string, any>(tempTaskOpts);
    const taskCopy = <ILinterOptions>taskOpts.toObject();

    if (copy.runInIsolation === true) {
      return this.runTasksInIsolation(
        tasks,
        isolationChambers,
        copy,
        taskCopy);
    } else {
      return this.runTasksInParallel(
        tasks,
        isolationChambers[0],
        copy,
        taskCopy);
    }
  }

  protected runTasksInParallel(
    tasks:            Array<ITask>,
    documentFragment: IDocumentFragmentLike,
    linterOptions:    ILinterOptions,
    taskOptions:      TIndexableObject = {}): Array<ITask>
  {
    const tempOpts = linterOptions || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    const copy = <ILinterOptions>opts.toObject();

    const tempTaskOpts = taskOptions || {};
    const taskOpts = Map<string, any>(tempTaskOpts);
    let taskCopy;
    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.preSetup(documentFragment, taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.setup(documentFragment, taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.postSetup(documentFragment, taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.preExecute(documentFragment, taskCopy);
    });

    const storyData = documentFragment.querySelector('tw-storydata');
    if (!isIElementLike(storyData)) {
      throw new Error(Linter.strings.RUN_TASKS_IN_PARALLEL_STORY_DATA_INVALID);
    }
    
    taskCopy = taskOpts.toObject();
    const recurser = typeof taskCopy.recurser === 'function' ?
      taskCopy.recurser : new Recurser().leftTopRecurse;
    this.filterChildNodes(storyData).forEach((childNode) => {
      let passageName: string | null = null;
      if (isIElementLike(childNode) &&
        childNode.tagName.toLowerCase() === 'tw-passagedata')
      {
        passageName = childNode.getAttribute('name');
      }

      const callback = (
        node: INodeLike,
        format: Formats,
        version: string,
        options: TIndexableObject = {}) =>
      {
        tasks.forEach((task) => {
          (<Function>task.executeMicrotask)(
            node,
            passageName,
            format,
            version,
            options);
        });
      };

      taskCopy = taskOpts.toObject();
      recurser(
        childNode,
        copy.format,
        copy.version,
        callback,
        taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.postExecute(documentFragment, taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.preComplete(documentFragment, taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.complete(documentFragment, taskCopy);
    });

    tasks.forEach((task) => {
      taskCopy = taskOpts.toObject();
      task.postComplete(documentFragment, taskCopy);
    });

    return tasks;
  }

  protected runTasksInIsolation(
    tasks:             Array<ITask>,
    isolationChambers: Array<IDocumentFragmentLike>,
    linterOptions:     ILinterOptions,
    taskOptions:       TIndexableObject = {}): Array<ITask>
  {
    const tempOpts = linterOptions || {};
    const _opts: ILinterOptions = typeof tempOpts.mergeOptions === 'function' ?
      tempOpts.mergeOptions(tempOpts) :
      this.mergeOptions(tempOpts);
    const opts = Map<string, any>(_opts);
    const copy = <ILinterOptions>opts.toObject();

    const tempTaskOpts = taskOptions || {};
    const taskOpts = Map<string, any>(tempTaskOpts);
    let taskCopy;

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.preSetup(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.setup(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.postSetup(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.preExecute(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      if (typeof task.execute === 'function') {
        task.execute(isolationChambers[ii], taskCopy);
      } else if (typeof task.executeMicrotask === 'function') {
        const doc = isolationChambers[ii];
        const storyData = doc.querySelector('tw-storydata');
        if (!isIElementLike(storyData)) {
          throw new Error(
            Linter.strings.RUN_TASKS_IN_ISOLATION_STORY_DATA_INVALID);
        }
        
        taskCopy = taskOpts.toObject();
        const recurser = typeof taskCopy.recurser === 'function' ?
          taskCopy.recurser : new Recurser().leftTopRecurse;
        this.filterChildNodes(storyData).forEach((childNode) => {
          let passageName: string | null = null;
          if (isIElementLike(childNode) &&
            childNode.tagName.toLowerCase() === 'tw-passagedata')
          {
            passageName = childNode.getAttribute('name');
          }

          const callback = (
            node: INodeLike,
            format: Formats,
            version: string,
            options: TIndexableObject = {}) =>
          {
            (<Function>task.executeMicrotask)(
              node,
              passageName,
              format,
              version,
              options);
          };

          taskCopy = taskOpts.toObject();
          recurser(
            childNode,
            copy.format,
            copy.version,
            callback,
            taskCopy);
        });
      } else {
        throw new Error(Linter.strings.RUN_TASKS_IN_ISOLATION_TASK_INVALID);
      }
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.postExecute(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.preComplete(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.complete(isolationChambers[ii], taskCopy);
    });

    tasks.forEach((task, ii) => {
      taskCopy = taskOpts.toObject();
      task.postComplete(isolationChambers[ii], taskCopy);
    });

    return tasks;
  }
};

export default Linter;