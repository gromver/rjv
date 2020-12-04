import ValidationResult from '../ValidationResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'minProperties',
  compile(compile, schema: any) {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minProperties" keyword should be a number.');
    }

    if (limit < 1) {
      throw new Error('The "minProperties" keyword can\'t be less then 1.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('object', value)) {
        if (Object.values(value).length < limit) {
          return new ValidationResult(
            false,
            'Should not have fewer than {limit} properties',
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
    minProperties?: number;
  }
}
