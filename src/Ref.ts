import Model, { IModelValidationOptions } from './Model';
import {
  Path, Route, IRuleValidationResult, IModelValidationResult, IValidationMessage,
} from './types';
import utils from './utils';

const _ = {
  isEqual: require('lodash/isEqual'),
  extend: require('lodash/extend'),
};

const DEFAULT_VALIDATION_OPTIONS: IModelValidationOptions = {
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

  /**
   * Get reference by path, if ref does not exist, creates a new one
   * @param path - a relative or absolute path to the property
   */
  ref(path: Path): Ref {
    return this.model.ref(utils.resolvePath(path, this.path), false);
  }

  /**
   * Get reference by path, if ref does not exist, returns undefined
   * @param path
   */
  safeRef(path: Path): Ref | undefined {
    return this.model.safeRef(utils.resolvePath(path, this.path), false);
  }

  /**
   * Validation
   */

  /**
   * Validate props of the ref, superior props aren't affected
   * @param options
   */
  validate(options: IModelValidationOptions = {}): Promise<boolean> {
    const normalizedOptions = _.extend({}, DEFAULT_VALIDATION_OPTIONS, options);

    return this.model.validateRef(this, normalizedOptions);
  }

  /**
   * Shortcut method for populating initial state of the whole model or the current ref.
   * Useful if ref's value has an array or an object types.
   * Should be called when new props or items added to the ref's value.
   * @param onlyRef
   */
  prepare(onlyRef = false): Promise<boolean> {
    return onlyRef
      ? this.validate({ forceValidated: false })
      : this.model.prepare();
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
   * @param value
   */
  set value(value: any) {
    this.model.setRefValue(this, value);
  }

  /**
   * Get value as getter
   * @returns value
   */
  get value(): any {
    return this.model.getRefValue(this);
  }

  /**
   * Get initial value as getter
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

  /**
   * Returns error refs related to this ref if exists
   */
  get errors(): Ref[] {
    return this.model.getRefErrors(this);
  }

  /**
   * Returns current validation message if exists
   */
  get message(): IValidationMessage | undefined {
    return this.state.message;
  }

  /**
   * Is ref's value changed?
   */
  get isChanged(): boolean {
    return !_.isEqual(
      this.getValue(),
      this.getInitialValue(),
    );
  }

  /**
   * Is ref dirty?
   */
  get isDirty(): boolean {
    return this.dirty;
  }

  /**
   * Is ref's value required?
   */
  get isRequired(): boolean {
    return !!this.state.required;
  }

  /**
   * Is ref mutable?
   */
  get isMutable() {
    return !this.state.readOnly;
  }

  /**
   * Is ref marked as read only?
   */
  get isReadOnly(): boolean {
    return !!this.state.readOnly;
  }

  /**
   * Is ref marked as write only?
   */
  get isWriteOnly(): boolean {
    return !!this.state.writeOnly;
  }

  /**
   * Is ref validated?
   */
  get isValidated(): boolean {
    return this.validated;
  }

  /**
   * Is ref valid?
   */
  get isValid(): boolean {
    return this.validated && this.state.valid === true;
  }

  /**
   * Is ref invalid?
   */
  get isInvalid(): boolean {
    return this.validated && this.state.valid === false;
  }

  /**
   * Is ref being validated at the moment?
   */
  get isValidating(): boolean {
    return this.validated && this.state.validating === true;
  }

  /**
   * Is ref pristine?
   */
  get isPristine(): boolean {
    return !this.validated || this.state.valid === undefined;
  }

  /**
   * Is ref should not be blank?
   */
  get isShouldNotBeBlank(): boolean {
    return !!this.state.presence;
  }

  /**
   * Is ref touched?
   */
  get isTouched(): boolean {
    return this.touched;
  }

  /**
   * Is ref untouched?
   */
  get isUntouched(): boolean {
    return !this.touched;
  }

  /**
   * Checks if the ref's value has desired type
   * todo: replace to the utils
   * @param dataType
   */
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

  /**
   * Helper - resolves given path relative to the path of the ref
   * @param path
   */
  resolvePath(path: Path): Path {
    return utils.resolvePath(path, this.path);
  }

  /**
   * Helper - creates undefined validation result
   * @param metadata
   */
  createUndefinedResult(metadata: IRuleValidationResult = {}): IRuleValidationResult {
    return metadata;
  }

  /**
   * Helper - creates success validation result
   * @param message
   * @param metadata
   */
  createSuccessResult(message?: IValidationMessage, metadata: IRuleValidationResult = {})
    : IRuleValidationResult {
    return {
      ...metadata,
      message,
      valid: true,
    };
  }

  /**
   * Helper - creates error validation result
   * @param message
   * @param metadata
   */
  createErrorResult(message: IValidationMessage, metadata: IRuleValidationResult = {})
    : IRuleValidationResult {
    return {
      ...metadata,
      message,
      valid: false,
    };
  }
}
