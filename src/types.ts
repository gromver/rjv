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

// Validate fn
export interface IValidateFnOptions {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
}

export interface ValidateFn {
  (ref: IRef, options: IValidateFnOptions, applyValidateFn: ApplyValidateFn)
    : Promise<ValidateFnResult>;
}

export interface ApplyValidateFn {
  (ref: IRef, validateFn: ValidateFn, options: IValidateFnOptions)
    : Promise<ValidateFnResult>;
}

export type InlineValidationResult = ValidationMessage | string | boolean | undefined;

export type ValidateFnResult = IValidateFnResult | undefined;

export interface IValidateFnResult {
  valid: boolean;
  messages: IValidationMessage[];
}

export interface IValidatorResult {
  valid: boolean;
  results: {
    [path: string]: IValidateFnResult;
  };
}

// keywords
export type CompileFn = (schema: any, parentSchema: ISchema) => ValidateFn;

export interface IKeyword {
  name: string;
  reserveNames?: string[];
  compile(compileFn: CompileFn, schema: any, parentSchema: ISchema): ValidateFn;
}

export interface IKeywordMap {
  [keyword: string]: IKeyword;
}
