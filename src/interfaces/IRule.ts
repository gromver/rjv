import Ref from '../Ref';
import IRuleValidationResult from './IRuleValidationResult';

export interface IRuleValidationOptions {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
}

export interface ValidateRuleFn {
  (ref: Ref, rule: IRule): Promise<IRuleValidationResult>;
  options: IRuleValidationOptions;
}

export default interface IRule {
  validate?: (ref: Ref, validateRuleFn: ValidateRuleFn) => Promise<IRuleValidationResult>;
}

export interface IRuleCompiled extends IRule {
  keyword: string;
}
