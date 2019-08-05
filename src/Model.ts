/// <reference path="./defaultKeywords.ts" />
import { Subject } from 'rxjs/Subject';
import Ref from './Ref';
import Event from './events/Event';
import ChangeRefStateEvent from './events/ChangeRefStateEvent';
import ChangeRefValueEvent from './events/ChangeRefValueEvent';
import ISchema from './interfaces/ISchema';
import IState, { StateTypes } from './interfaces/IState';
import IRule, { IRuleCompiled, ValidateRuleFn } from './interfaces/IRule';
import IKeyword from './interfaces/IKeyword';
import defaultKeywords, { addKeyword } from './defaultKeywords';
import IKeywordMap from './interfaces/IKeywordMap';
import IRuleValidationResult from './interfaces/IRuleValidationResult';
import IModelValidationResult from './interfaces/IModelValidationResult';
import IValidationOptions from './interfaces/IValidationOptions';

const _ = {
  extend: require('lodash/extend'),
  cloneDeep: require('lodash/cloneDeep'),
  memoize: require('lodash/memoize'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export type Path = (string|number)[];

export type AttributeStatesMap = { [key: string]: IState };

export interface IModelOptionsPartial extends IValidationOptions {
  clearStateOnSet?: boolean;
  keywords?: IKeyword[];
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  debug?: boolean;
}

export interface IModelOptions extends IModelOptionsPartial {
  // validation's process default opts
  coerceTypes: boolean;
  removeAdditional: boolean;
  ignoreValidationStates: boolean;
  onlyDirtyRefs: boolean;
  // model's default opts
  clearStateOnSet: boolean;
  keywords: IKeyword[];
  errors: { [keywordName: string]: any };
  warnings: { [keywordName: string]: any };
  debug: boolean;
}

const DEFAULT_OPTIONS: IModelOptions = {
  coerceTypes: false,
  removeAdditional: false,
  ignoreValidationStates: false,
  onlyDirtyRefs: false,
  clearStateOnSet: true,
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
  'errors',
  'warning',
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

function resultToState(result: IRuleValidationResult, path: Path, valLock: number): IState {
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
    valLock,
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
  private valLock = 0;
  private errLock = 0;

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
      const { type, message, ...inheritedState } = this.getRefState(ref);

      this.states[key] = {
        ...inheritedState,
        type: StateTypes.PRISTINE,
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

    if (curState.valLock > state.valLock) {
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
        valLock: 0,
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
   * @param dispatch
   */
  setRefValue(ref: Ref, value: any, dispatch) {
    if (ref.path.length) {
      _.set(this.value, ref.path, value);
    } else {
      this.value = value;
    }

    dispatch && this.dispatchChangeValue(ref);
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

  get validationLock(): number {
    return this.valLock += 1;
  }

  get errorLock(): number {
    return this.errLock += 1;
  }

  validateRef(ref: Ref, options: IValidationOptions = {}): Promise<boolean> {
    const valLock = this.validationLock;

    if (this.options.debug && !this.isPrepared) {
      console.warn('You are trying to validate an unprepared model. ' +
        'In most cases, it is recommended to prepare the model before validation.');
    }

    const scope = ref.path.join('.') || '';
    const ignoreValidationStates = options.ignoreValidationStates !== undefined
      ? options.ignoreValidationStates
      : this.options.ignoreValidationStates;
    const onlyDirtyRefs = options.onlyDirtyRefs !== undefined
      ? options.onlyDirtyRefs
      : this.options.onlyDirtyRefs;
    const coerceTypes = options.coerceTypes !== undefined
      ? options.coerceTypes
      : this.options.coerceTypes;
    const removeAdditional = options.removeAdditional !== undefined
      ? options.removeAdditional
      : this.options.removeAdditional;
    const results: { [path: string]: IRuleValidationResult } = {};

    // validate attribute function
    const validateRuleFn: ValidateRuleFn = (curRef: Ref, rule: IRule)
      : Promise<IRuleValidationResult> => {
      if (!rule.validate) {
        return Promise.resolve(curRef.createUndefinedResult());
      }

      const curScope = curRef.path.join('.');

      const isRefInScope = !scope || curScope.startsWith(scope);

      if (isRefInScope && !ignoreValidationStates && !(onlyDirtyRefs && !curRef.isDirty)) {
        // validating state
        const curState = this.getRefState(curRef);

        this.setRefState({
          ...curState,
          valLock,
          type: StateTypes.VALIDATING,
        });
      }

      return rule.validate(curRef, validateRuleFn)
        .then((result: IRuleValidationResult) => {
          if (result.valid === false) {
            result.errLock = this.errorLock;
          }

          const key = curRef.key;
          const curResult = results[key] || {};
          const mergedResult = results[key] = mergeResults([curResult, result]);

          const state = resultToState(mergedResult, curRef.path, valLock);
          if (isRefInScope && !ignoreValidationStates && !(onlyDirtyRefs && !curRef.isDirty)) {
            this.setRefState(state);
          } else {
            const curState = this.getRefState(curRef);

            this.setRefState({
              ...curState,
              ...state,
              type: curState.type,
              message: curState.message,
            });
          }

          return result;
        });
    };

    validateRuleFn.options = {
      coerceTypes,
      removeAdditional,
    };

    this.clearAttributeStates(ref.path);

    return validateRuleFn(this.ref(), this.rule)
      .then((result) => {
        if (this.options.debug && result.valid === undefined) {
          console.warn(UNDEFINED_RESULT_WARNING);
        }

        return !!result.valid;
      });
  }

  validate(options: IValidationOptions = {}): Promise<boolean> {
    return this.ref().validate(options);
  }

  prepare(options: IValidationOptions = {}): Promise<boolean> {
    options.ignoreValidationStates = true;
    this.isPrepared = true;

    return this.validateRef(this.ref(), options);
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
      validate: async (ref: Ref) => {
        const value = ref.get();

        if (value === undefined) {
          if (defaultValue !== undefined) {
            this.setRefValue(ref, defaultValue, false);
          }
        } else {
          if (filterFn) {
            const filteredValue = filterFn(value);

            if (filteredValue !== value) {
              this.setRefValue(ref, filteredValue, false);
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

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn)
      : Promise<IRuleValidationResult> => {
      const results: IRuleValidationResult[] = [];

      for (const rule of rules) {
        if (rule.validate) {
          const res = await rule.validate(ref, validateRuleFn);

          results.push(res);
        }
      }

      return addSchemaMessageDescriptions(mergeResults(results));
    };

    return {
      validate,
      keyword: 'schema',
    };
  }

  addKeyword(keyword: IKeyword) {
    addKeyword(keyword, this.keywords);
  }

  clearAttributeStates(path: Path) {
    const pathKey = JSON.stringify(path);
    const prefix = pathKey.slice(0, -1);

    Object.keys(this.states).forEach((statePath) => {
      if (statePath.startsWith(prefix) && statePath !== pathKey) {
        delete this.states[statePath];
      }
    });
  }
}
