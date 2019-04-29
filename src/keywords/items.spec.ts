declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('items keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        items: {
          anyOf: [
            { type: 'number' },
            { type: 'string' },
          ],
        },
      },
      [1, 'test'],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'test', null]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Some ajv tests 1', async () => {
    const model = new Model(
      {
        items: {
          type: 'number',
        },
      },
      [1, 2, 3],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'test']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set(null);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Some ajv tests 2', async () => {
    const model = new Model(
      {
        items: [
          { type: 'integer' },
          { type: 'string' },
        ],
      },
      [1],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'test']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'test', 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(['test', 1]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(['test']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set(null);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          items: 1,
        },
        '',
      );
    }).toThrow('The schema of the "items" keyword should be an object or array of schemas.');

    expect(() => {
      new Model(
        {
          // @ts-ignore
          items: [1],
        },
        '',
      );
    }).toThrow('Each item of the "items" keyword should be a schema object.');
  });

  it('additionalItems sync test 1', async () => {
    const model = new Model(
      {
        items: { type: 'integer' },
        additionalItems: { type: 'string' },
      },
      [],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'abc']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems sync test 2', async () => {
    const model = new Model(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: true,
      },
      [],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 'abc']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'abc']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([1, 'abc', 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems sync test 3', async () => {
    const model = new Model(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
      },
      [],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 'abc']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems sync test 4', async () => {
    const model = new Model(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: false,
      },
      [],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state.message).toMatchObject({
      description: 'Should not have more than 2 items',
      bindings: { limit: 2 },
    });
  });

  it('additionalItems async test 1', async () => {
    const model = new Model(
      {
        items: { type: 'integer' },
        additionalItems: { asyncSchema: () => Promise.resolve({ type: 'string' }) },
      },
      [],
    );

    expect(model.async).toBe(true);

    const ref = model.ref();
    await  ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    await  ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'abc']);
    await  ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems async test 2', async () => {
    const model = new Model(
      {
        items: [
          { asyncSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: true,
      },
      [],
    );

    expect(model.async).toBe(true);

    const ref = model.ref();
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 'abc']);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 'abc']);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([1, 'abc', 2]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems async test 3', async () => {
    const model = new Model(
      {
        items: [
          { asyncSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
      },
      [],
    );

    expect(model.async).toBe(true);

    const ref = model.ref();
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 'abc']);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems async test 4', async () => {
    const model = new Model(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { asyncSchema: () => Promise.resolve({ type: 'string' }) },
      },
      [],
    );

    expect(model.async).toBe(true);

    const ref = model.ref();
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 'abc']);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('additionalItems async test 5', async () => {
    const model = new Model(
      {
        items: [
          { asyncSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: false,
      },
      [],
    );

    expect(model.async).toBe(true);

    const ref = model.ref();
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set([1, 2]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
    await ref.validateAsync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state.message).toMatchObject({
      description: 'Should not have more than 2 items',
      bindings: { limit: 2 },
    });
  });
});
