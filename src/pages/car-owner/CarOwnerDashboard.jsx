// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from "../../api/axiosInstance";
// import { formatCurrency } from "../../utils/formatters";
// import { Car, Key, ClipboardList, TrendingUp, DollarSign, Clock } from "lucide-react";

// const CarOwnerDashboard = () => {
//   const { user }      = useAuth();
//   const navigate      = useNavigate();
//   const [cars, setCars]       = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading]   = useState(true);

//   useEffect(() => {
//     if (!user?.id) return;
//     Promise.all([
//       axiosInstance.get(`/api/rental-cars/owner/${user.id}`).then((r) => r.data || []).catch(() => []),
//       axiosInstance.get(`/api/rental-cars/owner/${user.id}/bookings`).then((r) => r.data || []).catch(() => []),
//     ]).then(([c, b]) => {
//       setCars(c);
//       setBookings(b);
//     }).finally(() => setLoading(false));
//   }, [user]);

//   const available = cars.filter((c) => c.status === "AVAILABLE").length;
//   const rented    = cars.filter((c) => c.status === "RENTED").length;
//   const earned    = bookings
//     .filter((b) => b.status === "COMPLETED")
//     .reduce((s, b) => s + (b.totalAmount || 0), 0);

//   const quickActions = [
//     { icon: Car,          label: "My Cars",         sub: "View & manage",     to: "/car-owner/cars",          color: "bg-blue-50 text-blue-600" },
//     { icon: Key,          label: "Add Car",          sub: "List a new car",    to: "/car-owner/cars?add=1",    color: "bg-green-50 text-green-600" },
//     { icon: ClipboardList,label: "Rental Bookings",  sub: "Booking history",   to: "/car-owner/bookings",      color: "bg-amber-50 text-amber-600" },
//   ];

//   return (
//     <div className="page-container space-y-8">

