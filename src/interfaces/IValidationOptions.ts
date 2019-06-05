import { Path } from '../Model';

export default interface IValidationOptions {
  scope?: Path;
  ignoreValidationStates?: boolean;
  onlyDirtyRefs?: boolean;
  coerceTypes?: boolean;
  removeAdditional?: boolean;
}
