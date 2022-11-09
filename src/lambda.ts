export type ComposeFunc<T> = (...args: T[]) => T;

export const compose = <T>(...fns: ComposeFunc<T>[]) => (...args: T[]): T => {
  return fns.reduceRight<T | T[]>((pre: T | T[], composer: ComposeFunc<T>) => {
    const arg = Array.isArray(pre) ? pre : [pre];
    return composer.call(null, ...arg) as T;
  }, args) as T;
};
