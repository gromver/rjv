declare const describe;
declare const it;
declare const expect;

import Ref from './Ref';
import Storage from './Storage';

describe('Ref tests', () => {
  it('Ref\'s getters and setters', async () => {
    const initialData = {
      foo: 'bar',
    };

    const storage = new Storage(initialData);
    const ref = new Ref(storage, '/');

    expect(ref.getValue()).toBe(initialData);

    ref.setValue(1);
    expect(ref.getValue()).toBe(1);

    ref.setValue(2);
    expect(ref.getValue()).toBe(2);
  });
});
