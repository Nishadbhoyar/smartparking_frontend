// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../../api/axiosInstance";
// import { formatCurrency } from "../../utils/formatters";
// import {
//   Shield, Users, ParkingSquare, Car, Truck, Tag,
//   DollarSign, ChevronRight, AlertTriangle, ArrowRight,
//   PlusCircle, Activity, Map, Globe, Award
// } from "lucide-react";

// const SuperAdminDashboard = () => {
//   const navigate          = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [loading, setL]   = useState(true);

//   useEffect(() => {
//     axiosInstance.get("/api/super-admin/platform-stats")
//       .then((r) => setStats(r.data))
//       .catch(() => setStats(null))
//       .finally(() => setL(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0c1322] flex items-center justify-center w-full">
//         <div className="w-8 h-8 border-4 border-[#adc6ff] border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0c1322] text-[#dce2f7] font-sans p-4 sm:p-6 lg:p-10 pb-20 selection:bg-[#adc6ff] selection:text-[#00285d] w-full max-w-full overflow-x-hidden">

//       {/* Header Section */}
//       <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 w-full min-w-0">
//         <div className="flex items-center gap-4 sm:gap-6 min-w-0">
//           <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#93000a]/20 flex items-center justify-center text-[#ffb4ab] shrink-0">
//             <Shield size={28} className="sm:w-8 sm:h-8" />
//           </div>
//           <div className="min-w-0">
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] tracking-tight truncate">
//               Platform Dashboard
//             </h1>
//             <div className="flex flex-wrap items-center gap-2 mt-1.5">
//               <span className="px-2.5 py-0.5 rounded-full bg-[#93000a] text-[#ffdad6] font-bold text-[10px] tracking-wider uppercase whitespace-nowrap">
//                 Super Admin
//               </span>
//               <span className="text-[#c2c6d6] text-xs sm:text-sm truncate">• Infrastructure Management</span>
//             </div>
//           </div>
//         </div>
//         <button className="bg-[#adc6ff] text-[#002e6a] font-bold px-6 py-3.5 rounded-xl shadow-[0_10px_15px_-3px_rgba(173,198,255,0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2 shrink-0 w-full md:w-auto">
//           <PlusCircle size={18} /> New Lot Integration
//         </button>
//       </header>

//       {/* Pending Alert Banner */}
//       <div className="mb-8 bg-[#df7412]/10 border border-[#df7412]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
//         <div className="flex items-center gap-3 text-[#ffb786]">
//           <AlertTriangle size={20} className="shrink-0" />
//           <p className="text-sm">
//             <span className="font-bold">3 pending companies</span> awaiting verification for platform access.
//           </p>
//         </div>
//         <button className="text-[#ffb786] font-bold text-sm underline underline-offset-4 hover:text-[#ffdcc6] transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto">
//           Review Now <ArrowRight size={16} />
//         </button>
//       </div>

//       {!stats ? (
//         <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-2xl px-6 py-4 text-sm text-[#ffb4ab]">
//           Platform stats unavailable. Check backend connectivity.
//         </div>
//       ) : (
//         <>
//           {/* Top 4 Stats Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 w-full min-w-0">
            
//             <div className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="w-10 h-10 rounded-lg bg-[#4d8eff]/20 text-[#adc6ff] flex items-center justify-center shrink-0">
//                   <Users size={20} />
//                 </div>
//                 <span className="text-[#00c853] text-[12px] font-mono font-bold">+12%</span>
//               </div>
//               <p className="text-[#c2c6d6] text-xs font-bold mb-1 truncate">Total Users</p>
//               <h3 className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] truncate">{stats.totalUsers?.toLocaleString() || 0}</h3>
//             </div>

//             <div className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="w-10 h-10 rounded-lg bg-[#00c853]/10 text-[#00c853] flex items-center justify-center shrink-0">
//                   <ParkingSquare size={20} />
//                 </div>
//                 <span className="text-[#00c853] text-[12px] font-mono font-bold">+4%</span>
//               </div>
//               <p className="text-[#c2c6d6] text-xs font-bold mb-1 truncate">Total Lots</p>
//               <h3 className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] truncate">{stats.totalParkingLots?.toLocaleString() || 0}</h3>
//             </div>

//             <div className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="w-10 h-10 rounded-lg bg-[#df7412]/20 text-[#ffb786] flex items-center justify-center shrink-0">
//                   <Activity size={20} />
//                 </div>
//                 <span className="text-[#ffb4ab] text-[12px] font-mono font-bold">-2%</span>
//               </div>
//               <p className="text-[#c2c6d6] text-xs font-bold mb-1 truncate">Active Bookings</p>
//               <h3 className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] truncate">{stats.totalActiveBookings?.toLocaleString() || 0}</h3>
//             </div>

