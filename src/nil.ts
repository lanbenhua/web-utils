export function isNil(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any
): obj is null | undefined {
  return obj === undefined || obj === null;
}
