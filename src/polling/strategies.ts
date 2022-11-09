import { PollerStrategy } from './type';

const strategies: Record<string, PollerStrategy> = {
  'fixed-interval': {
    defaults: {
      interval: 1000,
    },
    getNextInterval: function(_, options) {
      return (
        options?.interval ??
        (options?.strategy as PollerStrategy).defaults?.interval ??
        1000
      );
    },
  },

  'linear-backoff': {
    defaults: {
      start: 1000,
      increment: 1000,
    },
    getNextInterval: (count, options) => {
      return (
        ((options?.strategy as PollerStrategy).defaults?.start ?? 1000) +
        ((options?.strategy as PollerStrategy).defaults?.increment ?? 1000) *
          count
      );
    },
  },

  'exponential-backoff': {
    defaults: {
      min: 1000,
      max: 30000,
    },
    getNextInterval: function(count, options) {
      return Math.min(
        (options?.strategy as PollerStrategy).defaults?.max ?? 30000,
        Math.round(
          Math.random() *
            (Math.pow(2, count) * 1000 -
              ((options?.strategy as PollerStrategy).defaults?.min ?? 1000)) +
            ((options?.strategy as PollerStrategy).defaults?.min ?? 1000)
        )
      );
    },
  },
};

export default strategies;
