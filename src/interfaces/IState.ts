import { Path } from '../Model';
import IValidationMessage from './IValidationMessage';
import IStateMetadata from './IStateMetadata';

export enum StateTypes {
  PRISTINE,
  VALIDATING,
  SUCCESS,
  ERROR,
}

export default interface IState extends IStateMetadata {
  type: StateTypes;
  path: Path;
  valLock: number;
  errLock?: number;
  required: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  message?: IValidationMessage;
}
