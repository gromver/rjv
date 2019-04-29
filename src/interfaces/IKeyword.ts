import IRule from './IRule';
import ISchema from './ISchema';

export type CompileFn = (schema: any, parentSchema: ISchema) => IRule;

export default interface IKeyword {
  name: string;
  reserveNames?: string[];
  compile(compileFn: CompileFn, schema: any, parentSchema: ISchema): IRule;
}
