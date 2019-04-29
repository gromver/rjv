import { Path } from '../Model';
import IState from '../interfaces/IState';

export default class ChangeRefStateEvent {
  type: string = 'changeRefState';
  path: Path;
  state: IState;

  constructor(path: Path, state: IState) {
    this.path = path;
    this.state = state;
  }
}
