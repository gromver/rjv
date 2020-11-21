import * as pth from 'path';
import ValidationMessage from '../ValidationMessage';
import { Path, Route, ValueType, IRuleValidationResult, IValidationMessage } from '../types';

function reverse(promise: Promise<any>) {
  return new Promise((resolve, reject) => Promise.resolve(promise).then(reject, resolve));
}

function promiseAny(promises: Promise<any>[]): Promise<any> {
  return reverse(Promise.all([...promises].map(reverse)));
}

function normalizeSlug(slug): string | number {
  if (/^\d+$/.test(slug)) {
    return +slug;
  }

  return slug;
}

const removeTrailingSlash = /\/+$/;

const utils = {
  promiseAny,
  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  },
  resolvePath(path: Path, hostPath: Path): Path {
    return pth.resolve(hostPath, path);
  },
  pathToKey(path: Route): Path {
    return `/${path.join('/')}`;
  },
  pathToArray(path: string): Route {
    const relPath =  path.substr(1);
    return relPath ? relPath.split('/').map(normalizeSlug) : [];
  },
  mergeResults(results: IRuleValidationResult[]): IRuleValidationResult {
    let valid: any = undefined;
    let messages: IValidationMessage[] = [];

    results.forEach((item) => {
      if (
        (item.valid && valid === undefined)
        ||
        (!item.valid && valid !== false)
      ) {
        valid = item.valid;
      }
      messages = messages.concat(item.messages);
    });

    return {
      messages,
      valid: !!valid,
    };
  },
  withTrailingSlash(string: string): string {
    return `${string.replace(removeTrailingSlash, '')}/`;
  },
  checkDataType(dataType: ValueType, value: any): boolean {
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
  },
  injectVarsToString(str: string, variables: {}): string {
    if (Object.keys(variables).length === 0) {
      return str;
    }

    return str.replace(
      /{([^{}]+)}/g,
      (match, name) => variables.hasOwnProperty(name) ? variables[name] : `{${name}}`,
    );
  },
  // helpers
  /**
   * Helper - creates success validation result
   * @param message
   */
  createSuccessResult(message?: ValidationMessage)
    : IRuleValidationResult {
    return {
      messages: message ? [message] : [],
      valid: true,
    };
  },

  /**
   * Helper - creates error validation result
   * @param message
   */
  createErrorResult(message: ValidationMessage)
    : IRuleValidationResult {
    return {
      messages: [message],
      valid: false,
    };
  },

  toValidationResult(message: ValidationMessage | boolean | string): IRuleValidationResult {
    if (message instanceof ValidationMessage) {
      return {
        valid: message.success,
        messages: [message],
      };
    }

    if (typeof message === 'string') {
      return {
        valid: false,
        messages: [new ValidationMessage(false, 'inline', message)],
      };
    }

    if (message) {
      return {
        valid: true,
        messages: [],
      };
    }

    return {
      valid: false,
      messages: [new ValidationMessage(false, 'inline', 'Incorrect value')],
    };
  },

};

export default utils;
