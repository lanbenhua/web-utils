export const intersection = <T>(...arrays: T[][]): T[] => {
  const len = arrays.length;
  const map = new Map<T, number>();

  arrays.forEach((arr) => {
    arr.forEach((item) => {
      map.set(item, (map.get(item) ?? 0) + 1);
    });
  });

  const o: T[] = [];
  map.forEach((v, k) => {
    if (v === len) o.push(k);
  });

  return o;
};

type ST<T> = T | T[] | undefined | null;
type MT<T> = ST<T> | ST<T>[] | undefined;

export function flatt<T>(list: MT<T>[], recursive = true): T[] {
  let value: MT<T>[], jlen: number, j: number;
  const result: T[] = [];
  let idx = 0;
  const ilen: number = list.length;

  while (idx < ilen) {
    if (Array.isArray(list[idx])) {
      value = recursive ? flatt(list[idx] as MT<T>[]) : (list[idx] as MT<T>[]);
      j = 0;
      jlen = value.length;

      while (j < jlen) {
        result[result.length] = value[j] as T;
        j += 1;
      }
    } else {
      result[result.length] = list[idx] as T;
    }

    idx += 1;
  }

  return result;
}

export const unique = <T>(
  ...args: (MT<T> | ((item: T) => string | number | null | undefined))[]
): T[] => {
  const _args = args;
  let last:
    | ((item: T) => string | number | null | undefined)
    | undefined
    | null = args.pop() as unknown as (
    item: T
  ) => string | number | null | undefined;
  if (typeof last !== "function") {
    _args.push(last);
    last = undefined;
  }
  const arr: (T | null | undefined)[] = flatt(_args as MT<T>[]);

  const map = new Map();
  arr.forEach((item) => {
    if (item === null || item === undefined) return;
    if (last) {
      const key = last(item);
      if (key === null || key === undefined) return;
      if (!map.has(key)) map.set(key, item);
      return;
    }
    map.set(item, item);
  });
  const arr2: T[] = [];
  map.forEach((v) => {
    arr2.push(v);
  });
  return arr2;
};
