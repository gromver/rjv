import { Path } from '../types';

export default class AfterValidationEvent {
  type: string = 'afterValidation';

  constructor(public readonly scopes: Path[], public readonly valid: boolean) {}
}
