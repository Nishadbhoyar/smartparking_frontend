import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatDate, formatCurrency, statusColor } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  CalendarCheck, ScanLine, LogIn, LogOut, RefreshCw, Search
} from "lucide-react";

// ── Lot Bookings Page ─────────────────────────────────────────────────────────
export const LotBookingsPage = () => {
  const { user } = useAuth();

  const [lots, setLots]         = useState([]);
  const [selLot, setSel]        = useState(null);
  const [bookings, setB]        = useState([]);
  const [loading, setL]         = useState(false);
  const [filter, setFilter]     = useState("ALL");

  // Verify panel state
  const [scanCode, setScanCode]     = useState("");
  const [scanning, setScanning]     = useState(false);
  const [actionLoading, setActL]    = useState({}); // { [bookingCode]: true }

  // ── Load lots ──────────────────────────────────────────────────────────────
  useEffect(() => {
    axiosInstance.get(`/api/parking-lots/admin/${user.id}`).then((r) => {
      const data = r.data || [];
      setLots(data);
      if (data.length) setSel(data[0].id);
    });
  }, [user]);

  // ── Load bookings when lot changes ─────────────────────────────────────────
  const loadBookings = () => {
    if (!selLot) return;
    setL(true);
    axiosInstance.get(`/api/bookings/lot/${selLot}`)
      .then((r) => setB(r.data || []))
      .catch(() => setB([]))
      .finally(() => setL(false));
  };

  useEffect(() => { loadBookings(); }, [selLot]);

  // ── Verify arrival (PENDING → ACTIVE) ──────────────────────────────────────
  const verifyEntry = async (code) => {
    if (!code?.trim() || !selLot) {
      toast.error("Enter a booking code and select a lot first.");
      return;
    }
    setActL((p) => ({ ...p, [code]: true }));
    try {
      await axiosInstance.post(`/api/bookings/verify-code`, null, {
        params: { code: code.trim().toUpperCase(), lotId: selLot },
      });
      toast.success(`Booking ${code.trim().toUpperCase()} — customer checked in!`);
      setScanCode("");
      loadBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed. Check the code.");
    } finally {
      setActL((p) => ({ ...p, [code]: false }));
    }
  };

  // ── Checkout (ACTIVE → COMPLETED) ─────────────────────────────────────────
  const checkout = async (code) => {
    setActL((p) => ({ ...p, [code]: true }));
    try {
      const res = await axiosInstance.post(`/api/bookings/checkout`, null, {
        params: { code: code.trim().toUpperCase() },
      });
      toast.success(
        `Checked out! Final amount: ${formatCurrency(res.data?.totalAmount ?? 0)}`
      );
      loadBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Checkout failed.");
    } finally {
      setActL((p) => ({ ...p, [code]: false }));
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="page-container space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Bookings</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5">
              {pendingCount} customer{pendingCount > 1 ? "s" : ""} waiting to be verified
            </p>
          )}
        </div>
        <button
          onClick={loadBookings}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-sp-blue transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Lot selector */}
      {lots.length > 1 && (
        <select
          value={selLot || ""}
          onChange={(e) => setSel(Number(e.target.value))}
          className="input max-w-xs"
        >
          {lots.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      )}

      {/* ── Verify Arrival Panel ─────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ScanLine size={18} className="text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-blue-900 text-sm">Verify Customer Arrival</span>
        </div>
        <p className="text-xs text-blue-700">
          Ask the customer for their booking code and enter it below to check them in.
        </p>
        <div className="flex gap-2">
          <input
            value={scanCode}
            onChange={(e) => setScanCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && verifyEntry(scanCode)}
            placeholder="e.g. BK-A1B2C3D4"
            className="input flex-1 font-mono text-sm uppercase"
          />
          <button
            onClick={() => verifyEntry(scanCode)}
            disabled={!scanCode.trim() || scanning}
            className="btn-primary flex items-center gap-1.5 text-sm px-4 disabled:opacity-50"
          >
            <LogIn size={15} />
            Check In
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["ALL", "PENDING", "ACTIVE", "COMPLETED", "CANCELLED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? "bg-sp-blue text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f}
            {f === "PENDING" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarCheck size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">
            No {filter !== "ALL" ? filter.toLowerCase() : ""} bookings
          </p>
        </div>
      ) : (

        // ── Mobile-friendly cards ──────────────────────────────────────────
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3"
            >
              {/* Top row: code + status badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-gray-800 text-sm">{b.bookingCode}</span>
                <span className={`badge text-xs ${statusColor(b.status)}`}>{b.status}</span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                <div><span className="text-gray-400">Customer: </span>{b.customerName}</div>
                <div><span className="text-gray-400">Slot: </span>{b.slotNumber}</div>
                <div><span className="text-gray-400">Entry: </span>{formatDate(b.entryTime)}</div>
                <div>
                  <span className="text-gray-400">Exit: </span>
                  {b.exitTime ? formatDate(b.exitTime) : "—"}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Amount: </span>
                  <span className="font-semibold text-gray-900">
                    {b.totalAmount ? formatCurrency(b.totalAmount) : "—"}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {b.status === "PENDING" && (
                <button
                  onClick={() => verifyEntry(b.bookingCode)}
                  disabled={actionLoading[b.bookingCode]}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading[b.bookingCode] ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <LogIn size={14} />
                  )}
                  Verify Arrival — Check In
                </button>
              )}

              {b.status === "ACTIVE" && (
                <button
                  onClick={() => checkout(b.bookingCode)}
                  disabled={actionLoading[b.bookingCode]}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-sp-blue hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading[b.bookingCode] ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <LogOut size={14} />
                  )}
                  Checkout Customer
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LotBookingsPage;