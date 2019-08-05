import IStateMetadata from './IStateMetadata';
import IValidationMessage from './IValidationMessage';

export default interface IRuleValidationResult extends IStateMetadata {
  valid?: boolean;
  message?: IValidationMessage;
  required?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  [additionalMetadata: string]: any;
}
