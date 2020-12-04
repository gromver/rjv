import * as pth from 'path';
import ValidationResult from '../ValidationResult';
import { Path, Route, ValueType, IValidateFnResult, IValidationMessage } from '../types';

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
  mergeResults(results: IValidateFnResult[]): IValidateFnResult {
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
  toValidationResult(result: ValidationResult | boolean | string): IValidateFnResult {
    if (result instanceof ValidationResult) {
      return result;
    }

    if (typeof result === 'string') {
      return new ValidationResult(false, result);
    }

    if (result) {
      return new ValidationResult(true);
    }

    return new ValidationResult(false, 'Incorrect value');
  },
};

export default utils;
