import {
  ArrayIRGenerator,
} from '../IRGenerator/ArrayIRGenerator';
jest.mock('../IRGenerator/ArrayIRGenerator');
import {
  DetectionModes,
  Formats,
  ignores,  
} from '../constants';
import {
  detectFormat,
} from '../modules/detectFormat';
jest.mock('../modules/detectFormat');
import {
  detectVersion,
} from '../modules/detectVersion';
jest.mock('../modules/detectVersion');
import {
  DocumentFragmentIRGenerator,
} from '../IRGenerator/DocumentFragmentIRGenerator';
jest.mock('../IRGenerator/DocumentFragmentIRGenerator');
import {
  documentFactory,
} from '../modules/documentFactory';
jest.mock('../modules/documentFactory');
import {
  Map,
} from 'immutable';
jest.mock('immutable');
import {
  isIDocumentLike,
} from '../TypeGuards/isIDocumentLike';
jest.mock('../TypeGuards/isIDocumentLike');
import {
  isIElementLike,
} from '../TypeGuards/isIElementLike';
jest.mock('../TypeGuards/isIElementLike');
import {
  isIIgnores,
} from '../TypeGuards/isIIgnores';
jest.mock('../TypeGuards/isIIgnores');
import {
  Linter,
} from './Linter';
import {
  Recurser,
} from '../Recurser/Recurser';
jest.mock('../Recurser/Recurser');

const semver = require('semver');
jest.mock('semver');

describe('Linter constructor unit tests.', () => {
  it('Rejects if the options argument is falsy.', () => {
    const func = () => new Linter(null);
    expect(func).toThrow(Linter.strings.CONSTRUCTOR_OPTIONS_INVALID);
  });

  it('Rejects if the options argument is not an object.', () => {
    const func = () => new Linter('foo');
    expect(func).toThrow(Linter.strings.CONSTRUCTOR_OPTIONS_INVALID);
  });

  it('Merges options if guard conditions are passed.', () => {
    const options = { mergeOptions: jest.fn(() => options), };
    const linter = new Linter(options);
    expect(linter.options).toBe(options);
    expect(linter.options.mergeOptions.mock.calls).toEqual([ 
      [ options, ],
    ]);
  });
});

describe('Linter constructor integration tests.', () => {
  beforeEach(() => {
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    semver.valid.mockClear();
    semver.valid.mockReturnValue(true);
  });

  it('Uses the Linter\'s mergeOptions method if the options argument does not contain a mergeOptions function.', () => {
    const documentFactory = jest.fn();
    const linter = new Linter({
      documentFactory,
      format: 'gately',
      version: '2.3.4',
    });

    expect(linter.options).toEqual({
      detectionMode: DetectionModes.Manual,
      documentFactory,
      format: Formats.Gately,
      ignores: {
        elementTags: [
          'script',
          'style',
        ],
        nodeTypes: [],
        passageNames: [
          'lint',
          'linter',
          'twinelint',
          'twinelinter',
          'wreath',
        ],
        passageTags: [
          'lint',
          'linter',
          'twinelint',
          'twinelinter',
          'wreath',
        ],
      },
      runInIsolation: false,
      version: '2.3.4',
    });
  });
});

