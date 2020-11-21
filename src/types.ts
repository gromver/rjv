import ValidationMessage from './ValidationMessage';

export type Path = string;
export type Route = (string | number)[];

export type ValueType = 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean';

// storage
export interface IStorage {
  get(path: Route): any;
  set(path: Route, value: any): void;
}

// Ref
export interface IRef {
  readonly path: string;
  readonly route: Route;
  value: any;
  getValue: () => any;
  setValue: (value: any) => void;
  ref: (relPath: Path) => IRef;
}

// Validator
export interface IValidationMessage {
  success: boolean;
  keyword: string;
  description: any;
  bindings: {};
}

export interface IValidatorOptions {
  coerceTypes: boolean;
  removeAdditional: boolean;
  errors: { [keywordName: string]: any };
  warnings: { [keywordName: string]: any };
  keywords: IKeyword[];
}

// schema
export interface ISchema {
  default?: any;
  filter?: (value: any) => any;
  readonly?: boolean;
  error?: any;
  warning?: any;
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  removeAdditional?: boolean;
}

// rules
export interface IRuleValidationOptions {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
}

export interface ValidateRuleFn {
  (ref: IRef, rule: IRule, options: IRuleValidationOptions)
    : Promise<RuleValidationResult>;
}

export interface RuleValidateFn {
  (ref: IRef, options: IRuleValidationOptions, validateRuleFn: ValidateRuleFn)
    : Promise<RuleValidationResult>;
}

export interface IRule {
  validate?: RuleValidateFn;
}

export interface IRuleCompiled extends IRule {
  keyword: string;
}

export type IInlineValidationResult = ValidationMessage | string | boolean | undefined;

export type RuleValidationResult = IRuleValidationResult | undefined;

export interface IRuleValidationResult {
  valid: boolean;
  messages: IValidationMessage[];
}

export interface IValidationResult {
  valid: boolean;
  results: {
    [path: string]: IRuleValidationResult;
  };
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
