import {
  ICharacterDataLike,
} from '../ICharacterDataLike';

export interface IProcessingInstructionLike extends ICharacterDataLike {
  target:                    string;
  cloneNode(deep?: boolean): IProcessingInstructionLike;
}

export default IProcessingInstructionLike;