// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from "../../api/axiosInstance";
// import { formatCurrency, formatDate } from "../../utils/formatters";
// import { 
//   Truck, Car, ClipboardList, TrendingUp, DollarSign, Clock, 
//   ArrowRight, Building2, AlertCircle, Eye, Plus, ChevronRight,
//   LineChart
// } from "lucide-react";

// const FleetDashboard = () => {
//   const { user }   = useAuth();
//   const navigate   = useNavigate();

//   const [company, setCompany]     = useState(null);
//   const [companyLoading, setCL]   = useState(true);
//   const [cars, setCars]           = useState([]);
//   const [bookings, setBookings]   = useState([]);
//   const [loading, setL]           = useState(false);

//   // Fetch company status first
//   useEffect(() => {
//     axiosInstance.get("/api/rental-company/my")
//       .then((r) => setCompany(r.data))
//       .catch(() => setCompany(null))
//       .finally(() => setCL(false));
//   }, []);

//   // Fetch fleet data if company is verified
//   useEffect(() => {
//     if (!company?.platformVerified) return;
//     setL(true);
//     Promise.all([
//       axiosInstance.get(`/api/rental-cars/company/${company.id}`).then((r) => r.data || []).catch(() => []),
//       axiosInstance.get(`/api/rental-cars/company/${company.id}/bookings`).then((r) => r.data || []).catch(() => []),
//     ]).then(([c, b]) => {
//       setCars(c);
//       setBookings(b);
//     }).finally(() => setL(false));
//   }, [company]);

//   // Helper Variables
//   const total = cars.length;
//   const available = cars.filter((c) => c.status === "AVAILABLE").length;
//   const rented    = cars.filter((c) => c.status === "RENTED").length;
//   const maintenance = cars.filter((c) => c.status === "MAINTENANCE").length;
//   const pending   = bookings.filter((b) => b.status === "PENDING").length;
//   const revenue   = bookings.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + (b.totalAmount || 0), 0);

//   // Dynamic SVG Donut Chart Logic
//   const circ = 251.2; // Circumference for r=40
//   const safeTotal = total > 0 ? total : 1;
//   const rentedDash = (rented / safeTotal) * circ;
//   const availDash = (available / safeTotal) * circ;
//   const maintDash = (maintenance / safeTotal) * circ;

//   // ── 1. Loading State ───────────────────────────────────────
//   if (companyLoading) {
//     return (
//       <div className="min-h-screen bg-[#0c1322] flex items-center justify-center w-full max-w-full">
//         <div className="w-8 h-8 border-4 border-[#adc6ff] border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   // ── 2. No Company Registered ────────────────────────────────
//   if (!company) {
//     return (
//       <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] p-4 sm:p-8 flex items-center justify-center w-full max-w-full">
//         <div className="bg-[#191f2f] border border-[#424754] rounded-2xl p-6 sm:p-10 w-full max-w-md text-center shadow-2xl mx-auto">
//           <div className="w-16 h-16 bg-[#adc6ff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
//             <Building2 size={32} className="text-[#adc6ff]" />
//           </div>
//           <h2 className="text-xl sm:text-2xl font-bold mb-3">Register Your Company</h2>
//           <p className="text-[#c2c6d6] text-sm mb-8 leading-relaxed">
//             Before you can list cars, you need to register your rental company and get verified by the admin.
//           </p>
//           <button onClick={() => navigate("/fleet-admin/register-company")}
//             className="bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 w-full">
//             Register Now <ArrowRight size={18} />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── 3. Company Pending Verification ─────────────────────────
//   if (!company.platformVerified) {
//     return (
//       <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] p-4 sm:p-8 flex items-center justify-center w-full max-w-full">
//         <div className="bg-[#191f2f] border border-[#424754] rounded-2xl p-6 sm:p-10 w-full max-w-md text-center shadow-2xl mx-auto">
//           <div className="w-16 h-16 bg-[#fbbf24]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
//             <Clock size={32} className="text-[#fbbf24]" />
//           </div>
//           <h2 className="text-xl sm:text-2xl font-bold mb-3">Verification Pending</h2>
//           <p className="text-[#c2c6d6] text-sm mb-6 leading-relaxed">
//             <span className="font-bold text-[#dce2f7]">{company.companyName}</span> is under review.
//             You'll be notified once a super admin approves your account.
//           </p>
//           <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold px-4 py-2.5 rounded-lg mb-8 w-full">
//             <AlertCircle size={14} className="shrink-0" /> <span>Awaiting approval · 24–48 hrs</span>
//           </div>
//           <button onClick={() => navigate("/fleet-admin/company-pending")}
//             className="bg-[#2e3545] hover:bg-[#424754] border border-[#424754]/50 text-[#dce2f7] font-bold px-6 py-3.5 rounded-xl transition-all w-full">
//             View Details
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── 4. Main Dashboard ───────────────────────────────────────
//   return (
//     // Added w-full max-w-full overflow-x-hidden to prevent body scrolling out of bounds
//     <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] font-sans p-4 sm:p-6 lg:p-10 pb-20 selection:bg-[#adc6ff] selection:text-[#00285d] w-full max-w-full overflow-x-hidden">
      
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 w-full min-w-0">
//         <div className="w-full md:w-auto">
//           <h1 className="text-3xl sm:text-4xl md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[#dce2f7] mb-2 break-words">
//             Fleet Overview
//           </h1>
//           <p className="text-base sm:text-lg text-[#c2c6d6] truncate">{company.companyName}</p>
//         </div>
        
