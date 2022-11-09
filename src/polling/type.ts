export type PollerOptions<T = unknown> = {
  name?: string;
  strategy?: string | PollerStrategy;
  immediately?: boolean;
  interval?: number;
  retries?: number;
  timeout?: number;
  masterTimeout?: number;
  shouldContinue?: (err?: Error | null, result?: T) => boolean;
  getNextInterval?: (count: number, options?: PollerOptions) => number;
  progressCallback?: (err?: Error | null, result?: T) => void;
};

export type PollerStrategy = {
  defaults?: Record<string, number>;
  getNextInterval?: (count: number, options?: PollerOptions) => number;
};
