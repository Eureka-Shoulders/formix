export type PathParam = Array<string | number> | string;

export function stringToPath(string: string): Array<string | number> {
  const result: Array<string | number> = [];
  const paths = string.split('.');

  for (const path of paths) {
    const arrayAcessor = path.match(/\w+[[][0-9][\]]/g);

    if (arrayAcessor?.[0]) {
      const arrayPath = arrayAcessor[0].match(/(\w+)|[0-9]+/g);

      if (arrayPath) {
        if (arrayPath.length) {
          result.push(arrayPath[0]);
          result.push(Number(arrayPath[1]));
        }
      }
    } else {
      const number = Number(path);

      result.push(isNaN(number) ? path : number);
    }
  }

  return result;
}

const isObject = (input: unknown) =>
  null !== input &&
  typeof input === 'object' &&
  // eslint-disable-next-line no-prototype-builtins
  Object.getPrototypeOf(input).isPrototypeOf(Object);

/**
 * Exported functions
 */

export function get(object: object, path: PathParam) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result = object as any;

  if (typeof path === 'string') path = stringToPath(path);

  for (const index of path) {
    if (Array.isArray(result)) {
      if (typeof index === 'string') {
        return undefined;
      }
      if (!result.length || result.length < index + 1) {
        return undefined;
      }
    }

    if (result[index] === undefined) {
      return undefined;
    }

    result = result[index];
  }

  return result;
}

export function set(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: Record<string, any>,
  path: PathParam,
  value: unknown
) {
  if (typeof path === 'string') path = stringToPath(path);

  // TODO: improve types
  function createNewElement(
    object: Record<string, unknown>,
    path: PathParam,
    pathIndex: number,
    elem: string | number
  ) {
    if (typeof path[pathIndex + 1] === 'number') {
      object[elem] = [];
    } else {
      object[elem] = {};
    }
  }

  const length = path.length;

  for (let i = 0; i < length - 1; i++) {
    const elem = path[i];

    let outOfBounds = false;
    if (typeof elem === 'number' && Array.isArray(object)) {
      if (object.length < elem + 1) {
        outOfBounds = true;
      }
    }

    if (outOfBounds) {
      createNewElement(object, path, i, elem);
      object = object[elem];
      continue;
    }

    if (!object[elem] || !isObject(object[elem])) {
      if (object[elem] === undefined) {
        createNewElement(object, path, i, elem);
      }
    }
    object = object[elem];
  }

  // set value to second last key
  object[path[length - 1]] = value;
}