//         {/* Quick Actions */}
//         <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto mt-2 md:mt-0">
//           <button onClick={() => navigate("/fleet-admin/fleet")} 
//             className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#424754] text-[#dce2f7] font-bold hover:bg-[#191f2f] transition-colors flex items-center justify-center gap-2 text-sm shadow-sm shrink-0">
//             <Eye size={18} /> View Fleet
//           </button>
//           <button onClick={() => navigate("/fleet-admin/bookings")} 
//             className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#424754] text-[#dce2f7] font-bold hover:bg-[#191f2f] transition-colors flex items-center justify-center gap-2 text-sm shadow-sm shrink-0">
//             <ClipboardList size={18} /> View Bookings
//           </button>
//           <button onClick={() => navigate("/fleet-admin/fleet?add=1")} 
//             className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)] flex items-center justify-center gap-2 text-sm shrink-0">
//             <Plus size={18} /> Add Car
//           </button>
//         </div>
//       </div>

//       {/* Stats Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 w-full min-w-0">
        
//         <div className="bg-[#191f2f] p-5 sm:p-6 rounded-2xl border border-[#424754]/80 shadow-lg w-full min-w-0 flex flex-col">
//           <div className="flex justify-between items-start mb-4">
//             <div className="p-2 sm:p-2.5 rounded-xl bg-[#2e3545] shrink-0">
//               <Truck size={20} className="text-[#adc6ff]" />
//             </div>
//             <span className="text-[10px] sm:text-xs font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-1 rounded whitespace-nowrap">+12%</span>
//           </div>
//           <p className="text-[#c2c6d6] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 truncate">Total Cars</p>
//           <h3 className="text-3xl lg:text-4xl font-extrabold text-[#dce2f7] tracking-tight truncate">{loading ? "—" : total}</h3>
//         </div>

//         <div className="bg-[#191f2f] p-5 sm:p-6 rounded-2xl border border-[#424754]/80 shadow-lg w-full min-w-0 flex flex-col">
//           <div className="flex justify-between items-start mb-4">
//             <div className="p-2 sm:p-2.5 rounded-xl bg-[#052e16] shrink-0">
//               <Car size={20} className="text-[#4ade80]" />
//             </div>
//             <span className="text-[10px] sm:text-xs font-bold text-[#4ade80] whitespace-nowrap">Active</span>
//           </div>
//           <p className="text-[#c2c6d6] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 truncate">Active Rentals</p>
//           <h3 className="text-3xl lg:text-4xl font-extrabold text-[#dce2f7] tracking-tight truncate">{loading ? "—" : rented}</h3>
//         </div>

