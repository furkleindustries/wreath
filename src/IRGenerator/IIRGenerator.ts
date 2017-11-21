import {
  TIndexableObject,
} from '../TypeAliases/TIndexableObject';

export interface IIRGenerator {
  generate(
    value:   any,
    context: TIndexableObject): any;
}

export default IIRGenerator;