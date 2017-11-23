import {
  NodeTypes,
} from '../constants';
import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export interface IIgnores extends TIndexableObject {
  nodeTypes:    Array<NodeTypes>;
  elementTags:  Array<string>,
  passageNames: Array<string>,
  passageTags:  Array<string>,
};

export default IIgnores;