import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'maxItems',
  compile(compile, schema: any) {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxItems" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxItems" keyword can\'t be less then 0.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('array', value)) {
        if (value.length > limit) {
          return new ValidateFnResult(
            false,
            'Should not have more than {limit} items',
            keyword.name,
            { limit },
          );
        }

        return new ValidateFnResult(true);
      }

      return undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    maxItems?: number;
  }

  export interface ICustomErrors {
    maxItems?: string;
  }
}
