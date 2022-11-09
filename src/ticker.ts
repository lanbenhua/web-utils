/* eslint-disable @typescript-eslint/no-inferrable-types */
export type TickFunc = () => Promise<unknown> | unknown;

export type TickerOptions = {
  immediately?: boolean;
  interval?: number;
  retries?: number;
  timeout?: number;
  masterTimeout?: number;
  beforeTick?: () => void;
  afterTick?: () => void;
  shouldContinue?: (err?: Error | null, result?: unknown) => boolean;
  getNextInterval?: (count: number, options?: TickerOptions) => number;
  progressCallback?: (count: number, err?: Error) => void;
};

const debug = (...args: unknown[]) => console.log(args);
export const CANCEL_TOKEN = new Error("Canceled");

function timeout<T = unknown>(promise: Promise<T>, millis: number): Promise<T> {
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

function delay<T = unknown>(millis: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

export default class Ticker {
  private _options?: TickerOptions;
  private _tickFunc: TickFunc;
  private _retriesRemaining?: number;
  private _isPaused: boolean = false;
  private _isPolling: boolean = false;
  private _isTicking: boolean = false;
  private _masterTimer: number | null = null;
  private _masterResolve?: (result: unknown) => void;
  private _masterReject?: (err: unknown) => void;

  constructor(public tickFunc: TickFunc, options?: TickerOptions) {
    this._tickFunc = tickFunc;
    this._options = options;
  }

  get options(): TickerOptions | undefined {
    return this._options;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  get isTicking(): boolean {
    return this._isTicking;
  }

  get isPolling(): boolean {
    return this._isPolling;
  }

  public setTick(tickFunc: TickFunc) {
    this.tickFunc = tickFunc;
  }

  public setOptions(options?: TickerOptions) {
    this._options = options;
  }

  public start() {
    return new Promise((resolve, reject) => {
      this._isPolling = true;
      this._retriesRemaining = this._options?.retries;
      this._masterResolve = resolve;
      this._masterReject = reject;

      if (this._options?.masterTimeout) {
        debug(`Using master timeout of ${this._options?.masterTimeout} ms.`);
        this._masterTimer = window.setTimeout(() => {
          debug("Master timeout reached. Rejecting master promise.");
          this._isPolling = false;
          return reject(new Error("master timeout"));
        }, this._options?.masterTimeout);
      }

      if (this._options?.immediately) {
        this.tick();
      } else {
        window.setTimeout(() => {
          this.tick();
        }, this._options?.interval);
      }
    });
  }

  public tick() {
    debug(
      `start tick, polling is ${this._isPolling}, pasued is ${this._isPaused}, ticking is ${this._isTicking}`
    );
    if (!this._isPolling) return;
    if (this._isPaused) return;
    if (this._isTicking) return;

    this._isTicking = true;
    let tickPromise = Promise.resolve(this._tickFunc.call(null));
    if (this._options?.timeout) {
      tickPromise = timeout(tickPromise, this._options?.timeout);
    }

    tickPromise.then(
      (result) => {
        this._isTicking = false;
        if (this._options?.shouldContinue?.(null, result)) {
          debug("shouldContinue returned true. Retrying.");
          const nextInterval =
            this._options?.getNextInterval?.(
              (this._options?.retries ?? 0) - (this._retriesRemaining ?? 0),
              this._options
            ) ??
            this._options?.interval ??
            1000;
          debug(`Waiting ${nextInterval}ms to try again.`);
          delay(nextInterval).then(this.tick.bind(this));
        } else {
          this._isPolling = false;
          if (this._masterTimer !== null) {
            window.clearTimeout(this._masterTimer);
          }
          this._masterResolve?.(result);
        }
      },
      (err) => {
        this._isTicking = false;
        if (err === CANCEL_TOKEN) {
          debug("Task promise rejected with CANCEL_TOKEN, canceling.");
          this._isPolling = false;
          this._masterReject?.(err);
        }

        if (typeof this._options?.progressCallback === "function") {
          this._options?.progressCallback(this._retriesRemaining ?? 0, err);
        }

        if (
          this._retriesRemaining === 0 ||
          !this._options?.shouldContinue?.(err)
        ) {
          debug("Maximum retries reached. Rejecting master promise.");
          this._isPolling = false;
          this._masterReject?.(err);
        } else if (this._isPolling) {
          debug(`Poll failed. ${this._retriesRemaining} retries remaining.`);

          const nextInterval =
            this._options?.getNextInterval?.(
              (this._options?.retries ?? 0) - (this._retriesRemaining ?? 0),
              this._options
            ) ??
            this._options?.interval ??
            1000;

          debug(`Waiting ${nextInterval}ms to try again.`);
          if (this._retriesRemaining) this._retriesRemaining--;
          delay(nextInterval).then(this.tick.bind(this));
        }
      }
    );
  }

  public cancel() {
    debug(`cancel called`);
    if (!this._isPolling) return;
    this._isPolling = false;
  }

  public pause() {
    debug(`pause called`);
    if (!this._isPolling) return;
    if (this._isPaused) return;
    this._isPaused = true;
  }

  public resume() {
    debug(`resume called`);
    if (!this._isPolling) return;
    if (!this._isPaused) return;
    this._isPaused = false;
    this.tick();
  }
}
