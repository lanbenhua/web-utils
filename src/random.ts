const randomScope = <T extends unknown>(scope: T[]): T => {
  const scopeIdx = Math.floor(Math.random() * scope.length);
  return scope[scopeIdx];
};

const randomNumber = (
  min?: number,
  max?: number,
  options?: {
    round?: boolean;
    floor?: boolean;
    ceil?: boolean;
  }
): number => {
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  if (min > max)
    throw new Error('[randomNumber] min must small or equal than max');
  const { floor, ceil, round } = options || {};
  const random = Math.random() * (max - min) + min;
  if (round) return Math.round(random);
  if (floor) return Math.floor(random);
  if (ceil) return Math.ceil(random);
  return random;
};

const ramdomString = (minLen?: number, maxLen?: number): string => {
  if (minLen === undefined) minLen = 8;
  if (maxLen === undefined) maxLen = 32;
  if (minLen > maxLen)
    throw new Error('[ramdomString] minLen must small or equal than maxLen');
  let count = Math.floor(Math.random() * (maxLen - minLen) + minLen);
  const alpha =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let str = '';
  while (count > 0) {
    const ridx = Math.floor(Math.random() * alpha.length);
    str += alpha[ridx];
    count--;
  }
  return str;
};

const randomDate = (minDate?: Date, maxDate?: Date): Date => {
  if (minDate === undefined) minDate = new Date(1970, 1, 1, 0, 0, 0);
  if (maxDate === undefined) maxDate = new Date();
  if (minDate > maxDate)
    throw new Error('[ramdomDate] minDate must small or equal than minDate');
  const duration = maxDate.getTime() - minDate.getTime();
  return new Date(minDate.getTime() + Math.floor(Math.random() * duration));
};

const randomList = <T extends unknown>(
  generator: () => T,
  min?: number,
  max?: number
): T[] => {
  if (min === undefined) min = 8;
  if (max === undefined) max = 32;
  if (min > max)
    throw new Error('[randomNumber] min must small or equal than max');
  const list: T[] = [];
  let count = Math.floor(Math.random() * (max - min + 1) + min);
  while (count > 0) {
    list.push(generator());
    count--;
  }
  return list;
};

export {
  randomNumber as N,
  ramdomString as S,
  randomDate as D,
  randomScope as s,
  randomList as L,
};

export default {
  N: randomNumber,
  S: ramdomString,
  D: randomDate,
  s: randomScope,
  L: randomList,
};
