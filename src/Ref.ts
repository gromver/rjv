import Model, { Path } from './Model';
import IState, { StateTypes } from './interfaces/IState';
import IRuleValidationResult from './interfaces/IRuleValidationResult';
import IValidationMessage from './interfaces/IValidationMessage';
import IValidationOptions from './interfaces/IValidationOptions';

const _ = {
  isEqual: require('lodash/isEqual'),
};

export type DataType = 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean';

export default class Ref {
  private validated = false;
  private dirty = false;
  private touched = false;

  public readonly key: string;
  public readonly path: Path;
  public readonly model: Model;

  constructor(model: Model, path: Path) {
    this.model = model;
    this.path = path;
    this.key = JSON.stringify(path);
  }

  absoluteRef(path: Path = []) {
    return this.model.ref(path);
  }

  relativeRef(path: Path = []) {
    const pathNormalized = this.normalizePath(path);

    return this.model.ref(pathNormalized);
  }

  /**
   * Validation
   */

  validate(options: IValidationOptions = {}): Promise<boolean> {
    this.validated = true;
    this.touched = true;

    return this.model.validateRef(this, options);
  }

  /**
   * Getters and setters
   */

  get parent(): Ref | void {
    if (this.path.length) {
      return this.model.ref(this.path.slice(0, -1));
    }
  }

  /**
   * Get the ref's validation state
   * @returns {IState}
   */
  get state(): IState {
    return this.model.getRefState(this);
  }

  /**
   * Get the error that occurred first
   * @returns {IState | void}
   */
  get firstError(): IState | void {
    return this.model.getRefErrors(this).sort((a, b) => {
      if ((a as any).errLock > (b as any)!.errLock) {
        return 1;
      }

      if ((a as any).errLock < (b as any).errLock) {
        return -1;
      }

      return 0;
    })[0];
  }

  /**
   * Set value as method
   * @param value
   * @param dispatch
   */
  set(value: any, dispatch = true) {
    this.dirty = true;

    this.model.setRefValue(this, value, dispatch);
  }

  /**
   * Get value as method
   * @returns value
   */
  get(): any {
    return this.model.getRefValue(this);
  }

  /**
   * Set value as setter
   * @param value
   */
  set value(value: any) {
    this.dirty = true;

    this.model.setRefValue(this, value, true);
  }

  /**
   * Get value as getter
   * @returns value
   */
  get value(): any {
    return this.model.getRefValue(this);
  }

  /**
   * Get initial value
   */
  getInitialValue(): any {
    return this.model.getRefInitialValue(this);
  }

  /**
   * Mark ref as touched
   */
  touch(): boolean {
    return this.touched = true;
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
   * Get initial value as getter
   */
  get initialValue(): any {
    return this.model.getRefInitialValue(this);
  }

  get errors(): IState[] {
    return this.model.getRefErrors(this);
  }

  get isChanged(): boolean {
    return !_.isEqual(
      this.get(),
      this.getInitialValue(),
    );
  }

  get isDirty(): boolean {
    return this.dirty;
  }

  get isRequired(): boolean {
    return this.model.getRefState(this).required;
  }

  get isMutable() {
    return !this.model.getRefState(this).readOnly;
  }

  get isReadOnly(): boolean {
    return this.model.getRefState(this).readOnly;
  }

  get isWriteOnly(): boolean {
    return this.model.getRefState(this).writeOnly;
  }

  get isValidated(): boolean {
    return this.validated;
  }

  get isValid(): boolean {
    const state = this.model.getRefState(this);

    return state.type === StateTypes.SUCCESS;
  }

  get isInvalid(): boolean {
    const state = this.model.getRefState(this);

    return state.type === StateTypes.ERROR;
  }

  get isValidating(): boolean {
    const state = this.model.getRefState(this);

    return state.type === StateTypes.VALIDATING;
  }

  get isPristine(): boolean {
    const state = this.model.getRefState(this);

    return state.type === StateTypes.PRISTINE;
  }

  get isShouldNotBeBlank(): boolean {
    return this.model.getRefState(this).presence || false;
  }

  get isTouched(): boolean {
    return this.touched;
  }

  get isUntouched(): boolean {
    return !this.touched;
  }

  checkDataType(dataType: DataType): boolean {
    const value = this.get();

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

  private normalizePath(path: Path): Path {
    return [...this.path, ...path];
  }
}
