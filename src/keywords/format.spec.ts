declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('format keyword', () => {
  it('Email format test', async () => {
    const model = new Model(
      {
        format: 'email',
      },
      'test@mail.com',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('foo');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  // todo: cover with tests all format types

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          format: 1,
        },
        '',
      );
    }).toThrow('The schema of the "format" keyword should be a string.');

    expect(() => {
      new Model(
        {
          format: 'foo',
        },
        '',
      );
    }).toThrow('Unknown string format supplied.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        format: 'email',
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.format).toBe(undefined);

    ref.set('test@mail.com');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      format: 'email',
    });

    ref.set('foo');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      format: 'email',
      message: {
        description: 'Should match format "email"',
        bindings: {
          format: 'email',
        },
      },
    });
  });
});
