/// <reference path="./defaultKeywords.ts" />
import { Subject } from 'rxjs/Subject';
import Ref from './Ref';
import Event from './events/Event';
import ChangeRefStateEvent from './events/ChangeRefStateEvent';
import ChangeRefValueEvent from './events/ChangeRefValueEvent';
import ISchema from './interfaces/ISchema';
import IState, { StateTypes } from './interfaces/IState';
import IRule, { IRuleCompiled, ValidateAttributeFn } from './interfaces/IRule';
import IKeyword from './interfaces/IKeyword';
import defaultKeywords, { addKeyword } from './defaultKeywords';
import IKeywordMap from './interfaces/IKeywordMap';
import IRuleValidationResult from './interfaces/IRuleValidationResult';
import IModelValidationResult from './interfaces/IModelValidationResult';

const _ = {
  extend: require('lodash/extend'),
  cloneDeep: require('lodash/cloneDeep'),
  memoize: require('lodash/memoize'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export type Path = (string|number)[];

export type AttributeStatesMap = { [key: string]: IState };

export interface IValidationOptions {
  scope?: Path;
  ignoreValidationStates?: boolean;
  onlyDirtyRefs?: boolean;
}

export interface IModelOptionsPartial extends IValidationOptions {
  clearStateOnSet?: boolean;
  keywords?: IKeyword[];
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  debug?: boolean;
}

export interface IModelOptions extends IModelOptionsPartial {
  ignoreValidationStates: boolean;
  onlyDirtyRefs: boolean;
  clearStateOnSet: boolean;
  keywords: IKeyword[];
  errors: { [keywordName: string]: any };
  warnings: { [keywordName: string]: any };
  debug: boolean;
}

const DEFAULT_OPTIONS: IModelOptions = {
  clearStateOnSet: true,
  ignoreValidationStates: false,
  onlyDirtyRefs: false,
  keywords: [],
  errors: {},
  warnings: {},
  debug: false,
};

const SCHEMA_ANNOTATIONS = [
  'title',
  'description',
  'default',
  'readOnly',
  'writeOnly',
  'examples',
  'filter',
  'error',
  'warning',
  'errors',
  'warnings',
];

const UNDEFINED_RESULT_WARNING = 'The model received an undefined validation result. ' +
  'This is probably due to the lack of schema rules applicable to the model\'s value.';

function mergeResults(results: IRuleValidationResult[]): IRuleValidationResult {
  const result: IRuleValidationResult = {
    required: false,
    readOnly: false,
    writeOnly: false,
  };

  results.forEach((item) => {
    const { required, readOnly, writeOnly, valid, message, ...metadata } = item;

    required && (result.required = true);
    readOnly && (result.readOnly = true);
    writeOnly && (result.writeOnly = true);

    if (
      (valid === true && result.valid === undefined)
      ||
      (valid === false && result.valid !== false)
    ) {
      result.valid = valid;
      result.message = message;
    } else if (valid === true && result.valid === true && result.message === undefined) {
      result.message = message;
    }

    _.extend(result, metadata);
  });

  return result;
}

function resultToState(result: IRuleValidationResult, path: Path, lock: number): IState {
  let type: StateTypes = StateTypes.PRISTINE;
  const { required, readOnly, writeOnly, valid, message, ...metadata } = result;

  if (valid === true) {
    type = StateTypes.SUCCESS;
  } else if (valid === false) {
    type = StateTypes.ERROR;
  }

  return {
    ...metadata,
    path,
    lock,
    type,
    message,
    required: typeof required === 'boolean' ? required : false,
    readOnly: typeof readOnly === 'boolean' ? readOnly : false,
    writeOnly: typeof writeOnly === 'boolean' ? writeOnly : false,
  };
}

export default class Model {
  private readonly keywords: IKeywordMap;
  private readonly rule: IRuleCompiled;
  private isPrepared = false;

  public value: any;
  public states: AttributeStatesMap;
  public readonly initialValue: any;
  public readonly observable: Subject<Event>;
  public readonly options: IModelOptions;
  public readonly schema: ISchema;

  public ref: (path?: Path) => Ref;

  constructor(schema: ISchema, initialValue: any, options?: IModelOptionsPartial) {
    this.initialValue = _.cloneDeep(initialValue);
    this.value = _.cloneDeep(initialValue);
    this.states = {};
    this.observable = new Subject();
    this.schema = schema;
    this.keywords = { ...defaultKeywords };
    this.options = _.extend({}, DEFAULT_OPTIONS, options);
    this.ref = _.memoize(
      (path: Path = []): Ref => {
        return new Ref(this, path);
      },
      (path) => path ? JSON.stringify(path) : '[]',
    );

    this.options.keywords.forEach((keyword) => {
      this.addKeyword(keyword);
    });

    this.rule = this.compile(schema);
  }

  get async(): boolean {
    return !!this.rule.async;
  }

  /**
   * Dispatch event
   * @param event
   */
  dispatch(event: Event) {
    this.observable.next(event);
  }

  private dispatchChangeValue(ref: Ref) {
    const { key, path } = ref;

    if (this.options.clearStateOnSet) {
      const curState = this.getRefState(ref);

      this.states[key] = {
        path,
        type: StateTypes.PRISTINE,
        required: curState.required,
        readOnly: curState.readOnly,
        writeOnly: curState.writeOnly,
        lock: ref.validationLock,
      };
    }

    this.dispatch(new ChangeRefValueEvent(path, ref.get()));
  }

  /**
   * Set the attribute state
   * @param {IState} state
   */
  private setRefState(state: IState) {
    const ref = this.ref(state.path);
    const { key } = ref;
    const curState = this.getRefState(ref);

    if (curState && curState.lock > state.lock) {
      return;
    }

    this.states[key] = state;

    this.dispatch(new ChangeRefStateEvent(state.path, state));
  }

  /**
   * Get the validation state along the supplied path
   * @param {Ref} ref
   * @returns {IState}
   */
  getRefState(ref: Ref): IState {
    const { path, key } = ref;

    if (!this.states[key]) {
      this.states[key] = {
        path,
        type: StateTypes.PRISTINE,
        required: false,
        readOnly: false,
        writeOnly: false,
        lock: 0,
      };
    }

    return this.states[key];
  }

  private getRefStates(ref: Ref): AttributeStatesMap {
    const { path } = ref;

    if (path.length) {
      const pattern = JSON.stringify(path).slice(0, -1);
      const states = {};

      Object.entries(this.states).forEach(([k, v]) => {
        if (k.indexOf(pattern) === 0) {
          states[k] = v;
        }
      });

      return states;
    }

    return this.states;
  }

  /**
   * Set value
   * @param ref
   * @param value
   */
  setRefValue(ref: Ref, value: any) {
    if (ref.path.length) {
      _.set(this.value, ref.path, value);
    } else {
      this.value = value;
    }

    this.dispatchChangeValue(ref);
  }

  /**
   * Get value
   * @param ref
   * @returns value
   */
  getRefValue(ref: Ref): any {
    return ref.path.length ? _.get(this.value, ref.path) : this.value;
  }

  /**
   * Get initial value
   */
  getRefInitialValue(ref: Ref): any {
    return ref.path.length
      ? _.get(this.initialValue, ref.path)
      : this.initialValue;
  }

  getRefErrors(ref: Ref): IState[] {
    return Object.values(this.getRefStates(ref))
      .filter((state) => state.type === StateTypes.ERROR);
  }

  validate(options: IValidationOptions = {})
    : IModelValidationResult | Promise<IModelValidationResult> {
    if (this.options.debug && !this.isPrepared) {
      console.warn('You are trying to validate an unprepared model. ' +
        'In most cases, it is recommended to prepare the model before validation.');
    }

    const scope = options.scope ? options.scope.join('.') : '';
    const ignoreValidationStates = options.ignoreValidationStates !== undefined
      ? options.ignoreValidationStates
      : this.options.ignoreValidationStates;
    const onlyDirtyRefs = options.onlyDirtyRefs !== undefined
      ? options.onlyDirtyRefs
      : this.options.onlyDirtyRefs;
    const results: { [path: string]: IRuleValidationResult } = {};
    // tslint:disable-next-line
    const model: this = this;
    let firstErrorRef: Ref | undefined = undefined;

    // validate attribute function
    function validateAttributeFn(ref: Ref, rule: IRule)
      : IRuleValidationResult | Promise<IRuleValidationResult> {
      function createUndefinedResult() {
        return rule.async
          ? Promise.resolve(ref.createUndefinedResult())
          : ref.createUndefinedResult();
      }

      if (!rule.validate) {
        return createUndefinedResult();
      }

      // skip jobs
      if (scope) {
        const refScope = ref.path.join('.');

        if (refScope.length < scope.length) {
          if (!scope.startsWith(refScope)) return createUndefinedResult();
        } else {
          if (!refScope.startsWith(scope)) return createUndefinedResult();
        }
      }

      // async validation
      if (rule.async) {
        if (!ignoreValidationStates) {
          // pending state
          const curState = model.getRefState(ref);

          model.setRefState({
            ...curState,
            type: StateTypes.PENDING,
            lock: ref.validationLock,
          });
        }

        const lock = ref.validationLock;

        return (rule.validate(ref, validateAttributeFn) as Promise<IRuleValidationResult>)
          .then((result: IRuleValidationResult) => {
            const key = JSON.stringify(ref.path);
            const curResult = results[key] || {};
            const mergedResult = results[key] = mergeResults([curResult, result]);

            const state = resultToState(mergedResult, ref.path, lock);

            if (ignoreValidationStates || (onlyDirtyRefs && !ref.isDirty)) {
              const curState = model.getRefState(ref);

              model.setRefState({
                ...curState,
                ...state,
                type: curState.type,
                message: curState.message,
              });
            } else {
              model.setRefState(state);

              if (state.type === StateTypes.ERROR && firstErrorRef === undefined) {
                firstErrorRef = ref;
              }
            }

            return result;
          });
      }

      const key = JSON.stringify(ref.path);
      const curResult = results[key] || {};
      const result = results[key] = mergeResults(
        [curResult, rule.validate(ref, validateAttributeFn) as IRuleValidationResult],
      );

      const state = resultToState(result, ref.path, ref.validationLock);

      if (ignoreValidationStates || (onlyDirtyRefs && !ref.isDirty)) {
        const curState = model.getRefState(ref);

        model.setRefState({
          ...curState,
          ...state,
          type: curState.type,
          message: curState.message,
        });
      } else {
        model.setRefState(state);

        if (state.type === StateTypes.ERROR && firstErrorRef === undefined) {
          firstErrorRef = ref;
        }
      }

      return result;
    }

    this.clearAttributeStates(options.scope || []);

    if (this.rule.async) {
      return (validateAttributeFn(this.ref(), this.rule) as Promise<IRuleValidationResult>)
        .then((result) => {
          if (this.options.debug && result.valid === undefined) {
            console.warn(UNDEFINED_RESULT_WARNING);
          }

          return {
            firstErrorRef,
            valid: !!result.valid,
          };
        });
    }

    const result = validateAttributeFn(this.ref(), this.rule) as IRuleValidationResult;

    if (this.options.debug && result.valid === undefined) {
      console.warn(UNDEFINED_RESULT_WARNING);
    }

    return {
      firstErrorRef,
      valid: !!result.valid,
    };
  }

  validateSync(options: IValidationOptions = {}): IModelValidationResult {
    if (this.async) {
      throw new Error('Can\'t validate in synchronized mode.');
    }

    return this.validate(options) as IModelValidationResult;
  }

  validateAsync(options: IValidationOptions = {}): Promise<IModelValidationResult> {
    if (this.async) {
      return this.validate(options) as Promise<IModelValidationResult>;
    }

    return Promise.resolve(this.validate(options) as IModelValidationResult);
  }

  prepare(options: IValidationOptions = {})
    : IModelValidationResult | Promise<IModelValidationResult> {
    options.ignoreValidationStates = true;
    this.isPrepared = true;

    return this.validate(options);
  }

  prepareSync(options: IValidationOptions = {}): IModelValidationResult {
    options.ignoreValidationStates = true;
    this.isPrepared = true;

    return this.validateSync(options);
  }

  prepareAsync(options: IValidationOptions = {}): Promise<IModelValidationResult> {
    options.ignoreValidationStates = true;
    this.isPrepared = true;

    return this.validateAsync(options);
  }

  private compile = (schema: ISchema): IRuleCompiled => {
    const annotationResult: IRuleValidationResult = {
      title: schema.title,
      description: schema.description,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly,
    };

    const defaultValue = schema.default;
    const filterFn = schema.filter;
    const errorDesc = schema.error;
    const warningDesc = schema.warning;
    const schemaErrors = schema.errors || {};
    const schemaWarnings = schema.warnings || {};
    const modelErrors = this.options.errors;
    const modelWarnings = this.options.warnings;

    if (filterFn !== undefined && typeof filterFn !== 'function') {
      throw new Error('The schema of the "filter" keyword should be a function.');
    }

    function addSchemaMessageDescriptions(result: IRuleValidationResult) {
      const { message } = result;

      if (message) {
        if (result.valid === true) {
          message.description = warningDesc
            || schemaWarnings[message.keyword]
            || modelWarnings[message.keyword]
            || message.description;
        } else if (result.valid === false) {
          message.description = errorDesc
            || schemaErrors[message.keyword]
            || modelErrors[message.keyword]
            || message.description;
        }
      }

      return result;
    }

    // get rules
    const rules: IRuleCompiled[] = [{
      keyword: 'annotations',
      async: false,
      validate: (ref: Ref) => {
        const value = ref.get();

        if (value === undefined) {
          if (defaultValue !== undefined) {
            this.setRefValue(ref, defaultValue);
          }
        } else {
          if (filterFn) {
            const filteredValue = filterFn(value);

            if (filteredValue !== value) {
              this.setRefValue(ref, filteredValue);
            }
          }
        }

        return annotationResult;
      },
    }];

    Object.entries(schema).forEach(([keywordName, keywordSchema]) => {
      if (SCHEMA_ANNOTATIONS.indexOf(keywordName) !== -1) {
        return;
      }

      const keyword: IKeyword = this.keywords[keywordName];

      if (!keyword) {
        throw new Error(`Keyword "${keywordName}" does't exists.`);
      }

      const rule = keyword.compile(this.compile, keywordSchema, schema) as IRuleCompiled;
      rule.keyword = keyword.name;

      rules.push(rule);
    });

    const async = rules.some((item) => !!item.async);

    let validate: (ref: Ref, validateAttributeFn: ValidateAttributeFn)
      => IRuleValidationResult | Promise<IRuleValidationResult>;

    if (async) {
      validate = async (ref, validateAttributeFn) => {
        const results: IRuleValidationResult[] = [];

        for (const rule of rules) {
          if (rule.validate) {
            const res = await validateAttributeFn(ref, rule) as IRuleValidationResult;
            results.push(res);
          }
        }

        return addSchemaMessageDescriptions(mergeResults(results));
      };
    } else {
      validate = (ref, validateAttributeFn) => {
        const results = rules
          .map((rule) => rule.validate && validateAttributeFn(ref, rule))
          .filter((item) => !!item) as IRuleValidationResult[];

        return addSchemaMessageDescriptions(mergeResults(results));
      };
    }

    // think about adding the "schema" keyword and use it
    return {
      async,
      validate,
      keyword: 'schema',
    };
  }

  addKeyword(keyword: IKeyword) {
    addKeyword(keyword, this.keywords);
  }

  private clearAttributeStates(path: Path) {
    if (!path.length) {
      this.states = {};
    } else {
      const prefix = JSON.stringify(path).slice(0, -1);

      Object.keys(this.states).forEach((statePath) => {
        if (statePath.startsWith(prefix)) {
          delete this.states[statePath];
        }
      });
    }
  }
}
