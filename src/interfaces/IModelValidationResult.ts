import Ref from '../Ref';

export default interface IModelValidationResult {
  valid: boolean;
  firstErrorRef?: Ref;
}
