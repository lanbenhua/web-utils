export function timeout<T = unknown>(
  promise: Promise<T>,
  millis: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error("operation timed out")),
      millis
    );

    promise.then((result) => {
      clearTimeout(timeoutId);
      resolve(result);
    });
  });
}

export function delay<T = unknown>(millis: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}
