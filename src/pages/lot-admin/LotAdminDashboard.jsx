import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import {
  ParkingSquare, CalendarCheck, BarChart2, MessageSquare,
  TrendingUp, Clock, ArrowRight, ScanLine, LogIn, ChevronRight,
  Loader2
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";

const LotAdminDashboard = () => {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const [lots, setLots] = useState([]);
  const [bookings, setB]  = useState([]);
  const [loading, setL]   = useState(true);
  const [error, setError] = useState(false);

  // Quick verify from dashboard
  const [quickCode, setQuickCode]   = useState("");
  const [verifying, setVerifying]   = useState(false);
  const [defaultLotId, setDefault]  = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setError(false);
    Promise.all([
      axiosInstance.get(`/api/parking-lots/admin/${user.id}`).then((r) => r.data || []),
      axiosInstance.get(`/api/bookings/lot-admin/${user.id}`).then((r) => r.data || []),
    ])
      .then(([l, b]) => {
        setLots(l);
        setB(b);
        if (l.length) setDefault(l[0].id);
      })
      .catch(() => {
        setError(true);
        toast.error("Failed to load dashboard data. Please refresh.");
      })
      .finally(() => setL(false));
  }, [user]);

  const activeLots      = lots.filter((l) => l.status === "ACTIVE").length;
  const activeBookings  = bookings.filter((b) => b.status === "ACTIVE").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const revenue         = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  // Quick verify from the dashboard input
  const handleQuickVerify = async () => {
    if (!quickCode.trim() || !defaultLotId) return;
    setVerifying(true);
    try {
      await axiosInstance.post("/api/bookings/verify-code", null, {
        params: { code: quickCode.trim().toUpperCase(), lotId: defaultLotId },
      });
      toast.success(`${quickCode.trim().toUpperCase()} — customer checked in!`);
      setQuickCode("");
      // Refresh bookings count
      axiosInstance.get(`/api/bookings/lot-admin/${user.id}`)
        .then((r) => setB(r.data || []));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid booking code or wrong lot.");
    } finally {
      setVerifying(false);
    }
  };

  const quickActions = [
    { icon: ParkingSquare, label: "My Lots",    to: "/lot-admin/lots",     color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
    { icon: CalendarCheck, label: "Bookings",   to: "/lot-admin/bookings", color: "text-[#ffb786]", bg: "bg-[#ffb786]/10" },
    { icon: BarChart2,     label: "Analytics",  to: lots.length > 0 ? `/lot-admin/analytics/${lots[0].id}` : "/lot-admin/lots", color: "text-[#c0c1ff]", bg: "bg-[#c0c1ff]/10" },
    { icon: MessageSquare, label: "Feedback",   to: "/lot-admin/feedback", color: "text-[#ffb4ab]", bg: "bg-[#ffb4ab]/10" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c1322] flex items-center justify-center w-full">
        <div className="w-8 h-8 border-4 border-[#adc6ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] font-sans p-4 sm:p-6 lg:p-10 pb-20 selection:bg-[#adc6ff] selection:text-[#00285d] w-full max-w-full overflow-x-hidden">
      
      {error && (
        <div className="bg-[#93000a]/20 border border-[#93000a]/50 text-[#ffb4ab] text-sm rounded-xl px-4 py-3 flex items-center justify-between mb-6">
          <span>Could not load dashboard data.</span>
          <button onClick={() => window.location.reload()} className="font-bold hover:underline">Retry</button>
        </div>
      )}

      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 w-full min-w-0">
        <div>
          <h2 className="text-3xl md:text-[32px] font-bold tracking-tight text-[#dce2f7]">
            Good morning, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h2>
          <p className="text-[#c2c6d6] text-base mt-1">Manage your parking lots and track performance.</p>
        </div>
        <button onClick={() => navigate("/lot-admin/lots")} 
                className="bg-[#adc6ff] text-[#00285d] px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(173,198,255,0.2)] shrink-0 w-full md:w-auto">
          My Parking Lots
          <ArrowRight size={18} />
        </button>
      </section>

      {/* TOP ROW: Hero Card (7 Cols) & Stacked Stats (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6 w-full min-w-0">
        
        {/* Left: Quick Verify Arrival (Hero Card style) */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-[#424754]/30 shadow-2xl h-full flex flex-col justify-between min-h-[360px] w-full min-w-0">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden sm:block">
              <ScanLine size={200} className="text-[#adc6ff] transform translate-x-8 -translate-y-8" />
            </div>

            <div className="relative z-10 w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#adc6ff]/10 flex items-center justify-center shrink-0">
                    <ScanLine size={24} className="text-[#adc6ff]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-[#dce2f7] truncate">Quick Verify Arrival</h3>
                    <p className="text-[#c2c6d6] text-xs font-medium truncate">Check-in customers instantly</p>
                  </div>
                </div>
                {pendingBookings > 0 && (
                  <span className="self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-bold border border-[#fbbf24]/30 bg-[#fbbf24]/20 text-[#fbbf24] flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse"></span>
                    {pendingBookings} Pending
                  </span>
                )}
              </div>

              <div className="mt-8 sm:mt-10 w-full min-w-0">
                <p className="text-[#c2c6d6] text-xs uppercase tracking-wider font-semibold mb-3">
                  Enter Booking OTP Code
                </p>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickVerify()}
                    placeholder="e.g. AB12CD"
                    className="w-full h-20 rounded-2xl bg-[#2e3545] border border-[#424754]/50 focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff] text-center font-mono text-[28px] sm:text-[32px] font-bold tracking-[0.25em] sm:tracking-[0.5em] text-[#adc6ff] shadow-inner outline-none transition-all placeholder:text-[#424754]/40"
                    maxLength={8}
                  />
                </div>
              </div>

              {lots.length > 1 && (
                <div className="mt-6 flex flex-col min-w-0">
                  <span className="text-[#c2c6d6] text-[10px] font-medium uppercase tracking-wider mb-1">Target Lot</span>
                  <span className="text-[#dce2f7] font-bold text-sm truncate">
                    {lots.find(l => l.id === defaultLotId)?.name || "Default Lot"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 relative z-10 w-full">
              <button onClick={() => navigate("/lot-admin/bookings")}
                className="w-full sm:flex-1 bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm shrink-0">
                <CalendarCheck size={16} className="text-[#c2c6d6]" /> View Pending
              </button>
              
              <button onClick={handleQuickVerify} disabled={!quickCode.trim() || verifying}
                className="w-full sm:flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 shrink-0 shadow-[0_0_15px_rgba(173,198,255,0.15)]">
                {verifying ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={16} /> Check In Customer</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Stacked Stats */}
        <div className="lg:col-span-5 grid grid-rows-3 gap-4 sm:gap-6 w-full min-w-0">
          
          <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-5 sm:p-6 flex items-center justify-between group hover:border-[#adc6ff]/50 transition-all cursor-default w-full min-w-0 h-full">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#adc6ff]/10 flex items-center justify-center text-[#adc6ff] shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[#c2c6d6] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1 truncate">Active Lots</p>
                <p className="text-2xl sm:text-3xl font-bold leading-none truncate">{activeLots.toString().padStart(2, '0')}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#424754] group-hover:text-[#adc6ff] transition-colors shrink-0" />
          </div>

          <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-5 sm:p-6 flex items-center justify-between group hover:border-[#ffb786]/50 transition-all cursor-default w-full min-w-0 h-full">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#ffb786]/10 flex items-center justify-center text-[#ffb786] shrink-0">
                <Clock size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[#c2c6d6] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1 truncate">Active Bookings</p>
                <p className="text-2xl sm:text-3xl font-bold leading-none truncate">{activeBookings.toString().padStart(2, '0')}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#424754] group-hover:text-[#ffb786] transition-colors shrink-0" />
          </div>

          <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-5 sm:p-6 flex items-center justify-between group hover:border-[#c0c1ff]/50 transition-all cursor-default w-full min-w-0 h-full">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#c0c1ff]/10 flex items-center justify-center text-[#c0c1ff] shrink-0">
                <BarChart2 size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[#c2c6d6] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1 truncate">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold leading-none truncate">{formatCurrency(revenue)}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#424754] group-hover:text-[#c0c1ff] transition-colors shrink-0" />
          </div>

        </div>
      </div>

      {/* BOTTOM ROW: Quick Actions (4 Cols) & Recent Table (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        
        {/* Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
          {quickActions.map(({ icon: Icon, label, to, color, bg }) => (
            <button key={to} onClick={() => navigate(to)}
              className="bg-[#191f2f] border border-[#424754]/20 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#232a3a] transition-colors group aspect-square w-full">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform shrink-0`}>
                <Icon size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center truncate w-full px-2">{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Bookings Table (8 Cols) */}
        <div className="lg:col-span-8 bg-[#191f2f]/60 backdrop-blur-md rounded-3xl overflow-hidden border border-[#424754]/30 flex flex-col w-full min-w-0">
          <div className="p-5 sm:p-6 border-b border-[#424754]/20 flex items-center justify-between min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">Recent Bookings</h3>
            <button onClick={() => navigate("/lot-admin/bookings")} className="text-[#adc6ff] font-semibold text-xs sm:text-sm hover:underline shrink-0 pl-4">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto w-full">
            {bookings.length === 0 ? (
               <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                 <CalendarCheck size={40} className="text-[#424754] mb-3" />
                 <p className="text-[#c2c6d6] font-medium text-sm">No recent bookings</p>
               </div>
            ) : (
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-[#141b2b] text-[#c2c6d6] text-[10px] sm:text-[11px] uppercase tracking-widest border-b border-[#424754]/30">
                  <tr>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Location</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Date / Time</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">Price</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#424754]/10">
                  
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={`booking-${b.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm truncate max-w-[150px] sm:max-w-xs">{b.parkingLotName}</span>
                          <span className="text-[11px] sm:text-xs text-[#c2c6d6] truncate">Slot {b.slotNumber || "TBD"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#dce2f7] text-[13px] sm:text-sm font-medium whitespace-nowrap">
                        {b.customerName || `Customer #${b.customerId}`}
                      </td>
                      <td className="px-6 py-4 text-[#c2c6d6] text-[11px] sm:text-xs whitespace-nowrap">
                        <div>{formatDate(b.entryTime)}</div>
                        <div className="mt-0.5 opacity-60">To {formatDate(b.exitTime)}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-[#adc6ff] text-[13px] sm:text-sm whitespace-nowrap">
                        {formatCurrency(b.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border
                          ${b.status === 'COMPLETED' ? 'bg-[#ffb786]/10 text-[#ffb786] border-[#ffb786]/20' : 
                            b.status === 'ACTIVE' ? 'bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/20' : 
                            b.status === 'PENDING' ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20' :
                            'bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20'}`}>
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

export default LotAdminDashboard;