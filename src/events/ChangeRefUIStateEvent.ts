import { Path } from '../types';

type UIState = 'touched' | 'validated' | 'dirty' | 'pristine';

export default class ChangeRefUIStateEvent {
  type: string = 'changeRefUIState';

  constructor(public readonly path: Path, public readonly state: UIState) {}
}
