/* eslint-disable @typescript-eslint/no-explicit-any */
export const getSingleton = function<T>(fn: (...args: any[]) => T) {
  let result: any;
  return function singleton(...args: any[]) {
    return result || (result = fn.call(null, ...args)); // 确定this上下文并传递参数
  };
};

export type CreatorFunc<T = any> = () => T;

export class Singleton<T> {
  private instance?: T = undefined;

  constructor(public creator: CreatorFunc<T>) {
    this.creator = creator;
  }

  public getInstance(): T {
    if (!this.instance) {
      this.instance = this.creator();
    }
    return this.instance;
  }
}

export class Singleton2<T = any> {
  private static instance?: any = undefined;

  constructor(public creator: CreatorFunc<T>) {
    this.creator = creator;
  }

  static getInstance<T = any>(creator: CreatorFunc<T>): T {
    if (!this.instance) {
      this.instance = new Singleton(creator).getInstance();
    }
    return this.instance;
  }
}
