import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'pattern',
  compile(compile, schema: any) {
    if (typeof schema !== 'string') {
      throw new Error('The schema of the "pattern" keyword should be a string.');
    }

    const regexp = new RegExp(schema);

    return async (ref) => {
      const value = ref.value;
      if (utils.checkDataType('string', value)) {
        if (!regexp.test(value)) {
          return new ValidateFnResult(
            false,
            'Should match pattern {pattern}',
            keyword.name,
            { pattern: schema },
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
    pattern?: string;
  }
}
