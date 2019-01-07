import createModel, { Symbols, InternalSymbols } from '../../src/Repository/createModel';

describe('createModel', () => {
  it('returns a new object', () => {
    const obj = {};
    expect(createModel(obj)).not.toBe(obj);
  });

  it('has all of the same properties', () => {
    const obj = {
      foo: 'bar',
      bar: 'baz',
      [0]: 'number',
      [Symbol('sym')]: 'symbol',
    };
    expect(createModel(obj)).toEqual(obj);
  });

  it('contains all of the symbol properties', () => {
    const model = createModel({});
    expect(model[Symbols.isModel]).toEqual(true);
    expect(model[Symbols.dirty]).toEqual(false);
    expect(model[Symbols.changed]).toEqual([]);
    expect(model[Symbols.changes]).toEqual({});
    expect(model[Symbols.errors]).toEqual([]);
    expect(model[Symbols.valid]).toEqual(false);
  });

  it('does not allow changing symbol properties', () => {
    // Type as any to suppress intentional type errors:
    const model = createModel({}) as any;

    expect(() => (model[Symbols.isModel] = null)).toThrowError();
    expect(() => (model[Symbols.dirty] = null)).toThrowError();
    expect(() => (model[Symbols.changed] = null)).toThrowError();
    expect(() => (model[Symbols.changes] = null)).toThrowError();
    expect(() => (model[Symbols.errors] = null)).toThrowError();
    expect(() => (model[Symbols.valid] = null)).toThrowError();

    // Modifying the underlying properties should also fail:
    expect(() => model[Symbols.errors].push('foo')).toThrowError();
    expect(() => model[Symbols.changes].push('foo')).toThrowError();
    expect(() => (model[Symbols.changed]['foo'] = 'bar')).toThrowError();
  });

  it('is dirty after modifying a property', () => {
    const model = createModel({ foo: 'bar' });
    model.foo = 'baz';
    expect(model.foo).toEqual('baz');
    expect(model[Symbols.dirty]).toEqual(true);
    expect(model[Symbols.changed]).toEqual(['foo']);
    expect(model[Symbols.changes]).toEqual({ foo: 'bar' });
  });

  it('is not dirty after resetting a property', () => {
    const model = createModel({ foo: 'bar' });
    model.foo = 'baz';
    model.foo = 'bar';
    expect(model.foo).toEqual('bar');
    expect(model[Symbols.dirty]).toEqual(false);
    expect(model[Symbols.changed]).toEqual([]);
    expect(model[Symbols.changes]).toEqual({});
  });

  it('handles settings validation flags accordingly', () => {
    // NOTE: Type as any to allow calling internal methods:
    const model = createModel({ foo: 'bar' }) as any;
    expect(model[InternalSymbols.hasValidationRun]).toEqual(false);
    expect(model[Symbols.valid]).toEqual(false);
    model[InternalSymbols.setErrors]([]);
    expect(model[InternalSymbols.hasValidationRun]).toEqual(true);
    expect(model[Symbols.valid]).toEqual(true);
    model.foo = 'baz';
    expect(model[InternalSymbols.hasValidationRun]).toEqual(false);
    expect(model[Symbols.valid]).toEqual(false);
    model[InternalSymbols.setErrors]([{ message: 'Some error.' }]);
    expect(model[InternalSymbols.hasValidationRun]).toEqual(true);
    expect(model[Symbols.valid]).toEqual(false);
  });
});
