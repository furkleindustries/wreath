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
  nodeFactory,
} from './nodeFactory';

export function passageDataFactory(
  passage:  IPassage,
  document: IDocumentLike): IElementLike
{
  const passageData = document.createElement('tw-passagedata');
  passageData.setAttribute('name', passage.passageName);
  passageData.setAttribute('tags', passage.tags.join(' '));
  const nodes = passage.abstractSyntaxTree.map((node) => {
    return nodeFactory(node, document);
  });

  passageData.append(...nodes);
  return passageData;
}

export default passageDataFactory;