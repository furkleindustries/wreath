import {
  NodeTypes, Versions,
} from '../constants';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  IIntermediateRepresentationGenerator,
} from './IIntermediateRepresentationGenerator';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  isIElementLike,
} from '../TypeGuards/isIElementLike';
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

const semver = require('semver');

export class ArrayIntermediateRepresentationGenerator implements IIntermediateRepresentationGenerator {
  generate(
    storyData: Array<IElementLike>,
    context: TIndexableObject): Array<IPassage>
  {
    if (!isIElementLike(storyData)) {
      throw new Error('The storyDataElem argument was not an element.');
    }

    const passages: Array<IPassage> = [];
    const children = storyData.children;
    for (let ii = 0; ii < children.length; ii += 1) {
      const child = children[ii];
      const values = Object.values(NodeTypes);
      if (values.indexOf(child.nodeType.toString()) !== -1) {
        continue;
      }

      const abstractSyntaxTree = context.parser.parse(child.textContent);
      if (!abstractSyntaxTree || !abstractSyntaxTree.length) {
        throw new Error('There is no output.');
      }

      let passageName;
      const version = context.version;
      let requirement = Versions['^1'];
      if (semver.satisfies(version, requirement)) {
        passageName = child.getAttribute('tiddler');
      }

      requirement = Versions['^2'];
      if (semver.satisfies(version, requirement)) {
        passageName = child.getAttribute('name');
      }

      if (!passageName) {
        throw new Error('A passage name could not be found in one of the ' +
                        'passage elements.');
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

export default ArrayIntermediateRepresentationGenerator;