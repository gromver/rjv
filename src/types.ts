import Ref from './Ref';

export type Path = string;
export type Route = (string | number)[];

// validation
export interface IValidationMessage {
  keyword: string;
  description: any;
  bindings?: {};
}

export default interface IValidationOptions {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  keywords?: IKeyword[];
}

export interface IRuleValidationOptions {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
}

export interface ValidateRuleFn {
  (ref: Ref, rule: IRule, options: IRuleValidationOptions): Promise<IRuleValidationResult>;
}

export interface IRule {
  validate?: (ref: Ref, validateRuleFn: ValidateRuleFn, options: IRuleValidationOptions)
    => Promise<IRuleValidationResult>;
}

export interface IRuleCompiled extends IRule {
  keyword: string;
}

export interface IRuleValidationResult {
  valid?: boolean;
  message?: IValidationMessage;
  title?: any;
  description?: any;
  required?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  validating?: boolean;
  dependencies?: string[];
  dependsOn?: string[];
  [additionalMetadata: string]: any;
}

export interface IModelValidationResult extends IRuleValidationResult {
  valLock: number;
  errLock?: number;
}

// schema
export interface ISchema {
  title?: string;
  description?: string;
  default?: any;
  filter?: (value: any) => any;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: any[];
  error?: any;
  warning?: any;
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  dependencies?: string[];
  dependsOn?: string[];
}

// keywords
export type CompileFn = (schema: any, parentSchema: ISchema) => IRule;

export interface IKeyword {
  name: string;
  reserveNames?: string[];
  compile(compileFn: CompileFn, schema: any, parentSchema: ISchema): IRule;
}

export interface IKeywordMap {
  [keyword: string]: IKeyword;
}
