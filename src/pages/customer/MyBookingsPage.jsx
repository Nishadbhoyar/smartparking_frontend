import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatDate, formatCurrency, statusColor } from "../../utils/formatters";
import toast from "react-hot-toast";
import { ParkingSquare, Clock, ArrowRight, X, Car, CreditCard, KeyRound, Star, FileText, CheckCircle } from "lucide-react";

// ── CHANGE 1: Added "PAID" to the filter list ─────────────────────────────────
const PARKING_FILTERS = ["ALL", "PENDING", "PAID", "ACTIVE", "COMPLETED", "CANCELLED"];

const STATUS_COLOR_RENTAL = {
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700", COMPLETED: "bg-gray-100 text-gray-600", CANCELLED: "bg-red-100 text-red-700",
};

const MyBookingsPage = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [tab, setTab] = useState("parking");
  
  const [bookings, setB] = useState([]); 
  const [rentals, setR] = useState([]);
  const [valets, setV] = useState([]);

  const [loading, setL] = useState(true); 
  const [filter, setFilter] = useState("ALL");
  const [cancelling, setC] = useState(null);

  const load = () => {
    if (!user?.id) return; 
    setL(true);
    
    Promise.all([
      axiosInstance.get(`/api/bookings/customer/${user.id}`).then(r => r.data || []).catch(() => []),
      axiosInstance.get(`/api/rental-cars/customer/${user.id}/bookings`).then(r => r.data || []).catch(() => []),
      axiosInstance.get(`/api/valet/customer/${user.id}`).then(r => {
        return Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []);
      }).catch(() => [])
    ]).then(([b, r, v]) => { 
      setB(b); 
      setR(r); 
      setV(v); 
    }).finally(() => setL(false));
  };

  useEffect(() => { load(); }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setC(bookingId);
    try { 
      await axiosInstance.post(`/api/bookings/${bookingId}/cancel`); 
      toast.success("Booking cancelled."); 
      load(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || "Cancel failed."); 
    } finally { 
      setC(null); 
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);

  // ── CHANGE 2: Helper for icon background — handles PAID status ────────────
  const iconBg = (status) => {
    if (status === "ACTIVE")    return "bg-green-50";
    if (status === "PAID")      return "bg-blue-50";
    if (status === "COMPLETED") return "bg-blue-50";
    return "bg-gray-50";
  };

  const iconColor = (status) => {
    if (status === "ACTIVE")    return "text-green-600";
    if (status === "PAID")      return "text-blue-600";
    if (status === "COMPLETED") return "text-blue-600";
    return "text-gray-400";
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          {bookings.length} parking · {rentals.length} rental · {valets.length} valet
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {[
          ["parking", `🅿️ Parking (${bookings.length})`],
          ["rental", `🚗 Rental (${rentals.length})`],
          ["valet", `👔 Valet (${valets.length})`]
        ].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── PARKING TAB ──────────────────────────────────────────────────────── */}
      {tab === "parking" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PARKING_FILTERS.map(f => {
              const count = f === "ALL" ? bookings.length : bookings.filter(b => b.status === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? "bg-sp-blue text-white shadow-md shadow-sp-blue/25" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {f === "ALL" ? "All" : f} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map(i => (<div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"><div className="flex gap-3"><div className="w-12 h-12 bg-gray-100 rounded-xl" /><div className="flex-1 space-y-2 pt-1"><div className="h-3.5 bg-gray-100 rounded w-1/2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div></div></div>))}</div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <ParkingSquare size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No {filter !== "ALL" ? filter.toLowerCase() : ""} bookings found</p>
              <button onClick={() => navigate("/customer/find-parking")} className="btn-primary mt-4 text-xs">Find Parking</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => (
                <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">

                      {/* ── CHANGE 3: Icon uses updated helper ─────────── */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg(b.status)}`}>
                        <ParkingSquare size={18} className={iconColor(b.status)} />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{b.parkingLotName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Slot {b.slotNumber} · Code: <span className="font-mono font-semibold">{b.bookingCode}</span></p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                          <Clock size={11} />{formatDate(b.entryTime)}{b.exitTime && <> → {formatDate(b.exitTime)}</>}
                        </div>

                        {/* ── CHANGE 4: Helpful hint for PAID bookings ─── */}
                        {b.status === "PAID" && (
                          <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1 font-medium">
                            <CheckCircle size={11} /> Payment confirmed — show your code at entry
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-1.5">
                      <span className={`badge ${statusColor(b.status)}`}>{b.status}</span>
                      {b.totalAmount > 0 && <p className="text-sm font-bold text-gray-900">{formatCurrency(b.totalAmount)}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">

                    {/* Checkout button — only for ACTIVE (physically checked in) */}
                    {b.status === "ACTIVE" && (
                      <button onClick={() => navigate(`/customer/checkout/${b.id}`)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                        Checkout <ArrowRight size={12} />
                      </button>
                    )}

                    {/* Pay Now — only for PENDING (not yet paid) */}
                    {b.status === "PENDING" && (
                      <button onClick={() => navigate(`/customer/payment/PARKING_BOOKING/${b.id}`)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                        <CreditCard size={12} /> Pay Now
                      </button>
                    )}

                    {/* ── CHANGE 5: Cancel allowed for PENDING, PAID, ACTIVE ── */}
                    {(b.status === "PENDING" || b.status === "PAID" || b.status === "ACTIVE") && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                        className="text-xs py-1.5 px-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <X size={12} /> {cancelling === b.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}

                    <span className="text-xs text-gray-400 ml-auto self-center">#{b.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── RENTAL TAB ──────────────────────────────────────────────────────── */}
      {tab === "rental" && (
        <>
          {loading ? (<div className="space-y-3">{[1, 2, 3].map(i => (<div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />))}</div>
          ) : rentals.length === 0 ? (
            <div className="card text-center py-16">
              <Car size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No rental bookings yet</p>
              <button onClick={() => navigate("/customer/rentals")} className="btn-primary mt-4 text-xs">Browse Rentals</button>
            </div>
          ) : (
            <div className="space-y-3">
              {rentals.map(r => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0"><Car size={18} className="text-purple-600" /></div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.carMake} {r.carModel}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.licensePlate}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400"><Clock size={11} />{formatDate(r.startTime)} → {formatDate(r.endTime)}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1.5">
                      <span className={`badge ${STATUS_COLOR_RENTAL[r.status] || "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                      {r.totalAmount != null && <p className="text-sm font-bold text-gray-900">{formatCurrency(r.totalAmount)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── VALET TAB ──────────────────────────────────────────────────── */}
      {tab === "valet" && (
        <>
          {loading ? (<div className="space-y-3">{[1, 2, 3].map(i => (<div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />))}</div>
          ) : valets.length === 0 ? (
            <div className="card text-center py-16">
              <KeyRound size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No valet bookings yet</p>
              <button onClick={() => navigate("/customer/valet")} className="btn-primary mt-4 text-xs">Request Valet</button>
            </div>
          ) : (
            <div className="space-y-3">
              {valets.map(v => (
                <div key={v.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <KeyRound size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Car Plate: {v.carPlateNo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Assigned to: {v.valetName || "Assigning..."}</p>
                        {v.parkingLotName && (
                          <p className="text-xs text-gray-500">Parked at: {v.parkingLotName} (Slot {v.slotNumber})</p>
                        )}
                        {v.status === "REQUESTED" && <p className="text-xs text-amber-600 mt-1 font-medium">Waiting for valet to accept...</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1.5">
                      <span className={`badge ${v.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                    {["REQUESTED", "ACCEPTED", "PICKED_UP", "PARKED", "RETURN_REQUESTED"].includes(v.status) && (
                      <button 
                        onClick={() => navigate(`/customer/valet-tracking/${v.id}`)} 
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        Track Valet <ArrowRight size={12} />
                      </button>
                    )}

                    {v.status === "COMPLETED" && (
                      <>
                        {v.customerRating ? (
                          <button 
                            onClick={() => navigate(`/customer/feedback/valet/${v.id}`)}
                            className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs py-1.5 px-3 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Click to update your rating"
                          >
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            Rated {v.customerRating}/5 
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate(`/customer/feedback/valet/${v.id}`)} 
                            className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1"
                          >
                            <Star size={12} className="fill-amber-700" /> Rate Valet
                          </button>
                        )}
                        
                        <button 
                          onClick={() => navigate(`/customer/valet-tracking/${v.id}`)} 
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          <FileText size={12} /> View Receipt & Photos
                        </button>
                      </>
                    )}

                    <span className="text-xs text-gray-400 ml-auto self-center">Ref #{v.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookingsPage;