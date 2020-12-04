import ValidationResult from '../ValidationResult';
import { IKeyword, IRef } from '../types';

const _ = {
  isEqual: require('lodash/isEqual'),
};

const keyword: IKeyword = {
  name: 'const',
  compile(compile, schema: any) {
    let resolve: (ref: IRef) => any;

    if (typeof schema === 'function') {
      resolve = schema;
    } else {
      resolve = () => schema;
    }

    return async (ref) => {
      const value = ref.value;
      const allowedValue = resolve(ref);

      return _.isEqual(value, allowedValue)
        ? new ValidationResult(true)
        : new ValidationResult(
          false,
          'Should be equal to constant',
          keyword.name,
          { allowedValue },
        );
    };
  },
};

export default keyword;

type ConstValue = number | string | null | {} | [];

declare module '../types' {
  export interface ISchema {
    const?: ((ref: IRef) => ConstValue) | ConstValue;
  }
}