//             <div className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="w-10 h-10 rounded-lg bg-[#3131c0]/20 text-[#c0c1ff] flex items-center justify-center shrink-0">
//                   <DollarSign size={20} />
//                 </div>
//                 <span className="text-[#00c853] text-[12px] font-mono font-bold">+24%</span>
//               </div>
//               <p className="text-[#c2c6d6] text-xs font-bold mb-1 truncate">Monthly Revenue</p>
//               <h3 className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] truncate">{formatCurrency(stats.totalRevenueThisMonth || 0)}</h3>
//             </div>

//           </div>

//           {/* Main Layout Wrapper */}
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
            
//             {/* Left Col: Navigation Cards (Bento) */}
//             <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
              
//               <div onClick={() => navigate("/super-admin/lot-admins")} className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 flex flex-col justify-between hover:border-[#adc6ff]/50 transition-colors cursor-pointer group min-h-[160px]">
//                 <div className="w-12 h-12 rounded-lg bg-[#4d8eff]/20 text-[#adc6ff] flex items-center justify-center mb-4 shrink-0">
//                   <Shield size={24} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold text-[#dce2f7] mb-2 truncate">Lot Admins</h4>
//                   <span className="text-[#adc6ff] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
//                     Manage <ChevronRight size={16} />
//                   </span>
//                 </div>
//               </div>

//               <div onClick={() => navigate("/super-admin/car-owners")} className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 flex flex-col justify-between hover:border-[#c0c1ff]/50 transition-colors cursor-pointer group min-h-[160px]">
//                 <div className="w-12 h-12 rounded-lg bg-[#3131c0]/20 text-[#c0c1ff] flex items-center justify-center mb-4 shrink-0">
//                   <Car size={24} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold text-[#dce2f7] mb-2 truncate">Car Owners</h4>
//                   <span className="text-[#c0c1ff] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
//                     Manage <ChevronRight size={16} />
//                   </span>
//                 </div>
//               </div>

//               <div onClick={() => navigate("/super-admin/fleet-admins")} className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 flex flex-col justify-between hover:border-[#ffb786]/50 transition-colors cursor-pointer group min-h-[160px]">
//                 <div className="w-12 h-12 rounded-lg bg-[#df7412]/20 text-[#ffb786] flex items-center justify-center mb-4 shrink-0">
//                   <Truck size={24} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold text-[#dce2f7] mb-2 truncate">Fleet Admins</h4>
//                   <span className="text-[#ffb786] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
//                     Manage <ChevronRight size={16} />
//                   </span>
//                 </div>
//               </div>

//               <div onClick={() => navigate("/super-admin/promos")} className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 flex flex-col justify-between lg:col-span-1 hover:border-[#8c909f]/50 transition-colors cursor-pointer group min-h-[160px]">
//                 <div className="w-12 h-12 rounded-lg bg-[#424754]/50 text-[#8c909f] flex items-center justify-center mb-4 shrink-0">
//                   <Tag size={24} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold text-[#dce2f7] mb-2 truncate">Promo Codes</h4>
//                   <span className="text-[#8c909f] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
//                     Manage <ChevronRight size={16} />
//                   </span>
//                 </div>
//               </div>

//               {/* All Users spans 2 cols with glow effect */}
//               <div onClick={() => navigate("/super-admin/users")} className="bg-[#191f2f]/60 backdrop-blur-xl p-6 rounded-xl border border-[#424754]/30 flex flex-col justify-between sm:col-span-2 hover:border-[#adc6ff]/50 transition-colors cursor-pointer group relative overflow-hidden min-h-[160px]">
//                 <div className="w-12 h-12 rounded-lg bg-[#2e3545] text-[#adc6ff] flex items-center justify-center mb-4 z-10 shrink-0 border border-[#424754]/50">
//                   <Users size={24} />
//                 </div>
//                 <div className="z-10">
//                   <h4 className="text-xl font-bold text-[#dce2f7] mb-2 truncate">All Platform Users</h4>
//                   <span className="text-[#adc6ff] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
//                     Manage <ChevronRight size={16} />
//                   </span>
//                 </div>
//                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#adc6ff]/10 blur-[50px] rounded-full pointer-events-none"></div>
//               </div>

//             </div>

//             {/* Right Col: System Insights / Top Performers Timeline */}
//             <div className="lg:col-span-4 bg-[#191f2f]/60 backdrop-blur-xl border border-[#424754]/30 rounded-xl p-6 flex flex-col min-h-[400px]">
//               <div className="flex items-center justify-between mb-6">
//                 <h4 className="text-xl font-bold text-[#dce2f7]">System Insights</h4>
//                 <button className="text-[#c2c6d6] text-xs font-bold hover:text-[#adc6ff] transition-colors">Refresh</button>
//               </div>
              
