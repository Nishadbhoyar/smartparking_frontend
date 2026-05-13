import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import useNotificationSocket from "../../hooks/useNotificationSocket";
import { timeAgo } from "../../utils/formatters";
import toast from "react-hot-toast";
import { Bell, BellOff, CheckCheck, Trash2, RefreshCw, Check, Wifi, WifiOff } from "lucide-react";

// Type → icon emoji mapping for visual grouping
const TYPE_ICON = {
  VALET:   "🚗",
  BOOKING: "🅿️",
  RENTAL:  "🔑",
  SYSTEM:  "🔔",
};

const NotificationsPage = () => {
  const { user }                 = useAuth();
  const [notifications, setN]    = useState([]);
  const [unreadCount, setCount]  = useState(0);
  const [loading, setL]          = useState(true);
  const [markingAll, setMarkAll] = useState(false);
  const [clearing, setClearing]  = useState(false);

  const load = useCallback(async () => {
    setL(true);
    try {
      const [histRes, countRes] = await Promise.all([
        axiosInstance.get(`/api/notifications/history/${user.id}`),
        axiosInstance.get(`/api/notifications/unread-count/${user.id}`),
      ]);
      setN(histRes.data || []);
      setCount(countRes.data?.count || 0);
    } catch {
      setN([]);
      setCount(0);
    } finally {
      setL(false);
    }
  }, [user?.id]);

  useEffect(() => { if (user?.id) load(); }, [user, load]);

  // ── WebSocket: prepend new notifications instantly ───────────────────────
  // When the server pushes a notification over WS it lands here immediately.
  // No refresh or poll needed — the item appears at the top of the list.
  const { connected: wsConnected } = useNotificationSocket(
    user?.id,
    useCallback((msg) => {
      setN((prev) => [{ ...msg, read: false }, ...prev]);
      setCount((c) => c + 1);
    }, [])
  );

  const handleMarkOne = async (notif) => {
    if (notif.read) return;
    try {
      await axiosInstance.put(`/api/notifications/${notif.id}/read`);
      setN((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
      setCount((c) => Math.max(0, c - 1));
    } catch { toast.error("Failed to mark as read"); }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setMarkAll(true);
    try {
      await axiosInstance.put(`/api/notifications/mark-all-read/${user.id}`);
      setN((prev) => prev.map((n) => ({ ...n, read: true })));
      setCount(0);
      toast.success("All marked as read");
    } catch { toast.error("Failed"); }
    finally { setMarkAll(false); }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    setClearing(true);
    try {
      await axiosInstance.delete(`/api/notifications/clear/${user.id}`);
      setN([]);
      setCount(0);
      toast.success("Cleared");
    } catch { toast.error("Clear failed"); }
    finally { setClearing(false); }
  };

  return (
    <div className="page-container max-w-lg space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Notifications</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
            {/* Live connection indicator */}
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              wsConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {wsConnected
                ? <><Wifi size={10} /> Live</>
                : <><WifiOff size={10} /> Connecting...</>}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-xs">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} disabled={markingAll}
              className="btn-secondary flex items-center gap-1.5 text-xs">
              {markingAll
                ? <span className="w-3 h-3 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                : <><CheckCheck size={12} /> Mark all read</>}
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClear} disabled={clearing}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700
                border border-red-200 hover:border-red-300 rounded-xl px-3 py-2 transition-colors">
              {clearing
                ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                : <><Trash2 size={12} /> Clear all</>}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <BellOff size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium text-sm">No notifications yet</p>
          <p className="text-gray-400 text-xs">Booking updates and alerts will appear here instantly</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => handleMarkOne(n)}
              className={`relative bg-white border rounded-2xl p-4 cursor-pointer
                hover:shadow-sm transition-all ${
                n.read ? "border-gray-100" : "border-sp-blue/30 bg-sp-blue/[0.02]"
              }`}>
              {!n.read && <span className="absolute top-4 right-4 w-2 h-2 bg-sp-blue rounded-full" />}
              <div className="flex items-start gap-3 pr-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                  flex-shrink-0 text-base ${n.read ? "bg-gray-50" : "bg-sp-blue/10"}`}>
                  {TYPE_ICON[n.type] ?? <Bell size={15} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  {n.title && (
                    <p className={`text-sm font-semibold ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                      {n.title}
                    </p>
                  )}
                  <p className={`text-sm mt-0.5 ${n.read ? "text-gray-500" : "text-gray-700"}`}>
                    {n.body || n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
              {!n.read && (
                <p className="text-xs text-sp-blue/70 mt-2 flex items-center gap-1 pl-12">
                  <Check size={10} /> Tap to mark as read
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;