describe('Linter lint unit tests.', () => {
  function getLinterSafe() {
    const options = { mergeOptions: jest.fn(() => options), };
    const linter = new Linter(options);
    linter.mergeOptions = jest.fn();
    linter.filterChildNodes = jest.fn(() => []);
    linter.generateIRStageOne = jest.fn();
    linter.generateIRStageTwo = jest.fn(() => ({
      cloneNode: jest.fn(),
    }));

    linter.runTasks = jest.fn();

    return linter;
  }

  beforeEach(() => {
    documentFactory.mockClear();
    isIDocumentLike.mockClear();
    isIDocumentLike.mockReturnValue(true);
    isIElementLike.mockClear();
    isIElementLike.mockReturnValue(true);
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
      get: () => false,
    }));
  });

  it('Passes through an empty options object if the options argument is falsy.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    const linter = getLinterSafe();
    linter.mergeOptions = jest.fn(aa => aa);
    const cloneNode = jest.fn();
    linter.generateIRStageTwo = jest.fn(() => ({
      cloneNode,
    }));

    const execute = jest.fn();
    linter.lint(null, [ { execute, }, ], null);
    expect(linter.runTasks.mock.calls).toEqual([
      [
        [ { execute, }, ],
        [ { cloneNode, }, ],
        {},
      ],
    ]);
  });

  it('Rejects if the storyData argument is an empty string.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint('');
    expect(func).toThrow(Linter.strings.LINT_STORY_DATA_EMPTY_STRING);
  });

  it('Rejects if storyData is a string with content but there is no documentFactory option.', () => {
    const linter = getLinterSafe();
    linter.mergeOptions = jest.fn(() => ({}));
    const func = () => linter.lint('foo');
    expect(func).toThrow(Linter.strings.LINT_DOCUMENT_GETTER_INVALID);
  });

  it('Rejects if the product of the documentFactory option does not match the isIDocumentLike type guard.', () => {
    isIDocumentLike.mockReturnValue(false);
    const linter = getLinterSafe();
    linter.mergeOptions = jest.fn(() => ({
      documentFactory: jest.fn(),
    }));

    const func = () => linter.lint('foo');
    expect(func).toThrow(Linter.strings.LINT_DOCUMENT_INVALID);
  });

  it('Rejects if the product of querying the document element for a tw-storydata element does not meet the isIElementLike type guard.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const querySelector = jest.fn();
    linter.mergeOptions = jest.fn(() => ({
      documentFactory: jest.fn(() => ({
        documentElement: {
          querySelector,
        },
      })),
    }));

    const func = () => linter.lint('bar');
    expect(func).toThrow(Linter.strings.LINT_STORY_DATA_INVALID);
    expect(querySelector.mock.calls).toEqual([
      [ 'tw-storydata', ],
    ]);
  });

  it('Uses the document to create an element if there is no documentElement.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const querySelector = jest.fn();
    const createElement = jest.fn(() => ({
      querySelector,
    }));

    linter.mergeOptions = jest.fn(() => ({
      documentFactory: jest.fn(() => ({
        createElement,
      })),
    }));

    const func = () => linter.lint('bar');
    expect(func).toThrow(Linter.strings.LINT_STORY_DATA_INVALID);
    expect(createElement.mock.calls).toEqual([
      [ 'html', ],
    ]);

    expect(querySelector.mock.calls).toEqual([
      [ 'tw-storydata', ],
    ]);
  });

  it('Rejects if the storyData argument is neither an element nor a string.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const func = () => linter.lint();
    expect(func).toThrow(Linter.strings.LINT_STORY_DATA_INVALID);
  });

  it('Rejects if the tasks argument is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null);
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });

  it('Rejects if the tasks argument is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null);
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });
  
  it('Rejects if the tasks argument is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null);
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });

  it('Rejects if the tasks argument is not an object.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, 'foo');
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });

  it('Rejects if the tasks argument does not have a length which is a number greater than or equal to 0.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, { length: null, });
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });

  it('Rejects if tasks.length is not an integer.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, { length: 2.5, });
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });

  it('Rejects if tasks.filter is not a function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, Object.assign([], { filter: null, }));
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });

  it('Rejects if tasks.forEach is not a function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, Object.assign([], { forEach: null, }));
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });
  
  it('Rejects if tasks.map is not a function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, Object.assign([], { map: null, }));
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });
  
  it('Rejects if tasks.reduce is not a function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, Object.assign([], { reduce: null, }));
    expect(func).toThrow(Linter.strings.LINT_TASKS_INVALID);
  });
  
  it('Rejects if tasks.length is less than or equal to 0.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, []);
    expect(func).toThrow(Linter.strings.LINT_TASKS_EMPTY);
  });

  it('Rejects if one of the tasks in the tasks arraylike argument is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, [ null, ]);
    expect(func).toThrow(Linter.strings.LINT_TASK_INVALID);
  });

  it('Rejects if one of the tasks in the tasks arraylike argument has neither an execute nor executeMicrotask method.', () => {
    const linter = getLinterSafe();
    const func = () => linter.lint(null, [ {}, ]);
    expect(func).toThrow(Linter.strings.LINT_TASK_NO_EXECUTE_METHOD);
  });

  it('Filters out non-element results from Linter.filterChildNodes.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => ({}),
    }));
    
    let counter = 0;
    isIElementLike.mockImplementation(() => {
      if (counter % 2 === 0) {
        counter += 1;
        return true;
      } else {
        counter += 1;
        return false;
      }
    });

    const linter = getLinterSafe();
    const one = { one: 'one', };
    const two = { two: 'two', };
    const three = { three: 'three', };
    const four = { four: 'four', };
    linter.filterChildNodes = jest.fn((childNodes) => [
      one,
      two,
      three,
      four,
    ]);
    
    linter.lint(null, [ { execute: () => {}, }, ]);
    expect(linter.generateIRStageOne.mock.calls.length).toBe(1);
    expect(linter.generateIRStageOne.mock.calls[0][0]).toEqual([
      two,
      four,
    ]);
  });

  it('Passes the options argument, if it is truthy, to the options.mergeOptions function.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    const linter = getLinterSafe();
    const options = { mergeOptions: jest.fn(() => ({})), };
    linter.lint(null, [ { execute: jest.fn(), }], options);
    expect(options.mergeOptions.mock.calls).toEqual([ 
      [ options, ],
    ]);
  });

  it('Passes the options argument, if options.mergeOptions does not exist, to the Linter\'s mergeOptions method.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));
    
    const linter = getLinterSafe();
    linter.mergeOptions = jest.fn((aa) => aa);
    const options = {};
    linter.lint(null, [ { execute: jest.fn(), }, ], options);
    expect(linter.mergeOptions.mock.calls).toEqual([ 
      [ options, ],
    ]);
  });
  
  it('Passes an empty object, if the options argument is falsy, to the Linter\'s mergeOptions method.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    const linter = getLinterSafe();
    linter.mergeOptions = jest.fn((aa) => aa);
    linter.lint(null, [ { execute: jest.fn(), }]);
    expect(linter.mergeOptions.mock.calls).toEqual([ 
      [ {}, ],
    ]);
  });

  it('Passes a copy of the options argument to the Linter\'s filterChildNodes method.', () => {
    const linter = getLinterSafe();
    const storyData = {};
    const options = { mergeOptions: jest.fn((aa) => aa), };
    linter.lint(storyData, [ { execute: jest.fn(), }], options);
    expect(linter.filterChildNodes.mock.calls).toEqual([ 
      [
        storyData,
        options,
      ],
    ]);
  });

  it('Passes a copy of the options argument to the Linter\'s generateIRStageOne method.', () => {
    const linter = getLinterSafe();
    const options = { mergeOptions: jest.fn((aa) => aa), };
    linter.lint(null, [ { execute: jest.fn(), }], options);
    expect(linter.generateIRStageOne.mock.calls).toEqual([ 
      [
        [],
        options,
      ],
    ]);
  });
  
  it('Passes a copy of the options argument to the Linter\'s generateIRStageTwo method.', () => {
    const linter = getLinterSafe();
    const passages = {};
    linter.generateIRStageOne = jest.fn(() => passages);
    const options = { mergeOptions: jest.fn((aa) => aa), };
    linter.lint(null, [ { execute: jest.fn(), }], options);
    expect(linter.generateIRStageTwo.mock.calls).toEqual([ 
      [
        passages,
        options,
      ],
    ]);
  });

  it('Creates a single document fragment if options.runInIsolation is falsy.', () => {
    const linter = getLinterSafe();
    const docFrag = { cloneNode: () => docFrag, };
    linter.generateIRStageTwo = jest.fn(() => docFrag);
    const tasks = [
      { execute: jest.fn(), },
      { execute: jest.fn(), },
    ];

    const options = { test: 'foo', };
    Map.mockImplementation((aa) => ({
      toObject: () => options,
      get: () => false,
    }));

    const result = linter.lint(null, tasks, options);
    expect(linter.runTasks.mock.calls).toEqual([
      [
        tasks,
        [ docFrag, ],
        options,
      ],
    ]);
  });
  
  it('Creates multiple document fragments if options.runInIsolation is true.', () => {
    const linter = getLinterSafe();
    const docFrag = { cloneNode: jest.fn(() => docFrag), };
    const options = { runInIsolation: true, };
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
      get: () => true,
    }));

    linter.mergeOptions = jest.fn(() => options);
    linter.generateIRStageTwo = jest.fn(() => docFrag);
    const tasks = [
      { execute: jest.fn(), },
      { execute: jest.fn(), },
    ];
    const result = linter.lint(null, tasks, options);
    expect(docFrag.cloneNode.mock.calls.length).toBe(1);
    expect(linter.runTasks.mock.calls).toEqual([
      [
        tasks,
        [
          docFrag,
          docFrag,
        ],
        options,
      ],
    ]);
  });
});

