import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

/**
 * Connects to the backend STOMP broker and subscribes to real-time slot
 * updates for a given parking lot.
 *
 * Topic fix: backend broadcasts to /topic/parking-lot/{lotId}/slots
 * (was incorrectly subscribed to /topic/slots/{lotId} before)
 */
const useSlotWebSocket = (lotId, onSlotUpdate) => {
  const clientRef   = useRef(null);
  const onUpdateRef = useRef(onSlotUpdate);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onUpdateRef.current = onSlotUpdate;
  }, [onSlotUpdate]);

  const connect = useCallback(() => {
    if (!lotId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        // ✅ Fixed: topic now matches backend SlotWebSocketService broadcast path
        client.subscribe(`/topic/parking-lot/${lotId}/slots`, (message) => {
          try {
            const data = JSON.parse(message.body);
            if (onUpdateRef.current) onUpdateRef.current(data);
          } catch (e) {
            console.error("WS parse error:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        setConnected(false);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [lotId]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connected, disconnect };
};

export default useSlotWebSocket;