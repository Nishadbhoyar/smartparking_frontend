// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from "../../api/axiosInstance";
// import { formatDate, formatCurrency } from "../../utils/formatters";
// import {
//   MapPin, CalendarCheck, Car, ArrowRight, Clock, TrendingUp,
//   ParkingSquare, Zap, KeyRound, Copy, Loader2, Camera, ChevronRight,
//   Smartphone, UserCheck
// } from "lucide-react";
// import toast from "react-hot-toast";
// import ValetCarImages from "../valet/ValetCarImages";

// // ── Status Metadata ─────────────────────────────────────────────────────────

// const VALET_STATUS_META = {
//   REQUESTED:        { label: "Finding Valet",    color: "bg-[#ffb786]/20 text-[#ffb786] border-[#ffb786]/30", pulse: "bg-[#ffb786]" },
//   ACCEPTED:         { label: "Valet Assigned",   color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
//   PICKED_UP:        { label: "Keys Collected",   color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
//   PARKED:           { label: "Car Parked",       color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
//   RETURN_REQUESTED: { label: "Car Returning",    color: "bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30", pulse: "bg-[#c0c1ff]" },
//   RETURN_REQ:       { label: "Car Returning",    color: "bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30", pulse: "bg-[#c0c1ff]" },
// };

// const normalise = (s) => (s === "RETURN_REQ" ? "RETURN_REQUESTED" : s);

// // ── Active Valet Card (Hero) ──────────────────────────────────────────────────

// const ActiveValetCard = ({ job, onReturnRequested }) => {
//   const navigate           = useNavigate();
//   const [requesting, setR] = useState(false);
//   const status             = normalise(job.status);
//   const meta               = VALET_STATUS_META[status] ?? { label: status, color: "bg-[#424754]/20 text-[#c2c6d6] border-[#424754]/30", pulse: "bg-[#c2c6d6]" };

//   const displayOtp = (status === "REQUESTED" || status === "ACCEPTED") ? job.pickupOtp : (status === "RETURN_REQUESTED" ? job.dropoffOtp : null);

//   const copyOtp = (otp) => {
//     navigator.clipboard?.writeText(otp).catch(() => {});
//     toast.success("OTP copied!");
//   };

//   const handleReturn = async () => {
//     setR(true);
//     try {
//       await axiosInstance.post(`/api/valet/${job.id}/request-return`);
//       toast.success("Return requested! Valet is on the way.");
//       onReturnRequested();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to request return.");
//     } finally {
//       setR(false);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 lg:p-10 relative overflow-hidden border border-[#424754]/30 shadow-2xl h-full flex flex-col justify-between min-h-[360px]">
//       <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
//         <Car size={180} className="text-[#adc6ff] transform translate-x-12 -translate-y-8" />
//       </div>

