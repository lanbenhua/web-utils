export const ellipsis = (s: string, maxLen: number): string => {
  const len = s.length;
  if (len <= maxLen) return s;

  return s.slice(0, maxLen) + '...';
};
