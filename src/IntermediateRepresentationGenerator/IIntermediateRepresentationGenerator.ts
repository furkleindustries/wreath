import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export interface IIntermediateRepresentationGenerator {
  generate(
    value:   any,
    options: TIndexableObject): any;
}

export default IIntermediateRepresentationGenerator;