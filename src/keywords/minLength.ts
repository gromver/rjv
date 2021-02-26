import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'minLength',
  compile(compile, schema: any) {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minLength" keyword should be a number.');
    }

    if (limit < 1) {
      throw new Error('The "minLength" keyword can\'t be less then 1.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('string', value)) {
        if (value.length < limit) {
          return new ValidateFnResult(
              false,
              'Should not be shorter than {limit} characters',
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
    minLength?: number;
  }

  export interface ICustomErrors {
    minLength?: string;
  }
}
