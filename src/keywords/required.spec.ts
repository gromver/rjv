declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('required keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        required: ['foo', 'bar'],
      },
      {
        bar: null,
      },
    );

    const ref = model.ref();
    const fooRef = ref.relativeRef(['foo']);
    const barRef = ref.relativeRef(['bar']);
    const carRef = ref.relativeRef(['car']);
    expect(fooRef.isRequired).toBe(false);
    expect(barRef.isRequired).toBe(false);
    expect(carRef.isRequired).toBe(false);

    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    // expect(fooRef.state.type).toBe(StateTypes.PRISTINE);
    expect(fooRef.state.type).toBe(StateTypes.ERROR);
    expect(barRef.state.type).toBe(StateTypes.SUCCESS);
    expect(carRef.state.type).toBe(StateTypes.PRISTINE);
    expect(fooRef.isRequired).toBe(true);
    expect(barRef.isRequired).toBe(true);
    expect(carRef.isRequired).toBe(false);

    fooRef.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    fooRef.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);
  });
});