//       <div className="relative z-10">
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-[#adc6ff]/10 flex items-center justify-center">
//               <Car size={24} className="text-[#adc6ff]" />
//             </div>
//             <div>
//               <h3 className="font-bold text-lg text-[#dce2f7]">Valet Service</h3>
//               <p className="text-[#c2c6d6] text-xs font-medium">Booking ID: #{job.id} · {job.carPlateNo}</p>
//             </div>
//           </div>
//           <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${meta.color}`}>
//             <span className={`w-2 h-2 rounded-full animate-pulse ${meta.pulse}`}></span>
//             {meta.label}
//           </span>
//         </div>

//         {displayOtp && (
//           <div className="mt-10">
//             <div className="flex items-center justify-between mb-3">
//               <p className="text-[#c2c6d6] text-xs uppercase tracking-wider font-semibold">
//                 {status === "RETURN_REQUESTED" ? "Dropoff OTP Code" : "Retrieval OTP Code"}
//               </p>
//               <button onClick={() => copyOtp(displayOtp)} className="text-[#adc6ff] hover:text-[#dce2f7] flex items-center gap-1 text-xs font-bold transition-colors">
//                 <Copy size={14} /> Copy
//               </button>
//             </div>
//             <div className="flex gap-4">
//               {displayOtp.split('').map((digit, i) => (
//                 <div key={i} className="w-16 h-20 rounded-2xl bg-[#2e3545] border border-[#424754]/50 flex items-center justify-center font-mono text-[32px] font-medium text-[#adc6ff] shadow-inner">
//                   {digit}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {(status === "PARKED" || status === "RETURN_REQUESTED") && job.parkingLotName && (
//           <div className="mt-10 flex items-center gap-8 border-t border-[#424754]/30 pt-8">
//             <div className="flex flex-col">
//               <span className="text-[#c2c6d6] text-xs font-medium mb-1">Location</span>
//               <span className="text-[#dce2f7] font-bold text-sm">
//                 {job.parkingLotName} {job.slotNumber && <span className="font-normal text-[#c2c6d6]"> (Slot {job.slotNumber})</span>}
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex gap-4 mt-8 relative z-10">
//         <button onClick={() => navigate(`/customer/valet/track/${job.id}`)}
//           className="flex-1 bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm">
//           <MapPin size={16} className="text-[#adc6ff]" /> Track Live
//         </button>
        
//         {status === "PARKED" && (
//           <button onClick={handleReturn} disabled={requesting}
//             className="flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
//             {requesting ? <Loader2 size={16} className="animate-spin" /> : <><KeyRound size={16} /> Request Car Back</>}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Empty Hero Card (Maintains layout when no valet is active) ───────────────

// const EmptyHeroCard = ({ navigate }) => (
//   <div className="bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 lg:p-10 relative overflow-hidden border border-[#424754]/30 shadow-2xl h-full flex flex-col justify-center min-h-[360px]">
//     <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
//       <ParkingSquare size={240} className="text-[#adc6ff] transform translate-x-12 -translate-y-12" />
//     </div>
    
//     <div className="relative z-10 max-w-md">
//       <div className="w-14 h-14 rounded-2xl bg-[#adc6ff]/10 border border-[#adc6ff]/20 text-[#adc6ff] flex items-center justify-center mb-6">
//         <MapPin size={28} />
//       </div>
//       <h3 className="font-bold text-[#dce2f7] text-3xl mb-3 tracking-tight">Ready to park?</h3>
//       <p className="text-[#c2c6d6] font-medium mb-8 leading-relaxed text-sm">
//         You currently have no active sessions. Find a premium spot nearby or request our valet service to handle it for you.
//       </p>
      
//       <div className="flex gap-4">
//         <button onClick={() => navigate("/customer/find-parking")} 
//           className="bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm">
//           Find Parking <ArrowRight size={16} />
//         </button>
//         <button onClick={() => navigate("/customer/valet/request")} 
//           className="bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm">
//           Request Valet
//         </button>
//       </div>
//     </div>
//   </div>
// );

// // ── Main Dashboard ────────────────────────────────────────────────────────────

// const CustomerDashboard = () => {
//   const { user }   = useAuth();
//   const navigate   = useNavigate();

//   const [bookings, setBookings] = useState([]);
//   const [rentals,  setRentals]  = useState([]);
//   const [valets,   setValets]   = useState([]); 
//   const [valetJob, setValetJob] = useState(null);
//   const [loading,  setLoading]  = useState(true);

//   const loadData = () => {
//     if (!user?.id) return;
//     Promise.all([
//       axiosInstance.get(`/api/bookings/customer/${user.id}`).then((r) => r.data || []).catch(() => []),
//       axiosInstance.get(`/api/rental-cars/customer/${user.id}/bookings`).then((r) => r.data || []).catch(() => []),
//       axiosInstance.get(`/api/valet/customer/${user.id}/active`).then((r) => r.status === 204 ? null : r.data).catch(() => null),
//       axiosInstance.get(`/api/valet/customer/${user.id}`).then((r) => Array.isArray(r.data) ? r.data : (r.data ? [r.data] : [])).catch(() => []),
//     ]).then(([b, r, vActive, vAll]) => {
//       setBookings(b);
//       setRentals(r);
//       setValetJob(vActive);
//       setValets(vAll);
//     }).finally(() => setLoading(false));
//   };

//   useEffect(() => { loadData(); }, [user]);

//   const handleReturnRequested = () => {
//     axiosInstance.get(`/api/valet/customer/${user.id}/active`)
//       .then((r) => setValetJob(r.status === 204 ? null : r.data))
//       .catch(() => {});
//   };

//   const activeParking = bookings.filter((b) => b.status === "ACTIVE" || b.status === "PENDING");
//   const activeRentals = rentals.filter((r) => r.status === "ACTIVE" || r.status === "CONFIRMED");
//   const activeValets  = valets.filter((v) => ["REQUESTED", "ACCEPTED", "PICKED_UP", "PARKED", "RETURN_REQUESTED"].includes(v.status));

//   const totalActiveBookings = activeParking.length + activeRentals.length + activeValets.length;
//   // Stats adapted to match your visual layout placeholders while using real logic
//   const completedBookingsCount = bookings.filter(b => b.status === "COMPLETED").length;
//   const valetHistoryCount = valets.length;

//   const quickActions = [
//     { icon: MapPin,        label: "Find Parking",  to: "/customer/find-parking",  color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
//     { icon: CalendarCheck, label: "My Bookings",   to: "/customer/bookings",      color: "text-[#ffb786]", bg: "bg-[#ffb786]/10" },
//     { icon: Car,           label: "Request Valet", to: "/customer/valet/request", color: "text-[#c0c1ff]", bg: "bg-[#c0c1ff]/10" },
//     { icon: Zap,           label: "Rent a Car",    to: "/customer/rentals",       color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
//   ];

//   return (
//     <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] font-sans p-6 lg:p-8 pb-20 selection:bg-[#adc6ff] selection:text-[#002e6a]">
      
//       {/* Header Section */}
//       <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
//         <div>
//           <h2 className="text-[32px] font-bold tracking-tight text-[#dce2f7]">
//             Good morning, {user?.name?.split(" ")[0] || "Guest"} 👋
//           </h2>
//           <p className="text-[#c2c6d6] text-base mt-1">Find your perfect spot</p>
//         </div>
//         <button onClick={() => navigate("/customer/find-parking")} 
//                 className="bg-[#adc6ff] text-[#00285d] px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(173,198,255,0.2)]">
//           Find Parking
//           <ArrowRight size={18} />
//         </button>
//       </section>

//       {/* TOP ROW: Hero Card (7 Cols) & Stacked Stats (5 Cols) */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        
//         {/* Left: Valet Hero OR Empty Hero */}
//         <div className="lg:col-span-7">
//           {!loading && valetJob ? (
//             <ActiveValetCard job={valetJob} onReturnRequested={handleReturnRequested} />
//           ) : (
//             <EmptyHeroCard navigate={navigate} />
//           )}
//         </div>

//         {/* Right: Stacked Stats */}
//         <div className="lg:col-span-5 grid grid-rows-3 gap-6">
          
//           {/* Stat 1: Active Bookings */}
//           <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#adc6ff]/50 transition-all cursor-default">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-[#adc6ff]/10 flex items-center justify-center text-[#adc6ff]">
//                 <Smartphone size={24} />
//               </div>
//               <div>
//                 <p className="text-[#c2c6d6] text-xs font-medium">Active Bookings</p>
//                 <p className="text-3xl font-bold leading-none mt-1">{loading ? "—" : totalActiveBookings.toString().padStart(2, '0')}</p>
//               </div>
//             </div>
//             <ChevronRight size={24} className="text-[#c2c6d6] group-hover:text-[#adc6ff] transition-colors" />
//           </div>

//           {/* Stat 2: Completed / Parking Lots Nearby */}
//           <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#ffb786]/50 transition-all cursor-default">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-[#ffb786]/10 flex items-center justify-center text-[#ffb786]">
//                 <ParkingSquare size={24} />
//               </div>
//               <div>
//                 <p className="text-[#c2c6d6] text-xs font-medium">Total Completed</p>
//                 <p className="text-3xl font-bold leading-none mt-1">{loading ? "—" : completedBookingsCount.toString().padStart(2, '0')}</p>
//               </div>
//             </div>
//             <ChevronRight size={24} className="text-[#c2c6d6] group-hover:text-[#ffb786] transition-colors" />
//           </div>

//           {/* Stat 3: Valet Requests */}
//           <div className="bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#c0c1ff]/50 transition-all cursor-default">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-xl bg-[#c0c1ff]/10 flex items-center justify-center text-[#c0c1ff]">
//                 <UserCheck size={24} />
//               </div>
//               <div>
//                 <p className="text-[#c2c6d6] text-xs font-medium">Valet Requests</p>
//                 <p className="text-3xl font-bold leading-none mt-1">{loading ? "—" : valetHistoryCount.toString().padStart(2, '0')}</p>
//               </div>
//             </div>
//             <ChevronRight size={24} className="text-[#c2c6d6] group-hover:text-[#c0c1ff] transition-colors" />
//           </div>

//         </div>
//       </div>

//       {/* BOTTOM ROW: Quick Actions (4 Cols) & Recent Table (8 Cols) */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
//         {/* Quick Actions (4 Cols) */}
//         <div className="lg:col-span-4 grid grid-cols-2 gap-4">
//           {quickActions.map(({ icon: Icon, label, to, color, bg }) => (
//             <button key={to} onClick={() => navigate(to)}
//               className="bg-[#191f2f] border border-[#424754]/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#232a3a] transition-colors group aspect-square">
//               <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
//                 <Icon size={28} />
//               </div>
//               <span className="font-semibold text-sm text-center">{label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Recent Bookings Table (8 Cols) */}
//         <div className="lg:col-span-8 bg-[#191f2f]/60 backdrop-blur-md rounded-3xl overflow-hidden border border-[#424754]/30 flex flex-col">
//           <div className="p-6 border-b border-[#424754]/20 flex items-center justify-between">
//             <h3 className="font-bold text-lg">Recent Bookings</h3>
//             <button onClick={() => navigate("/customer/bookings")} className="text-[#adc6ff] font-semibold text-sm hover:underline">
//               View All
//             </button>
//           </div>
          
//           <div className="overflow-x-auto">
//             {loading ? (
//               <div className="p-6 space-y-4">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="animate-pulse flex space-x-4">
//                     <div className="flex-1 space-y-3 py-1"><div className="h-4 bg-[#424754]/50 rounded w-3/4"></div></div>
//                   </div>
//                 ))}
//               </div>
//             ) : [...activeParking, ...activeRentals, ...bookings.slice(0, 5)].length === 0 ? (
//                <div className="p-12 text-center flex flex-col items-center justify-center">
//                  <ParkingSquare size={40} className="text-[#424754] mb-3" />
//                  <p className="text-[#c2c6d6] font-medium text-sm">No recent bookings</p>
//                </div>
//             ) : (
//               <table className="w-full text-left">
//                 <thead className="bg-[#141b2b] text-[#c2c6d6] text-xs uppercase tracking-wider">
//                   <tr>
//                     <th className="px-6 py-4 font-semibold">Location</th>
//                     <th className="px-6 py-4 font-semibold">Date</th>
//                     <th className="px-6 py-4 font-semibold">Price</th>
//                     <th className="px-6 py-4 font-semibold text-center">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-[#424754]/10">
                  
//                   {/* Rentals List */}
//                   {activeRentals.map((r) => (
//                     <tr key={`rental-${r.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col">
//                           <span className="font-semibold text-sm">{r.carMake} {r.carModel}</span>
//                           <span className="text-xs text-[#c2c6d6]">Rental Vehicle</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-[#c2c6d6] text-xs">
//                         Until {formatDate(r.endTime)}
//                       </td>
//                       <td className="px-6 py-4 font-semibold text-[#adc6ff] text-sm">
//                         {formatCurrency(r.totalAmount || 0)}
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${r.status === "ACTIVE" ? "bg-[#ffb786]/10 text-[#ffb786] border-[#ffb786]/20" : "bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/20"}`}>
//                           {r.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}

//                   {/* Parking List */}
//                   {(activeParking.length > 0 ? activeParking : bookings.slice(0,5)).map((b) => (
//                     <tr key={`parking-${b.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col">
//                           <span className="font-semibold text-sm">{b.parkingLotName}</span>
//                           <span className="text-xs text-[#c2c6d6]">Spot {b.slotNumber || "TBD"}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-[#c2c6d6] text-xs">
//                         {formatDate(b.entryTime)}
//                       </td>
//                       <td className="px-6 py-4 font-semibold text-[#adc6ff] text-sm">
//                         {formatCurrency(b.totalAmount || 0)}
//                       </td>
//                       <td className="px-6 py-4 flex items-center justify-center gap-3">
//                         {b.status === "ACTIVE" && (
//                           <button onClick={() => navigate(`/customer/checkout/${b.id}`)} className="text-[10px] bg-[#adc6ff] text-[#00285d] px-3 py-1 rounded font-bold transition-colors">
//                             Checkout
//                           </button>
//                         )}
//                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap
//                           ${b.status === 'COMPLETED' ? 'bg-[#ffb786]/10 text-[#ffb786] border-[#ffb786]/20' : 
//                             b.status === 'ACTIVE' ? 'bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/20' : 'bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20'}`}>
//                           {b.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}

//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
      
//     </div>
//   );
// };

// export default CustomerDashboard;




// // CustomerDashboard.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from "../../api/axiosInstance";
// import { formatDate, formatCurrency } from "../../utils/formatters";
// import {
//   MapPin, CalendarCheck, Car, ArrowRight, Clock, TrendingUp,
//   ParkingSquare, Zap, KeyRound, Copy, Loader2, Camera, ChevronRight,
//   Smartphone, UserCheck
// } from "lucide-react";
// import toast from "react-hot-toast";
// import ValetCarImages from "../valet/ValetCarImages";

// const VALET_STATUS_META = {
//   REQUESTED:        { label: "Finding Valet",    color: "bg-[#ffb786]/20 text-[#ffb786] border-[#ffb786]/30", pulse: "bg-[#ffb786]" },
//   ACCEPTED:         { label: "Valet Assigned",   color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
//   PICKED_UP:        { label: "Keys Collected",   color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
//   PARKED:           { label: "Car Parked",       color: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30", pulse: "bg-[#adc6ff]" },
//   RETURN_REQUESTED: { label: "Car Returning",    color: "bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30", pulse: "bg-[#c0c1ff]" },
//   RETURN_REQ:       { label: "Car Returning",    color: "bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30", pulse: "bg-[#c0c1ff]" },
// };

// const normalise = (s) => (s === "RETURN_REQ" ? "RETURN_REQUESTED" : s);

// const ActiveValetCard = ({ job, onReturnRequested }) => {
//   const navigate           = useNavigate();
//   const [requesting, setR] = useState(false);
//   const status             = normalise(job.status);
//   const meta               = VALET_STATUS_META[status] ?? { label: status, color: "bg-[#424754]/20 text-[#c2c6d6] border-[#424754]/30", pulse: "bg-[#c2c6d6]" };

//   const displayOtp = (status === "REQUESTED" || status === "ACCEPTED") ? job.pickupOtp : (status === "RETURN_REQUESTED" ? job.dropoffOtp : null);

//   const copyOtp = (otp) => {
//     navigator.clipboard?.writeText(otp).catch(() => {});
//     toast.success("OTP copied!");
//   };

//   const handleReturn = async () => {
//     setR(true);
//     try {
//       await axiosInstance.post(`/api/valet/${job.id}/request-return`);
//       toast.success("Return requested! Valet is on the way.");
//       onReturnRequested();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to request return.");
//     } finally {
//       setR(false);
//     }
//   };

//   return (
//     <div className="relative bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 lg:p-10 overflow-hidden border border-[#424754]/30 shadow-2xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(173,198,255,0.1)]">
//       <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
//         <Car size={180} className="text-[#adc6ff] transform translate-x-12 -translate-y-8" />
//       </div>
//       <div className="relative z-10">
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-[#adc6ff]/10 flex items-center justify-center">
//               <Car size={24} className="text-[#adc6ff]" />
//             </div>
//             <div>
//               <h3 className="font-bold text-lg text-[#dce2f7]">Valet Service</h3>
//               <p className="text-[#c2c6d6] text-xs font-medium">Booking ID: #{job.id} · {job.carPlateNo}</p>
//             </div>
//           </div>
//           <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${meta.color}`}>
//             <span className={`w-2 h-2 rounded-full animate-pulse ${meta.pulse}`}></span>
//             {meta.label}
//           </span>
//         </div>

//         {displayOtp && (
//           <div className="mt-10">
//             <div className="flex items-center justify-between mb-3">
//               <p className="text-[#c2c6d6] text-xs uppercase tracking-wider font-semibold">
//                 {status === "RETURN_REQUESTED" ? "Dropoff OTP Code" : "Retrieval OTP Code"}
//               </p>
//               <button onClick={() => copyOtp(displayOtp)} className="text-[#adc6ff] hover:text-[#dce2f7] flex items-center gap-1 text-xs font-bold transition-colors">
//                 <Copy size={14} /> Copy
//               </button>
//             </div>
//             <div className="flex gap-4">
//               {displayOtp.split('').map((digit, i) => (
//                 <div key={i} className="w-16 h-20 rounded-2xl bg-[#2e3545] border border-[#424754]/50 flex items-center justify-center font-mono text-[32px] font-medium text-[#adc6ff] shadow-inner">
//                   {digit}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {(status === "PARKED" || status === "RETURN_REQUESTED") && job.parkingLotName && (
//           <div className="mt-10 flex items-center gap-8 border-t border-[#424754]/30 pt-8">
//             <div className="flex flex-col">
//               <span className="text-[#c2c6d6] text-xs font-medium mb-1">Location</span>
//               <span className="text-[#dce2f7] font-bold text-sm">
//                 {job.parkingLotName} {job.slotNumber && <span className="font-normal text-[#c2c6d6]"> (Slot {job.slotNumber})</span>}
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex gap-4 mt-8 relative z-10">
//         <button onClick={() => navigate(`/customer/valet/track/${job.id}`)}
//           className="flex-1 bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
//           <MapPin size={16} className="text-[#adc6ff]" /> Track Live
//         </button>
        
//         {status === "PARKED" && (
//           <button onClick={handleReturn} disabled={requesting}
//             className="flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
//             {requesting ? <Loader2 size={16} className="animate-spin" /> : <><KeyRound size={16} /> Request Car Back</>}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const EmptyHeroCard = ({ navigate }) => (
//   <div className="relative bg-gradient-to-br from-[#0A0E1A] to-[#1E2435] rounded-3xl p-6 lg:p-10 overflow-hidden border border-[#424754]/30 shadow-2xl transition-all duration-300">
//     <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
//       <ParkingSquare size={240} className="text-[#adc6ff] transform translate-x-12 -translate-y-12" />
//     </div>
//     <div className="relative z-10 max-w-md">
//       <div className="w-14 h-14 rounded-2xl bg-[#adc6ff]/10 border border-[#adc6ff]/20 text-[#adc6ff] flex items-center justify-center mb-6">
//         <MapPin size={28} />
//       </div>
//       <h3 className="font-bold text-[#dce2f7] text-3xl mb-3 tracking-tight">Ready to park?</h3>
//       <p className="text-[#c2c6d6] font-medium mb-8 leading-relaxed text-sm">
//         You currently have no active sessions. Find a premium spot nearby or request our valet service.
//       </p>
//       <div className="flex gap-4">
//         <button onClick={() => navigate("/customer/find-parking")} 
//           className="bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all">
//           Find Parking <ArrowRight size={16} />
//         </button>
//         <button onClick={() => navigate("/customer/valet/request")} 
//           className="bg-[#191f2f] hover:bg-[#232a3a] border border-[#424754]/50 text-[#dce2f7] px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all">
//           Request Valet
//         </button>
//       </div>
//     </div>
//   </div>
// );

// const CustomerDashboard = () => {
//   const { user }   = useAuth();
//   const navigate   = useNavigate();

//   const [bookings, setBookings] = useState([]);
//   const [rentals,  setRentals]  = useState([]);
//   const [valets,   setValets]   = useState([]); 
//   const [valetJob, setValetJob] = useState(null);
//   const [loading,  setLoading]  = useState(true);

//   const loadData = () => {
//     if (!user?.id) return;
//     Promise.all([
//       axiosInstance.get(`/api/bookings/customer/${user.id}`).then((r) => r.data || []).catch(() => []),
//       axiosInstance.get(`/api/rental-cars/customer/${user.id}/bookings`).then((r) => r.data || []).catch(() => []),
//       axiosInstance.get(`/api/valet/customer/${user.id}/active`).then((r) => r.status === 204 ? null : r.data).catch(() => null),
//       axiosInstance.get(`/api/valet/customer/${user.id}`).then((r) => Array.isArray(r.data) ? r.data : (r.data ? [r.data] : [])).catch(() => []),
//     ]).then(([b, r, vActive, vAll]) => {
//       setBookings(b);
//       setRentals(r);
//       setValetJob(vActive);
//       setValets(vAll);
//     }).finally(() => setLoading(false));
//   };

//   useEffect(() => { loadData(); }, [user]);

//   const handleReturnRequested = () => {
//     axiosInstance.get(`/api/valet/customer/${user.id}/active`)
//       .then((r) => setValetJob(r.status === 204 ? null : r.data))
//       .catch(() => {});
//   };

//   const activeParking = bookings.filter((b) => b.status === "ACTIVE" || b.status === "PENDING");
//   const activeRentals = rentals.filter((r) => r.status === "ACTIVE" || r.status === "CONFIRMED");
//   const activeValets  = valets.filter((v) => ["REQUESTED", "ACCEPTED", "PICKED_UP", "PARKED", "RETURN_REQUESTED"].includes(v.status));

//   const totalActiveBookings = activeParking.length + activeRentals.length + activeValets.length;
//   const completedBookingsCount = bookings.filter(b => b.status === "COMPLETED").length;
//   const valetHistoryCount = valets.length;

//   const quickActions = [
//     { icon: MapPin,        label: "Find Parking",  to: "/customer/find-parking",  color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
//     { icon: CalendarCheck, label: "My Bookings",   to: "/customer/bookings",      color: "text-[#ffb786]", bg: "bg-[#ffb786]/10" },
//     { icon: Car,           label: "Request Valet", to: "/customer/valet/request", color: "text-[#c0c1ff]", bg: "bg-[#c0c1ff]/10" },
//     { icon: Zap,           label: "Rent a Car",    to: "/customer/rentals",       color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
//   ];

//   return (
//     <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] p-6 lg:p-8 animate-fadeInUp">
//       <style>{`
//         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
//         @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
//         .animate-slideIn { animation: slideIn 0.4s ease-out forwards; }
//       `}</style>

//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
//         <div>
//           <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#dce2f7] to-[#adc6ff] bg-clip-text text-transparent">
//             Good morning, {user?.name?.split(" ")[0] || "Guest"} 👋
//           </h2>
//           <p className="text-[#c2c6d6] text-base mt-1">Find your perfect spot</p>
//         </div>
//         <button onClick={() => navigate("/customer/find-parking")} 
//           className="bg-[#adc6ff] text-[#00285d] px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-lg">
//           Find Parking <ArrowRight size={18} />
//         </button>
//       </div>

//       {/* Hero + Stats */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
//         <div className="lg:col-span-7 animate-slideIn">
//           {!loading && valetJob ? (
//             <ActiveValetCard job={valetJob} onReturnRequested={handleReturnRequested} />
//           ) : (
//             <EmptyHeroCard navigate={navigate} />
//           )}
//         </div>
//         <div className="lg:col-span-5 grid grid-rows-3 gap-5 animate-slideIn" style={{ animationDelay: '0.1s' }}>
//           {[
//             { icon: Smartphone, label: "Active Bookings", value: totalActiveBookings, color: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10", trend: "live" },
//             { icon: ParkingSquare, label: "Total Completed", value: completedBookingsCount, color: "text-[#ffb786]", bg: "bg-[#ffb786]/10", trend: "history" },
//             { icon: UserCheck, label: "Valet Requests", value: valetHistoryCount, color: "text-[#c0c1ff]", bg: "bg-[#c0c1ff]/10", trend: "total" },
//           ].map((stat, idx) => (
//             <div key={idx} className="group bg-[#191f2f]/60 backdrop-blur-md border border-[#424754]/30 rounded-2xl p-6 flex items-center justify-between hover:border-[#adc6ff]/40 transition-all duration-300 hover:-translate-y-1">
//               <div className="flex items-center gap-4">
//                 <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
//                   <stat.icon size={24} className={stat.color} />
//                 </div>
//                 <div>
//                   <p className="text-[#c2c6d6] text-xs font-medium">{stat.label}</p>
//                   <p className="text-3xl font-bold mt-1">{loading ? "—" : stat.value.toString().padStart(2, '0')}</p>
//                 </div>
//               </div>
//               <ChevronRight size={24} className="text-[#424754] group-hover:text-[#adc6ff] transition-colors" />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Quick Actions + Recent Table */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         <div className="lg:col-span-4 grid grid-cols-2 gap-4">
//           {quickActions.map(({ icon: Icon, label, to, color, bg }) => (
//             <button key={to} onClick={() => navigate(to)}
//               className="group bg-[#191f2f] border border-[#424754]/30 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#232a3a] transition-all duration-300 hover:-translate-y-1">
//               <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
//                 <Icon size={28} />
//               </div>
//               <span className="font-semibold text-sm text-center">{label}</span>
//             </button>
//           ))}
//         </div>
//         <div className="lg:col-span-8 bg-[#191f2f]/60 backdrop-blur-md rounded-3xl overflow-hidden border border-[#424754]/30">
//           <div className="p-6 border-b border-[#424754]/20 flex justify-between items-center">
//             <h3 className="font-bold text-lg">Recent Bookings</h3>
//             <button onClick={() => navigate("/customer/bookings")} className="text-[#adc6ff] text-sm font-semibold hover:underline">View All</button>
//           </div>
//           <div className="overflow-x-auto">
//             {loading ? (
//               <div className="p-6 space-y-3">
//                 {[1,2,3].map(i => <div key={i} className="h-12 bg-[#2e3545]/50 rounded animate-pulse"></div>)}
//               </div>
//             ) : [...activeParking, ...activeRentals, ...bookings.slice(0,5)].length === 0 ? (
//               <div className="p-12 text-center">
//                 <ParkingSquare size={40} className="mx-auto text-[#424754] mb-3" />
//                 <p className="text-[#c2c6d6]">No recent bookings</p>
//               </div>
//             ) : (
//               <table className="w-full min-w-[700px]">
//                 <thead className="bg-[#141b2b] text-[#c2c6d6] text-xs uppercase">
//                   <tr><th className="px-6 py-4">Location</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-center">Status</th></tr>
//                 </thead>
//                 <tbody className="divide-y divide-[#424754]/20">
//                   {activeRentals.map(r => (
//                     <tr key={`rental-${r.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
//                       <td className="px-6 py-4"><div><span className="font-semibold">{r.carMake} {r.carModel}</span><span className="text-xs text-[#c2c6d6] block">Rental Vehicle</span></div></td>
//                       <td className="px-6 py-4 text-xs">Until {formatDate(r.endTime)}</td>
//                       <td className="px-6 py-4 font-semibold text-[#adc6ff]">{formatCurrency(r.totalAmount || 0)}</td>
//                       <td className="px-6 py-4 text-center"><span className="px-2 py-1 text-[10px] font-bold rounded-full bg-[#ffb786]/10 text-[#ffb786] border border-[#ffb786]/20">{r.status}</span></td>
//                     </tr>
//                   ))}
//                   {(activeParking.length ? activeParking : bookings.slice(0,5)).map(b => (
//                     <tr key={`parking-${b.id}`} className="hover:bg-[#232a3a]/50 transition-colors">
//                       <td className="px-6 py-4"><div><span className="font-semibold">{b.parkingLotName}</span><span className="text-xs text-[#c2c6d6] block">Spot {b.slotNumber || "TBD"}</span></div></td>
//                       <td className="px-6 py-4 text-xs">{formatDate(b.entryTime)}</td>
//                       <td className="px-6 py-4 font-semibold text-[#adc6ff]">{formatCurrency(b.totalAmount || 0)}</td>
//                       <td className="px-6 py-4 flex items-center justify-center gap-3">
//                         {b.status === "ACTIVE" && <button onClick={() => navigate(`/customer/checkout/${b.id}`)} className="text-[10px] bg-[#adc6ff] text-[#00285d] px-3 py-1 rounded font-bold">Checkout</button>}
//                         <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${b.status === 'COMPLETED' ? 'bg-[#ffb786]/10 text-[#ffb786] border-[#ffb786]/20' : b.status === 'ACTIVE' ? 'bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/20' : 'bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20'}`}>{b.status}</span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatDate, formatCurrency } from "../../utils/formatters";
import {
  MapPin, CalendarCheck, Car, ArrowRight, ParkingSquare, Zap,
  KeyRound, Copy, Loader2, ChevronRight, Smartphone, UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import ValetCarImages from "../valet/ValetCarImages";

// ── Status Metadata ─────────────────────────────────────────────────────────
const VALET_STATUS_META = {
  REQUESTED:        { label: "Finding Valet",  color: "bg-orange-400/20 text-orange-300 border-orange-400/30",   pulse: "bg-orange-400" },
  ACCEPTED:         { label: "Valet Assigned", color: "bg-blue-400/20 text-blue-300 border-blue-400/30",         pulse: "bg-blue-400" },
  PICKED_UP:        { label: "Keys Collected", color: "bg-blue-400/20 text-blue-300 border-blue-400/30",         pulse: "bg-blue-400" },
  PARKED:           { label: "Car Parked",     color: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",pulse: "bg-emerald-400" },
  RETURN_REQUESTED: { label: "Car Returning",  color: "bg-violet-400/20 text-violet-300 border-violet-400/30",   pulse: "bg-violet-400" },
  RETURN_REQ:       { label: "Car Returning",  color: "bg-violet-400/20 text-violet-300 border-violet-400/30",   pulse: "bg-violet-400" },
};

const normalise = (s) => (s === "RETURN_REQ" ? "RETURN_REQUESTED" : s);

// ── Active Valet Hero Card ───────────────────────────────────────────────────
const ActiveValetCard = ({ job, onReturnRequested }) => {
  const navigate           = useNavigate();
  const [requesting, setR] = useState(false);
  const status             = normalise(job.status);
  const meta               = VALET_STATUS_META[status] ?? { label: status, color: "bg-slate-400/20 text-slate-300 border-slate-400/30", pulse: "bg-slate-400" };
  const displayOtp         = (status === "REQUESTED" || status === "ACCEPTED") ? job.pickupOtp : (status === "RETURN_REQUESTED" ? job.dropoffOtp : null);

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
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 lg:p-10 overflow-hidden border border-slate-700/40 shadow-2xl h-full flex flex-col justify-between min-h-[340px]">
      <Car size={200} className="absolute -bottom-8 -right-8 text-slate-700/30 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Car size={22} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Valet Service</h3>
              <p className="text-slate-400 text-xs font-bold">#{job.id} · {job.carPlateNo}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${meta.color}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${meta.pulse}`}></span>
            {meta.label}
          </span>
        </div>

        {displayOtp && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                {status === "RETURN_REQUESTED" ? "Dropoff OTP" : "Pickup OTP"}
              </p>
              <button onClick={() => copyOtp(displayOtp)} className="text-blue-400 hover:text-white flex items-center gap-1 text-xs font-black transition-colors">
                <Copy size={13} /> Copy
              </button>
            </div>
            <div className="flex gap-3">
              {displayOtp.split('').map((digit, i) => (
                <div key={i} className="w-14 h-16 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center font-mono text-3xl font-bold text-blue-400 shadow-inner">
                  {digit}
                </div>
              ))}
            </div>
          </div>
        )}

        {(status === "PARKED" || status === "RETURN_REQUESTED") && job.parkingLotName && (
          <div className="mt-6 border-t border-slate-700 pt-4">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-1">Location</p>
            <p className="text-white font-black text-sm">
              {job.parkingLotName}{job.slotNumber && <span className="font-normal text-slate-400"> (Slot {job.slotNumber})</span>}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 relative z-10">
        <button onClick={() => navigate(`/customer/valet/track/${job.id}`)}
          className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm">
          <MapPin size={15} className="text-blue-400" /> Track Live
        </button>
        {status === "PARKED" && (
          <button onClick={handleReturn} disabled={requesting}
            className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
            {requesting ? <Loader2 size={15} className="animate-spin" /> : <><KeyRound size={15} /> Get Car Back</>}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Empty Hero Card ──────────────────────────────────────────────────────────
const EmptyHeroCard = ({ navigate }) => (
  <div className="relative bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-10 overflow-hidden border border-white shadow-lg h-full flex flex-col justify-between min-h-[340px]">
    <ParkingSquare size={200} className="absolute -bottom-8 -right-8 text-slate-100 pointer-events-none" />
    <div>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6">
        <MapPin size={26} className="text-white" />
      </div>
      <h3 className="font-black text-slate-900 text-3xl mb-3 tracking-tight">Ready to park?</h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
        No active sessions right now. Find a spot nearby or let our valet handle it.
      </p>
    </div>
    <div className="flex gap-3 flex-wrap">
      <button onClick={() => navigate("/customer/find-parking")}
        className="px-6 py-3.5 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
        Find Parking <ArrowRight size={16} />
      </button>
      <button onClick={() => navigate("/customer/valet/request")}
        className="px-6 py-3.5 bg-blue-50 text-blue-700 font-black rounded-2xl hover:bg-blue-100 transition-all">
        Request Valet
      </button>
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

  const activeParking        = bookings.filter((b) => b.status === "ACTIVE" || b.status === "PENDING");
  const activeRentals        = rentals.filter((r) => r.status === "ACTIVE" || r.status === "CONFIRMED");
  const activeValets         = valets.filter((v) => ["REQUESTED","ACCEPTED","PICKED_UP","PARKED","RETURN_REQUESTED"].includes(v.status));
  const totalActiveBookings  = activeParking.length + activeRentals.length + activeValets.length;
  const completedBookingsCount = bookings.filter(b => b.status === "COMPLETED").length;
  const valetHistoryCount    = valets.length;

  const quickActions = [
    { icon: MapPin,        label: "Find Parking",  to: "/customer/find-parking",  color: "from-blue-500 to-blue-700" },
    { icon: CalendarCheck, label: "My Bookings",   to: "/customer/bookings",      color: "from-amber-400 to-orange-500" },
    { icon: Car,           label: "Valet",         to: "/customer/valet/request", color: "from-violet-500 to-purple-600" },
    { icon: Zap,           label: "Rent a Car",    to: "/customer/rentals",       color: "from-cyan-400 to-blue-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden font-sans">
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-cyan-400/8 blur-[80px] rounded-full pointer-events-none"></div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 animate-card">
        <div>
          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-md">Customer Portal</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 mt-2">
            Hey, <span className="text-blue-600">{user?.name?.split(" ")[0] || "there"}</span> 👋
          </h1>
        </div>
        <button onClick={() => navigate("/customer/find-parking")}
          className="w-full md:w-auto px-6 py-4 bg-slate-900 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3">
          <MapPin size={18} className="text-blue-400" />
          <span>Find Parking</span>
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 relative z-10">
        {[
          { label: "Active Sessions", val: totalActiveBookings,    icon: Smartphone,    color: "from-blue-500 to-blue-700",        delay: "0s" },
          { label: "Completed",       val: completedBookingsCount, icon: ParkingSquare, color: "from-amber-400 to-orange-500",     delay: "0.1s" },
          { label: "Valet Requests",  val: valetHistoryCount,      icon: UserCheck,     color: "from-violet-500 to-purple-600",    delay: "0.2s" },
        ].map((item, i) => (
          <div key={i} className="animate-card bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all" style={{ animationDelay: item.delay }}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{String(item.val || 0).padStart(2, "0")}</h3>
          </div>
        ))}
      </div>

      {/* Bento: Hero + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 relative z-10">
        <div className="lg:col-span-7 animate-card" style={{ animationDelay: "0.3s" }}>
          {valetJob
            ? <ActiveValetCard job={valetJob} onReturnRequested={handleReturnRequested} />
            : <EmptyHeroCard navigate={navigate} />
          }
        </div>
        <div className="lg:col-span-5 grid grid-cols-2 gap-4 animate-card" style={{ animationDelay: "0.4s" }}>
          {quickActions.map(({ icon: Icon, label, to, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-6 flex flex-col justify-between h-36 hover:shadow-xl transition-all cursor-pointer text-left group">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <Icon size={19} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{label}</p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Launch</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-lg overflow-hidden relative z-10 animate-card" style={{ animationDelay: "0.5s" }}>
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Recent Bookings</h2>
          <button onClick={() => navigate("/customer/bookings")} className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All →</button>
        </div>
        <div className="overflow-x-auto">
          {[...activeRentals, ...(activeParking.length > 0 ? activeParking : bookings.slice(0, 5))].length === 0 ? (
            <div className="p-12 text-center">
              <ParkingSquare size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-black text-sm">No recent bookings</p>
            </div>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeRentals.map(r => (
                  <tr key={`rental-${r.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm">{r.carMake} {r.carModel}</p>
                      <p className="text-xs text-slate-400">Rental Vehicle</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">Until {formatDate(r.endTime)}</td>
                    <td className="px-6 py-4 font-black text-blue-600 text-sm">{formatCurrency(r.totalAmount || 0)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status === "ACTIVE" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
                {(activeParking.length > 0 ? activeParking : bookings.slice(0, 5)).map(b => (
                  <tr key={`parking-${b.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm">{b.parkingLotName}</p>
                      <p className="text-xs text-slate-400">Spot {b.slotNumber || "TBD"}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(b.entryTime)}</td>
                    <td className="px-6 py-4 font-black text-blue-600 text-sm">{formatCurrency(b.totalAmount || 0)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {b.status === "ACTIVE" && (
                          <button onClick={() => navigate(`/customer/checkout/${b.id}`)}
                            className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-black hover:bg-blue-700 transition-colors">
                            Checkout
                          </button>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${b.status === "COMPLETED" ? "bg-slate-100 text-slate-600" : b.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                          {b.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;