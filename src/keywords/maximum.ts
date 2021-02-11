import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'maximum',
  reserveNames: ['exclusiveMaximum'],
  compile(compile, schema: any, parentSchema) {
    const limit = schema;
    const exclusive = (parentSchema as any).exclusiveMaximum || false;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maximum" keyword should be a number.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('number', value)) {
        if (exclusive ? value >= limit : value > limit) {
          return new ValidateFnResult(
            false,
            exclusive
              ? 'Should be less than {limit}'
              : 'Should be less than or equal {limit}',
            exclusive ? `${keyword.name}_exclusive` : keyword.name,
            { limit, exclusive },
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
    maximum?: number;
    exclusiveMaximum?: boolean;
  }

  export interface ICustomErrors {
    maximum?: string;
    maximum_exclusive?: string;
  }
}
