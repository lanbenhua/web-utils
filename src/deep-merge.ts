/* eslint-disable @typescript-eslint/no-explicit-any */
export default function deepMerge(...sources: any[]): any {
  let acc: Record<string, any> = {};
  for (const source of sources) {
    if (source instanceof Array) {
      if (!(acc instanceof Array)) {
        acc = [];
      }
      acc = [...(acc as any[]), ...source];
    } else if (source instanceof Object) {
      for (const [key, value] of Object.entries(source)) {
        let newValue = value;
        if (value instanceof Object && key in acc) {
          newValue = deepMerge((acc as any)[key], value);
        }
        acc = { ...acc, [key]: newValue };
      }
    }
  }
  return acc;
}