//         <div className="bg-[#191f2f] p-5 sm:p-6 rounded-2xl border border-[#424754]/80 shadow-lg w-full min-w-0 flex flex-col">
//           <div className="flex justify-between items-start mb-4">
//             <div className="p-2 sm:p-2.5 rounded-xl bg-[#451a03] shrink-0">
//               <Clock size={20} className="text-[#fbbf24]" />
//             </div>
//             <span className="text-[10px] sm:text-xs font-bold text-[#fbbf24] whitespace-nowrap">Pending</span>
//           </div>
//           <p className="text-[#c2c6d6] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 truncate">Pending Bookings</p>
//           <h3 className="text-3xl lg:text-4xl font-extrabold text-[#dce2f7] tracking-tight truncate">{loading ? "—" : pending}</h3>
//         </div>

//         <div className="bg-[#191f2f] p-5 sm:p-6 rounded-2xl border border-[#424754]/80 shadow-lg w-full min-w-0 flex flex-col">
//           <div className="flex justify-between items-start mb-4">
//             <div className="p-2 sm:p-2.5 rounded-xl bg-[#2e1065] shrink-0">
//               <DollarSign size={20} className="text-[#c084fc]" />
//             </div>
//             <span className="text-[10px] sm:text-xs font-bold text-[#c084fc] whitespace-nowrap">This Month</span>
//           </div>
//           <p className="text-[#c2c6d6] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 truncate">Monthly Revenue</p>
//           <h3 className="text-3xl lg:text-4xl font-extrabold text-[#dce2f7] tracking-tight truncate">{loading ? "—" : formatCurrency(revenue)}</h3>
//         </div>

//       </div>

//       {/* Bento Grid Section - min-w-0 prevents blowout */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        
//         {/* Fleet Summary Card */}
//         <div className="lg:col-span-4 bg-[#191f2f] p-6 sm:p-8 rounded-3xl border border-[#424754]/80 shadow-lg flex flex-col justify-between w-full min-w-0">
//           <div className="w-full">
//             <h2 className="text-xl sm:text-2xl font-bold text-[#dce2f7] mb-6 sm:mb-8 tracking-tight">Fleet Status</h2>
            
//             <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-8 sm:mb-10 shrink-0">
//               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
//                 <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2e3545" strokeWidth="12" />
//                 {rented > 0 && (
//                   <circle cx="50" cy="50" r="40" fill="transparent" stroke="#adc6ff" 
//                     strokeWidth="12" strokeLinecap="round"
//                     strokeDasharray={`${rentedDash} ${circ - rentedDash}`} strokeDashoffset={0} 
//                     className="transition-all duration-1000 ease-out" />
//                 )}
//                 {available > 0 && (
//                   <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4ade80" 
//                     strokeWidth="12" strokeLinecap="round"
//                     strokeDasharray={`${availDash} ${circ - availDash}`} strokeDashoffset={-rentedDash} 
//                     className="transition-all duration-1000 ease-out" />
//                 )}
//                 {maintenance > 0 && (
//                   <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ffb4ab" 
//                     strokeWidth="12" strokeLinecap="round"
//                     strokeDasharray={`${maintDash} ${circ - maintDash}`} strokeDashoffset={-(rentedDash + availDash)} 
//                     className="transition-all duration-1000 ease-out" />
//                 )}
//               </svg>
//               <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <span className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] tracking-tight">{total}</span>
//                 <span className="text-[10px] font-bold text-[#c2c6d6] uppercase tracking-widest mt-1">Total</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="space-y-3 w-full">
//             <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#2e3545]/50 border border-[#424754]/30 w-full min-w-0">
//               <div className="flex items-center gap-3 min-w-0">
//                 <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.5)] shrink-0"></span>
//                 <span className="text-[#dce2f7] font-bold text-xs sm:text-sm truncate">Available</span>
//               </div>
//               <span className="font-mono text-base sm:text-lg font-bold text-[#dce2f7] pl-2">{available}</span>
//             </div>
            
