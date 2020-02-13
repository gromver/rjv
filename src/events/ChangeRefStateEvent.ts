import { Path, IModelValidationResult } from '../types';

export default class ChangeRefStateEvent {
  type: string = 'changeRefState';

  constructor(public readonly path: Path, public readonly state: IModelValidationResult) {}
}
