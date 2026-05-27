// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from "../../api/axiosInstance";
// import { formatCurrency } from "../../utils/formatters";
// import { Briefcase, DollarSign, Star, Clock, TrendingUp, ChevronRight } from "lucide-react";

// const ValetDashboard = () => {
//   const { user }    = useAuth();
//   const navigate    = useNavigate();
//   const [earnings, setEarnings] = useState(null);
//   const [avg, setAvg]           = useState(null);
//   const [activeJob, setActive]  = useState(null);
//   const [loading, setL]         = useState(true);

//   useEffect(() => {
//     if (!user?.id) return;
//     Promise.all([
//       axiosInstance.get(`/api/valet/earnings/${user.id}`).then((r) => r.data).catch(() => null),
//       axiosInstance.get(`/api/feedback/valet/${user.id}/average`).then((r) => r.data).catch(() => null),
//       // FIX: was /api/valet/jobs/active (didn't exist) — now correct endpoint + handles 204 no content
//       axiosInstance.get(`/api/valet/jobs/active`, { params: { valetId: user.id } })
//         .then((r) => r.status === 204 ? null : r.data)
//         .catch(() => null),
//     ]).then(([e, a, job]) => {
//       setEarnings(e);
//       setAvg(a);
//       setActive(job);
//     }).finally(() => setL(false));
//   }, [user]);

//   const quickActions = [
//     { icon: Briefcase,  label: "Available Jobs", sub: "Browse open jobs",     to: "/valet/jobs",     color: "bg-blue-50 text-blue-600" },
//     { icon: DollarSign, label: "My Earnings",    sub: "View your income",     to: "/valet/earnings", color: "bg-green-50 text-green-600" },
//     { icon: Star,       label: "My Ratings",     sub: "See customer reviews", to: "/valet/ratings",  color: "bg-amber-50 text-amber-600" },
//     { icon: Clock,      label: "Active Job",     sub: "Continue a job",       to: activeJob ? `/valet/job/${activeJob.id}` : "/valet/jobs", color: "bg-purple-50 text-purple-600" },
//   ];

//   return (
//     <div className="page-container space-y-8">

//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-gray-900">
//             Welcome, <span className="text-sp-blue">{user?.name?.split(" ")[0]}</span> 👋
//           </h1>
//           <p className="text-gray-500 text-sm mt-1">Ready to take on jobs today?</p>
//         </div>
//         <button onClick={() => navigate("/valet/jobs")} className="btn-primary flex items-center gap-2 text-sm">
//           Browse Jobs <ChevronRight size={14} />
//         </button>
//       </div>

//       {/* Active job banner */}
//       {!loading && activeJob && (
//         <div
//           onClick={() => navigate(`/valet/job/${activeJob.id}`)}
//           className="bg-sp-dark rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity"
//         >
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-sp-blue/20 rounded-xl flex items-center justify-center">
//               <Briefcase size={18} className="text-sp-blue" />
//             </div>
//             <div>
//               <p className="text-white font-semibold text-sm">Active Job in Progress</p>
//               <p className="text-gray-400 text-xs mt-0.5">Request #{activeJob.id} · {activeJob.status}</p>
//             </div>
//           </div>
//           <ChevronRight size={18} className="text-white flex-shrink-0" />
//         </div>
//       )}