//               <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                
//                 {stats.topParkingLots?.[0] && (
//                   <div className="flex gap-4">
//                     <div className="w-1 bg-[#adc6ff] rounded-full shrink-0"></div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-[#dce2f7] text-sm leading-snug">Top Earning Lot: <span className="font-bold">{stats.topParkingLots[0].lotName}</span> generated <span className="text-[#00c853] font-bold">{formatCurrency(stats.topParkingLots[0].revenue)}</span>.</p>
//                       <p className="text-[#c2c6d6] font-mono text-[10px] mt-1.5 uppercase">Performance Data</p>
//                     </div>
//                   </div>
//                 )}

//                 {stats.topValets?.[0] && (
//                   <div className="flex gap-4">
//                     <div className="w-1 bg-[#ffb786] rounded-full shrink-0"></div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-[#dce2f7] text-sm leading-snug">Valet Leader: <span className="font-bold">{stats.topValets[0].valetName}</span> completed <span className="font-bold text-[#ffb786]">{stats.topValets[0].jobsCompleted} jobs</span>.</p>
//                       <p className="text-[#c2c6d6] font-mono text-[10px] mt-1.5 uppercase">Performance Data</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-4">
//                   <div className="w-1 bg-[#c0c1ff] rounded-full shrink-0"></div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[#dce2f7] text-sm leading-snug">Capacity Alert: <span className="font-bold">{stats.occupiedSlots?.toLocaleString()}</span> parking slots currently occupied globally.</p>
//                     <p className="text-[#c2c6d6] font-mono text-[10px] mt-1.5 uppercase">Live Infrastructure</p>
//                   </div>
//                 </div>

//                 <div className="flex gap-4">
//                   <div className="w-1 bg-[#ffb4ab] rounded-full shrink-0"></div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[#dce2f7] text-sm leading-snug">Valet Activity: <span className="font-bold">{stats.activeValets}</span> valets are currently active and handling requests.</p>
//                     <p className="text-[#c2c6d6] font-mono text-[10px] mt-1.5 uppercase">Live Workforce</p>
//                   </div>
//                 </div>

//               </div>
//             </div>

//           </div>
//         </>
//       )}

//       {/* Global Map Preview Section */}
//       <section className="mt-8 relative h-[350px] sm:h-[400px] rounded-2xl overflow-hidden bg-[#191f2f]/60 backdrop-blur-xl border border-[#424754]/30 shadow-lg">
//         {/* Subtle grid/map graphic representation */}
//         <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#424754 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
//         <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent z-10 pointer-events-none"></div>
        
//         <div className="relative z-20 p-6 sm:p-10 h-full flex flex-col justify-end pointer-events-none">
//           <div className="max-w-md pointer-events-auto">
//             <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#adc6ff]/10 border border-[#adc6ff]/20 text-[#adc6ff] font-bold text-[10px] sm:text-xs mb-3 sm:mb-4 whitespace-nowrap">
//               <span className="w-2 h-2 rounded-full bg-[#adc6ff] animate-pulse"></span>
//               Live Infrastructure Pulse
//             </span>
//             <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#dce2f7] mb-2 sm:mb-3">Real-time Global Network</h3>
//             <p className="text-[#c2c6d6] text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
//               Monitoring {stats?.totalParkingLots || 0} integrated parking complexes. Total network processing volume at peak efficiency.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//               <button className="bg-[#adc6ff] text-[#002e6a] font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-[#adc6ff]/90 w-full sm:w-auto">
//                 <Map size={18} /> Enter Live Map
//               </button>
//               <button className="border border-[#424754] bg-[#191f2f]/80 text-[#dce2f7] font-bold px-6 py-3.5 rounded-xl hover:bg-[#2e3545] transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
//                 <Globe size={18} /> Network Status
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//     </div>
//   );
// };

// export default SuperAdminDashboard;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import {
  Shield, Users, ParkingSquare, Car, Truck, Tag,
  DollarSign, ChevronRight, Activity
} from "lucide-react";