describe('Linter mergeOptions unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    delete linter.options.mergeOptions;
    return linter;
  }

  beforeEach(() => {
    detectFormat.mockClear();
    detectVersion.mockClear();
    isIElementLike.mockClear();
    isIElementLike.mockReturnValue(true);
    isIIgnores.mockClear();
    isIIgnores.mockReturnValue(true);
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
      get: () => false,
    }));

    semver.valid.mockClear();
    semver.valid.mockReturnValue(true);
  });

  it('Copies the values of this Linter\'s options to a Map.', () => {
    const linter = getLinterSafe();
    linter.mergeOptions({ storyData: { foo: 'foo', }, });
    expect(Map.mock.calls).toEqual([
      [ linter.options, ],
    ]);
  });

  it('Rejects if detectionMode is in args and is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ detectionMode: false, });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_DETECTION_MODE_INVALID);
  });
  
  it('Rejects if detectionMode is in args and is not a string.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ detectionMode: true, });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_DETECTION_MODE_INVALID);
  });
  
  it('Rejects if detectionMode is in args and is a string but is not an item in DetectionModes.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ detectionMode: 'foobar', });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_DETECTION_MODE_UNRECOGNIZED);
  });

  it('Rejects if detectionMode is not in args, is in the Linter\'s options property, and is falsy.', () => {
    const linter = getLinterSafe();
    linter.options.detectionMode = null;
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_DETECTION_MODE_INVALID);
  });

  it('Rejects if detectionMode is not in args, is in the Linter\'s options property, and is not a string.', () => {
    const linter = getLinterSafe();
    linter.options.detectionMode = true;
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_DETECTION_MODE_INVALID);
  });

  it('Rejects if detectionMode is not in args, is in the Linter\'s options property, and is not an item in constants.DetectionModes.', () => {
    const linter = getLinterSafe();
    linter.options.detectionMode = 'foobar';
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_DETECTION_MODE_UNRECOGNIZED);
  });

  it('Rejects if documentFactory is in args but is not a function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ documentFactory: null, });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_DOCUMENT_GETTER_INVALID);
  });

  it('Rejects if documentFactory is not in args, is in the Linter\'s options property, and is not a function.', () => {
    const linter = getLinterSafe();
    linter.options.documentFactory = false;
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_DOCUMENT_GETTER_INVALID);
  });

  it('Rejects if format is in args but is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ format: null, });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_FORMAT_INVALID);
  });

  it('Rejects if format is in args but is not a string.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ format: 3, });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_FORMAT_INVALID);
  });

  it('Rejects if format is in args but is not an item in constants.Formats.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({ format: 'fug', });
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_FORMAT_UNRECOGNIZED);
  });

  it('Rejects if format is not in args, is in the Linter\'s options property, but is falsy.', () => {
    const linter = getLinterSafe();
    linter.options.format = null;
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_FORMAT_INVALID);
  });

  it('Rejects if format is not in args, is in the Linter\'s options property, but is not a string.', () => {
    const linter = getLinterSafe();
    linter.options.format = 4;
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_FORMAT_INVALID);
  });

  it('Rejects if format is not in args, is in the Linter\'s options property, but is not an item in constants.Formats.', () => {
    const linter = getLinterSafe();
    linter.options.format = 'bux';
    const func = () => linter.mergeOptions();
    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_FORMAT_UNRECOGNIZED);
  });

  it('Rejects if format is not in args or the Linter\'s options property, and args.storyData is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions();
    expect(func).toThrow(Linter.strings.MERGE_OPTIONS_ARGS_STORY_DATA_INVALID);
  });
  
  it('Rejects if format is not in args or the Linter\'s options property, and args.storyData is not a string and does not match the isIElementLike type guard.', () => {
    const linter = getLinterSafe();
    isIElementLike.mockReturnValue(false);
    const func = () => linter.mergeOptions({
      storyData: 3,
    });

    expect(func).toThrow(Linter.strings.MERGE_OPTIONS_ARGS_STORY_DATA_INVALID);
  });

  it('Rejects if ignores is in args and it does not meet the isIIgnores type guard.', () => {
    const linter = getLinterSafe();
    isIIgnores.mockReturnValue(false);
    const func = () => linter.mergeOptions({
      storyData: {},
      ignores: null,
    });

    expect(func).toThrow(Linter.strings.MERGE_OPTIONS_ARGS_IGNORES_INVALID);
  });
  
  it('Rejects if ignores is not in args, is in the Linter\'s options property, and it does not meet the isIIgnores type guard.', () => {
    const linter = getLinterSafe();
    linter.options.ignores = 'baz';
    isIIgnores.mockReturnValue(false);
    const func = () => linter.mergeOptions({ storyData: {}, });
    expect(func).toThrow(Linter.strings.MERGE_OPTIONS_THIS_IGNORES_INVALID);
  });

  it('Rejects if runInIsolation is in args and is not a boolean.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({
      storyData: {},
      runInIsolation: null,
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_RUN_IN_ISOLATION_INVALID);
  });
  
  it('Rejects if runInIsolation is not in args, is in the Linter\'s options property, and is not a boolean.', () => {
    const linter = getLinterSafe();
    linter.options.runInIsolation = 'foobar';
    const func = () => linter.mergeOptions({
      storyData: {},
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_RUN_IN_ISOLATION_INVALID);
  });
  
  it('Rejects if version is in args but is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({
      storyData: {},
      version: null,
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_VERSION_INVALID);
  });

  it('Rejects if version is in args but is not a string.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({
      storyData: {},
      version: 3,
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_VERSION_INVALID);
  });

  it('Rejects if version is in args but is not a valid semantic version.', () => {
    const linter = getLinterSafe();
    semver.valid.mockReturnValue(false);
    const func = () => linter.mergeOptions({
      storyData: {},
      version: 'fug',
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_ARGS_VERSION_NOT_SEMANTIC);
  });

  it('Rejects if version is not in args, is in the Linter\'s options property, but is falsy.', () => {
    const linter = getLinterSafe();
    linter.options.version = null;
    const func = () => linter.mergeOptions({
      storyData: {},
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_VERSION_INVALID);
  });

  it('Rejects if version is not in args, is in the Linter\'s options property, but is not a string.', () => {
    const linter = getLinterSafe();
    linter.options.version = 4;
    const func = () => linter.mergeOptions({
      storyData: {},
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_VERSION_INVALID);
  });

  it('Rejects if version is not in args, is in the Linter\'s options property, but is not an item in constants.Formats.', () => {
    const linter = getLinterSafe();
    semver.valid.mockReturnValue(false);
    linter.options.version = 'bux';
    const func = () => linter.mergeOptions({
      storyData: {},
    });

    expect(func).toThrow(
      Linter.strings.MERGE_OPTIONS_THIS_VERSION_NOT_SEMANTIC);
  });

  it('Rejects if version is not in args or the Linter\'s options property, and args.storyData is falsy.', () => {
    const linter = getLinterSafe();
    const func = () => linter.mergeOptions({
      format: 'gately',
      storyData: null,
    });

    expect(func).toThrow(Linter.strings.MERGE_OPTIONS_ARGS_STORY_DATA_INVALID);
  });

  it('Rejects if version is not in args or the Linter\'s options property, and args.storyData is not a string and does not match the isIElementLike type guard.', () => {
    const linter = getLinterSafe();
    isIElementLike.mockReturnValue(false);
    const func = () => linter.mergeOptions({
      format: 'gately',
      storyData: 3,
    });

    expect(func).toThrow(Linter.strings.MERGE_OPTIONS_ARGS_STORY_DATA_INVALID);
  });

  it('Passes through valid options from the options argument.', () => {
    const linter = getLinterSafe();
    const options = {
      detectionMode: DetectionModes.Manual,
      documentFactory: jest.fn(),
      format: Formats.Gately,
      ignores: {},
      runInIsolation: true,
      version: 'foobar',
    };

    expect(linter.mergeOptions(options)).toEqual(options);
  });
  
  it('Passes through valid options from the Linter\'s options property.', () => {
    const options = {
      detectionMode: DetectionModes.Manual,
      documentFactory: jest.fn(),
      format: Formats.Gately,
      ignores: {},
      mergeOptions: jest.fn((aa) => aa),
      runInIsolation: true,
      version: 'foobar',
    };

    const linter = new Linter(options);
    expect(linter.mergeOptions()).toEqual(options);
  });
  
  it('Passes through valid defaults.', () => {
    detectFormat.mockReturnValue('__format');
    detectVersion.mockReturnValue('__version');

    const options = {
      detectionMode: DetectionModes.Auto,
      mergeOptions: jest.fn((aa) => {
        delete aa.mergeOptions;
        return aa;
      }),
    };

    const linter = new Linter(options);
    expect(linter.mergeOptions({ storyData: {}, })).toEqual({
      detectionMode: DetectionModes.Auto,
      documentFactory,
      format: '__format',
      ignores,
      runInIsolation: false,
      version: '__version',
    });
  });

  it('Defaults the detectionMode property to DetectionModes.Manual.', () => {
    const linter = getLinterSafe();
    delete linter.options.detectionMode;
    expect(linter.mergeOptions({ storyData: {}, }).detectionMode)
      .toBe(DetectionModes.Manual);
  });
});

describe('Linter filterChildNodes unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    delete linter.options.mergeOptions;
    linter.mergeOptions = jest.fn(() => ({}));
    return linter;
  }

  beforeEach(() => {
    isIElementLike.mockClear();
    isIElementLike.mockReturnValue(true);
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));
  });
  
  it('Rejects if the storyData argument does not meet the isIElementLike type guard.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const func = () => linter.filterChildNodes();
    expect(func).toThrow(Linter.strings.FILTER_CHILD_NODES_STORY_DATA_INVALID);
  });

  it('Rejects if the storyData argument neither an array nor a value matching the isIElementLike type guard.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const func = () => linter.filterChildNodes({});
    expect(func).toThrow(Linter.strings.FILTER_CHILD_NODES_STORY_DATA_INVALID);
  });

  it('Uses the storyData argument like an array if it meets the arraylike shape.', () => {
    const from = Array.from;
    const test = [ 'test', ];
    Array.from = jest.fn(() => []);
    const linter = getLinterSafe();
    linter.filterChildNodes(test);
    expect(Array.from.mock.calls).toEqual([
      [ test, ],
    ]);

    Array.from = from;
  });
  
  it('Uses the storyData argument\'s childNodes property like an array if it meets the arraylike shape.', () => {
    const from = Array.from;
    const childNodes = [ 'test', ]
    const test = {
      childNodes,
    };

    Array.from = jest.fn(() => []);
    const linter = getLinterSafe();
    linter.filterChildNodes(test);
    expect(Array.from.mock.calls).toEqual([
      [ childNodes, ],
    ]);

    Array.from = from;
  });

  it('Does not fail if the options argument is falsy and no options are needed.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    const linter = getLinterSafe();
    linter.mergeOptions = jest.fn(aa => aa);
    const func = () => linter.filterChildNodes([], null);
    expect(func).not.toThrow();
  });
  
  it('Calls the options merger if it is provided.', () => {
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    const linter = getLinterSafe();
    const mergeOptions = jest.fn((aa) => aa);
    linter.filterChildNodes([], {
      mergeOptions,
    });

    expect(mergeOptions.mock.calls).toEqual([
      [
        { mergeOptions, },
      ],
    ]);
  });

  it('Creates a copy of the options for each child node.', () => {
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [ 1, ],
      },

      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };

    Map.mockReturnValue(options);
    linter.filterChildNodes([
      { nodeType: 1, },
      { nodeType: 1, },
      { nodeType: 1, },
    ]);

    expect(options.toObject.mock.calls).toEqual([ [], [], [], ]);
  });
  
  it('Skips all nodes whose nodeType is present in opts.ignores.nodeTypes.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [ 1, ],
      },

      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };

    Map.mockReturnValue(options);
    expect(linter.filterChildNodes([
      { nodeType: 1, },
      { nodeType: 3, },
      { nodeType: 1, },
    ])).toEqual([ { nodeType: 3, }, ]);
  });
  
  it('Skips all elements whose tagName is in opts.ignores.elementTags.', () => {
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [],
        elementTags: [ 'div', ],
        passageNames: [],
      },

      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };

    Map.mockReturnValue(options);
    const getAttribute = jest.fn();
    expect(linter.filterChildNodes([
      {
        tagName: 'div',
        getAttribute,
      },
      {
        tagName: 'span',
        getAttribute,
      },
      {
        tagName: 'p',
        getAttribute,
      },
    ])).toEqual([
      {
        tagName: 'span',
        getAttribute,
      },
      {
        tagName: 'p',
        getAttribute,
      },
    ]);
  });
  
  it('Passes through all elements whose nodeType is not in opts.ignores.nodeTypes and whose tagName is not in opts.ignores.elementTags.', () => {
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [],
        elementTags: [],
        passageNames: [],
      },
      
      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };
    
    Map.mockReturnValue(options);
    const getAttribute = jest.fn();
    expect(linter.filterChildNodes([
      {
        tagName: 'div',
        getAttribute,
      },
      {
        tagName: 'span',
        getAttribute,
      },
      {
        tagName: 'p',
        getAttribute,
      },
    ])).toEqual([
      {
        tagName: 'div',
        getAttribute,
      },
      {
        tagName: 'span',
        getAttribute,
      },
      {
        tagName: 'p',
        getAttribute,
      },
    ]);
  });

  it('Skips all elements whose passage name is in opts.ignores.passageNames.', () => {
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [],
        elementTags: [],
        passageNames: [ 'foo', 'baz', ],
        passageTags: [],
      },

      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };

    const passes = jest.fn(() => 'bar');
    Map.mockReturnValue(options);
    expect(linter.filterChildNodes([
      {
        tagName: 'tw-passagedata',
        getAttribute: jest.fn(() => 'foo'),
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: jest.fn(() => 'baz'),
      },
    ])).toEqual([
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
      },
    ]);
  });

  it('Passes through values when getAttribute returns null.', () => {
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [],
        elementTags: [],
        passageNames: [],
        passageTags: [],
      },

      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };

    const passes = jest.fn(() => null);
    Map.mockReturnValue(options);
    expect(linter.filterChildNodes([
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'one',
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'two',
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'three',
      },
    ])).toEqual([
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'one',
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'two',
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'three',
      },
    ]);
  });

  it('Skips all elements who have tags in opts.ignores.passageTags.', () => {
    const linter = getLinterSafe();
    const options = {
      ignores: {
        nodeTypes: [],
        elementTags: [],
        passageNames: [],
        passageTags: [ 'one', 'three', ],
      },

      toObject: jest.fn(() => {
        const obj = Object.assign({}, options);
        delete obj.toObject;
        return obj;
      }),
    };

    let counter = -1;
    const passes = jest.fn(() => {
      const values = [
        null,
        'one foo',
        null,
        'two bar',
        null,
        'three baz',
      ];

      return values[counter += 1];
    });

    Map.mockReturnValue(options);
    expect(linter.filterChildNodes([
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'one',
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'two',
      },
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'three',
      },
    ])).toEqual([
      {
        tagName: 'tw-passagedata',
        getAttribute: passes,
        z: 'two',
      },
    ]);
  });
});

