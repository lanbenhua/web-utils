export type ComposeFunc<T> = (...args: T[]) => T;

export const compose =
  <T>(...fns: ComposeFunc<T>[]) =>
  (...args: T[]): T => {
    return fns.reduceRight<T | T[]>(
      (pre: T | T[], composer: ComposeFunc<T>) => {
        const arg = Array.isArray(pre) ? pre : [pre];
        return composer.call(null, ...arg) as T;
      },
      args
    ) as T;
  };

export type PipeFunc<T> = (value: T) => T;
export const pipe =
  <T>(...args: PipeFunc<T>[]) =>
  (x: T): T =>
    args.reduce(
      (outputValue, currentFunction) => currentFunction(outputValue),
      x
    );
