import ValidationMessage from '../ValidationMessage';
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
          return utils.createErrorResult(new ValidationMessage(
            false,
            keyword.name,
            'Should be multiple of {multiplier}',
            { multiplier },
          ));
        }

        return utils.createSuccessResult();
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
}
