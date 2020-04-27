/// <reference path="./defaultKeywords.ts" />
import { Subject } from 'rxjs/Subject';
import Ref from './Ref';
import Event from './events/Event';
import ChangeRefStateEvent from './events/ChangeRefStateEvent';
import ChangeRefValueEvent from './events/ChangeRefValueEvent';
import BeforeValidationEvent from './events/BeforeValidationEvent';
import AfterValidationEvent from './events/AfterValidationEvent';
import LodashStorage from './storage/LodashStorage';
import Validator, { IValidationOptionsPartial } from './Validator';
import {
  ISchema, IStorage, IRule, ValidateRuleFn, IRuleValidationResult,
  IModelValidationResult, IModelOptionsPartial,
} from './types';
import utils from './utils';

const _ = {
  extend: require('lodash/extend'),
  assignIn: require('lodash/assignIn'),
  cloneDeep: require('lodash/cloneDeep'),
  memoize: require('lodash/memoize'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export interface IModelOptions extends IModelOptionsPartial {
  // validation's process default opts
  validation: IValidationOptionsPartial;
  debug: boolean;
}

export interface IModelValidationOptions extends IValidationOptionsPartial {
  forceValidated?: boolean;
}

const DEFAULT_OPTIONS: IModelOptions = {
  validation: {},
  debug: false,
};

const UNDEFINED_RESULT_WARNING = 'The model received an undefined validation result. ' +
  'This is probably due to the lack of schema rules applicable to the model\'s value.';

export type RefMap = {
  [path: string]: Ref;
};

export default class Model {
  private refs: RefMap;
  private valLock = 0;
  private errLock = 0;
  private validator: Validator;
  private dataStorage: IStorage;
  private initialDataStorage: IStorage;
  private schema: ISchema;

  public readonly observable: Subject<Event>;
  public readonly options: IModelOptions;

  /**
   * Creates model
   * @param schema
   * @param initialValue
   * @param options
   */
  constructor(schema: ISchema, initialValue: LodashStorage | any, options?: IModelOptionsPartial) {
    this.refs = {};
    this.options = _.extend({}, DEFAULT_OPTIONS, options);
    this.observable = new Subject();
    this.setSchema(schema);

    if (initialValue instanceof LodashStorage) {
      this.dataStorage = initialValue;
      this.initialDataStorage = new LodashStorage(_.cloneDeep(initialValue.get([])));
    } else {
      this.dataStorage = new LodashStorage(_.cloneDeep(initialValue));
      this.initialDataStorage = new LodashStorage(_.cloneDeep(initialValue));
    }
  }

  setSchema(schema: ISchema) {
    this.schema = schema;
    this.validator = new Validator(schema, this.options.validation);
  }

  getSchema(): ISchema {
    return this.schema;
  }

  /**
   * Dispatch event
   * @param event
   */
  dispatch(event: Event) {
    this.observable.next(event);
  }

  /**
   * Get reference by path, if ref does not exist, creates a new one
   * @param path - a relative or absolute path to the property
   * @param resolve - resolve given path to the root path
   */
  ref(path = '/', resolve= true): Ref {
    let resolvedPath = path;

    if (resolve) {
      resolvedPath = resolvedPath ? utils.resolvePath(path, '/') : '/';
    }

    return this.refs[resolvedPath] || (this.refs[resolvedPath] = new Ref(this, resolvedPath));
  }

  /**
   * Get reference by path, if ref does not exist, returns undefined
   * Note: refs are automatically created according to the schema
   * during initialization or validation
   * @param path - a relative or absolute path to the property
   * @param resolve - resolve given path to the root path
   */
  safeRef(path = '/', resolve= true): Ref | undefined {
    let resolvedPath = path;

    if (resolve) {
      resolvedPath = resolvedPath ? utils.resolvePath(path, '/') : '/';
    }

    if (this.options.debug) {
      console.warn('Attention, you are trying to get a ref to a property that does not have a corresponding rule in the JSON schema');
    }

    return this.refs[resolvedPath];
  }

  /**
   * Set the attribute state
   * @param {Ref} ref
   * @param {IModelValidationResult} state
   */
  private setRefState(ref: Ref, state: IModelValidationResult) {
    const curState = ref.state;

    if (curState.valLock > state.valLock) {
      return;
    }

    ref.state = state;

    this.dispatch(new ChangeRefStateEvent(ref.path, state));
  }

  /**
   * Get the validation state along the supplied path
   * @param {Ref} ref
   * @returns {IModelValidationResult}
   */
  getRefState(ref: Ref): IModelValidationResult {
    return ref.state;
  }

  /**
   * Get refs belonging to the given host ref
   * @param hostRef
   */
  private getRefs(hostRef: Ref): RefMap {
    const { route, path } = hostRef;

    if (route.length) {
      const prefix = `${path}/`;
      const refs = {};

      Object.entries(this.refs).forEach(([k, v]) => {
        if (k.startsWith(prefix)) {
          refs[k] = v;
        }
      });

      return refs;
    }

    return this.refs;
  }

  /**
   * Set value
   * @param ref
   * @param value
   */
  setRefValue(ref: Ref, value: any) {
    this.dataStorage.set(ref.route, value);

    this.dispatch(new ChangeRefValueEvent(ref.path, ref.getValue()));
  }

  /**
   * Get value
   * @param ref
   * @returns value
   */
  getRefValue(ref: Ref): any {
    return this.dataStorage.get(ref.route);
  }

  /**
   * Get initial value
   */
  getRefInitialValue(ref: Ref): any {
    return this.initialDataStorage.get(ref.route);
  }

  /**
   * Returns an array of error refs related to the given ref if exists
   * @param ref
   */
  getRefErrors(ref: Ref): Ref[] {
    return Object.values(this.getRefs(ref))
      .filter((ref) => ref.state.valid === false);
  }

  /**
   * Returns incremented validation lock, used to track validation queue
   */
  get validationLock(): number {
    return this.valLock += 1;
  }

  /**
   * Returns incremented error lock, used to track the order of incoming errors
   */
  get errorLock(): number {
    return this.errLock += 1;
  }

  /**
   * Validates given ref, by default all validated refs will be marked as validated
   * @param ref - ref to be validated
   * @param options - validation options
   */
  validateRef(ref: Ref, options: IModelValidationOptions = {}): Promise<boolean> {
    const valLock = this.validationLock;
    const results: { [path: string]: IRuleValidationResult } = {};
    const refs: RefMap = {};
    let scopes = ref.route.length ? [ref.path] : [];
    const targetScope = ref.route.length ? ref.path : '';

    if (ref.state.dependencies) {
      const resolvedDependencies = ref.state.dependencies
        .map((depPath) => utils.resolvePath(depPath, ref.path));
      scopes = [...scopes, ...resolvedDependencies];
    }

    // validate attribute function
    const validateRuleFn: ValidateRuleFn = (curRef: Ref, rule: IRule, validationOptions)
      : Promise<IRuleValidationResult> => {
      const curScope = curRef.path;

      if (
        curRef.state.dependsOn
        && curRef.state.dependsOn
          .find((depPath) => utils.resolvePath(depPath, curRef.path) === ref.path)
      ) {
        scopes.push(curRef.path);
      }

      const isRefInTargetScope = !targetScope
        || curScope === targetScope || curScope.startsWith(`${targetScope}/`);

      const isRefInScope = !scopes.length
        || !!scopes.find((scope) => curScope === scope || curScope.startsWith(`${scope}/`));

      const isRefInParentScope = !isRefInScope
        && !!scopes.find((scope) => scope.startsWith(curScope));

      if (!rule.validate && !isRefInScope && !isRefInParentScope) {
        return Promise.resolve(curRef.createUndefinedResult());
      }

      if (isRefInScope) {
        refs[curRef.path] = curRef;

        // validating state
        const curState = curRef.state;

        if (options.forceValidated && isRefInTargetScope) {
          curRef.markAsValidated();
        }

        this.setRefState(curRef, {
          ...curState,
          valLock,
          validating: true,
        });
      }

      return (rule as any).validate(curRef, validateRuleFn, validationOptions)
        .then((result: IRuleValidationResult) => {
          if (isRefInScope) {
            if (result.valid === false) {
              result.errLock = this.errorLock;
            }

            const path = curRef.path;
            const curResult = results[path] || { valLock };
            const mergedResult = results[path] = utils.mergeResults([curResult, result]);
            mergedResult.valLock = valLock;
            mergedResult.validating = false;

            this.setRefState(curRef, mergedResult as IModelValidationResult);
          }

          return result;
        });
    };

    const validationPath = targetScope || '/';

    this.dispatch(new BeforeValidationEvent(validationPath));

    return this.validator.validate(this.ref(), validateRuleFn, options)
      .then((result) => {
        if (this.options.debug && result.valid === undefined) {
          console.warn(UNDEFINED_RESULT_WARNING);
        }

        // merge map
        if (scopes.length) {
          scopes.forEach((scope) => {
            Object.keys(this.refs).forEach((refPath) => {
              if (refPath === scope || refPath.startsWith(`${scope}/`)) {
                delete this.refs[refPath];
              }
            });
          });

          _.extend(this.refs, refs);
        } else {
          this.refs = refs;
        }

        const valid = !!ref.state.valid;

        this.dispatch(new AfterValidationEvent(validationPath, valid));

        return valid;
      });
  }

  /**
   * Validates root ref, by default all validated refs will be marked as validated
   * @param options - validation options
   */
  validate(options?: IModelValidationOptions): Promise<boolean> {
    return this.ref().validate(options);
  }

  /**
   * Validates root ref, by default all validated refs will be marked as validated
   * @param options - validation options
   */
  prepare(options: IModelValidationOptions = {}): Promise<boolean> {
    const opts = {
      ...options,
      forceValidated: false,
    };

    return this.ref().validate(opts);
  }

  /**
   * Function - Returns a cloned data of the model
   */
  getAttributes(): any {
    return _.cloneDeep(this.dataStorage.get([]));
  }

  /**
   * Getter - Returns a cloned data of the model
   */
  get attributes(): any {
    return this.getAttributes();
  }
}
