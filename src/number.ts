export const humanize = (n: number): string => {
  const NAlpha: { [key: string]: string } = {
    0: "Original",
    1: "1st",
    2: "2nd",
    3: "3rd",
    n: "th",
  };

  if (n <= 3) return NAlpha[n];

  return `${n}${NAlpha.n}`;
};
