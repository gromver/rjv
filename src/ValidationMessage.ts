import { IValidationMessage } from './types';

export function injectVarsToString(str: string, variables: {}): string {
  if (Object.keys(variables).length === 0) {
    return str;
  }

  return str.replace(
    /{([^{}]+)}/g,
    (match, name) => variables.hasOwnProperty(name) ? variables[name] : `{${name}}`,
  );
}

export default class ValidationMessage implements IValidationMessage {
  constructor(
    public readonly success: boolean,
    public readonly keyword: string,
    public description: any,
    public readonly bindings = {},
  ) {}

  toString(): string {
    if (typeof this.description === 'string') {
      return injectVarsToString(this.description, this.bindings);
    }

    return `${this.description}`;
  }
}
