import Model from './Model';
import { IValidationOptionsPartial } from './Validator';
import {
  Path, Route, IRuleValidationResult, IModelValidationResult, IValidationMessage,
} from './types';
import utils from './utils';

const _ = {
  isEqual: require('lodash/isEqual'),
  extend: require('lodash/extend'),
};

const DEFAULT_VALIDATION_OPTIONS = {
  forceValidated: true,
};

export type DataType = 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean';

export default class Ref {
  private validated = false;
  private dirty = false;
  private touched = false;
  public state: IModelValidationResult;

  public readonly route: Route;
  public readonly path: Path;
  public readonly model: Model;

  constructor(model: Model, path: Path) {
    this.model = model;
    this.path = path;
    this.route = utils.pathToArray(path);
    this.state = { valLock: 0 };
  }

  ref(path: Path): Ref {
    return this.model.ref(utils.resolvePath(path, this.path), false);
  }

  safeRef(path: Path): Ref | undefined {
    return this.model.safeRef(utils.resolvePath(path, this.path), false);
  }

  /**
   * Validation
   */

  validate(options: IValidationOptionsPartial = {}): Promise<boolean> {
    const normalizedOptions = _.extend({}, DEFAULT_VALIDATION_OPTIONS, options);

    return this.model.validateRef(this, normalizedOptions);
  }

  /**
   * Getters and setters
   */

  /**
   * Get the error that occurred first
   * @returns {Ref | void}
   */
  get firstError(): Ref | void {
    return this.model.getRefErrors(this).sort((a, b) => {
      if ((a.state as any).errLock > (b.state as any).errLock) {
        return 1;
      }

      if ((a.state as any).errLock < (b.state as any).errLock) {
        return -1;
      }

      return 0;
    })[0];
  }

  /**
   * Set value as method
   * @param value
   */
  setValue(value: any) {
    this.model.setRefValue(this, value);
  }

  /**
   * Get value as method
   * @returns value
   */
  getValue(): any {
    return this.model.getRefValue(this);
  }

  /**
   * Get initial value
   */
  getInitialValue(): any {
    return this.model.getRefInitialValue(this);
  }

  /**
   * Set value as setter
   * @deprecated
   * @param value
   */
  set value(value: any) {
    this.model.setRefValue(this, value);
  }

  /**
   * Get value as getter
   * @deprecated
   * @returns value
   */
  get value(): any {
    return this.model.getRefValue(this);
  }

  /**
   * Get initial value as getter
   * @deprecated
   * @returns value
   */
  get initialValue(): any {
    return this.model.getRefInitialValue(this);
  }

  /**
   * Mark ref as dirty
   * @return this
   */
  markAsDirty(): this {
    this.dirty = true;

    return this;
  }

  /**
   * Mark ref as touched
   * @return this
   */
  markAsTouched(): this {
    this.touched = true;

    return this;
  }

  /**
   * Mark ref as validated
   * @return this
   */
  markAsValidated(): this {
    this.validated = true;

    return this;
  }

  /**
   * Mark ref as pristine
   * @return this
   */
  markAsPristine(): this {
    this.dirty = false;
    this.touched = false;
    this.validated = false;
    delete this.state.valid;
    delete this.state.message;

    return this;
  }

  /**
   * Mark ref as changed
   * after changing the value, the validation state of the ref should become undefined
   * @return this
   */
  markAsChanged(): this {
    delete this.state.valid;
    delete this.state.message;

    return this;
  }

  /**
   * Add touch behavior to the handler function
   */
  withTouch<T extends (...args:any[]) => any>(handler: T): T {
    return <T>((...args:any[]): any => {
      this.touched = true;

      return handler(...args);
    });
  }

  get errors(): Ref[] {
    return this.model.getRefErrors(this);
  }

  get isChanged(): boolean {
    return !_.isEqual(
      this.getValue(),
      this.getInitialValue(),
    );
  }

  get isDirty(): boolean {
    return this.dirty;
  }

  get isRequired(): boolean {
    return !!this.state.required;
  }

  get isMutable() {
    return !this.state.readOnly;
  }

  get isReadOnly(): boolean {
    return !!this.state.readOnly;
  }

  get isWriteOnly(): boolean {
    return !!this.state.writeOnly;
  }

  get isValidated(): boolean {
    return this.validated;
  }

  get isValid(): boolean {
    return this.validated && this.state.valid === true;
  }

  get isInvalid(): boolean {
    return this.validated && this.state.valid === false;
  }

  get isValidating(): boolean {
    return this.validated && this.state.validating === true;
  }

  get isPristine(): boolean {
    return !this.validated || this.state.valid === undefined;
  }

  get isShouldNotBeBlank(): boolean {
    return !!this.state.presence;
  }

  get isTouched(): boolean {
    return this.touched;
  }

  get isUntouched(): boolean {
    return !this.touched;
  }

  checkDataType(dataType: DataType): boolean {
    const value = this.getValue();

    switch (dataType) {
      case 'null':
        return value === null;
      case 'array':
        return Array.isArray(value);
      case 'object':
        return value && typeof value === 'object' && !Array.isArray(value);
      case 'integer':
        return typeof value === 'number' && !(value % 1);
      default:
        return typeof value === dataType;
    }
  }

  createUndefinedResult(metadata: IRuleValidationResult = {}): IRuleValidationResult {
    return metadata;
  }

  createSuccessResult(message?: IValidationMessage, metadata: IRuleValidationResult = {})
    : IRuleValidationResult {
    return {
      ...metadata,
      message,
      valid: true,
    };
  }

  createErrorResult(message: IValidationMessage, metadata: IRuleValidationResult = {})
    : IRuleValidationResult {
    return {
      ...metadata,
      message,
      valid: false,
    };
  }
}
