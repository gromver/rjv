import _isEqual from 'lodash/isEqual';
import ValidationMessage from '../ValidationMessage';
import { ISchema, IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'enum',
  compile(compile, schema: any[]) {
    const allowedValues = schema;

    if (!Array.isArray(allowedValues)) {
      throw new Error('The schema of the "enum" keyword should be an array.');
    }

    return {
      async validate(ref) {
        const value = ref.value;
        const valid = allowedValues.some((item) => _isEqual(value, item));

        return valid
          ? utils.createSuccessResult()
          : utils.createErrorResult(
            new ValidationMessage(
              false,
              keyword.name,
              'Should be equal to one of the allowed values',
              { allowedValues },
            ),
          );
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    enum?: any[];
  }
}
