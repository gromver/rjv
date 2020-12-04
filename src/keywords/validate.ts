import {
  IKeyword,
  IRef,
  ApplyValidateFn,
  IValidateFnOptions,
  InlineValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'validate',
  compile(
    compile,
    schema: (ref: IRef, applyValidateFn: ApplyValidateFn, options: IValidateFnOptions)
      => InlineValidationResult | Promise<InlineValidationResult>,
  ) {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "validate" keyword should be an async validation function.',
      );
    }

    return async (ref, options, applyValidateFn) => {
      const result = await schema(ref, applyValidateFn, options);

      return result !== undefined ? utils.toValidationResult(result) : undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    validate?: (ref: IRef, applyValidateFn: ApplyValidateFn, options: IValidateFnOptions)
      => InlineValidationResult | Promise<InlineValidationResult>;
  }
}
