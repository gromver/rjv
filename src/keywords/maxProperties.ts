import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'maxProperties',
  compile(compile, schema: any) {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxProperties" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxProperties" keyword can\'t be less then 0.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('object', value)) {
        if (Object.values(value).length > limit) {
          return new ValidateFnResult(
            false,
            'Should not have more than {limit} properties',
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
    maxProperties?: number;
  }

  export interface ICustomErrors {
    maxProperties?: string;
  }
}
