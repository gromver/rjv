import Ref from '../Ref';
import IRuleValidationResult from './IRuleValidationResult';

export type ValidateAttributeFn = (ref: Ref, rule: IRule) => Promise<IRuleValidationResult>;

export default interface IRule {
  validate?: (ref: Ref, validateAttributeFn: ValidateAttributeFn) => Promise<IRuleValidationResult>;
}

export interface IRuleCompiled extends IRule {
  keyword: string;
}