//             <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#2e3545]/50 border border-[#424754]/30 w-full min-w-0">
//               <div className="flex items-center gap-3 min-w-0">
//                 <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.5)] shrink-0"></span>
//                 <span className="text-[#dce2f7] font-bold text-xs sm:text-sm truncate">Rented</span>
//               </div>
//               <span className="font-mono text-base sm:text-lg font-bold text-[#dce2f7] pl-2">{rented}</span>
//             </div>
            
//             <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#2e3545]/50 border border-[#424754]/30 w-full min-w-0">
//               <div className="flex items-center gap-3 min-w-0">
//                 <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ffb4ab] shadow-[0_0_10px_rgba(255,180,171,0.5)] shrink-0"></span>
//                 <span className="text-[#dce2f7] font-bold text-xs sm:text-sm truncate">Maintenance</span>
//               </div>
//               <span className="font-mono text-base sm:text-lg font-bold text-[#dce2f7] pl-2">{maintenance}</span>
//             </div>
//           </div>
//         </div>

//         {/* Recent Bookings Table - Explicitly boxed to stop flex overflow */}
//         <div className="lg:col-span-8 bg-[#191f2f] rounded-3xl border border-[#424754]/80 shadow-lg flex flex-col w-full min-w-0 overflow-hidden">
//           <div className="p-6 sm:p-8 border-b border-[#424754]/50 flex justify-between items-center w-full min-w-0">
//             <h2 className="text-xl sm:text-2xl font-bold text-[#dce2f7] tracking-tight truncate">Recent Bookings</h2>
//             <button onClick={() => navigate("/fleet-admin/bookings")} 
//               className="text-[#adc6ff] font-bold text-xs sm:text-sm flex items-center gap-1 hover:text-[#dce2f7] transition-colors shrink-0 pl-4">
//               View All <ChevronRight size={16} />
//             </button>
//           </div>
          
//           <div className="w-full overflow-x-auto relative">
//             <table className="w-full text-left min-w-[700px] border-collapse">
//               <thead>
//                 <tr className="bg-[#2e3545]/30 border-b border-[#424754]/50">
//                   <th className="px-6 sm:px-8 py-4 sm:py-5 font-bold text-[#c2c6d6] text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-nowrap">Vehicle</th>
//                   <th className="px-6 sm:px-8 py-4 sm:py-5 font-bold text-[#c2c6d6] text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-nowrap">Customer</th>
//                   <th className="px-6 sm:px-8 py-4 sm:py-5 font-bold text-[#c2c6d6] text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-nowrap">Duration</th>
//                   <th className="px-6 sm:px-8 py-4 sm:py-5 font-bold text-[#c2c6d6] text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-nowrap">Amount</th>
//                   <th className="px-6 sm:px-8 py-4 sm:py-5 font-bold text-[#c2c6d6] text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-nowrap">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[#424754]/30">
//                 {loading ? (
//                   <tr><td colSpan="5" className="p-8 text-center text-[#c2c6d6] text-sm font-medium">Loading...</td></tr>
//                 ) : bookings.length === 0 ? (
//                   <tr><td colSpan="5" className="p-8 text-center text-[#c2c6d6] text-sm font-medium">No recent bookings found.</td></tr>
//                 ) : (
//                   bookings.slice(0, 5).map((b) => {
//                     const statusConfig = {
//                       COMPLETED: "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
//                       ACTIVE:    "bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/20",
//                       PENDING:   "bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20",
//                     }[b.status] || "bg-[#424754]/30 text-[#c2c6d6] border border-[#424754]";

