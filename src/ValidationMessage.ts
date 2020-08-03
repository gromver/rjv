import { IValidationMessage } from './types';

export default class ValidationMessage implements IValidationMessage {
  constructor(public keyword: string, public description: any, public bindings = {}) {}
}
