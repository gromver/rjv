import IRule from './interfaces/IRule';

declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from './Model';
import Ref from './Ref';
import { StateTypes } from './interfaces/IState';

describe('Model test', () => {
  it('Should set default value.', () => {
    const model = new Model(
      {
        type: 'number',
        default: 123,
      },
      undefined,
    );

    const ref = model.ref();

    const result = ref.validateSync();
    expect(result.valid).toBe(true);
    expect(ref.get()).toBe(123);
  });

  it('Should return proper first error', async () => {
    const model = new Model(
      {
        properties: {
          car: { properties: { a: { type: 'number' } } },
          foo: { type: 'number' },
          bar: { properties: { b: { type: 'number' } } },
        },
      },
      {
        car: { a: false },
        foo: false,
        bar: { b: false },
      },
    );

    const ref = model.ref();
    const result = ref.validateSync();
    expect((result.firstErrorRef as any).path).toMatchObject(['car', 'a']);
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        title: 'title',
        description: 'description',
        writeOnly: true,
        readOnly: true,
      },
      '',
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
    expect(ref.state).toMatchObject({
      title: 'title',
      description: 'description',
      writeOnly: true,
      readOnly: true,
    });
  });

  it('OnlyDirtyRefs test', async () => {
    const model = new Model(
      {
        properties: {
          a: { type: 'number', maximum: 5 },
          b: { type: 'number', maximum: 5 },
          c: { type: 'number', maximum: 5 },
        },
      },
      {
        a: 6,
        b: 7,
        c: 8,
      },
    );

    const ref = model.ref();
    const refA = model.ref(['a']);
    const refB = model.ref(['b']);
    const refC = model.ref(['c']);
    let result = ref.validateSync({
      onlyDirtyRefs: true,
    });
    expect(result.valid).toBe(false);
    expect(result.firstErrorRef).toBe(undefined);
    expect(refA.state.type).toBe(StateTypes.PRISTINE);
    expect(refB.state.type).toBe(StateTypes.PRISTINE);
    expect(refC.state.type).toBe(StateTypes.PRISTINE);

    refC.set(1);
    result = ref.validateSync({
      onlyDirtyRefs: true,
    });
    expect(result.valid).toBe(false);
    expect(result.firstErrorRef).toBe(undefined);
    expect(refA.state.type).toBe(StateTypes.PRISTINE);
    expect(refB.state.type).toBe(StateTypes.PRISTINE);
    expect(refC.state.type).toBe(StateTypes.SUCCESS);

    refB.set(6);
    result = ref.validateSync({
      onlyDirtyRefs: true,
    });
    expect(result.valid).toBe(false);
    expect(result.firstErrorRef).toMatchObject({ path: ['b'] });
    expect(refA.state.type).toBe(StateTypes.PRISTINE);
    expect(refB.state.type).toBe(StateTypes.ERROR);
    expect(refC.state.type).toBe(StateTypes.SUCCESS);
  });

  it('Test default keyword', () => {
    const schema = {
      properties: {
        foo: { default: 'foo' },
        bar: { default: 'bar' },
      },
    };
    const expectedObject = {
      foo: 'foo',
      bar: 'bar',
    };

    const m1 = new Model(schema, {});
    m1.prepareSync();
    expect(m1.ref().get()).toMatchObject(expectedObject);

    const m2 = new Model(schema, {});
    m2.prepareSync();
    expect(m2.ref().get()).toMatchObject(expectedObject);
  });

  it('Test default keyword validation priority', () => {
    const schema = {
      properties: {
        foo: { default: 'foo', type: 'string', minLength: 1 },
      },
    };

    const m1 = new Model(schema, {});
    m1.validateSync();
    expect(m1.ref().state.type).toBe(StateTypes.SUCCESS);
  });

  it('Test filter keyword', () => {
    const schema = {
      filter: (v) => v.trim(),
    };

    const model = new Model(schema, ' foo  ');
    model.prepareSync();
    expect(model.ref().get()).toBe('foo');
  });

  it('Should throw an error', () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          filter: '',
        },
        '',
      );
    }).toThrow('The schema of the "filter" keyword should be a function.');
  });

  it('Test error keyword', () => {
    const model = new Model(
      {
        minLength: 1,
        error: 'Value can\'t be blank.',
      },
      '',
    );
    model.validateSync();
    // @ts-ignore
    expect(model.ref().state.message.description).toBe('Value can\'t be blank.');
  });

  it('Test warning keyword 1', () => {
    const model = new Model(
      {
        minLength: 1,
        warning: 'Warning text',
      },
      'a',
    );
    model.validateSync();
    // @ts-ignore
    expect(model.ref().state.message).toBe(undefined);
  });

  it('Test warning keyword 2', () => {
    const validator = (ref: Ref) => ref.createSuccessResult({
      keyword: 'custom',
      description: 'Validator\'s warning message.',
    });

    const m1 = new Model(
      {
        syncValidate: validator,
      },
      '',
    );

    m1.validateSync();
    // @ts-ignore
    expect(m1.ref().state.message.description).toBe('Validator\'s warning message.');

    const m2 = new Model(
      {
        syncValidate: validator,
        warning: 'Custom warning message.',
      },
      '',
    );

    m2.validateSync();
    // @ts-ignore
    expect(m2.ref().state.message.description).toBe('Custom warning message.');
  });

  it('Test keywords option', () => {
    const model = new Model(
      {
        // @ts-ignore
        newKeyword: true,
      },
      '',
      {
        keywords: [
          {
            name: 'newKeyword',
            compile(): IRule {
              return {
                async: false,
                validate: (ref) => (ref.createSuccessResult({
                  keyword: 'newKeyword',
                  description: 'Ok',
                })),
              };
            },
          },
        ],
      },
    );
    model.validateSync();
    const ref = model.ref();

    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state.message).toMatchObject({
      keyword: 'newKeyword',
      description: 'Ok',
    });
  });

  it('Test model\'s errors option', () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: true,
          },
        },
      },
      {
        foo: '',
      },
      {
        errors: {
          presence: 'Custom error message',
        },
      },
    );
    model.validateSync();
    const ref = model.ref(['foo']);

    expect(ref.state.message).toMatchObject({
      description: 'Custom error message',
    });
  });

  it('Test model\'s warnings option', () => {
    const model = new Model(
      {
        // @ts-ignore
        syncValidate: (ref) => ref.createSuccessResult({
          keyword: 'customValidation',
          description: 'default warning',
        }),
      },
      {},
      {
        warnings: {
          customValidation: 'Custom warning message',
        },
      },
    );
    model.validateSync();
    const ref = model.ref();

    expect(ref.state.message).toMatchObject({
      keyword: 'customValidation',
      description: 'Custom warning message',
    });
  });

  it('Test schema\'s errors keyword', () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: true,
            errors: {
              presence: 'schema\'s custom error message',
            },
          },
        },
      },
      {
        foo: '',
      },
      {
        errors: {
          presence: 'model\'s custom error message',
        },
      },
    );
    model.validateSync();
    const ref = model.ref(['foo']);

    expect(ref.state.message).toMatchObject({
      description: 'schema\'s custom error message',
    });
  });

  it('Test schema\'s warnings keyword', () => {
    const model = new Model(
      {
        // @ts-ignore
        syncValidate: (ref) => ref.createSuccessResult({
          keyword: 'customValidation',
          description: 'default warning',
        }),
        warnings: {
          customValidation: 'schema\'s custom warning message',
        },
      },
      {},
      {
        warnings: {
          customValidation: 'model\'s custom warning message',
        },
      },
    );
    model.validateSync();
    const ref = model.ref();

    expect(ref.state.message).toMatchObject({
      keyword: 'customValidation',
      description: 'schema\'s custom warning message',
    });
  });
});
