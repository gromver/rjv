import ValidationResult from '../ValidationResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'required',
  compile(compile, schema: any) {
    const required: string[] = schema;

    if (!Array.isArray(required)) {
      throw new Error('The schema of the "required" keyword should be an array.');
    }

    return async (ref) => {
      if (utils.checkDataType('object', ref.value)) {
        const value = ref.value;
        const invalidProperties: string[] = [];

        for (const propName of required) {
          if (!Object.prototype.hasOwnProperty.call(value, propName)) {
            invalidProperties.push(propName);
          }
        }

        if (invalidProperties.length) {
          return new ValidationResult(
            false,
            'Should have all required properties',
            keyword.name,
            { invalidProperties },
          );
        }

        return new ValidationResult(true);
      }

      return undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    required?: string[];
  }
}
