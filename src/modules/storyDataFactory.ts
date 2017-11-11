import {
  IDocumentLike,
} from '../NodeLike/ParentNodeLike/DocumentLike/IDocumentLike';
import {
  IElementLike,
} from '../NodeLike/ParentNodeLike/ElementLike/IElementLike';
import {
  IPassage,
} from '../Passage/IPassage';
import {
  passageDataFactory,
} from './passageDataFactory';

export function storyDataFactory(
  passages: Array<IPassage>,
  document: IDocumentLike): IElementLike
{
  const storyData = document.createElement('tw-storydata');
  let counter = 0;
  const nodes = passages.map((passage) => {
    let passageName = passage.passageName;
    if (!passageName) {
      passageName = `UNKNOWN_${counter}`;
      counter += 1;
    }

    return passageDataFactory(passage, document);
  });

  storyData.append(...nodes);
  return storyData;
}

export default storyDataFactory;