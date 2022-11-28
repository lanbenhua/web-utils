export type ISortField<T> =
  | keyof T
  | {
      name: keyof T;
      primer?: (v: T[keyof T]) => number;
      reverse?: boolean;
    };
type ICompareFunc<T> = (a: T, b: T) => number;
const default_cmp = function <T>(a: T, b: T): number {
  if (a == b) return 0;
  return a < b ? -1 : 1;
};
const getCmpFunc = function <T>(primer?: (v: T) => number, reverse?: boolean) {
  const dfc = default_cmp; // closer in scope
  let cmp: ICompareFunc<T> = default_cmp;
  if (primer) {
    cmp = (a: T, b: T) => dfc(primer(a), primer(b));
  }
  if (reverse) {
    return function (a: T, b: T) {
      return -1 * cmp(a, b);
    };
  }
  return cmp;
};

export const sortBy = <T extends object>(fields: ISortField<T>[]) => {
  return (list: T[]): T[] => {
    const nfields: {
      name: keyof T;
      cmp: ICompareFunc<T[keyof T]>;
    }[] = fields.map((field) =>
      typeof field === "object"
        ? {
            name: field.name,
            cmp: getCmpFunc<T[keyof T]>(field.primer, field.reverse),
          }
        : { name: field, cmp: default_cmp }
    );
    const n_fields = nfields.length;

    return list.sort((a, b) => {
      let name: keyof T;
      let result = 0;
      for (let i = 0; i < n_fields; i++) {
        result = 0;
        const field = nfields[i];
        name = field.name;
        // @ts-ignore
        result = field.cmp(a[name], b[name]);
        if (result !== 0) break;
      }
      return result;
    });
  };
};
