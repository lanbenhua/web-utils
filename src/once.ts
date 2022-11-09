export type DoFunc = () => void;

export default class Once {
  private id = 0;

  constructor() {
    this.id = 0;
  }

  public do(fn: DoFunc): void {
    if (this.id === 0) {
      this.id++;
      fn.call(null);
    }
  }
}
