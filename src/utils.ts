import * as pth from 'path';
import { Path, Route, ValueType, IRuleValidationResult } from './types';

const _ = {
  extend: require('lodash/extend'),
};

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
    const result: IRuleValidationResult = {
      required: false,
      readOnly: false,
      writeOnly: false,
    };

    results.forEach((item) => {
      const { required, readOnly, writeOnly, dependsOn, valid, message, ...metadata } = item;

      required && (result.required = true);
      readOnly && (result.readOnly = true);
      writeOnly && (result.writeOnly = true);
      dependsOn && (result.dependsOn = [...(result.dependsOn || []), ...dependsOn]);

      if (
        (valid === true && result.valid === undefined)
        ||
        (valid === false && result.valid !== false)
      ) {
        result.valid = valid;
        result.message = message;
      } else if (valid === true && result.valid === true && result.message === undefined) {
        result.message = message;
      }

      _.extend(result, metadata);
    });

    return result;
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

    return str.replace(/{([^{}]+)}/g, (match, name) => variables[name] || `{${name}}`);
  },
};

export default utils;
