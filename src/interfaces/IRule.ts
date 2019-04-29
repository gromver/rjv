import Ref from '../Ref';
import IRuleValidationResult from './IRuleValidationResult';

export type ValidateAttributeFn = (ref: Ref, rule: IRule)
  => IRuleValidationResult | Promise<IRuleValidationResult>;

export default interface IRule {
  async?: boolean;
  validate?: (ref: Ref, validateAttributeFn: ValidateAttributeFn)
    => IRuleValidationResult | Promise<IRuleValidationResult>;
}

export interface IRuleCompiled extends IRule {
  keyword: string;
}
