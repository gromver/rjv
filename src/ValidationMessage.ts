import { IValidationMessage } from './types';

export default class ValidationMessage implements IValidationMessage {
  constructor(
    public readonly success: boolean,
    public readonly keyword: string,
    public description: any,
    public readonly bindings = {},
  ) {}
}
