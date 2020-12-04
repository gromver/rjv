import ValidationResult from '../ValidationResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'minimum',
  reserveNames: ['exclusiveMinimum'],
  compile(compile, schema: any, parentSchema) {
    const limit = schema;
    const exclusive = (parentSchema as any).exclusiveMinimum || false;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minimum" keyword should be a number.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('number', value)) {
        if (exclusive ? value <= limit : value < limit) {
          return new ValidationResult(
            false,
            exclusive
              ? 'Should be greater than {limit}'
              : 'Should be greater than or equal {limit}',
            exclusive ? `${keyword.name}_exclusive` : keyword.name,
            { limit, exclusive },
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
    minimum?: number;
    exclusiveMinimum?: boolean;
  }
}