describe('Linter generateIRStageOne unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    delete linter.options.mergeOptions;
    linter.mergeOptions = jest.fn(() => ({}));
    return linter;
  }

  beforeEach(() => {
    ArrayIRGenerator.mockClear();
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));
  });

  it('Uses the merger provided by the options argument.', () => {
    const linter = getLinterSafe();
    const mergeOptions = jest.fn();
    linter.generateIRStageOne(null, { mergeOptions, });
    expect(mergeOptions.mock.calls).toEqual([ [ { mergeOptions, }, ], ]);
  });

  it('Uses the merger provided by the Linter\'s options property.', () => {
    const linter = getLinterSafe();
    linter.generateIRStageOne(null);
    expect(linter.mergeOptions.mock.calls).toEqual([ [ {}, ], ]);
  });

  it('Copies the merged options.', () => {
    const linter = getLinterSafe();
    linter.generateIRStageOne(null);
    expect(Map.mock.calls).toEqual([ [ {}, ], ]);
  });

  it('Creates an IntermediateRepresentationGenerator and calls generate on it.', () => {
    const linter = getLinterSafe();
    const passages = { test: '-_test', };
    linter.generateIRStageOne(passages);
    expect(ArrayIRGenerator.mock.instances.length).toBe(1);
    expect(ArrayIRGenerator.mock.instances[0].generate.mock.calls).toEqual([
      [
        passages,
        {},
      ],
    ]);
  });
});