//                     return (
//                       <tr key={b.id} className="hover:bg-[#2e3545]/20 transition-colors">
//                         <td className="px-6 sm:px-8 py-4 sm:py-5">
//                           <div className="flex items-center gap-3 sm:gap-4">
//                             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#2e3545] flex items-center justify-center border border-[#424754]/50 shrink-0">
//                               <Car size={18} className="text-[#adc6ff] sm:w-5 sm:h-5" />
//                             </div>
//                             <div className="min-w-0">
//                               <div className="text-[#dce2f7] font-bold text-sm whitespace-nowrap truncate">{b.carMake} {b.carModel}</div>
//                               <div className="text-[11px] sm:text-xs text-[#c2c6d6] mt-0.5 whitespace-nowrap truncate">{b.licensePlate || "N/A"}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 sm:px-8 py-4 sm:py-5 text-[#dce2f7] text-sm font-medium whitespace-nowrap truncate max-w-[150px]">{b.customerName || `Customer #${b.customerId}`}</td>
//                         <td className="px-6 sm:px-8 py-4 sm:py-5 whitespace-nowrap">
//                           <div className="text-[#dce2f7] text-sm font-medium">{formatDate(b.startTime)}</div>
//                           <div className="text-[11px] sm:text-xs text-[#c2c6d6] mt-0.5">To {formatDate(b.endTime)}</div>
//                         </td>
//                         <td className="px-6 sm:px-8 py-4 sm:py-5 font-mono text-[#dce2f7] font-bold whitespace-nowrap">
//                           {b.totalAmount ? formatCurrency(b.totalAmount) : "TBD"}
//                         </td>
//                         <td className="px-6 sm:px-8 py-4 sm:py-5 whitespace-nowrap">
//                           <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-widest ${statusConfig}`}>
//                             {b.status}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Featured Analytics */}
//         <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-2 w-full min-w-0">
          
//           <div className="bg-[#191f2f] rounded-2xl p-5 sm:p-6 border border-[#adc6ff]/30 shadow-[0_0_15px_rgba(173,198,255,0.05)] relative overflow-hidden min-h-[140px] flex flex-col justify-between w-full min-w-0">
//             <h4 className="text-[#dce2f7] font-bold mb-3 text-sm sm:text-base truncate">Live Occupancy</h4>
//             <div className="flex items-end gap-1.5 h-10 sm:h-12 mb-3 sm:mb-4 w-full">
//               <div className="flex-1 bg-[#adc6ff]/20 h-4 rounded-sm"></div>
//               <div className="flex-1 bg-[#adc6ff]/30 h-8 rounded-sm"></div>
//               <div className="flex-1 bg-[#adc6ff]/40 h-6 rounded-sm"></div>
//               <div className="flex-1 bg-[#adc6ff]/60 h-10 rounded-sm"></div>
//               <div className="flex-1 bg-[#adc6ff] h-12 rounded-sm shadow-[0_0_10px_rgba(173,198,255,0.5)]"></div>
//               <div className="flex-1 bg-[#adc6ff]/80 h-9 rounded-sm"></div>
//             </div>
//             <p className="text-[10px] sm:text-[11px] text-[#c2c6d6] leading-relaxed">Real-time fleet utilization tracking active across all registered parking zones.</p>
//           </div>

