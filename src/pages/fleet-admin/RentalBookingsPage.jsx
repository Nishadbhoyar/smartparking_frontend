// ── RentalBookingsPage.jsx (fleet-admin) ──────────────────────────────────────
// FIXED: Added verify-pickup OTP, verify-return OTP, extend booking
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatDate, formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { ClipboardList, Truck, RefreshCw, KeyRound, X, Calendar } from "lucide-react";

const STATUS_COLOR = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  ACTIVE:    "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

const OtpModal = ({ title, hint, onConfirm, onClose }) => {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!otp.trim()) return toast.error("Enter OTP");
    setBusy(true);
    try { await onConfirm(otp.trim()); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><X size={14} /></button>
        </div>
        <p className="text-xs text-gray-500">{hint}</p>
        <div className="relative">
          <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={otp} onChange={(e) => setOtp(e.target.value.toUpperCase())}
            placeholder="Enter OTP" maxLength={6}
            className="input pl-9 font-mono tracking-widest text-center uppercase"
            onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={submit} disabled={busy || !otp.trim()} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ExtendModal = ({ booking, onClose, onRefresh }) => {
  const [newEnd, setNewEnd] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!newEnd) return toast.error("Select new end date/time");
    setBusy(true);
    try {
      const res = await axiosInstance.put(`/api/rental-cars/bookings/${booking.id}/extend`, {
        newEndTime: new Date(newEnd).toISOString().slice(0, 19),
      });
      toast.success(`Extended! Extra charge: ${formatCurrency(res.data.extraCost)}`);
      onRefresh(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Extend failed"); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900">Extend Rental</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><X size={14} /></button>
        </div>
        <p className="text-xs text-gray-500">Current end: <strong>{formatDate(booking.endTime)}</strong>. Pick a later date/time.</p>
        <input type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
          min={booking.endTime?.slice(0, 16)} className="input" />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={submit} disabled={busy || !newEnd} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Extend"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RentalBookingsPage = () => {
  const { user }         = useAuth();
  const [bookings, setB] = useState([]);
  const [loading, setL]  = useState(true);
  const [otpModal, setOtpModal] = useState(null);
  const [extModal, setExtModal] = useState(null);

  const companyId = user?.companyId || user?.id;

  const load = () => {
    setL(true);
    axiosInstance.get(`/api/rental-cars/company/${companyId}/bookings`)
      .then((r) => setB(r.data || []))
      .catch(() => setB([]))
      .finally(() => setL(false));
  };

  useEffect(() => { if (user?.id) load(); }, [user]);

  const handleVerifyPickup = async (otp) => {
    await axiosInstance.post(`/api/rental-cars/bookings/${otpModal.bookingId}/verify-pickup`, { otp });
    toast.success("Pickup confirmed! Booking is now ACTIVE.");
    load();
  };

  const handleVerifyReturn = async (otp) => {
    await axiosInstance.post(`/api/rental-cars/bookings/${otpModal.bookingId}/verify-return`, { otp });
    toast.success("Return confirmed! Booking completed.");
    load();
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Rental Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Track all rental requests for your fleet</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-xs">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <ClipboardList size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium text-sm">No rental bookings yet</p>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">When customers book your fleet cars, bookings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {b.carMake} {b.carModel}{" "}
                      <span className="text-gray-400 font-normal">{b.licensePlate}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Customer: <span className="font-medium">{b.customerName ?? `#${b.customerId}`}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>From: {formatDate(b.startTime)}</span>
                      <span>To: {formatDate(b.endTime)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  {b.totalAmount != null && <p className="text-sm font-bold text-sp-blue">{formatCurrency(b.totalAmount)}</p>}
                  <span className={`badge text-xs ${STATUS_COLOR[b.status] || "bg-gray-100 text-gray-600"}`}>{b.status}</span>
                </div>
              </div>

              {(b.status === "CONFIRMED" || b.status === "ACTIVE") && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50 flex-wrap">
                  {b.status === "CONFIRMED" && (
                    <button onClick={() => setOtpModal({ bookingId: b.id, type: "pickup" })}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                      <KeyRound size={12} /> Verify Pickup OTP
                    </button>
                  )}
                  {b.status === "ACTIVE" && (
                    <>
                      <button onClick={() => setOtpModal({ bookingId: b.id, type: "return" })}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                        <KeyRound size={12} /> Verify Return OTP
                      </button>
                      <button onClick={() => setExtModal(b)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                        <Calendar size={12} /> Extend
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {otpModal && (
        <OtpModal
          title={otpModal.type === "pickup" ? "Verify Pickup OTP" : "Verify Return OTP"}
          hint={otpModal.type === "pickup"
            ? "Ask the customer for their pickup OTP to confirm handover."
            : "Ask the customer for their return OTP to confirm car is back."}
          onConfirm={otpModal.type === "pickup" ? handleVerifyPickup : handleVerifyReturn}
          onClose={() => setOtpModal(null)}
        />
      )}
      {extModal && <ExtendModal booking={extModal} onClose={() => setExtModal(null)} onRefresh={load} />}
    </div>
  );
};

export default RentalBookingsPage;