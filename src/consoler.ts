/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from "./nil";
import deepMerge from "./deep-merge";

export type ConsolerPrefixType = "error" | "info" | "log" | "warn";
export type ConsolerPrefix =
  | string
  | null
  | ((type: ConsolerPrefixType) => string | null | undefined);
export type ConsolerMethod = keyof Console; // | keyof Omit<Consoler, 'options' | 'getPrefix' | 'isPrefixable' | 'isExecutable'>;
export type ConsolerExecableMap = Partial<{ [p in ConsolerMethod]: boolean }>;
export type ConsolerPrefixMap = Partial<
  Record<ConsolerPrefixType, boolean | { enable?: boolean; style?: string }>
>;
export type ConsolerOptions = {
  execable?: boolean;
  execableMap?: ConsolerExecableMap;
  prefix?: ConsolerPrefix;
  prefixMap?: ConsolerPrefixMap;
};

const defaultColorSets: Record<ConsolerPrefixType, string> = {
  error: "color: #fff; font-style: normal; background-color: red; padding: 2px",
  log: "color: #fff; font-style: normal; background-color: grey; padding: 2px",
  warn: "color: #333; font-style: normal; background-color: yellow; padding: 2px",
  info: "color: #fff; font-style: normal; background-color: green; padding: 2px",
};

const defaultOptions: ConsolerOptions = {
  execable: true,
  execableMap: {
    assert: true,
    clear: true,
    count: true,
    countReset: true,
    debug: true,
    dir: true,
    dirxml: true,
    error: true,
    group: true,
    groupCollapsed: true,
    groupEnd: true,
    info: true,
    log: true,
    table: true,
    time: true,
    timeEnd: true,
    timeLog: true,
    timeStamp: true,
    trace: true,
    warn: true,
    profile: true,
    profileEnd: true,
  },
  prefix: (type: ConsolerPrefixType) => {
    const map: Record<ConsolerPrefixType, string> = {
      error: "[ERROR]",
      info: "[INFO]",
      log: "[DEBUG]",
      warn: "[WARN]",
    };
    return map[type];
  },
  prefixMap: {
    error: {
      enable: true,
      style: defaultColorSets.error,
    },
    info: {
      enable: true,
      style: defaultColorSets.info,
    },
    log: {
      enable: true,
      style: defaultColorSets.log,
    },
    warn: {
      enable: true,
      style: defaultColorSets.warn,
    },
  },
};

function execable() {
  return function (
    _: Consoler,
    proporty: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    if (typeof original !== "function")
      throw new Error(
        `execable decorator must use for a method, but ${proporty.toString()} is ${typeof original}`
      );
    descriptor.value = function () {
      //@ts-ignore
      // eslint-disable-next-line prefer-rest-params
      const args: any[] = [...arguments];
      if (!(this instanceof Consoler)) return original.apply(this, args);
      const self = this as Consoler;
      const enable = self.isExecutable(proporty.toString() as ConsolerMethod);
      if (enable) return original.apply(this, args);
    };
  };
}

function prefixable(c?: string) {
  return function (
    _: Consoler,
    proporty: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    if (typeof original !== "function")
      throw new Error(
        `prefixable decorator must use for a method, but ${proporty.toString()} is ${typeof original}`
      );
    descriptor.value = function () {
      //@ts-ignore
      // eslint-disable-next-line prefer-rest-params
      const args: any[] = [...arguments];
      if (!(this instanceof Consoler)) return original.apply(this, args);
      const self = this as Consoler;
      const { enable, prefix, style } = self.getPrefix(
        proporty.toString() as ConsolerPrefixType
      );
      const first = args.shift();
      if (!enable || isNil(prefix)) return original.call(this, first, ...args);

      if (typeof first === "string")
        return original.call(
          this,
          "%c" + prefix + "%c " + first,
          style ?? c,
          "color: inherit; font-style: normal",
          ...args
        );
      return original.call(
        this,
        "%c%s%c %o",
        style ?? c,
        prefix,
        "color: inherit; font-style: normal",
        first,
        ...args
      );
    };
  };
}

class Consoler {
  public options?: ConsolerOptions;

