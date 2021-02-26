import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'multipleOf',
  compile(compile, schema: any) {
    const multiplier = schema;

    if (typeof multiplier !== 'number') {
      throw new Error('The schema of the "multipleOf" keyword should be a number.');
    }

    if (multiplier === 0) {
      throw new Error('The "multipleOf" keyword can\'t be zero.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('number', value)) {
        if ((value / multiplier) % 1 !== 0) {
          return new ValidateFnResult(
            false,
            'Should be multiple of {multiplier}',
            keyword.name,
            { multiplier },
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
    multipleOf?: number;
  }

  export interface ICustomErrors {
    multipleOf?: string;
  }
}
