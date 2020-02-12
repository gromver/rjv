import { Path } from '../types';

export default class ChangeRefValueEvent {
  type: string = 'changeRefValue';

  constructor(public path: Path, public value: any) {}
}
