import Ref from './Ref';
import { IModelValidationOptions } from './Model';

export type Path = string;
export type Route = (string | number)[];

export type ValueType = 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean';

// Model
export interface IModelOptionsPartial {
  // utilized by Ref::messageDescription to make messages readable
  descriptionResolver?: (message: IValidationMessage) => string | any;
  // default validator options
  validator?: IValidatorOptionsPartial;
  // additional keywords
  keywords?: IKeyword[];
  // mode
  debug?: boolean;
}

export interface IModelOptions extends IModelOptionsPartial {
  // validation's process default opts
  validator: IModelValidationOptions;
  descriptionResolver: (message: IValidationMessage) => string | any;
  debug: boolean;
}

// Validator
export interface IValidationMessage {
  keyword: string;
  description: any;
  bindings: {};
}

export interface IValidatorOptionsPartial {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  keywords?: IKeyword[];
}

export interface IValidatorOptions extends IValidatorOptionsPartial {
  coerceTypes: boolean;
  removeAdditional: boolean;
  errors: { [keywordName: string]: any };
  warnings: { [keywordName: string]: any };
  keywords: IKeyword[];
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
  removeAdditional?: boolean;
}

// rules
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

// storage
export interface IStorage {
  get(path: Route): any;
  set(path: Route, value: any): void;
}
