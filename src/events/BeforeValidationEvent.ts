import { Path } from '../types';

export default class BeforeValidationEvent {
  type: string = 'beforeValidation';

  constructor(public readonly scopes: Path[]) {}
}
