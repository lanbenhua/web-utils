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