//           <div className="bg-[#191f2f] rounded-2xl p-5 sm:p-6 border border-[#424754] min-h-[140px] flex items-center gap-4 sm:gap-6 shadow-lg w-full min-w-0">
//             <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] sm:border-4 border-[#c0c1ff]/10 border-t-[#c0c1ff] animate-spin shrink-0" style={{ animationDuration: '3s' }}></div>
//             <div className="min-w-0">
//               <h4 className="text-[#dce2f7] font-bold mb-1.5 sm:mb-2 text-sm sm:text-base truncate">System Health</h4>
//               <p className="text-[10px] sm:text-[11px] text-[#c2c6d6] leading-relaxed">All fleet IoT sensors are currently broadcasting diagnostic data at optimal frequency.</p>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-[#191f2f] to-[#2e3545] rounded-2xl p-5 sm:p-6 border border-[#424754] min-h-[140px] relative group overflow-hidden shadow-lg flex flex-col justify-between w-full min-w-0">
//             <div className="relative z-10">
//               <h4 className="text-[#dce2f7] font-bold mb-1.5 sm:mb-2 text-sm sm:text-base truncate">Annual Forecast</h4>
//               <p className="text-[10px] sm:text-[11px] text-[#c2c6d6] mb-4 sm:mb-5 leading-relaxed">Predictive AI suggests 15% growth by Q4 based on historical rental peaks.</p>
//               <button className="text-[#adc6ff] font-bold text-[11px] sm:text-xs flex items-center gap-2 group-hover:gap-3 transition-all shrink-0">
//                 Review Model <TrendingUp size={14} />
//               </button>
//             </div>
//             <LineChart size={100} className="absolute -bottom-4 -right-4 text-[#adc6ff]/5 select-none sm:w-[120px] sm:h-[120px] pointer-events-none" />
//           </div>

//         </div>
//       </div>
      
//     </div>
//   );
// };

// export default FleetDashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  Truck, Car, ClipboardList, DollarSign, Clock,
  ArrowRight, Building2, AlertCircle, Eye, Plus, ChevronRight
} from "lucide-react";

