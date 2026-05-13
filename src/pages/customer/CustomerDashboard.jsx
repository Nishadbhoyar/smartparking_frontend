import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatDate, formatCurrency } from "../../utils/formatters";
import {
  MapPin, CalendarCheck, Car, ArrowRight, Clock, TrendingUp,
  ParkingSquare, Zap, KeyRound, Copy, Loader2, Camera, ChevronRight,
  Smartphone, UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import ValetCarImages from "../valet/ValetCarImages";

// ── Status Metadata ─────────────────────────────────────────────────────────

const VALET_STATUS_META = {
  REQUESTED:        { label: "Finding Valet",    color: "bg-[#ffb786]/20 text-[#ffb786] border-[#ffb786]/30", pulse: "bg-[#ffb786]" },
  ACCEPTED:         { label: "Valet Assigned",   color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
  PICKED_UP:        { label: "Keys Collected",   color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
  PARKED:           { label: "Car Parked",       color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
  RETURN_REQUESTED: { label: "Car Returning",    color: "bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30", pulse: "bg-[#c0c1ff]" },
  RETURN_REQ:       { label: "Car Returning",    color: "bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30", pulse: "bg-[#c0c1ff]" },
};

const normalise = (s) => (s === "RETURN_REQ" ? "RETURN_REQUESTED" : s);

// ── Active Valet Card (Hero) ──────────────────────────────────────────────────

const ActiveValetCard = ({ job, onReturnRequested }) => {
  const navigate           = useNavigate();
  const [requesting, setR] = useState(false);
  const status             = normalise(job.status);
  const meta               = VALET_STATUS_META[status] ?? { label: status, color: "bg-[#424754]/20 text-[#c2c6d6] border-[#424754]/30", pulse: "bg-[#c2c6d6]" };

  const displayOtp = (status === "REQUESTED" || status === "ACCEPTED") ? job.pickupOtp : (status === "RETURN_REQUESTED" ? job.dropoffOtp : null);

  const copyOtp = (otp) => {
    navigator.clipboard?.writeText(otp).catch(() => {});
    toast.success("OTP copied!");
  };

  const handleReturn = async () => {
    setR(true);
    try {
      await axiosInstance.post(`/api/valet/${job.id}/request-return`);
      toast.success("Return requested! Valet is on the way.");
      onReturnRequested();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request return.");
    } finally {
      setR(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 lg:p-10 relative overflow-hidden border border-[#424754]/30 shadow-2xl h-full flex flex-col justify-between min-h-[360px]">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Car size={180} className="text-[#adc6ff] transform translate-x-12 -translate-y-8" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#adc6ff]/10 flex items-center justify-center">
              <Car size={24} className="text-[#adc6ff]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#dce2f7]">Valet Service</h3>
              <p className="text-[#c2c6d6] text-xs font-medium">Booking ID: #{job.id} · {job.carPlateNo}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${meta.color}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${meta.pulse}`}></span>
            {meta.label}
          </span>
        </div>

        {displayOtp && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#c2c6d6] text-xs uppercase tracking-wider font-semibold">
                {status === "RETURN_REQUESTED" ? "Dropoff OTP Code" : "Retrieval OTP Code"}
              </p>
              <button onClick={() => copyOtp(displayOtp)} className="text-[#adc6ff] hover:text-[#dce2f7] flex items-center gap-1 text-xs font-bold transition-colors">
                <Copy size={14} /> Copy
              </button>
            </div>
            <div className="flex gap-4">
              {displayOtp.split('').map((digit, i) => (
                <div key={i} className="w-16 h-20 rounded-2xl bg-[#2e3545] border border-[#424754]/50 flex items-center justify-center font-mono text-[32px] font-medium text-[#adc6ff] shadow-inner">
                  {digit}
                </div>
              ))}
            </div>
          </div>
        )}

        {(status === "PARKED" || status === "RETURN_REQUESTED") && job.parkingLotName && (
          <div className="mt-10 flex items-center gap-8 border-t border-[#424754]/30 pt-8">
            <div className="flex flex-col">
              <span className="text-[#c2c6d6] text-xs font-medium mb-1">Location</span>
              <span className="text-[#dce2f7] font-bold text-sm">
                {job.parkingLotName} {job.slotNumber && <span className="font-normal text-[#c2c6d6]"> (Slot {job.slotNumber})</span>}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8 relative z-10">
        <button onClick={() => navigate(`/customer/valet/track/${job.id}`)}
          className="flex-1 bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm">
          <MapPin size={16} className="text-[#adc6ff]" /> Track Live
        </button>
        
        {status === "PARKED" && (
          <button onClick={handleReturn} disabled={requesting}
            className="flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
            {requesting ? <Loader2 size={16} className="animate-spin" /> : <><KeyRound size={16} /> Request Car Back</>}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Empty Hero Card (Maintains layout when no valet is active) ───────────────

const EmptyHeroCard = ({ navigate }) => (
  <div className="bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 lg:p-10 relative overflow-hidden border border-[#424754]/30 shadow-2xl h-full flex flex-col justify-center min-h-[360px]">
    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
      <ParkingSquare size={240} className="text-[#adc6ff] transform translate-x-12 -translate-y-12" />
    </div>
    
    <div className="relative z-10 max-w-md">
      <div className="w-14 h-14 rounded-2xl bg-[#adc6ff]/10 border border-[#adc6ff]/20 text-[#adc6ff] flex items-center justify-center mb-6">
        <MapPin size={28} />
      </div>
      <h3 className="font-bold text-[#dce2f7] text-3xl mb-3 tracking-tight">Ready to park?</h3>
      <p className="text-[#c2c6d6] font-medium mb-8 leading-relaxed text-sm">
        You currently have no active sessions. Find a premium spot nearby or request our valet service to handle it for you.
      </p>
      
      <div className="flex gap-4">
        <button onClick={() => navigate("/customer/find-parking")} 
          className="bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm">
          Find Parking <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate("/customer/valet/request")} 
          className="bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm">
          Request Valet
        </button>
      </div>
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────

const CustomerDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [rentals,  setRentals]  = useState([]);
  const [valets,   setValets]   = useState([]); 
  const [valetJob, setValetJob] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const loadData = () => {
    if (!user?.id) return;
    Promise.all([
      axiosInstance.get(`/api/bookings/customer/${user.id}`).then((r) => r.data || []).catch(() => []),
      axiosInstance.get(`/api/rental-cars/customer/${user.id}/bookings`).then((r) => r.data || []).catch(() => []),
      axiosInstance.get(`/api/valet/customer/${user.id}/active`).then((r) => r.status === 204 ? null : r.data).catch(() => null),
      axiosInstance.get(`/api/valet/customer/${user.id}`).then((r) => Array.isArray(r.data) ? r.data : (r.data ? [r.data] : [])).catch(() => []),
    ]).then(([b, r, vActive, vAll]) => {
      setBookings(b);
      setRentals(r);
      setValetJob(vActive);
      setValets(vAll);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  const handleReturnRequested = () => {
    axiosInstance.get(`/api/valet/customer/${user.id}/active`)
      .then((r) => setValetJob(r.status === 204 ? null : r.data))
      .catch(() => {});
  };

  const activeParking = bookings.filter((b) => b.status === "ACTIVE" || b.status === "PENDING");
  const activeRentals = rentals.filter((r) => r.status === "ACTIVE" || r.status === "CONFIRMED");
  const activeValets  = valets.filter((v) => ["REQUESTED", "ACCEPTED", "PICKED_UP", "PARKED", "RETURN_REQUESTED"].includes(v.status));

  const totalActiveBookings = activeParking.length + activeRentals.length + activeValets.length;
  // Stats adapted to match your visual layout placeholders while using real logic
  const completedBookingsCount = bookings.filter(b => b.status === "COMPLETED").length;
  const valetHistoryCount = valets.length;

  const quickActions = [
    { icon: MapPin,        label: "Find Parking",  to: "/customer/find-parking",  color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
    { icon: CalendarCheck, label: "My Bookings",   to: "/customer/bookings",      color: "text-[#ffb786]", bg: "bg-[#ffb786]/10" },
    { icon: Car,           label: "Request Valet", to: "/customer/valet/request", color: "text-[#c0c1ff]", bg: "bg-[#c0c1ff]/10" },
    { icon: Zap,           label: "Rent a Car",    to: "/customer/rentals",       color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
  ];

  return (
    <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] font-sans p-6 lg:p-8 pb-20 selection:bg-[#adc6ff] selection:text-[#002e6a]">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-[32px] font-bold tracking-tight text-[#dce2f7]">
            Good morning, {user?.name?.split(" ")[0] || "Guest"} 👋
          </h2>
          <p className="text-[#c2c6d6] text-base mt-1">Find your perfect spot</p>
        </div>
        <button onClick={() => navigate("/customer/find-parking")} 
                className="bg-[#adc6ff] text-[#00285d] px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(173,198,255,0.2)]">
          Find Parking
          <ArrowRight size={18} />
        </button>
      </section>

      {/* TOP ROW: Hero Card (7 Cols) & Stacked Stats (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* Left: Valet Hero OR Empty Hero */}
        <div className="lg:col-span-7">
          {!loading && valetJob ? (
            <ActiveValetCard job={valetJob} onReturnRequested={handleReturnRequested} />
          ) : (
            <EmptyHeroCard navigate={navigate} />
          )}
        </div>

        {/* Right: Stacked Stats */}
        <div className="lg:col-span-5 grid grid-rows-3 gap-6">
          
          {/* Stat 1: Active Bookings */}
          <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#adc6ff]/50 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#adc6ff]/10 flex items-center justify-center text-[#adc6ff]">
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-[#c2c6d6] text-xs font-medium">Active Bookings</p>
                <p className="text-3xl font-bold leading-none mt-1">{loading ? "—" : totalActiveBookings.toString().padStart(2, '0')}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#c2c6d6] group-hover:text-[#adc6ff] transition-colors" />
          </div>

          {/* Stat 2: Completed / Parking Lots Nearby */}
          <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#ffb786]/50 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffb786]/10 flex items-center justify-center text-[#ffb786]">
                <ParkingSquare size={24} />
              </div>
              <div>
                <p className="text-[#c2c6d6] text-xs font-medium">Total Completed</p>
                <p className="text-3xl font-bold leading-none mt-1">{loading ? "—" : completedBookingsCount.toString().padStart(2, '0')}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#c2c6d6] group-hover:text-[#ffb786] transition-colors" />
          </div>

          {/* Stat 3: Valet Requests */}
          <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#c0c1ff]/50 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#c0c1ff]/10 flex items-center justify-center text-[#c0c1ff]">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-[#c2c6d6] text-xs font-medium">Valet Requests</p>
                <p className="text-3xl font-bold leading-none mt-1">{loading ? "—" : valetHistoryCount.toString().padStart(2, '0')}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#c2c6d6] group-hover:text-[#c0c1ff] transition-colors" />
          </div>

        </div>
      </div>

      {/* BOTTOM ROW: Quick Actions (4 Cols) & Recent Table (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {quickActions.map(({ icon: Icon, label, to, color, bg }) => (
            <button key={to} onClick={() => navigate(to)}
              className="bg-[#191f2f] border border-[#424754]/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#232a3a] transition-colors group aspect-square">
              <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
              </div>
              <span className="font-semibold text-sm text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Bookings Table (8 Cols) */}
        <div className="lg:col-span-8 bg-[#191f2f]/60 backdrop-blur-md rounded-3xl overflow-hidden border border-[#424754]/30 flex flex-col">
          <div className="p-6 border-b border-[#424754]/20 flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Bookings</h3>
            <button onClick={() => navigate("/customer/bookings")} className="text-[#adc6ff] font-semibold text-sm hover:underline">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3 py-1"><div className="h-4 bg-[#424754]/50 rounded w-3/4"></div></div>
                  </div>
                ))}
              </div>
            ) : [...activeParking, ...activeRentals, ...bookings.slice(0, 5)].length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center justify-center">
                 <ParkingSquare size={40} className="text-[#424754] mb-3" />
                 <p className="text-[#c2c6d6] font-medium text-sm">No recent bookings</p>
               </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#141b2b] text-[#c2c6d6] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#424754]/10">
                  
                  {/* Rentals List */}
                  {activeRentals.map((r) => (
                    <tr key={`rental-${r.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{r.carMake} {r.carModel}</span>
                          <span className="text-xs text-[#c2c6d6]">Rental Vehicle</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#c2c6d6] text-xs">
                        Until {formatDate(r.endTime)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#adc6ff] text-sm">
                        {formatCurrency(r.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${r.status === "ACTIVE" ? "bg-[#ffb786]/10 text-[#ffb786] border-[#ffb786]/20" : "bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/20"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Parking List */}
                  {(activeParking.length > 0 ? activeParking : bookings.slice(0,5)).map((b) => (
                    <tr key={`parking-${b.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{b.parkingLotName}</span>
                          <span className="text-xs text-[#c2c6d6]">Spot {b.slotNumber || "TBD"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#c2c6d6] text-xs">
                        {formatDate(b.entryTime)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#adc6ff] text-sm">
                        {formatCurrency(b.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-3">
                        {b.status === "ACTIVE" && (
                          <button onClick={() => navigate(`/customer/checkout/${b.id}`)} className="text-[10px] bg-[#adc6ff] text-[#00285d] px-3 py-1 rounded font-bold transition-colors">
                            Checkout
                          </button>
                        )}
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap
                          ${b.status === 'COMPLETED' ? 'bg-[#ffb786]/10 text-[#ffb786] border-[#ffb786]/20' : 
                            b.status === 'ACTIVE' ? 'bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/20' : 'bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CustomerDashboard;