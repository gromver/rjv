import { Path } from '../types';
import { IModelValidationResult } from '../Model';

export default class ChangeRefValidationStateEvent {
  type: string = 'changeRefValidationState';

  constructor(public readonly path: Path, public readonly state: IModelValidationResult) {}
}