const SuperAdminDashboard = () => {
  const navigate                = useNavigate();
  const [stats,   setStats]     = useState(null);
  const [loading, setL]         = useState(true);

  useEffect(() => {
    axiosInstance.get("/api/super-admin/platform-stats")
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setL(false));
  }, []);

  const adminActions = [
    { icon: Shield,        label: "Lot Admins",   to: "/super-admin/lot-admins",   color: "from-blue-500 to-indigo-600",   colSpan: "col-span-1" },
    { icon: Car,           label: "Car Owners",   to: "/super-admin/car-owners",   color: "from-emerald-400 to-teal-600",  colSpan: "col-span-1" },
    { icon: Truck,         label: "Fleet Admins", to: "/super-admin/fleet-admins", color: "from-amber-400 to-orange-500",  colSpan: "col-span-1" },
    { icon: Tag,           label: "Promo Codes",  to: "/super-admin/promos",       color: "from-rose-400 to-pink-600",     colSpan: "col-span-1 lg:col-span-1" },
    { icon: Users,         label: "All Users",    to: "/super-admin/users",        color: "from-violet-500 to-purple-600", colSpan: "col-span-1 sm:col-span-2" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[40%] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-400/8 blur-[80px] rounded-full pointer-events-none"></div>
      
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 animate-card">
        <div>
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-md">Command Center</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 mt-2">
            Platform <span className="text-indigo-600">Overview</span>
          </h1>
        </div>
      </header>

      {!stats ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between animate-card relative z-10">
          <span className="text-red-700 font-black text-sm">Platform stats unavailable. Check backend connectivity.</span>
          <button onClick={() => window.location.reload()} className="text-red-700 font-black text-sm hover:underline">Retry</button>
        </div>
      ) : (
        <>
          {/* Top 4 Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
            {[
              { label: "Total Users",     val: stats.totalUsers?.toLocaleString() || 0,       icon: Users,         color: "from-blue-500 to-indigo-600",   trend: "+12%", trendColor: "text-emerald-500", delay: "0s" },
              { label: "Total Lots",      val: stats.totalParkingLots?.toLocaleString() || 0, icon: ParkingSquare, color: "from-emerald-400 to-teal-600",  trend: "+4%",  trendColor: "text-emerald-500", delay: "0.1s" },
              { label: "Active Bookings", val: stats.totalActiveBookings?.toLocaleString()||0,icon: Activity,      color: "from-amber-400 to-orange-500",  trend: "-2%",  trendColor: "text-rose-500",    delay: "0.2s" },
              { label: "Monthly Revenue", val: formatCurrency(stats.totalRevenueThisMonth||0),icon: DollarSign,    color: "from-violet-500 to-purple-600", trend: "+24%", trendColor: "text-emerald-500", delay: "0.3s" },
            ].map((item, i) => (
              <div key={i} className="animate-card bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all flex flex-col justify-between" style={{ animationDelay: item.delay }}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg`}>
                    <item.icon size={20} />
                  </div>
                  <span className={`${item.trendColor} text-[10px] font-black bg-slate-50 px-2 py-1 rounded-md shadow-sm`}>{item.trend}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{item.val}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Main Layout Wrapper */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left Col: Navigation Bento */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-card" style={{ animationDelay: "0.4s" }}>
              {adminActions.map((action, idx) => (
                <button key={idx} onClick={() => navigate(action.to)}
                  className={`bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-xl transition-all cursor-pointer text-left group min-h-[160px] ${action.colSpan}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <action.icon size={20} />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-black text-slate-900 mb-1">{action.label}</h4>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                      Manage <ChevronRight size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Col: System Insights */}
            <div className="lg:col-span-4 bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-6 sm:p-8 shadow-lg flex flex-col min-h-[400px] animate-card" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-black text-slate-900">System Insights</h4>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Refresh</button>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                
                {stats.topParkingLots?.[0] && (
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="w-1.5 h-auto bg-indigo-400 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Top Earning Lot</p>
                      <p className="font-black text-slate-900 text-sm leading-snug">{stats.topParkingLots[0].lotName}</p>
                      <p className="text-sm font-black text-emerald-600 mt-1">{formatCurrency(stats.topParkingLots[0].revenue)}</p>
                    </div>
                  </div>
                )}

                {stats.topValets?.[0] && (
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="w-1.5 h-auto bg-amber-400 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Valet Leader</p>
                      <p className="font-black text-slate-900 text-sm leading-snug">{stats.topValets[0].valetName}</p>
                      <p className="text-sm font-black text-amber-600 mt-1">{stats.topValets[0].jobsCompleted} jobs completed</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-1.5 h-auto bg-violet-400 rounded-full shrink-0"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Capacity Alert</p>
                    <p className="font-black text-slate-900 text-sm leading-snug">{stats.occupiedSlots?.toLocaleString()} spots</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Currently occupied globally</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-1.5 h-auto bg-rose-400 rounded-full shrink-0"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Valet Activity</p>
                    <p className="font-black text-slate-900 text-sm leading-snug">{stats.activeValets} active valets</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Handling requests right now</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;