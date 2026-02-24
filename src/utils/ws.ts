class WebSocketManager {
  url: string;
  ws: WebSocket | null = null;
  private readonly listeners: Record<string, ((...args: unknown[]) => void)[]> =
    {};
  private readonly reconnectInterval = 5000;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;

  constructor(wsPath: string) {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host.replace("3000", "4000");
    const wsUrl = `${wsProtocol}//${wsHost}${wsPath}`;
    this.url = wsUrl;
  }

  connect() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket connection opened.");
        if (this.listeners.open) {
          for (const cb of this.listeners.open) {
            cb();
          }
        }
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      this.ws.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (this.listeners.message) {
          for (const cb of this.listeners.message) {
            cb(message);
          }
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection closed");
        if (this.listeners.close) {
          for (const cb of this.listeners.close) {
            cb();
          }
        }
      };

      this.ws.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
        // Prevent error from bubbling up and crashing the app
      };
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket connection not open.");
    }
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => this.connect(), this.reconnectInterval);
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
    } else {
      console.log("Max reconnection attempts reached, giving up.");
    }
  }
}

export default WebSocketManager;