const FleetDashboard = () => {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [company,   setCompany]     = useState(null);
  const [companyLoading, setCL]     = useState(true);
  const [cars,      setCars]        = useState([]);
  const [bookings,  setBookings]    = useState([]);
  const [loading,   setL]           = useState(false);

  useEffect(() => {
    axiosInstance.get("/api/rental-company/my")
      .then((r) => setCompany(r.data))
      .catch(() => setCompany(null))
      .finally(() => setCL(false));
  }, []);

  useEffect(() => {
    if (!company?.platformVerified) return;
    setL(true);
    Promise.all([
      axiosInstance.get(`/api/rental-cars/company/${company.id}`).then((r) => r.data || []).catch(() => []),
      axiosInstance.get(`/api/rental-cars/company/${company.id}/bookings`).then((r) => r.data || []).catch(() => []),
    ]).then(([c, b]) => {
      setCars(c);
      setBookings(b);
    }).finally(() => setL(false));
  }, [company]);

  const total       = cars.length;
  const available   = cars.filter((c) => c.status === "AVAILABLE").length;
  const rented      = cars.filter((c) => c.status === "RENTED").length;
  const maintenance = cars.filter((c) => c.status === "MAINTENANCE").length;
  const pending     = bookings.filter((b) => b.status === "PENDING").length;
  const revenue     = bookings.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + (b.totalAmount || 0), 0);

  // SVG donut chart
  const circ      = 251.2;
  const safeTotal = total > 0 ? total : 1;
  const rentedDash = (rented / safeTotal) * circ;
  const availDash  = (available / safeTotal) * circ;
  const maintDash  = (maintenance / safeTotal) * circ;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // ── No Company ───────────────────────────────────────────────────────────
  if (!company) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Register Your Company</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Before you can list cars, register your rental company and get verified by an admin.
          </p>
          <button onClick={() => navigate("/fleet-admin/register-company")}
            className="w-full px-6 py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl">
            Register Now <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Pending Verification ─────────────────────────────────────────────────
  if (!company.platformVerified) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
            <Clock size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Verification Pending</h2>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            <span className="font-black text-slate-900">{company.companyName}</span> is under review.
            You'll be notified once approved.
          </p>
          <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black px-4 py-3 rounded-2xl mb-8">
            <AlertCircle size={14} /> Awaiting approval · 24–48 hrs
          </div>
          <button onClick={() => navigate("/fleet-admin/company-pending")}
            className="w-full px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
            View Details
          </button>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden font-sans">
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[40%] bg-amber-400/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-orange-400/8 blur-[80px] rounded-full pointer-events-none"></div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 animate-card">
        <div>
          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-md">Fleet Control</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 mt-2">
            Fleet <span className="text-amber-500">Overview</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-bold">{company.companyName}</p>
        </div>
        <div className="flex gap-3 flex-wrap w-full md:w-auto">
          <button onClick={() => navigate("/fleet-admin/fleet")}
            className="flex-1 md:flex-none px-5 py-3.5 bg-white/80 backdrop-blur border border-white text-slate-900 font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Eye size={16} /> View Fleet
          </button>
          <button onClick={() => navigate("/fleet-admin/bookings")}
            className="flex-1 md:flex-none px-5 py-3.5 bg-white/80 backdrop-blur border border-white text-slate-900 font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <ClipboardList size={16} /> Bookings
          </button>
          <button onClick={() => navigate("/fleet-admin/fleet?add=1")}
            className="flex-1 md:flex-none px-5 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
            <Plus size={16} className="text-amber-400" /> Add Car
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
        {[
          { label: "Total Cars",       val: loading ? "—" : total,                  icon: Truck,        color: "from-amber-400 to-orange-500",  delay: "0s" },
          { label: "Active Rentals",   val: loading ? "—" : rented,                 icon: Car,          color: "from-emerald-400 to-teal-600",  delay: "0.1s" },
          { label: "Pending Bookings", val: loading ? "—" : pending,                icon: Clock,        color: "from-blue-500 to-blue-700",     delay: "0.2s" },
          { label: "Monthly Revenue",  val: loading ? "—" : formatCurrency(revenue),icon: DollarSign,   color: "from-violet-500 to-purple-600", delay: "0.3s" },
        ].map((item, i) => (
          <div key={i} className="animate-card bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all" style={{ animationDelay: item.delay }}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* Bento: Donut Chart + Bookings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* Fleet Status Donut */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-6 sm:p-8 shadow-lg animate-card" style={{ animationDelay: "0.4s" }}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Status</p>
          <h2 className="text-xl font-black text-slate-900 mb-6">Live Breakdown</h2>

          <div className="relative w-44 h-44 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
              {rented > 0 && (
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12"
                  strokeDasharray={`${rentedDash} ${circ - rentedDash}`} />
              )}
              {available > 0 && (
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12"
                  strokeDasharray={`${availDash} ${circ - availDash}`} strokeDashoffset={-rentedDash} />
              )}
              {maintenance > 0 && (
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f87171" strokeWidth="12"
                  strokeDasharray={`${maintDash} ${circ - maintDash}`} strokeDashoffset={-(rentedDash + availDash)} />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900">{total}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { color: "bg-emerald-400", label: "Available",   val: available },
              { color: "bg-amber-400",   label: "Rented",      val: rented },
              { color: "bg-red-400",     label: "Maintenance", val: maintenance },
            ].map(({ color, label, val }) => (
              <div key={label} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${color} flex-shrink-0`}></span>
                  <span className="text-sm font-black text-slate-700">{label}</span>
                </div>
                <span className="font-black text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-lg overflow-hidden animate-card" style={{ animationDelay: "0.5s" }}>
          <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Recent Bookings</h2>
            <button onClick={() => navigate("/fleet-admin/bookings")} className="text-xs font-black text-amber-600 hover:underline uppercase tracking-widest">View All →</button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Truck size={36} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 font-black text-sm">No bookings yet</p>
              </div>
            ) : (
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Vehicle</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Duration</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.slice(0, 6).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Car size={15} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{b.carMake} {b.carModel}</p>
                            <p className="text-xs text-slate-400">{b.licensePlate || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-bold">{b.customerName || `Customer #${b.customerId}`}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(b.startTime)}<br /><span className="text-slate-400">to {formatDate(b.endTime)}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-amber-600 text-sm">{b.totalAmount ? formatCurrency(b.totalAmount) : "TBD"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === "COMPLETED" ? "bg-slate-100 text-slate-600" : b.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
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

export default FleetDashboard;