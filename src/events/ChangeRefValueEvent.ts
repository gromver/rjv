import { Path } from '../Model';

export default class ChangeRefValueEvent {
  type: string = 'changeRefValue';
  path: Path;
  value: any;

  constructor(path: Path, value: any) {
    this.path = path;
    this.value = value;
  }
}
