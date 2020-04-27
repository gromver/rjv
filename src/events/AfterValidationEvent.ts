import { Path } from '../types';

export default class AfterValidationEvent {
  type: string = 'afterValidation';

  constructor(public readonly path: Path, public readonly valid: boolean) {}
}
