/// <reference path="./defaultKeywords.ts" />
import { Subject } from 'rxjs/Subject';
import Ref from './Ref';
import Event from './events/Event';
import ChangeRefStateEvent from './events/ChangeRefStateEvent';
import ChangeRefValueEvent from './events/ChangeRefValueEvent';
import LodashStorage from './Storage';
import Validator, { IValidationOptionsPartial } from './Validator';
import {
  ISchema, IRule, ValidateRuleFn, IKeyword, IRuleValidationResult, IModelValidationResult,
} from './types';
import utils from './utils';

const _ = {
  extend: require('lodash/extend'),
  cloneDeep: require('lodash/cloneDeep'),
  memoize: require('lodash/memoize'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export interface IModelOptionsPartial {
  // default validate options
  validation?: IValidationOptionsPartial;
  // validator settings
  keywords?: IKeyword[];
  // mode
  forceValidatedOnInit?: boolean; // при инициализации помечаем все рефы как "валидировано"
  debug?: boolean;
}

export interface IModelOptions extends IModelOptionsPartial {
  // validation's process default opts
  validation: IValidationOptionsPartial;
  forceValidatedOnInit?: boolean; // при инициализации помечаем все рефы как "валидировано"
  debug: boolean;
}

export interface IModelValidationOptions extends IValidationOptionsPartial {
  forceValidated?: boolean;
}

const DEFAULT_OPTIONS: IModelOptions = {
  validation: {},
  forceValidatedOnInit: false,
  debug: false,
};

const UNDEFINED_RESULT_WARNING = 'The model received an undefined validation result. ' +
  'This is probably due to the lack of schema rules applicable to the model\'s value.';

export type RefMap = {
  [path: string]: Ref;
};

export default class Model {
  private refs: RefMap;
  private isInitiated = false;
  private valLock = 0;
  private errLock = 0;
  private validator: Validator;
  private dataStorage: LodashStorage;
  private initialDataStorage: LodashStorage;

  public readonly observable: Subject<Event>;
  public readonly options: IModelOptions;
  public readonly schema: ISchema;

  constructor(options?: IModelOptionsPartial) {
    this.refs = {};
    this.options = _.extend({}, DEFAULT_OPTIONS, options);
    this.observable = new Subject();
  }

  async init(schema: ISchema, initialValue: any) {
    try {
      this.dataStorage = new LodashStorage(_.cloneDeep(initialValue));
      this.initialDataStorage = new LodashStorage(_.cloneDeep(initialValue));
      this.validator = new Validator(schema, this.options.validation);
      this.isInitiated = true;

      await this.validate({ forceValidated: this.options.forceValidatedOnInit });
    } catch (e) {
      if (this.options.debug) {
        console.error(e);
      }

      return Promise.reject(e);
    }
  }

  /**
   * Dispatch event
   * @param event
   */
  dispatch(event: Event) {
    this.observable.next(event);
  }

  ref(path = '/', resolve= true): Ref {
    this.checkInitiated();

    let resolvedPath = path;

    if (resolve) {
      resolvedPath = resolvedPath ? utils.resolvePath(path, '/') : '/';
    }

    return this.refs[resolvedPath];
  }

  unsafeRef(path = '/', resolve= true): Ref {
    this.checkInitiated();

    let resolvedPath = path;

    if (resolve) {
      resolvedPath = resolvedPath ? utils.resolvePath(path, '/') : '/';
    }

    return this.refs[resolvedPath] || (this.refs[resolvedPath] = new Ref(this, resolvedPath));
  }

  /**
   * Set the attribute state
   * @param {Ref} ref
   * @param {IModelValidationResult} state
   */
  private setRefState(ref: Ref, state: IModelValidationResult) {
    this.checkInitiated();

    const curState = ref.state;

    if (curState.valLock > state.valLock) {
      return;
    }

    ref.state = state;

    this.dispatch(new ChangeRefStateEvent(state.path, state));
  }

  /**
   * Get the validation state along the supplied path
   * @param {Ref} ref
   * @returns {IModelValidationResult}
   */
  getRefState(ref: Ref): IModelValidationResult {
    this.checkInitiated();

    return ref.state;
  }

  private getRefs(hostRef: Ref): RefMap {
    this.checkInitiated();

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
    this.checkInitiated();

    this.dataStorage.set(ref.route, value);

    this.dispatch(new ChangeRefValueEvent(ref.path, ref.getValue()));
  }

  /**
   * Get value
   * @param ref
   * @returns value
   */
  getRefValue(ref: Ref): any {
    this.checkInitiated();

    return this.dataStorage.get(ref.route);
  }

  /**
   * Get initial value
   */
  getRefInitialValue(ref: Ref): any {
    this.checkInitiated();

    return this.initialDataStorage.get(ref.route);
  }

  getRefErrors(ref: Ref): Ref[] {
    this.checkInitiated();

    return Object.values(this.getRefs(ref))
      .filter((ref) => ref.state.valid === false);
  }

  get validationLock(): number {
    this.checkInitiated();

    return this.valLock += 1;
  }

  get errorLock(): number {
    this.checkInitiated();

    return this.errLock += 1;
  }

  validateRef(ref: Ref, options: IModelValidationOptions = {}): Promise<boolean> {
    this.checkInitiated();

    const valLock = this.validationLock;
    const results: { [path: string]: IRuleValidationResult } = {};
    const refs: RefMap = {};
    let scopes = ref.route.length ? [ref.path] : [];
    const targetScope = ref.route.length ? ref.path : '';

    if (ref.state.dependencies) {
      scopes = [...scopes, ...ref.state.dependencies];
    }

    // validate attribute function
    const validateRuleFn: ValidateRuleFn = (curRef: Ref, rule: IRule, validationOptions)
      : Promise<IRuleValidationResult> => {
      const curScope = curRef.path;

      if (curRef.state.dependsOn && curRef.state.dependsOn.find((item) => item === ref.path)) {
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

        return !!result.valid;
      });
  }

  validate(options?: IModelValidationOptions): Promise<boolean> {
    this.checkInitiated();

    return this.unsafeRef().validate(options);
  }

  private checkInitiated() {
    if (!this.isInitiated) {
      throw new Error('You should initialize your model to work with it.');
    }
  }
}