describe('Linter generateIRStageTwo unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    delete linter.options.mergeOptions;
    linter.mergeOptions = jest.fn(() => ({}));
    return linter;
  }

  beforeEach(() => {
    DocumentFragmentIRGenerator.mockClear();
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));
  });

  it('Uses the merger provided by the options argument.', () => {
    const linter = getLinterSafe();
    const mergeOptions = jest.fn();
    linter.generateIRStageTwo(null, { mergeOptions, });
    expect(mergeOptions.mock.calls).toEqual([ [ { mergeOptions, }, ], ]);
  });

  it('Uses the merger provided by the Linter\'s options property.', () => {
    const linter = getLinterSafe();
    linter.generateIRStageTwo(null);
    expect(linter.mergeOptions.mock.calls).toEqual([ [ {}, ], ]);
  });

  it('Copies the merged options.', () => {
    const linter = getLinterSafe();
    linter.generateIRStageTwo(null);
    expect(Map.mock.calls).toEqual([ [ {}, ], ]);
  });

  it('Creates an IntermediateRepresentationGenerator and calls generate on it.', () => {
    const linter = getLinterSafe();
    const passages = { test: '-_test', };
    linter.generateIRStageTwo(passages);
    expect(DocumentFragmentIRGenerator.mock.instances.length).toBe(1);
    expect(DocumentFragmentIRGenerator.mock.instances[0].generate.mock.calls).toEqual([
      [
        passages,
        {},
      ],
    ]);
  });
});

