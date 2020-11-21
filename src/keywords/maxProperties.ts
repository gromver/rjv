import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, RuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'maxProperties',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxProperties" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxProperties" keyword can\'t be less then 0.');
    }

    return {
      async validate(ref: IRef): Promise<RuleValidationResult> {
        const value = ref.value;

        if (utils.checkDataType('object', value)) {
          if (Object.values(value).length > limit) {
            return utils.createErrorResult(
              new ValidationMessage(
                false,
                keyword.name,
                'Should not have more than {limit} properties',
                { limit },
              ),
            );
          }

          return utils.createSuccessResult();
        }

        return undefined;
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    maxProperties?: number;
  }
}
