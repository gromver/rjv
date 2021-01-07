export type Path = string;
export type Route = (string | number)[];

export type ValueType = 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean';

// storage
export interface IStorage {
  get(path: Route): any;
  set(path: Route, value: any): void;
}

// ref
export interface IRef {
  readonly path: string;
  readonly route: Route;
  value: any;
  getValue: () => any;
  setValue: (value: any) => void;
  ref: (absOrRelPath: Path) => IRef;
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

// validation messages
export interface IValidationMessage {
  success: boolean;
  keyword: string;
  description: any;
  bindings: {};
}

// validate fn
export interface IValidateFnOptions {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  validateFirst?: boolean;
}

export interface ValidateFn {
  (ref: IRef, options: IValidateFnOptions, applyValidateFn: ApplyValidateFn)
    : Promise<KeywordFnValidationResult>;
}

export interface ApplyValidateFn {
  (ref: IRef, validateFn: ValidateFn, options: IValidateFnOptions)
    : Promise<KeywordFnValidationResult>;
}

export interface IValidateFnResult {
  valid: boolean;
  messages: IValidationMessage[];
}

export type KeywordFnValidationResult = IValidateFnResult | undefined;

export type InlineFnValidationResult = IValidateFnResult | string | boolean | undefined;

// validator
export interface IValidatorOptions {
  coerceTypes: boolean;
  removeAdditional: boolean;
  validateFirst: boolean;
  errors: { [keywordName: string]: any };
  warnings: { [keywordName: string]: any };
  keywords: IKeyword[];
}

export interface IValidationResult {
  valid: boolean;
  results: {
    [absPath: string]: KeywordFnValidationResult;
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