describe('Linter runTasks unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    delete linter.options.mergeOptions;
    linter.mergeOptions = jest.fn((aa) => aa);
    linter.runTasksInParallel = jest.fn();
    linter.runTasksInIsolation = jest.fn();
    return linter;
  }

  beforeEach(() => {
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));
  });

  it('Uses the merger provided by the options argument.', () => {
    const linter = getLinterSafe();
    const mergeOptions = jest.fn(aa => aa);
    linter.runTasks([], [], { mergeOptions, });
    expect(mergeOptions.mock.calls).toEqual([ [ { mergeOptions, }, ], ]);
  });

  it('Uses the merger provided by the Linter\'s options property.', () => {
    const linter = getLinterSafe();
    linter.runTasks([], []);
    expect(linter.mergeOptions.mock.calls).toEqual([ [ {}, ], ]);
  });

  it('Copies the merged options and the task options.', () => {
    const linter = getLinterSafe();
    linter.runTasks([], []);
    expect(Map.mock.calls).toEqual([
      [ {}, ],
      [ {}, ],
    ]);
  });

  it('Calls the Linter\'s runTasksInIsolation method if opts.runInIsolation is true.', () => {
    const linter = getLinterSafe();
    const tasks = [ 'foo', ];
    const isolationChambers = [ 'bar', ];
    const linterOpts = { runInIsolation: true, }
    const taskOpts = { test: '__test', };
    linter.runTasks(tasks, isolationChambers, linterOpts, taskOpts);
    expect(linter.runTasksInIsolation.mock.calls).toEqual([
      [
        tasks,
        isolationChambers,
        linterOpts,
        taskOpts,
      ],
    ]);
  });
  
  it('Calls the Linter\'s runTasksInParallel method if opts.runInIsolation is not true.', () => {
    const linter = getLinterSafe();
    const tasks = [ 'foo', ];
    const isolationChambers = [ 'bar', ];
    const linterOpts = { runInIsolation: 'baz', };
    const taskOpts = { test: '__test', };
    linter.runTasks(tasks, isolationChambers, linterOpts, taskOpts);
    expect(linter.runTasksInParallel.mock.calls).toEqual([
      [
        tasks,
        isolationChambers[0],
        linterOpts,
        taskOpts,
      ],
    ]);
  });

  it('Defaults to an empty object if linterOptions is falsy.', () => {
    const linter = getLinterSafe();
    const tasks = [ 'foo', ];
    const isolationChambers = [ 'bar', ];
    const linterOpts = false;
    const taskOpts = { test: '__test', };
    linter.runTasks(tasks, isolationChambers, linterOpts, taskOpts);
    expect(linter.runTasksInParallel.mock.calls).toEqual([
      [
        tasks,
        isolationChambers[0],
        {},
        taskOpts,
      ],
    ]);
  });
  
  it('Defaults to an empty object if taskOptions is falsy.', () => {
    const linter = getLinterSafe();
    const tasks = [ 'foo', ];
    const isolationChambers = [ 'bar', ];
    const linterOpts = { bar: 'baz', };
    const taskOpts = null;
    linter.runTasks(tasks, isolationChambers, linterOpts, taskOpts);
    expect(linter.runTasksInParallel.mock.calls).toEqual([
      [
        tasks,
        isolationChambers[0],
        linterOpts,
        {},
      ],
    ]);
  });
});