//       {/* Welcome */}
//       <div>
//         <h1 className="font-display text-2xl font-bold text-gray-900">
//           Car Owner Dashboard
//         </h1>
//         <p className="text-gray-500 text-sm mt-1">
//           Welcome back, <span className="font-medium text-gray-700">{user?.name?.split(" ")[0]}</span> 🚗
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         {[
//           { label: "Total Cars",       value: loading ? "—" : cars.length,   icon: Car,         color: "text-sp-blue",    bg: "bg-sp-blue/10" },
//           { label: "Available",        value: loading ? "—" : available,      icon: TrendingUp,  color: "text-green-600",  bg: "bg-green-50" },
//           { label: "Currently Rented", value: loading ? "—" : rented,         icon: Clock,       color: "text-amber-600",  bg: "bg-amber-50" },
//           { label: "Total Earned",     value: loading ? "—" : formatCurrency(earned), icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
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
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//           {quickActions.map(({ icon: Icon, label, sub, to, color }) => (
//             <button
//               key={label}
//               onClick={() => navigate(to)}
//               className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group active:scale-[0.97]"
//             >
//               <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
//                 <Icon size={18} />
//               </div>
//               <div className="font-semibold text-gray-900 text-sm">{label}</div>
//               <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Recent bookings */}
//       {!loading && bookings.length > 0 && (
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="section-title">Recent Bookings</h2>
//             <button onClick={() => navigate("/car-owner/bookings")} className="text-xs text-sp-blue font-semibold hover:underline">
//               View all →
//             </button>
//           </div>
//           <div className="space-y-2">
//             {bookings.slice(0, 4).map((b) => (
//               <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
//                     <Car size={15} className="text-cyan-600" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">
//                       {b.rentalCar?.make} {b.rentalCar?.model}
//                     </p>
//                     <p className="text-xs text-gray-400">{b.customerName ?? `Customer #${b.customerId}`}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   {b.totalAmount != null && (
//                     <p className="text-sm font-bold text-sp-blue">{formatCurrency(b.totalAmount)}</p>
//                   )}
//                   <span className={`badge text-xs ${
//                     b.status === "ACTIVE"    ? "bg-green-100 text-green-700"  :
//                     b.status === "COMPLETED" ? "bg-gray-100 text-gray-600"    :
//                     b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700":
//                     "bg-gray-100 text-gray-600"
//                   }`}>{b.status}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Empty state */}
//       {!loading && cars.length === 0 && (
//         <div className="card text-center py-14">
//           <Car size={36} className="mx-auto text-gray-300 mb-3" />
//           <p className="text-gray-500 font-medium">No cars listed yet</p>
//           <p className="text-gray-400 text-xs mt-1">Add your first car to start earning</p>
//           <button onClick={() => navigate("/car-owner/cars?add=1")} className="btn-primary mt-4 text-xs">
//             List a Car
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CarOwnerDashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import { Car, Key, ClipboardList, TrendingUp, DollarSign, Clock, ArrowRight } from "lucide-react";

const CarOwnerDashboard = () => {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [cars,     setCars]         = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [loading,  setLoading]      = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      axiosInstance.get(`/api/rental-cars/owner/${user.id}`).then((r) => r.data || []).catch(() => []),
      axiosInstance.get(`/api/rental-cars/owner/${user.id}/bookings`).then((r) => r.data || []).catch(() => []),
    ]).then(([c, b]) => {
      setCars(c);
      setBookings(b);
    }).finally(() => setLoading(false));
  }, [user]);

  const available = cars.filter((c) => c.status === "AVAILABLE").length;
  const rented    = cars.filter((c) => c.status === "RENTED").length;
  const earned    = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  const quickActions = [
    { icon: Car,          label: "My Cars",        sub: "View & manage",   to: "/car-owner/cars",        color: "from-indigo-500 to-violet-600" },
    { icon: Key,          label: "Add Car",         sub: "List a new car",  to: "/car-owner/cars?add=1",  color: "from-emerald-400 to-teal-600" },
    { icon: ClipboardList,label: "Rental Bookings", sub: "Booking history", to: "/car-owner/bookings",    color: "from-amber-400 to-orange-500" },
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
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-violet-400/8 blur-[80px] rounded-full pointer-events-none"></div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 animate-card">
        <div>
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-md">Owner Hub</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 mt-2">
            Welcome, <span className="text-indigo-600">{user?.name?.split(" ")[0]}</span> 🚗
          </h1>
        </div>
        <button onClick={() => navigate("/car-owner/cars?add=1")}
          className="w-full md:w-auto px-6 py-4 bg-slate-900 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3">
          <Key size={18} className="text-indigo-400" />
          <span>List a Car</span>
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
        {[
          { label: "Total Cars",       val: cars.length,            icon: Car,        color: "from-indigo-500 to-violet-600", delay: "0s" },
          { label: "Available",        val: available,              icon: TrendingUp, color: "from-emerald-400 to-teal-600", delay: "0.1s" },
          { label: "Currently Rented", val: rented,                 icon: Clock,      color: "from-amber-400 to-orange-500", delay: "0.2s" },
          { label: "Total Earned",     val: formatCurrency(earned), icon: DollarSign, color: "from-violet-500 to-purple-600",delay: "0.3s" },
        ].map((item, i) => (
          <div key={i} className="animate-card bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-lg hover:shadow-xl transition-all" style={{ animationDelay: item.delay }}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{item.val || 0}</h3>
          </div>
        ))}
      </div>

      {/* Bento: Hero Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 relative z-10">

        {/* Hero: My Cars CTA */}
        <div className="lg:col-span-8 animate-card" style={{ animationDelay: "0.4s" }}>
          <div onClick={() => navigate("/car-owner/cars")}
            className="relative bg-white/80 backdrop-blur-md border border-white rounded-[2.5rem] p-6 sm:p-10 overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group min-h-[220px] flex flex-col justify-between">
            <Car size={200} className="absolute -bottom-8 -right-8 text-slate-100 group-hover:text-indigo-100 transition-colors pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                <Car size={22} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">My Cars</h4>
              <p className="text-slate-500 text-sm max-w-sm">
                You have <span className="font-black text-slate-900">{cars.length}</span> {cars.length === 1 ? "car" : "cars"} listed.
                {available > 0 && <span> <span className="font-black text-emerald-600">{available} available</span> for rental.</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 font-black text-indigo-600 relative z-10 mt-4">
              Manage Fleet <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4 animate-card" style={{ animationDelay: "0.5s" }}>
          {quickActions.map(({ icon: Icon, label, sub, to, color }) => (
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

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-lg overflow-hidden relative z-10 animate-card" style={{ animationDelay: "0.6s" }}>
          <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Recent Bookings</h2>
            <button onClick={() => navigate("/car-owner/bookings")} className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">View All →</button>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="p-5 sm:p-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Car size={15} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{b.rentalCar?.make} {b.rentalCar?.model}</p>
                    <p className="text-xs text-slate-400">{b.customerName ?? `Customer #${b.customerId}`}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  {b.totalAmount != null && (
                    <p className="font-black text-indigo-600 text-sm">{formatCurrency(b.totalAmount)}</p>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : b.status === "COMPLETED" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {cars.length === 0 && (
        <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] shadow-lg p-14 text-center relative z-10 animate-card" style={{ animationDelay: "0.6s" }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Car size={28} />
          </div>
          <p className="font-black text-slate-900 text-lg mb-1">No cars listed yet</p>
          <p className="text-slate-400 text-sm mb-6">Add your first car to start earning</p>
          <button onClick={() => navigate("/car-owner/cars?add=1")}
            className="px-6 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2">
            <Key size={16} className="text-indigo-400" /> List a Car
          </button>
        </div>
      )}
    </div>
  );
};

export default CarOwnerDashboard;