//       {/* Stats */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         {[
//           { label: "Today's Earnings", value: loading ? "—" : formatCurrency(earnings?.totalEarningsToday || 0),    icon: DollarSign, color: "text-sp-blue",    bg: "bg-sp-blue/10" },
//           { label: "This Month",       value: loading ? "—" : formatCurrency(earnings?.totalEarningsThisMonth || 0), icon: TrendingUp, color: "text-green-600",  bg: "bg-green-50" },
//           { label: "Jobs Completed",   value: loading ? "—" : (earnings?.totalJobsCompleted || 0),                   icon: Briefcase,  color: "text-amber-600",  bg: "bg-amber-50" },
//           { label: "Avg Rating",       value: loading ? "—" : avg != null ? `${Number(avg).toFixed(1)} ⭐` : "No ratings", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
//         ].map(({ label, value, icon: Icon, color, bg }) => (
//           <div key={label} className="stat-card">
//             <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
//               <Icon size={18} className={color} />
//             </div>
//             <div>
//               <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
//               <div className="text-xs text-gray-500 mt-0.5">{label}</div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Actions */}
//       <div>
//         <h2 className="section-title mb-4">Quick Actions</h2>
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {quickActions.map(({ icon: Icon, label, sub, to, color }) => (
//             <button key={label} onClick={() => navigate(to)}
//               className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group active:scale-[0.97]">
//               <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
//                 <Icon size={18} />
//               </div>
//               <div className="font-semibold text-gray-900 text-sm">{label}</div>
//               <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Unpaid earnings callout */}
//       {!loading && earnings?.totalUnpaidEarnings > 0 && (
//         <div onClick={() => navigate("/valet/earnings")}
//           className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100 transition-colors">
//           <div className="flex items-center gap-3">
//             <DollarSign size={18} className="text-amber-600 flex-shrink-0" />
//             <div>
//               <p className="font-semibold text-amber-800 text-sm">Unpaid Balance</p>
//               <p className="text-amber-700 font-bold">{formatCurrency(earnings.totalUnpaidEarnings)}</p>
//             </div>
//           </div>
//           <span className="text-xs text-amber-700 font-semibold">Request Payout →</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ValetDashboard;



// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from "../../api/axiosInstance";
// import { formatCurrency } from "../../utils/formatters";
// import { Briefcase, DollarSign, Star, Clock, TrendingUp, ChevronRight, ArrowRight, Zap } from "lucide-react";

// const ValetDashboard = () => {
//   const { user }                  = useAuth();
//   const navigate                  = useNavigate();
//   const [earnings,  setEarnings]  = useState(null);
//   const [avg,       setAvg]       = useState(null);
//   const [activeJob, setActive]    = useState(null);
//   const [loading,   setL]         = useState(true);

//   useEffect(() => {
//     if (!user?.id) return;
//     Promise.all([
//       axiosInstance.get(`/api/valet/earnings/${user.id}`).then((r) => r.data).catch(() => null),
//       axiosInstance.get(`/api/feedback/valet/${user.id}/average`).then((r) => r.data).catch(() => null),
//       axiosInstance.get(`/api/valet/jobs/active`, { params: { valetId: user.id } })
//         .then((r) => r.status === 204 ? null : r.data)
//         .catch(() => null),
//     ]).then(([e, a, job]) => {
//       setEarnings(e);
//       setAvg(a);
//       setActive(job);
//     }).finally(() => setL(false));
//   }, [user]);

//   const quickActions = [
//     { icon: Briefcase,  label: "Available Jobs", sub: "Browse open jobs",     to: "/valet/jobs",     color: "from-rose-400 to-pink-600" },
//     { icon: DollarSign, label: "My Earnings",    sub: "View your income",     to: "/valet/earnings", color: "from-emerald-400 to-teal-600" },
//     { icon: Star,       label: "My Ratings",     sub: "See customer reviews", to: "/valet/ratings",  color: "from-amber-400 to-orange-500" },
//     { icon: Clock,      label: "Active Job",     sub: "Continue a job",       to: activeJob ? `/valet/job/${activeJob.id}` : "/valet/jobs", color: "from-violet-500 to-purple-600" },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
//         <div className="relative w-12 h-12">
//           <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full"></div>
//           <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f0f4f8] text-slate-900 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden font-sans">
//       <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-rose-400/10 blur-[100px] rounded-full pointer-events-none"></div>
//       <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-pink-400/8 blur-[80px] rounded-full pointer-events-none"></div>
//       <style>{`
//         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-card { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
//       `}</style>

//       {/* Header */}
//       <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 animate-card">
//         <div>
//           <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-md">Valet Services</span>
//           <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 mt-2">
//             Welcome, <span className="text-rose-500">{user?.name?.split(" ")[0]}</span> 👋
//           </h1>
//         </div>
//         <button onClick={() => navigate("/valet/jobs")}
//           className="w-full md:w-auto px-6 py-4 bg-slate-900 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3">
//           <Briefcase size={18} className="text-rose-400" />
//           <span>Browse Jobs</span>
//         </button>
//       </header>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
//         {[
//           { label: "Today's Earnings", val: formatCurrency(earnings?.totalEarningsToday || 0),    icon: DollarSign, color: "from-rose-400 to-pink-600",     delay: "0s" },
//           { label: "This Month",       val: formatCurrency(earnings?.totalEarningsThisMonth || 0), icon: TrendingUp, color: "from-emerald-400 to-teal-600",  delay: "0.1s" },
//           { label: "Jobs Completed",   val: earnings?.totalJobsCompleted || 0,                     icon: Briefcase,  color: "from-amber-400 to-orange-500",  delay: "0.2s" },
//           { label: "Avg Rating",       val: avg != null ? `${Number(avg).toFixed(1)} ⭐` : "—",   icon: Star,       color: "from-violet-500 to-purple-600",  delay: "0.3s" },
//         ].map((item, i) => (
//           <div key={i} className="animate-card bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all" style={{ animationDelay: item.delay }}>
//             <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
//               <item.icon size={20} />
//             </div>
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
//             <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{item.val}</h3>
//           </div>
//         ))}
//       </div>

//       {/* Active Job Banner */}
//       {activeJob && (
//         <div onClick={() => navigate(`/valet/job/${activeJob.id}`)}
//           className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-all shadow-xl mb-8 relative z-10 animate-card overflow-hidden"
//           style={{ animationDelay: "0.4s" }}>
//           <Briefcase size={140} className="absolute -right-6 -bottom-4 text-slate-700/30 pointer-events-none" />
//           <div className="flex items-center gap-4 relative z-10">
//             <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
//               <Briefcase size={20} className="text-rose-400" />
//             </div>
//             <div>
//               <p className="text-white font-black">Active Job In Progress</p>
//               <p className="text-slate-400 text-xs font-bold mt-0.5">Request #{activeJob.id} · {activeJob.status}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 text-white font-black text-sm relative z-10 flex-shrink-0">
//             View Job <ChevronRight size={18} />
//           </div>
//         </div>
//       )}

//       {/* Bento: Jobs CTA + Quick Actions */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 relative z-10">

//         {/* Browse Jobs Hero */}
//         <div className="lg:col-span-8 animate-card" style={{ animationDelay: "0.4s" }}>
//           <div onClick={() => navigate("/valet/jobs")}
//             className="relative bg-white/80 backdrop-blur-md border border-white rounded-[2.5rem] p-6 sm:p-10 overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group min-h-[200px] flex flex-col justify-between">
//             <Briefcase size={200} className="absolute -bottom-8 -right-8 text-slate-100 group-hover:text-rose-100 transition-colors pointer-events-none" />
//             <div className="relative z-10">
//               <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/25">
//                 <Briefcase size={22} />
//               </div>
//               <h4 className="text-2xl font-black text-slate-900 mb-2">Available Jobs</h4>
//               <p className="text-slate-500 text-sm max-w-sm">
//                 Browse open valet requests in your area. Every job you complete builds your rating and earnings.
//               </p>
//             </div>
//             <div className="flex items-center gap-2 font-black text-rose-500 relative z-10 mt-4">
//               Find Jobs Now <ArrowRight size={18} />
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="lg:col-span-4 flex flex-col gap-4 animate-card" style={{ animationDelay: "0.5s" }}>
//           {quickActions.slice(0, 3).map(({ icon: Icon, label, sub, to, color }) => (
//             <button key={label} onClick={() => navigate(to)}
//               className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-5 flex items-center gap-4 hover:shadow-xl transition-all cursor-pointer text-left group">
//               <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
//                 <Icon size={19} />
//               </div>
//               <div>
//                 <p className="font-black text-slate-900 text-sm">{label}</p>
//                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{sub}</p>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Unpaid Earnings Callout */}
//       {earnings?.totalUnpaidEarnings > 0 && (
//         <div onClick={() => navigate("/valet/earnings")}
//           className="bg-white/80 backdrop-blur-md border border-amber-200 rounded-[2rem] p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:shadow-xl transition-all shadow-lg relative z-10 animate-card"
//           style={{ animationDelay: "0.6s" }}>
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
//               <DollarSign size={20} className="text-white" />
//             </div>
//             <div>
//               <p className="font-black text-slate-900">Unpaid Balance</p>
//               <p className="font-black text-amber-600 text-lg">{formatCurrency(earnings.totalUnpaidEarnings)}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 font-black text-amber-600 text-sm flex-shrink-0">
//             Request Payout <ChevronRight size={16} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ValetDashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { Briefcase, DollarSign, Star, Clock, TrendingUp, ChevronRight, ArrowRight, Zap, Power } from "lucide-react";

const ValetDashboard = () => {
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const [earnings,  setEarnings]  = useState(null);
  const [avg,       setAvg]       = useState(null);
  const [activeJob, setActive]    = useState(null);
  const [loading,   setL]         = useState(true);
  
  // --- NEW: Live Status & Location Tracking ---
  const [isOnline, setIsOnline]   = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      axiosInstance.get(`/api/valet/earnings/${user.id}`).then((r) => r.data).catch(() => null),
      axiosInstance.get(`/api/feedback/valet/${user.id}/average`).then((r) => r.data).catch(() => null),
      axiosInstance.get(`/api/valet/jobs/active`, { params: { valetId: user.id } })
        .then((r) => r.status === 204 ? null : r.data)
        .catch(() => null),
      // Optional: Fetch current online status from DB if you have an endpoint for it
      // axiosInstance.get(`/api/valet/${user.id}/status`).then(r => setIsOnline(r.data.isAvailableNow))
    ]).then(([e, a, job]) => {
      setEarnings(e);
      setAvg(a);
      setActive(job);
    }).finally(() => setL(false));
  }, [user]);

  // --- NEW: Handle Online/Offline Toggle ---
  const toggleOnlineStatus = async () => {
    const newState = !isOnline;
    setIsOnline(newState);
    
    try {
      // ⚠️ UPDATE THIS URL to match your Spring Boot Valet Controller endpoint
      await axiosInstance.put(`/api/valet/${user.id}/status`, null, {
        params: { isAvailable: newState }
      });
      toast.success(newState ? "You are now ONLINE and visible to customers" : "You are now OFFLINE");
    } catch (err) {
      toast.error("Failed to update status");
      setIsOnline(!newState); // revert on failure
    }
  };

  // --- NEW: Continuously track and send location while ONLINE ---
  useEffect(() => {
    if (!isOnline || !user?.id) return;

    // Start watching the valet's GPS position
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // Ping backend with new coordinates
        // ⚠️ UPDATE THIS URL to match your Spring Boot Valet Controller endpoint
        axiosInstance.post(`/api/valet/location`, {
          valetId: user.id,
          latitude: latitude,
          longitude: longitude,
          available: isOnline
        }).catch((err) => console.error("Failed to sync location", err));
      },
      (err) => {
        console.error("GPS Error:", err);
        toast.error("Please enable GPS permissions to stay online.");
        setIsOnline(false); // Force offline if GPS fails
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 5000, 
        timeout: 10000 
      }
    );

    // Stop tracking when component unmounts or valet goes offline
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, user]);

  const quickActions = [
    { icon: Briefcase,  label: "Available Jobs", sub: "Browse open jobs",     to: "/valet/jobs",     color: "from-rose-400 to-pink-600" },
    { icon: DollarSign, label: "My Earnings",    sub: "View your income",     to: "/valet/earnings", color: "from-emerald-400 to-teal-600" },
    { icon: Star,       label: "My Ratings",     sub: "See customer reviews", to: "/valet/ratings",  color: "from-amber-400 to-orange-500" },
    { icon: Clock,      label: "Active Job",     sub: "Continue a job",       to: activeJob ? `/valet/job/${activeJob.id}` : "/valet/jobs", color: "from-violet-500 to-purple-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden font-sans">
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-rose-400/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-pink-400/8 blur-[80px] rounded-full pointer-events-none"></div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 animate-card">
        <div>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900">
              Welcome, <span className="text-rose-500">{user?.name?.split(" ")[0]}</span> 👋
            </h1>
          </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          {/* Online/Offline Toggle Button */}
          <button 
            onClick={toggleOnlineStatus}
            className={`w-full sm:w-auto px-6 py-4 font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 ${
              isOnline 
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30" 
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            <Power size={18} className={isOnline ? "animate-pulse" : ""} />
            <span>{isOnline ? "YOU ARE ONLINE" : "GO ONLINE"}</span>
          </button>

          <button onClick={() => navigate("/valet/jobs")}
            className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3">
            <Briefcase size={18} className="text-rose-400" />
            <span>Browse Jobs</span>
          </button>
        </div>
      </header>

      {/* Active Job Banner */}
      {activeJob && (
        <div onClick={() => navigate(`/valet/job/${activeJob.id}`)}
          className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-all shadow-xl mb-8 relative z-10 animate-card overflow-hidden"
          style={{ animationDelay: "0.1s" }}>
          <Briefcase size={140} className="absolute -right-6 -bottom-4 text-slate-700/30 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Briefcase size={20} className="text-rose-400" />
            </div>
            <div>
              <p className="text-white font-black">Active Job In Progress</p>
              <p className="text-slate-400 text-xs font-bold mt-0.5">Request #{activeJob.id} · {activeJob.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white font-black text-sm relative z-10 flex-shrink-0">
            View Job <ChevronRight size={18} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
        {[
          { label: "Today's Earnings", val: formatCurrency(earnings?.totalEarningsToday || 0),    icon: DollarSign, color: "from-rose-400 to-pink-600",     delay: "0.2s" },
          { label: "This Month",       val: formatCurrency(earnings?.totalEarningsThisMonth || 0), icon: TrendingUp, color: "from-emerald-400 to-teal-600",  delay: "0.3s" },
          { label: "Jobs Completed",   val: earnings?.totalJobsCompleted || 0,                     icon: Briefcase,  color: "from-amber-400 to-orange-500",  delay: "0.4s" },
          { label: "Avg Rating",       val: avg != null ? `${Number(avg).toFixed(1)} ⭐` : "—",   icon: Star,       color: "from-violet-500 to-purple-600",  delay: "0.5s" },
        ].map((item, i) => (
          <div key={i} className="animate-card bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all" style={{ animationDelay: item.delay }}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* Bento: Jobs CTA + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 relative z-10">

        {/* Browse Jobs Hero */}
        <div className="lg:col-span-8 animate-card" style={{ animationDelay: "0.6s" }}>
          <div onClick={() => navigate("/valet/jobs")}
            className="relative bg-white/80 backdrop-blur-md border border-white rounded-[2.5rem] p-6 sm:p-10 overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group min-h-[200px] flex flex-col justify-between">
            <Briefcase size={200} className="absolute -bottom-8 -right-8 text-slate-100 group-hover:text-rose-100 transition-colors pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/25">
                <Briefcase size={22} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">Available Jobs</h4>
              <p className="text-slate-500 text-sm max-w-sm">
                Browse open valet requests in your area. Every job you complete builds your rating and earnings.
              </p>
            </div>
            <div className="flex items-center gap-2 font-black text-rose-500 relative z-10 mt-4">
              Find Jobs Now <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4 animate-card" style={{ animationDelay: "0.7s" }}>
          {quickActions.slice(0, 3).map(({ icon: Icon, label, sub, to, color }) => (
            <button key={label} onClick={() => navigate(to)}
              className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-5 flex items-center gap-4 hover:shadow-xl transition-all cursor-pointer text-left group">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={19} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{label}</p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ValetDashboard;