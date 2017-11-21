import {
  ArrayIRGenerator,
} from './ArrayIRGenerator';
import {
  Formats,
  Versions,
} from '../constants';
import {
  isIElementLike,
} from '../TypeGuards/isIElementLike';
jest.mock('../TypeGuards/isIElementLike');
import {
  parserFactory,
} from '../Parser/parserFactory';
jest.mock('../Parser/parserFactory');
import {
  satisfies,
  valid,
} from 'semver';
jest.mock('semver');

describe('ArrayIRGenerator.generate unit tests.', () => {
  beforeEach(() => {
    isIElementLike.mockClear();
    isIElementLike.mockReturnValue(true);
    parserFactory.mockClear();
    parserFactory.mockReturnValue({
      parse: jest.fn(),
    });

    satisfies.mockClear();
    satisfies.mockReturnValue(true);
    valid.mockClear();
    valid.mockReturnValue(true);
  });

  it('Rejects if the storyData argument does not meet the isIElementLike type guard.', () => {
    isIElementLike.mockReturnValue(false);
    const gen = new ArrayIRGenerator();
    const func = () => gen.generate();
    expect(func).toThrow(ArrayIRGenerator.strings.GENERATE_STORY_DATA_INVALID);
  });

  it('Rejects if context.format is falsy.', () => {
    const gen = new ArrayIRGenerator();
    const func = () => gen.generate();
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_FORMAT_INVALID);
  });

  it('Rejects if ctx.format is not a string.', () => {
    const gen = new ArrayIRGenerator();
    const func = () => gen.generate(null, { format: 2, });
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_FORMAT_INVALID);
  });

  it('Rejects if ctx.format is not in constants.Formats.', () => {
    const gen = new ArrayIRGenerator();
    const func = () => gen.generate(null, { format: 'bux', });
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_FORMAT_UNRECOGNIZED);
  });

  it('Rejects if context.version is falsy.', () => {
    const gen = new ArrayIRGenerator();
    const func = () => gen.generate(null, {
      format: Formats.Gately,
    });

    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_INVALID);
  });
  
  it('Rejects if context.version is not a string.', () => {
    const gen = new ArrayIRGenerator();
    const context = {
      format: Formats.Gately,
      version: 3,
    };

    const func = () => gen.generate(null, context);
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_INVALID);
  });

  it('Passes if ctx.version satisfies the version 1 requirements.', () => {
    const gen = new ArrayIRGenerator();
    gen.generate({ children: [], }, {
      format: Formats.Gately,
      version: 'test',
    });

    expect(satisfies.mock.calls).toEqual([
      [ 'test', Versions['^1'], ],
    ]);
  });

  it('Passes if ctx.version satisfies the version 2 requirements.', () => {
    satisfies.mockReturnValueOnce(false).mockReturnValue(true);
    const gen = new ArrayIRGenerator();
    gen.generate({ children: [], }, {
      format: Formats.Gately,
      version: 'test',
    });

    expect(satisfies.mock.calls).toEqual([
      [ 'test', Versions['^1'], ],
      [ 'test', Versions['^2'], ],
    ]);
  });

  it('Rejects if context.version is not a valid semantic version.', () => {
    valid.mockReturnValue(false);
    const gen = new ArrayIRGenerator();
    const context = {
      format: Formats.Gately,
      version: 'foo',
    };

    const func = () => gen.generate(null, context);
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_NOT_SEMANTIC);
  });

  it('Rejects if the version meets neither the v1 nor the v2 requirements.', () => {
    satisfies.mockReturnValue(false);
    const gen = new ArrayIRGenerator();
    const context = {
      format: Formats.Sugarcane,
      version: 'test', 
    };

    const func = () => gen.generate(null, context);
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_CONTEXT_VERSION_UNRECOGNIZED);
  });

  it('Calls parserFactory to generate a parser based on the format.', () => {
    const gen = new ArrayIRGenerator();
    const storyData = { children: [], };
    const context = {
      format: Formats.Gately,
      version: '1.2.3',
    };

    gen.generate(storyData, context);
    expect(parserFactory.mock.calls).toEqual([
      [ Formats.Gately, ],
    ]);
  });

  it('Rejects if there is no output from the parser.', () => {
    const gen = new ArrayIRGenerator();
    const storyData = { children: [ 'foo', ], };
    const context = {
      format: Formats.Gately,
      version: 'test',
    };

    const func = () => gen.generate(storyData, context);
    expect(func).toThrow(ArrayIRGenerator.strings.GENERATE_NO_OUTPUT);
  });

  it('Gets the tiddler attribute from the child if the version meets the v1 requirements.', () => {
    parserFactory.mockReturnValue({
      parse: jest.fn(() => ([ 'foo', ])),
    });

    const gen = new ArrayIRGenerator();
    const storyData = {
      children: [
        { getAttribute: jest.fn(() => 'test'), },
      ],
    };

    const context = {
      format: Formats.Gately,
      version: 'test',
    };

    gen.generate(storyData, context);
    expect(storyData.children[0].getAttribute.mock.calls).toEqual([
      [ 'tiddler', ],
      [ 'tags', ]
    ]);
  });
  
  it('Gets the name attribute from the child if the version meets the v2 requirements, and gets the tags.', () => {
    satisfies.mockReturnValueOnce(false).mockReturnValue(true);
    parserFactory.mockReturnValue({
      parse: jest.fn(() => ([ 'foo', ])),
    });

    const gen = new ArrayIRGenerator();
    const storyData = {
      children: [
        { getAttribute: jest.fn(() => 'test'), },
      ],
    };

    const context = {
      format: Formats.Gately,
      version: 'test',
    };

    gen.generate(storyData, context);
    expect(storyData.children[0].getAttribute.mock.calls).toEqual([
      [ 'name', ],
      [ 'tags', ],
    ]);
  });

  it('Rejects if the passageName cannot be computed.', () => {
    satisfies.mockReturnValueOnce(false).mockReturnValue(true);
    parserFactory.mockReturnValue({
      parse: jest.fn(() => ([ 'foo', ])),
    });

    const gen = new ArrayIRGenerator();
    const storyData = {
      children: [
        { getAttribute: jest.fn(() => ''), },
      ],
    };

    const context = {
      format: Formats.Gately,
      version: 'test',
    };

    const func = () => gen.generate(storyData, context);
    expect(func).toThrow(
      ArrayIRGenerator.strings.GENERATE_INVALID_PASSAGE_NAME);
  });

  it('Returns array of AST nodes.', () => {
    satisfies.mockReturnValueOnce(false).mockReturnValue(true);
    let counter = 0;
    parserFactory.mockReturnValue({
      parse: jest.fn(() => ([ `__parsed${counter += 1}`, ])),
    });

    const gen = new ArrayIRGenerator();
    const storyData = {
      children: [
        { getAttribute: jest.fn(() => 'foo'), },
        { getAttribute: jest.fn(() => 'bar'), },
        { getAttribute: jest.fn(() => 'baz'), },
      ],
    };

    const context = {
      format: Formats.Gately,
      version: 'test',
    };

    expect(gen.generate(storyData, context)).toEqual([
      {
        abstractSyntaxTree: [ '__parsed1', ],
        passageName: 'foo',
        tags: [ 'foo', ],
      },

      {
        abstractSyntaxTree: [ '__parsed2', ],
        passageName: 'bar',
        tags: [ 'bar', ],
      },

      {
        abstractSyntaxTree: [ '__parsed3', ],
        passageName: 'baz',
        tags: [ 'baz', ],
      },
    ]);
  });
});