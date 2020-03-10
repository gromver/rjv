import { Path } from '../types';

export default class ChangeRefValueEvent {
  type: string = 'changeRefValue';

  constructor(public readonly path: Path, public readonly value: any) {}
}
