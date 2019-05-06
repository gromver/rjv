import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const validateFn: ValidateAttributeFn = (ref: Ref, rule: IRule): Promise<IRuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, validateFn)
    : Promise.resolve({});
};

const keyword: IKeyword = {
  name: 'if',
  reserveNames: ['then', 'else'],
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "if" keyword should be a schema object.');
    }

    // all rules have validate() fn
    const ifRule: IRule = compile(schema, parentSchema);
    const thenRule: IRule | void = parentSchema.then && compile(parentSchema.then, parentSchema);
    const elseRule: IRule | void = parentSchema.else && compile(parentSchema.else, parentSchema);

    if (!(thenRule || elseRule)) {
      throw new Error(
        'For the "if" keyword You must specify at least the keyword "then" or "else".',
      );
    }

    return {
      async validate(ref: Ref, validateAttributeFn: ValidateAttributeFn)
        : Promise<IRuleValidationResult> {
        return (
          (ifRule as any).validate(ref, validateFn) as Promise<IRuleValidationResult>
        )
          .then((result) => {
            if (result.valid === false) {
              if (elseRule) {
                return (elseRule as any).validate(ref, validateAttributeFn);
              }
            } else if (result.valid === true) {
              if (thenRule) {
                return (thenRule as any).validate(ref, validateAttributeFn);
              }
            }

            return ref.createUndefinedResult();
          });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    if?: ISchema;
    else?: ISchema;
    then?: ISchema;
  }
}