  constructor(options?: ConsolerOptions) {
    this.options =
      deepMerge<ConsolerOptions>(defaultOptions, options) ?? undefined;

    this.getPrefix = this.getPrefix.bind(this);
    this.isExecutable = this.isExecutable.bind(this);

    this.assert = this.assert.bind(this);
    this.clear = this.clear.bind(this);
    this.count = this.count.bind(this);
    this.countReset = this.countReset.bind(this);
    this.debug = this.debug.bind(this);
    this.dir = this.dir.bind(this);
    this.dirxml = this.dirxml.bind(this);
    this.error = this.error.bind(this);
    this.group = this.group.bind(this);
    this.groupCollapsed = this.groupCollapsed.bind(this);
    this.groupEnd = this.groupEnd.bind(this);
    this.info = this.info.bind(this);
    this.log = this.log.bind(this);
    this.profile = this.profile.bind(this);
    this.profileEnd = this.profileEnd.bind(this);
    this.table = this.table.bind(this);
    this.time = this.time.bind(this);
    this.timeEnd = this.timeEnd.bind(this);
    this.timeLog = this.timeLog.bind(this);
    this.timeStamp = this.timeStamp.bind(this);
    this.trace = this.trace.bind(this);
    this.warn = this.warn.bind(this);
  }

  public getPrefix(type: ConsolerPrefixType): {
    enable: boolean;
    prefix?: string | null;
    style?: string;
  } {
    const prefix =
      typeof this.options?.prefix === "string"
        ? this.options?.prefix
        : this.options?.prefix?.(type);
    const option = this.options?.prefixMap?.[type];
    return {
      enable: this.isPrefixable(type),
      style: typeof option === "boolean" ? undefined : option?.style,
      prefix,
    };
  }

  public isPrefixable(type: ConsolerPrefixType): boolean {
    const option = this.options?.prefixMap?.[type];
    if (isNil(option)) return false;
    if (typeof option === "boolean") return option;
    return option.enable !== false;
  }

  public isExecutable(type: ConsolerMethod): boolean {
    return !!(this.options?.execable && this.options?.execableMap?.[type]);
  }

  @execable()
  public assert(condition?: boolean, ...data: any[]) {
    console.assert(condition, ...data);
  }

  @execable()
  public clear() {
    console.clear();
  }

  @execable()
  public count(label?: string) {
    console.count(label);
  }

  @execable()
  public countReset(label?: string) {
    console.countReset(label);
  }

  @execable()
  public debug(...data: any[]) {
    console.debug(...data);
  }

  @execable()
  public dir(item?: any, options?: any) {
    console.dir(item, options);
  }

  @execable()
  public dirxml(...data: any[]) {
    console.dirxml(...data);
  }

  @execable()
  @prefixable(defaultColorSets.error)
  public error(...data: any[]) {
    return console.error(...data);
  }

  @execable()
  public group(...data: any[]) {
    console.group(...data);
  }

  @execable()
  public groupCollapsed(...data: any[]) {
    console.groupCollapsed(...data);
  }

  @execable()
  public groupEnd() {
    console.groupEnd();
  }

  @execable()
  @prefixable(defaultColorSets.info)
  public info(...data: any[]) {
    return console.info(...data);
  }

  @execable()
  @prefixable(defaultColorSets.log)
  public log(...data: any[]) {
    return console.log(...data);
  }

  @execable()
  public table(tabularData?: any, properties?: string[]) {
    console.table(tabularData, properties);
  }

  @execable()
  public time(label?: string) {
    console.time(label);
  }

  @execable()
  public timeEnd(label?: string) {
    console.timeEnd(label);
  }

  @execable()
  public timeLog(label?: string, ...data: any[]) {
    console.timeLog(label, ...data);
  }

  @execable()
  public timeStamp(label?: string) {
    console.timeStamp(label);
  }

  @execable()
  public trace(...data: any[]) {
    console.trace(...data);
  }
  @execable()
  @prefixable(defaultColorSets.warn)
  public warn(...data: any[]) {
    return console.warn(...data);
  }

  @execable()
  public profile(...data: any[]) {
    console.profile(...data);
  }

  @execable()
  public profileEnd(...data: any[]) {
    console.profileEnd(...data);
  }
}

export default Consoler;