describe('Linter runTasksInParallel unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    linter.filterChildNodes = jest.fn((aa) => aa);
    delete linter.options.mergeOptions;
    linter.mergeOptions = jest.fn((aa) => aa);
    return linter;
  }

  beforeEach(() => {
    isIElementLike.mockClear();
    isIElementLike.mockReturnValue(true);
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));
  });

  it('Uses the linterOptions.mergeOptions function if it is available.', () => {
    const linter = getLinterSafe();
    const docFrag = { querySelector: jest.fn(() => []), };
    const linterOptions = { mergeOptions: jest.fn(), };
    const taskOptions = { test: '__test', };
    linter.runTasksInParallel([], docFrag, linterOptions, taskOptions);
    expect(linterOptions.mergeOptions.mock.calls).toEqual([
      [ linterOptions, ],
    ]);
  });

  it('Copies the linterOptions and taskOptions arguments.', () => {
    const linter = getLinterSafe();
    const docFrag = { querySelector: jest.fn(() => []), };
    const linterOptions = { test: '++test', };
    const taskOptions = { test: '__test', };
    linter.runTasksInParallel([], docFrag, linterOptions, taskOptions);
    expect(Map.mock.calls).toEqual([
      [ linterOptions, ],
      [ taskOptions, ],
    ]);
  });
  
  it('Runs each of the tasks once for all the simple tasks, and once for each element, walking through every element in the storyData.', () => {
    const linter = getLinterSafe();
    const nodeOne = {
      tagName: 'tw-passagedata',
      getAttribute: jest.fn(() => 'foo'),
    };

    const nodeTwo = {
      tagName: 'tw-passagedata',
      getAttribute: jest.fn(() => 'bar'),
    };

    const nodeThree = {
      tagName: 'test-script',
      getAttribute: jest.fn(() => null),
    };

    linter.filterChildNodes.mockReturnValue([
      nodeOne,
      nodeTwo,
      nodeThree,
    ]);

    const taskOne = {
      preSetup: jest.fn(),
      setup: jest.fn(),
      postSetup: jest.fn(),
      preExecute: jest.fn(),
      executeMicrotask: jest.fn(),
      postExecute: jest.fn(),
      preComplete: jest.fn(),
      complete: jest.fn(),
      postComplete: jest.fn(),
    };

    const taskTwo = {
      preSetup: jest.fn(),
      setup: jest.fn(),
      postSetup: jest.fn(),
      preExecute: jest.fn(),
      executeMicrotask: jest.fn(),
      postExecute: jest.fn(),
      preComplete: jest.fn(),
      complete: jest.fn(),
      postComplete: jest.fn(),
    };

    const taskThree = {
      preSetup: jest.fn(),
      setup: jest.fn(),
      postSetup: jest.fn(),
      preExecute: jest.fn(),
      executeMicrotask: jest.fn(),
      postExecute: jest.fn(),
      preComplete: jest.fn(),
      complete: jest.fn(),
      postComplete: jest.fn(),
    };

    const tasks = [ taskOne, taskTwo, taskThree, ];
    const docFrag = {
      querySelector: jest.fn(() => []),
    };

    const recurser = (a, b, c, d, e) => d(a, b, c);
    const taskOptions = {
      test: '__test',
      recurser,
    };

    const results = linter.runTasksInParallel(tasks, docFrag, {}, taskOptions);
    expect(results).toEqual(tasks);
    expect(taskOne.preSetup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);

    expect(taskTwo.preSetup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.preSetup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);

    expect(taskOne.setup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.setup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.setup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);

    expect(taskOne.postSetup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.postSetup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.postSetup.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);

    expect(taskOne.preExecute.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.preExecute.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
        
    expect(taskThree.preExecute.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);

    expect(taskOne.executeMicrotask.mock.calls).toEqual([
      [
        nodeOne,
        'foo',
        undefined,
        undefined,
        {},
      ],

      [
        nodeTwo,
        'bar',
        undefined,
        undefined,
        {},
      ],
      
      [
        nodeThree,
        null,
        undefined,
        undefined,
        {},
      ],
    ]);
    
    expect(taskTwo.executeMicrotask.mock.calls).toEqual([
      [
        nodeOne,
        'foo',
        undefined,
        undefined,
        {},
      ],

      [
        nodeTwo,
        'bar',
        undefined,
        undefined,
        {},
      ],
      
      [
        nodeThree,
        null,
        undefined,
        undefined,
        {},
      ],
    ]);
    
    expect(taskThree.executeMicrotask.mock.calls).toEqual([
      [
        nodeOne,
        'foo',
        undefined,
        undefined,
        {},
      ],

      [
        nodeTwo,
        'bar',
        undefined,
        undefined,
        {},
      ],
      
      [
        nodeThree,
        null,
        undefined,
        undefined,
        {},
      ],
    ]);
    
    expect(taskOne.postExecute.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.postExecute.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.postExecute.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskOne.preComplete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.preComplete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.preComplete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskOne.complete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.complete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.complete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskOne.postComplete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskTwo.postComplete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
    
    expect(taskThree.postComplete.mock.calls).toEqual([
      [ docFrag, taskOptions, ],
    ]);
  });

  it('Rejects if the storyData produced by querying the document does not meet the isIElementLike type guard.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const func = () => linter.runTasksInParallel([], {
      querySelector: jest.fn(),
    });

    expect(func).toThrow(
      Linter.strings.RUN_TASKS_IN_PARALLEL_STORY_DATA_INVALID);
  });

  it('Does not fail if no task options are provided to the function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.runTasksInParallel([], {
      querySelector: jest.fn(() => []),
    }, null, null);
    
    expect(func).not.toThrow();
  });
});


