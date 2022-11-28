export const revert = <
  K extends string | number | symbol,
  V extends string | number | symbol
>(
  obj: Record<K, V>
): Record<V, K> => {
  return Object.entries<V>(obj).reduce((acc, [k, v]) => {
    return {
      ...acc,
      [v]: k,
    };
  }, {}) as Record<V, K>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function omitBy<T extends { [key: string]: any }>(
  obj: T,
  fn: (v: T[keyof T], key: string) => boolean
): Partial<T> {
  const newObj: Partial<T> = Object.create(null);

  Object.keys(obj).forEach((key: keyof T) => {
    if (fn.call(null, obj[key], key as string)) return;
    newObj[key] = obj[key];
  });

  return newObj;
}
