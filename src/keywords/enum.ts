import _isEqual from 'lodash/isEqual';
import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';

const keyword: IKeyword = {
  name: 'enum',
  compile(compile, schema: any[]) {
    const allowedValues = schema;

    if (!Array.isArray(allowedValues)) {
      throw new Error('The schema of the "enum" keyword should be an array.');
    }

    return async (ref) => {
      const value = ref.value;
      const valid = allowedValues.some((item) => _isEqual(value, item));

      return valid
        ? new ValidateFnResult(true)
        : new ValidateFnResult(
          false,
          'Should be equal to one of the allowed values',
          keyword.name,
          { allowedValues },
        );
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    enum?: any[];
  }
}