describe('Linter runTasksInIsolation unit tests.', () => {
  function getLinterSafe() {
    /* Mock out the mergeOptions call in the constructor. */
    const linter = new Linter({ mergeOptions: jest.fn((aa) => aa), });
    linter.filterChildNodes = jest.fn((aa) => aa);
    delete linter.options.mergeOptions;
    linter.mergeOptions = jest.fn((aa) => aa);
    return linter;
  }

  beforeEach(() => {
    isIElementLike.mockClear();
    isIElementLike.mockReturnValue(true);
    Map.mockClear();
    Map.mockImplementation((aa) => ({
      toObject: () => aa,
    }));

    Recurser.mockClear();
  });
  
  it('Uses the linterOptions.mergeOptions function if it is available.', () => {
    const linter = getLinterSafe();
    const docFrag = { querySelector: jest.fn(() => []), };
    const linterOptions = { mergeOptions: jest.fn(), };
    const taskOptions = { test: '__test', };
    linter.runTasksInIsolation([], [ docFrag, ], linterOptions, taskOptions);
    expect(linterOptions.mergeOptions.mock.calls).toEqual([
      [ linterOptions, ],
    ]);
  });

  it('Copies the linterOptions and taskOptions arguments.', () => {
    const linter = getLinterSafe();
    const docFrag = {
      querySelector: jest.fn(() => []),
    };

    const linterOptions = { test: '--test', };
    const taskOptions = { test: '__test', };
    linter.runTasksInIsolation([], docFrag, linterOptions, taskOptions);
    expect(Map.mock.calls).toEqual([
      [ linterOptions, ],
      [ taskOptions, ],
    ]);
  });
  
  it('Runs each of the tasks once for all the simple tasks, and once for each element, walking through every element in the storyData.', () => {
    const linter = getLinterSafe();
    const nodeOne = {
      tagName: 'tw-passagedata',
      getAttribute: jest.fn(() => 'foo'),
    };

    const nodeTwo = {
      tagName: 'tw-passagedata',
      getAttribute: jest.fn(() => 'bar'),
    };

    const nodeThree = {
      tagName: 'test-script',
      getAttribute: jest.fn(() => null),
    };

    linter.filterChildNodes.mockReturnValue([
      nodeOne,
      nodeTwo,
      nodeThree,
    ]);

    const taskOne = {
      preSetup: jest.fn(),
      setup: jest.fn(),
      postSetup: jest.fn(),
      preExecute: jest.fn(),
      executeMicrotask: jest.fn(),
      postExecute: jest.fn(),
      preComplete: jest.fn(),
      complete: jest.fn(),
      postComplete: jest.fn(),
    };

    const taskTwo = {
      preSetup: jest.fn(),
      setup: jest.fn(),
      postSetup: jest.fn(),
      preExecute: jest.fn(),
      executeMicrotask: jest.fn(),
      postExecute: jest.fn(),
      preComplete: jest.fn(),
      complete: jest.fn(),
      postComplete: jest.fn(),
    };

    const taskThree = {
      preSetup: jest.fn(),
      setup: jest.fn(),
      postSetup: jest.fn(),
      preExecute: jest.fn(),
      executeMicrotask: jest.fn(),
      postExecute: jest.fn(),
      preComplete: jest.fn(),
      complete: jest.fn(),
      postComplete: jest.fn(),
    };

    const tasks = [ taskOne, taskTwo, taskThree, ];
    const docFragOne = {
      querySelector: jest.fn(() => []),
    };

    const docFragTwo = Object.assign({}, docFragOne);
    const docFragThree = Object.assign({}, docFragOne);
    const isolationChambers = [ docFragOne, docFragTwo, docFragThree, ];

    const recurser = (a, b, c, d, e) => d(a, b, c);
    const taskOptions = {
      test: '__test',
      recurser,
    };

    const results = linter.runTasksInIsolation(
      tasks,
      isolationChambers,
      {},
      taskOptions);

    expect(results).toEqual(tasks);
    expect(taskOne.preSetup.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);

    expect(taskTwo.preSetup.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.preSetup.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);

    expect(taskOne.setup.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.setup.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.setup.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);

    expect(taskOne.postSetup.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.postSetup.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.postSetup.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);

    expect(taskOne.preExecute.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.preExecute.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
        
    expect(taskThree.preExecute.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);

    expect(taskOne.executeMicrotask.mock.calls).toEqual([
      [
        nodeOne,
        'foo',
        undefined,
        undefined,
        {},
      ],

      [
        nodeTwo,
        'bar',
        undefined,
        undefined,
        {},
      ],
      
      [
        nodeThree,
        null,
        undefined,
        undefined,
        {},
      ],
    ]);
    
    expect(taskTwo.executeMicrotask.mock.calls).toEqual([
      [
        nodeOne,
        'foo',
        undefined,
        undefined,
        {},
      ],

      [
        nodeTwo,
        'bar',
        undefined,
        undefined,
        {},
      ],
      
      [
        nodeThree,
        null,
        undefined,
        undefined,
        {},
      ],
    ]);
    
    expect(taskThree.executeMicrotask.mock.calls).toEqual([
      [
        nodeOne,
        'foo',
        undefined,
        undefined,
        {},
      ],

      [
        nodeTwo,
        'bar',
        undefined,
        undefined,
        {},
      ],
      
      [
        nodeThree,
        null,
        undefined,
        undefined,
        {},
      ],
    ]);
    
    expect(taskOne.postExecute.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.postExecute.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.postExecute.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);
    
    expect(taskOne.preComplete.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.preComplete.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.preComplete.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);
    
    expect(taskOne.complete.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.complete.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.complete.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);
    
    expect(taskOne.postComplete.mock.calls).toEqual([
      [ docFragOne, taskOptions, ],
    ]);
    
    expect(taskTwo.postComplete.mock.calls).toEqual([
      [ docFragTwo, taskOptions, ],
    ]);
    
    expect(taskThree.postComplete.mock.calls).toEqual([
      [ docFragThree, taskOptions, ],
    ]);
  });

  it('Rejects if the storyData produced by querying the document does not meet the IElementLike type guard.', () => {
    isIElementLike.mockReturnValue(false);
    const linter = getLinterSafe();
    const tasks = [
      {
        preSetup: () => {},
        setup: () => {},
        postSetup: () => {},
        preExecute: () => {},
        executeMicrotask: () => {},
      },
    ];

    const isolationChambers = [
      { querySelector: jest.fn(), },
    ];

    const func = () => linter.runTasksInIsolation(tasks, isolationChambers);
    expect(func).toThrow(
      Linter.strings.RUN_TASKS_IN_ISOLATION_STORY_DATA_INVALID);
  });

  it('Does not fail if no task options are provided to the function.', () => {
    const linter = getLinterSafe();
    const func = () => linter.runTasksInIsolation([], {
      querySelector: jest.fn(() => []),
    }, null, null);
    
    expect(func).not.toThrow();
  });

  it('Prioritizes execute over executeMicrotask.', () => {
    const linter = getLinterSafe();
    const tasks = [
      {
        preSetup: () => {},
        setup: () => {},
        postSetup: () => {},
        preExecute: () => {},
        execute: jest.fn(),
        executeMicrotask: jest.fn(),
        postExecute: () => {},
        preComplete: () => {},
        complete: () => {},
        postComplete: () => {},
      },
    ];

    const isolationChambers = [
      { querySelector: jest.fn(), },
    ];

    linter.runTasksInIsolation(tasks, isolationChambers);
    expect(tasks[0].execute.mock.calls).toEqual([
      [ isolationChambers[0], {}, ]
    ]);

    expect(tasks[0].executeMicrotask).not.toBeCalled();
  });

  it('Rejects if the task has neither an execute nor an executeMicrotask method.', () => {
    const linter = getLinterSafe();
    const tasks = [
      {
        preSetup: () => {},
        setup: () => {},
        postSetup: () => {},
        preExecute: () => {},
        postExecute: () => {},
        preComplete: () => {},
        complete: () => {},
        postComplete: () => {},
      },
    ];

    const isolationChambers = [
      { querySelector: jest.fn(), },
    ];

    const func = () => linter.runTasksInIsolation(tasks, isolationChambers);
    expect(func).toThrow(Linter.strings.RUN_TASKS_IN_ISOLATION_TASK_INVALID);
  });

  it('Defaults to the left top recurser if one is not provided.', () => {
    const linter = getLinterSafe();
    const child = {
      tagName: 'tw-passagedata',
      getAttribute: jest.fn(),
    };

    linter.filterChildNodes.mockReturnValue([ child, ]);

    const tasks = [
      {
        preSetup: () => {},
        setup: () => {},
        postSetup: () => {},
        preExecute: () => {},
        executeMicrotask: () => {},
        postExecute: () => {},
        preComplete: () => {},
        complete: () => {},
        postComplete: () => {},
      },
    ];

    const isolationChambers = [
      { querySelector: jest.fn(), },
    ];

    linter.runTasksInIsolation(tasks, isolationChambers);
    expect(Recurser.mock.instances[0].leftTopRecurse).toBeCalled();
  });
});