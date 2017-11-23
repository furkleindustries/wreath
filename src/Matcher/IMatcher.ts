import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export interface IMatcher extends TIndexableObject {
  first:   Function,
  match:   Function,
  select:  Function,
  byId:    Function,
  byTag:   Function,
  byClass: Function,
  byName:  Function,
};

export default IMatcher;