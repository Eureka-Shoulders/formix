import { get, set } from '../src/utils';

describe('Utils', () => {
  it('should get first level property of an object', () => {
    const obj = {
      a: 1,
      b: 2,
    };

    expect(get(obj, 'a')).toBe(1);
    expect(get(obj, 'b')).toBe(2);
  });

  it('should get nested properties of an object', () => {
    const obj = {
      a: {
        b: { c: 1 },
      },
    };

    expect(get(obj, 'a.b.c')).toBe(1);
  });

  it('should get nested properties of an object with array indexes', () => {
    const obj = {
      a: [{ b: 1 }, { c: 2 }],
    };

    expect(get(obj, 'a[0].b')).toBe(1);
    expect(get(obj, 'a.0.b')).toBe(1);
    expect(get(obj, 'a[1].c')).toBe(2);
    expect(get(obj, 'a.1.c')).toBe(2);
  });

  it('should set first level property of an object', () => {
    const obj = {
      a: 1,
      b: 2,
    };

    set(obj, 'a', 3);
    expect(obj.a).toBe(3);

    set(obj, 'b', 4);
    expect(obj.b).toBe(4);
  });

  it('should set nested properties of an object', () => {
    const obj = {
      a: {
        b: { c: 1 },
      },
    };

    set(obj, 'a.b.c', 2);
    expect(obj.a.b.c).toBe(2);
  });

  it('should set nested properties of an object with array indexes', () => {
    const obj = {
      a: [{ b: 1 }, { c: 2 }],
    };

    set(obj, 'a[0].b', 3);
    expect(obj.a[0].b).toBe(3);
    expect(obj.a[1].c).toBe(2);

    set(obj, 'a.0.b', 4);
    expect(obj.a[0].b).toBe(4);
    expect(obj.a[1].c).toBe(2);

    set(obj, 'a[1].c', 5);
    expect(obj.a[0].b).toBe(4);
    expect(obj.a[1].c).toBe(5);

    set(obj, 'a.1.c', 6);
    expect(obj.a[0].b).toBe(4);
    expect(obj.a[1].c).toBe(6);
  });

  it('should set elements of undefined indexes', () => {
    const obj: Record<string, unknown> = {
      a: [1],
    };

    set(obj, 'a.2.b', 2);
    expect(obj.a[0]).toBe(1);
    expect(obj.a[2].b).toBe(2);
  });

  it('should create an array and set value by index', () => {
    const obj: Record<string, number[]> = {};

    set(obj, 'a[0]', 1);
    expect(obj.a[0]).toBe(1);

    set(obj, 'a.1', 2);
    expect(obj.a[1]).toBe(2);
  });

  it('should create an object and set value by key', () => {
    const obj: Record<string, Record<string, number>> = {};

    set(obj, 'a.b', 1);
    expect(obj.a.b).toBe(1);
  });

  it('should return undefined on access property of array', () => {
    const obj: Record<string, number[]> = { a: [1] };

    expect(get(obj, 'a.b')).toBeUndefined();
  });

  it('should return undefined on access element of empty array', () => {
    const obj: Record<string, number[]> = { a: [1] };

    expect(get(obj, 'a.1')).toBeUndefined();
  });

  it('should return undefined on access undefined property of an object', () => {
    const obj: Record<string, number> = {};

    expect(get(obj, 'a.b')).toBeUndefined();
  });
});
