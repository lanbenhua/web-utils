export const MAX_WS_RETRY = 10;
export enum WebSocketReadyStatus {
  CONNECTING = 0,
  OPEN,
  CLOSING,
  CLOSED,
}

export const MAX_WS_RETRY_MESSAGE = (retry = MAX_WS_RETRY) =>
  `exceed max retry times (${retry} times)`;

class WebsocketHelper {
  // @ts-ignore
  private ws: WebSocket;
  // @ts-ignore
  private url: string;
  private pong = "pong";
  private closedByClient = false;
  private retryWhenClose = true;
  private retryWhenError = true;
  // eslint-disable-next-line @typescript-eslint/ban-types
  private messageQueue: Array<(data: object) => void> = [];
  private resQueue: Array<() => void> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rejQueue: Array<(err?: any) => void> = [];

  private connect(url: string, retry = 0): Promise<void> {
    if (retry > MAX_WS_RETRY) {
      this.dispatchRejQueue(MAX_WS_RETRY_MESSAGE());
      return Promise.reject(MAX_WS_RETRY_MESSAGE());
    }

    if (this.ws?.readyState === WebSocketReadyStatus.OPEN) {
      this.dispatchResQueue();
      return Promise.resolve();
    }

    return new Promise((res, rej) => {
      this.resQueue.push(res);
      this.rejQueue.push(rej);

      if (this.ws) return;

      this.ws = new WebSocket(url);
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.ws.onopen = (_) => {
        this.dispatchResQueue();
      };

      this.ws.onmessage = (e) => {
        if (e.data === this.pong) return;

        let data = e.data;
        try {
          data = JSON.parse(e.data);
          // eslint-disable-next-line no-empty
        } catch (e) {}

        this.messageQueue.map((handler) => {
          handler(data);
        });
      };

      this.ws.onerror = (err) => {
        console.log(err);
        if (this.retryWhenError) return this.connect(url, retry + 1);
        this.dispatchRejQueue(err);
      };

      this.ws.onclose = () => {
        if (this.closedByClient) {
          this.closedByClient = false;
          return this.dispatchRejQueue("close");
        }
        if (this.retryWhenClose) return this.connect(url, retry + 1);
        this.dispatchRejQueue("close");
      };
    });
  }

  private dispatchResQueue() {
    this.resQueue.map((r) => r());
    this.clearQueue();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dispatchRejQueue(err: any) {
    this.rejQueue.map((r) => r(err));
    this.clearQueue();
  }

  private clearQueue() {
    this.rejQueue = [];
    this.resQueue = [];
  }

  public close() {
    this.closedByClient = true;
    this.ws?.close();
  }

  public getWs(url: string) {
    return this.connect(url).then(() => this.ws);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public onMessage(handler: (data: object) => void) {
    this.messageQueue.push(handler);
  }

  public setUrl(url: string) {
    this.url = url;
  }

  public send(msg: string) {
    return this.connect(this.url).then(() => {
      this.ws.send(msg);
    });
  }
}

export const websocketHelper = new WebsocketHelper();
