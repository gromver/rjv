import ValidationResult from '../ValidationResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'minItems',
  compile(compile, schema: any) {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minItems" keyword should be a number.');
    }

    if (limit < 1) {
      throw new Error('The "minItems" keyword can\'t be less then 1.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('array', value)) {
        if (value.length < limit) {
          return new ValidationResult(
            false,
            'Should not have fewer than {limit} items',
            keyword.name,
            { limit },
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
    minItems?: number;
  }
}
