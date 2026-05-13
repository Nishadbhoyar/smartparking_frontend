import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

/**
 * Connects to /topic/notifications/{userId} and calls onNotification(msg)
 * immediately when the server pushes a new notification.
 *
 * msg shape: { id, title, body, type, createdAt }
 *
 * This eliminates the 30-second polling delay in the Navbar badge and the
 * NotificationsPage list — new items appear the instant they are saved.
 *
 * Usage:
 *   const { connected } = useNotificationSocket(user.id, (msg) => {
 *     setNotifications(prev => [{ ...msg, read: false }, ...prev]);
 *     setUnread(c => c + 1);
 *   });
 */
const useNotificationSocket = (userId, onNotification) => {
  const clientRef   = useRef(null);
  const callbackRef = useRef(onNotification);
  const [connected, setConnected] = useState(false);

  // Keep callback ref current so we don't recreate the connection on re-render
  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  const connect = useCallback(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/notifications/${userId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            if (callbackRef.current) callbackRef.current(msg);
          } catch (e) {
            console.error("[NotificationSocket] parse error:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("[NotificationSocket] STOMP error:", frame.headers["message"]);
        setConnected(false);
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
  }, [userId]);

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

  return { connected };
};

export default useNotificationSocket;