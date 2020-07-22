import { Path, IModelValidationResult } from '../types';

export default class ChangeRefValidationStateEvent {
  type: string = 'changeRefValidationState';

  constructor(public readonly path: Path, public readonly state: IModelValidationResult) {}
}
