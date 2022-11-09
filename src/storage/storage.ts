/* eslint-disable no-underscore-dangle */

const stringify = <T>(data: T): string => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error(e);

    return "";
  }
};

const parse = <T>(data: string): T | null => {
  try {
    return JSON.parse(data) as T | null;
  } catch (e) {
    console.error(e);

    return null;
  }
};

const storage = {
  write<T>(key: string, data: T) {
    window.localStorage.setItem(key, stringify(data));
  },

  read<T>(key: string): T | null {
    const d = window.localStorage.getItem(key);

    return d === null || d === "" ? null : parse(d);
  },
};

interface InitOptions {
  flushImmediately?: boolean;
}

class Storage<T> {
  private __ID__: string;

  private __INIT__?: InitOptions;

  private __ORIGIN_DATA__:
    | Record<string, T | undefined | null>
    | null
    | undefined;

  constructor(id: string, init?: InitOptions) {
    this.__ID__ = id;
    this.__INIT__ = init;

    this.sync();

    this.registerEvents();
  }

  public get id(): string {
    return this.__ID__;
  }

  public get initOptions(): InitOptions | undefined {
    return this.__INIT__;
  }

  public get __data(): Record<string, T | undefined | null> | undefined | null {
    return this.__ORIGIN_DATA__;
  }

  /**
   * sync data from storage
   */
  public sync(): boolean {
    try {
      this.__ORIGIN_DATA__ = storage.read(this.__ID__);

      return true;
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  /**
   * flush data to storage
   */
  public flush(): boolean {
    try {
      storage.write(this.__ID__, this.__ORIGIN_DATA__);

      return true;
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  public try_flush(): boolean {
    if (this.__INIT__?.flushImmediately) {
      return this.flush();
    }
    return false;
  }

  public read(key: string): T | undefined | null {
    const d = this.__ORIGIN_DATA__?.[key];

    return d;
  }

  public write(key: string, data: T | undefined | null): boolean {
    if (!this.__ORIGIN_DATA__) this.__ORIGIN_DATA__ = {};
    this.__ORIGIN_DATA__[key] = data;

    this.try_flush();

    return true;
  }

  public update(key: string, data: T | undefined | null): boolean {
    if (!this.__ORIGIN_DATA__) return false;
    this.__ORIGIN_DATA__[key] = data;

    this.try_flush();

    return true;
  }

  public delete(key: string): boolean {
    if (!this.__ORIGIN_DATA__) return false;
    this.__ORIGIN_DATA__[key] = undefined;

    this.try_flush();

    return true;
  }

  private registerEvents() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    window.addEventListener("storage", (e) => {
      console.log(`storage changed e: `, e, e.key, e.oldValue, e.newValue);
      console.log(`storage changed cache: `, this.__ID__, this.__ORIGIN_DATA__);

      if (e.key === this.__ID__) {
        this.sync();
      }
    });

    if (!this.__INIT__?.flushImmediately) {
      window.addEventListener("beforeunload", () => {
        self.flush();
      });
    }
  }
}

export { InitOptions };

export default Storage;
