/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from "./nil";
import deepMerge from "./deep-merge";

export type PrefixType = "error" | "info" | "log" | "warn";

type KeyMapRecord<T, S> = Partial<{
  [p in keyof T]: S;
}>;

type ConsolerOptions = {
  execable?: boolean;
  execableMap?: KeyMapRecord<Consoler, boolean>;
  prefix?: string | null | ((type: PrefixType) => string | null | undefined);
  prefixMap?: Partial<Record<PrefixType, boolean>>;
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
  prefix: null,
  prefixMap: {
    error: true,
    info: true,
    log: true,
    warn: true,
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
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      const args: any[] = [...arguments];
      if (!(this instanceof Consoler)) return original.apply(this, args);
      const self = this as Consoler;
      // @ts-ignore
      const enable = self.isExecutable(proporty.toString() as keyof Consoler);
      if (enable) return original.apply(this, args);
    };
  };
}

function prefixable() {
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
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      const args: any[] = [...arguments];
      if (!(this instanceof Consoler)) return original.apply(this, args);
      const self = this as Consoler;
      // @ts-ignore
      const prefix = self.getPrefix(proporty.toString());
      const first = args.shift();
      if (isNil(prefix)) return original.call(this, first, ...args);
      if (typeof first === "string")
        return original.call(this, prefix + " " + first, ...args);
      return original.call(this, "%s %o", prefix, first, ...args);
    };
  };
}

class Consoler {
  private _options?: ConsolerOptions;
  public get options() {
    return this._options;
  }

  constructor(options?: ConsolerOptions) {
    this._options =
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

  private getPrefix(type: PrefixType): string | null | undefined {
    if (this._options?.prefix) {
      return typeof this._options?.prefix === "string"
        ? this._options?.prefix
        : this._options?.prefix(type);
    }
    return undefined;
  }

  private isExecutable(type: keyof Consoler): boolean {
    return !!(this._options?.execable && this._options?.execableMap?.[type]);
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
  @prefixable()
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
  @prefixable()
  public info(...data: any[]) {
    return console.info(...data);
  }

  @execable()
  @prefixable()
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
  @prefixable()
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
