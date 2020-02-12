import { Path, IModelValidationResult } from '../types';

export default class ChangeRefStateEvent {
  type: string = 'changeRefState';

  constructor(public path: Path, public state: IModelValidationResult) {}
}
