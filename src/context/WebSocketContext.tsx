import type React from "react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useDashboardStore } from "@/stores/dashboard";
import { handleSuccess } from "@/utils/api";
import WebSocketManager from "@/utils/ws";

interface WebSocketHook {
  send: (message: any) => void;
  profile?: any;
}

// Context
const WebSocketContext = createContext<WebSocketHook | undefined>(undefined);

// Provider Component
interface AppWebSocketProviderProps {
  children: ReactNode;
}

const AppWebSocketProvider: React.FC<AppWebSocketProviderProps> = ({
  children,
}) => {
  const { store, update, delete: deleteRecord, profile } = useDashboardStore();
  const wsManager = useRef<WebSocketManager | null>(null);

  const send = useCallback((message: any) => {
    if (wsManager.current && wsManager.current.isConnected()) {
      wsManager.current.send(message);
    } else {
      console.error("WebSocket is not connected.");
    }
  }, []);

  useEffect(() => {
    const userPath = "/api/user";

    if (!profile?.id) return;
    const setupWebSocket = () => {
      wsManager.current = new WebSocketManager(
        `${userPath}?userId=${profile.id}`
      );

      wsManager.current.on("open", () => {
        console.log("WebSocket Connected to", userPath);
        send({ type: "SUBSCRIBE", payload: { type: "auth" } });
      });

      wsManager.current.on("close", () => {
        console.log("WebSocket Disconnected from", userPath);
        wsManager.current = null;
      });

      wsManager.current.on("error", (error) => {
        console.error("WebSocket error on", userPath, ":", error);
      });

      wsManager.current.on("message", (message) => {
        const handleStore = (stateKey, data) => {
          store(stateKey, data);
        };

        const handleUpdate = (stateKey, { id, ids, data }) => {
          update(stateKey, id || ids, data);
        };

        const handleDelete = (stateKey, { id, ids }) => {
          deleteRecord(stateKey, id || ids);
        };
        switch ((message as any).method) {
          case "get":
          case "create":
            handleStore((message as any).type, (message as any).payload);
            if ((message as any).payload?.message)
              handleSuccess((message as any).payload, "Success", false);
            break;
          case "update":
            handleUpdate((message as any).type, (message as any).payload);
            if ((message as any).payload?.message)
              handleSuccess((message as any).payload, "Success", false);
            break;
          case "delete":
            handleDelete((message as any).type, (message as any).payload);
            if ((message as any).payload?.message)
              handleSuccess((message as any).payload, "Success", false);
            break;
          default:
            console.log("Received unknown method", message);
        }
      });

      wsManager.current.connect();
    };

    if (profile?.id) {
      if (wsManager.current) {
        wsManager.current.disconnect();
        wsManager.current = null;
      }
      setupWebSocket();
    } else if (wsManager.current) {
      wsManager.current.disconnect();
      wsManager.current = null;
    }

    return () => {
      if (wsManager.current) {
        wsManager.current.disconnect();
        wsManager.current = null;
      }
    };
  }, [profile?.id, send, store, update, deleteRecord]);

  return (
    <WebSocketContext.Provider value={{ send, profile }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketHook => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within an AppWebSocketProvider");
  }
  return context;
};

export { AppWebSocketProvider };
