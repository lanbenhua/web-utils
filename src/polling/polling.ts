import strategies from "./strategies";
import { PollerOptions } from "./type";
import { timeout, delay } from "./util";

const DEFAULTS: PollerOptions = {
  strategy: "fixed-interval",
  retries: 3,
  interval: 1000,
  shouldContinue: (err) => {
    return !!err;
  },
};

let pollerCount = 0;
export const CANCEL_TOKEN = new Error("Canceled");

export default function polling<T>(
  poller: () => T | Promise<T>,
  options?: PollerOptions
) {
  options = Object.assign({}, DEFAULTS, options);
  options.name = options.name || `Poller-${pollerCount++}`;

  const debug = (message: string) =>
    console.log(`(${options?.name ?? ""}): ${message}`);

  debug(
    `Creating a promise poller "${options.name}" with interval=${options.interval}, retries=${options.retries}`
  );

  if (typeof options.strategy === "string" && !strategies[options.strategy]) {
    throw new Error(
      `Invalid strategy "${
        options.strategy
      }". Valid strategies are ${Object.keys(strategies)}`
    );
  }

  const strategy =
    typeof options.strategy === "string"
      ? strategies[options.strategy]
      : options.strategy;
  debug(`Using strategy "${options.strategy}", ${strategy}.`);
  options.strategy = strategy;

  debug("Options:");
  Object.keys(options).forEach((option: string) => {
    // @ts-ignore
    debug(`    "${option}": ${options[option]}`);
  });

  return new Promise<T>((resolve, reject) => {
    let polling = true;
    let retriesRemaining = options?.retries ?? 0;
    const rejections: Error[] = [];
    let timeoutId: number | null = null;

    if (options?.masterTimeout) {
      debug(`Using master timeout of ${options.masterTimeout} ms.`);
      // @ts-ignore
      timeoutId = setTimeout(() => {
        debug("Master timeout reached. Rejecting master promise.");
        polling = false;
        reject("master timeout");
      }, options.masterTimeout);
    }

    const _getNextInterval = () => {
      return (
        strategy?.getNextInterval?.(
          (options?.retries ?? 0) - (retriesRemaining ?? 0),
          options
        ) ??
        options?.getNextInterval?.(
          (options?.retries ?? 0) - (retriesRemaining ?? 0),
          options
        ) ??
        options?.interval ??
        1000
      );
    };

    const poll = () => {
      let pollerPromise = Promise.resolve(poller());

      if (options?.timeout) {
        pollerPromise = timeout(pollerPromise, options.timeout);
      }

      pollerPromise.then(
        (result) => {
          debug("Poll succeeded. Resolving master promise.");

          if (typeof options?.progressCallback === "function") {
            options.progressCallback(null, result);
          }

          if (options?.shouldContinue?.(null, result)) {
            debug("shouldContinue returned true. Retrying.");

            const nextInterval = _getNextInterval();

            debug(`Waiting ${nextInterval}ms to try again.`);
            delay(nextInterval).then(poll);
          } else {
            if (timeoutId !== null) {
              clearTimeout(timeoutId);
            }
            resolve(result);
          }
        },
        (err) => {
          if (err === CANCEL_TOKEN) {
            debug("Task promise rejected with CANCEL_TOKEN, canceling.");
            reject(rejections);
            polling = false;
          }

          rejections.push(err);
          if (typeof options?.progressCallback === "function") {
            options.progressCallback(err);
          }

          if (!--retriesRemaining || !options?.shouldContinue?.(err)) {
            debug("Maximum retries reached. Rejecting master promise.");
            reject(rejections);
          } else if (polling) {
            debug(`Poll failed. ${retriesRemaining} retries remaining.`);

            const nextInterval = _getNextInterval();

            debug(`Waiting ${nextInterval}ms to try again.`);
            delay(nextInterval).then(poll);
          }
        }
      );
    };

    poll();
  });
}
