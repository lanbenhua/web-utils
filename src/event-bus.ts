/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line no-unused-vars
type Listener<P = any> = (payload: P) => void;

const noOp = (): void => {
  /* empty function */
};

const subscribers: {
  [type: string]: Listener[];
} = {};

function proxyArgs<CommandType>(
  ...args: unknown[]
): [string, CommandType | undefined] {
  let key: string;
  let command: CommandType | undefined;
  if (
    args.length === 3 &&
    typeof args[0] === "string" &&
    typeof args[1] === "string"
  ) {
    key = `${args[0]} // ${args[1]}`;
    command = args[2] as CommandType;
  } else if (args.length === 2 && typeof args[0] === "string") {
    [key] = args;
    command = args[1] as CommandType;
  } else {
    key = "";
  }
  return [key, command];
}

export function subscribe<
  T extends string = string,
  L extends Function = () => void
>(type: T, listener: L): () => void;
// eslint-disable-next-line no-redeclare
export function subscribe<
  W extends string = string,
  T extends string = string,
  L extends Function = () => void
>(widgetId: W, type: T, listener: L): () => void;
// eslint-disable-next-line no-redeclare
export function subscribe(...args: unknown[]): () => void {
  const [channel, listener] = proxyArgs<Listener | undefined>(...args);

  if (!channel || !listener) {
    throw new Error("Wrong number of args supplied to `subscribe`.");
  }

  if (subscribers[channel] && subscribers[channel].includes(listener)) {
    return noOp;
  }
  subscribers[channel] = [...(subscribers[channel] || []), listener];

  return (): void => {
    subscribers[channel] = subscribers[channel].filter((fn) => fn !== listener);
  };
}

export function dispatch<T extends string = string, P = any>(
  type: T,
  payload: P
): void;
// eslint-disable-next-line no-redeclare
export function dispatch<
  W extends string = string,
  T extends string = string,
  P = any
>(widgetId: W, type: T, payload: P): void;
// eslint-disable-next-line no-redeclare
export function dispatch(...args: unknown[]): void {
  const [channel, payload] = proxyArgs<any>(...args);

  if (channel && subscribers[channel]) {
    subscribers[channel].forEach((listener) => listener(payload));
  }
}
