// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { ROLES } from "../../utils/constants";
// import toast from "react-hot-toast";
// import {
//   LayoutDashboard, MapPin, CalendarCheck, Car, User,
//   Bell, LogOut, ParkingSquare, Users, Tag, BarChart2,
//   MessageSquare, Layers, Briefcase, DollarSign, Star,
//   ClipboardList, Shield, ChevronRight, Truck, Key
// } from "lucide-react";

// const NAV_BY_ROLE = {
//   [ROLES.CUSTOMER]: [
//     { to: "/customer/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/customer/find-parking", icon: MapPin,           label: "Find Parking" },
//     { to: "/customer/bookings",     icon: CalendarCheck,    label: "My Bookings" },
//     { to: "/customer/valet/request",icon: Car,              label: "Request Valet" },
//     { to: "/customer/rentals",      icon: Key,              label: "Rent a Car" },
//   ],
//   [ROLES.VALET]: [
//     { to: "/valet/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/valet/jobs",       icon: Briefcase,       label: "Available Jobs" },
//     { to: "/valet/earnings",   icon: DollarSign,      label: "My Earnings" },
//     { to: "/valet/ratings",    icon: Star,            label: "My Ratings" },
//   ],
//   [ROLES.PARKING_LOT_ADMIN]: [
//     { to: "/lot-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/lot-admin/lots",      icon: ParkingSquare,   label: "My Lots" },
//     { to: "/lot-admin/bookings",  icon: CalendarCheck,   label: "Bookings" },
//     { to: "/lot-admin/feedback",  icon: MessageSquare,   label: "Feedback" },
//   ],
//   [ROLES.SUPER_ADMIN]: [
//     { to: "/super-admin/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/super-admin/lot-admins",  icon: ParkingSquare,   label: "Lot Admins" },
//     { to: "/super-admin/car-owners",  icon: Car,             label: "Car Owners" },
//     { to: "/super-admin/fleet-admins",icon: Truck,           label: "Fleet Admins" },
//     { to: "/super-admin/promos",      icon: Tag,             label: "Promo Codes" },
//     { to: "/super-admin/users",       icon: Users,           label: "All Users" },
//   ],
//   [ROLES.FLEET_ADMIN]: [
//     { to: "/fleet-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/fleet-admin/fleet",     icon: Truck,           label: "My Fleet" },
//     { to: "/fleet-admin/add-car",   icon: Car,             label: "Add Car" },
//     { to: "/fleet-admin/bookings",  icon: ClipboardList,   label: "Rental Bookings" },
//   ],
//   [ROLES.CAR_OWNER]: [
//     { to: "/car-owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/car-owner/cars",      icon: Car,             label: "My Cars" },
//     { to: "/car-owner/add-car",   icon: Key,             label: "Add Car" },
//     { to: "/car-owner/bookings",  icon: ClipboardList,   label: "Rental Bookings" },
//   ],
// };

// const ROLE_LABEL = {
//   [ROLES.CUSTOMER]:          { label: "Customer",     color: "bg-blue-500/10 text-blue-400" },
//   [ROLES.VALET]:             { label: "Valet Driver", color: "bg-emerald-500/10 text-emerald-400" },
//   [ROLES.PARKING_LOT_ADMIN]: { label: "Lot Admin",    color: "bg-amber-500/10 text-amber-400" },
//   [ROLES.SUPER_ADMIN]:       { label: "Super Admin",  color: "bg-red-500/10 text-red-400" },
//   [ROLES.FLEET_ADMIN]:       { label: "Fleet Admin",  color: "bg-purple-500/10 text-purple-400" },
//   [ROLES.CAR_OWNER]:         { label: "Car Owner",    color: "bg-cyan-500/10 text-cyan-400" },
// };

// const Sidebar = ({ onClose }) => {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const navItems         = NAV_BY_ROLE[user?.role] || [];
//   const roleInfo         = ROLE_LABEL[user?.role]  || { label: user?.role, color: "bg-gray-500/10 text-gray-400" };

//   const handleLogout = () => {
//     logout();
//     toast.success("Logged out");
//     navigate("/login");
//   };

//   return (
//     <aside className="flex flex-col h-full bg-sp-dark w-64 flex-shrink-0">
//       {/* Logo */}
//       <div className="px-5 py-5 border-b border-white/[0.06]">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 bg-sp-blue rounded-xl flex items-center justify-center shadow-lg shadow-sp-blue/30 flex-shrink-0">
//             <span className="text-white font-display font-bold">S</span>
//           </div>
//           <div>
//             <div className="font-display text-white font-bold text-base leading-none">SmartParking</div>
//             <div className="text-sp-muted text-[10px] mt-0.5">Management Platform</div>
//           </div>
//         </div>
//       </div>

//       {/* User */}
//       <div className="px-4 py-4 border-b border-white/[0.06]">
//         <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3">
//           <div className="w-9 h-9 rounded-xl bg-sp-blue/20 flex items-center justify-center flex-shrink-0">
//             <span className="text-sp-blue font-display font-bold text-sm">
//               {user?.name?.[0]?.toUpperCase() || "U"}
//             </span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
//             <div className={`text-xs font-medium px-1.5 py-0.5 rounded-full w-fit mt-0.5 ${roleInfo.color}`}>
//               {roleInfo.label}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
//         {navItems.map(({ to, icon: Icon, label }) => (
//           <NavLink key={to} to={to} onClick={onClose}
//             className={({ isActive }) =>
//               `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                 isActive
//                   ? "bg-sp-blue text-white shadow-lg shadow-sp-blue/20"
//                   : "text-sp-muted hover:text-white hover:bg-white/[0.06]"
//               }`
//             }>
//             {({ isActive }) => (
//               <>
//                 <Icon size={16} className="flex-shrink-0" />
//                 <span className="flex-1">{label}</span>
//                 {isActive && <ChevronRight size={14} className="opacity-60" />}
//               </>
//             )}
//           </NavLink>
//         ))}

//         {/* Shared links */}
//         <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-0.5">
//           <NavLink to="/profile" onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                 isActive ? "bg-white/10 text-white" : "text-sp-muted hover:text-white hover:bg-white/[0.06]"
//               }`}>
//             <User size={16} /> Profile
//           </NavLink>
//           <NavLink to="/notifications" onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
//                 isActive ? "bg-white/10 text-white" : "text-sp-muted hover:text-white hover:bg-white/[0.06]"
//               }`}>
//             <Bell size={16} /> Notifications
//           </NavLink>
//         </div>
//       </nav>

//       {/* Logout */}
//       <div className="px-3 py-4 border-t border-white/[0.06]">
//         <button onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sp-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
//           <LogOut size={16} /> Sign out
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import toast from "react-hot-toast";
import {
  LayoutDashboard, MapPin, CalendarCheck, Car, User,
  Bell, LogOut, ParkingSquare, Users, Tag, BarChart2,
  MessageSquare, Layers, Briefcase, DollarSign, Star,
  ClipboardList, Shield, ChevronRight, Truck, Key
} from "lucide-react";

const NAV_BY_ROLE = {
  [ROLES.CUSTOMER]: [
    { to: "/customer/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
    { to: "/customer/find-parking", icon: MapPin,           label: "Find Parking" },
    { to: "/customer/bookings",     icon: CalendarCheck,    label: "My Bookings" },
    { to: "/customer/valet/request",icon: Car,              label: "Request Valet" },
    { to: "/customer/rentals",      icon: Key,              label: "Rent a Car" },
  ],
  [ROLES.VALET]: [
    { to: "/valet/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
    { to: "/valet/jobs",       icon: Briefcase,       label: "Available Jobs" },
    { to: "/valet/earnings",   icon: DollarSign,      label: "My Earnings" },
    { to: "/valet/ratings",    icon: Star,            label: "My Ratings" },
  ],
  [ROLES.PARKING_LOT_ADMIN]: [
    { to: "/lot-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/lot-admin/lots",      icon: ParkingSquare,   label: "My Lots" },
    { to: "/lot-admin/bookings",  icon: CalendarCheck,   label: "Bookings" },
    { to: "/lot-admin/feedback",  icon: MessageSquare,   label: "Feedback" },
  ],
  [ROLES.SUPER_ADMIN]: [
    { to: "/super-admin/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { to: "/super-admin/lot-admins",  icon: Shield,          label: "Lot Admins" },
    { to: "/super-admin/car-owners",  icon: Car,             label: "Car Owners" },
    { to: "/super-admin/fleet-admins",icon: Truck,           label: "Fleet Admins" },
    { to: "/super-admin/promos",      icon: Tag,             label: "Promo Codes" },
    { to: "/super-admin/users",       icon: Users,           label: "All Users" },
  ],
  [ROLES.FLEET_ADMIN]: [
    { to: "/fleet-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/fleet-admin/fleet",     icon: Truck,           label: "My Fleet" },
    { to: "/fleet-admin/add-car",   icon: Car,             label: "Add Car" },
    { to: "/fleet-admin/bookings",  icon: ClipboardList,   label: "Rental Bookings" },
  ],
  [ROLES.CAR_OWNER]: [
    { to: "/car-owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/car-owner/cars",      icon: Car,             label: "My Cars" },
    { to: "/car-owner/add-car",   icon: Key,             label: "Add Car" },
    { to: "/car-owner/bookings",  icon: ClipboardList,   label: "Rental Bookings" },
  ],
};

const ROLE_LABEL = {
  [ROLES.CUSTOMER]:          { label: "Customer",     color: "bg-blue-500/20 text-blue-300" },
  [ROLES.VALET]:             { label: "Valet Driver", color: "bg-emerald-500/20 text-emerald-300" },
  [ROLES.PARKING_LOT_ADMIN]: { label: "Lot Admin",    color: "bg-amber-500/20 text-amber-300" },
  [ROLES.SUPER_ADMIN]:       { label: "Super Admin",  color: "bg-indigo-500/20 text-indigo-300" },
  [ROLES.FLEET_ADMIN]:       { label: "Fleet Admin",  color: "bg-rose-500/20 text-rose-300" },
  [ROLES.CAR_OWNER]:         { label: "Car Owner",    color: "bg-cyan-500/20 text-cyan-300" },
};

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const navItems         = NAV_BY_ROLE[user?.role] || [];
  const roleInfo         = ROLE_LABEL[user?.role]  || { label: user?.role, color: "bg-slate-500/20 text-slate-300" };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="flex flex-col h-full w-[280px] flex-shrink-0 bg-slate-900 shadow-2xl relative overflow-hidden">
      {/* Subtle background glow in sidebar */}
      <div className="absolute top-0 left-0 w-full h-40 bg-indigo-500/10 blur-[50px] pointer-events-none"></div>

      {/* Logo Area */}
      <div className="px-6 py-8 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div>
            <div className="font-black text-white text-xl tracking-tight">SmartParking</div>
            <div className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-0.5">Management</div>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-5 py-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-[1.25rem] p-3 transition-all hover:bg-white/10 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-black text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-black truncate">{user?.name}</div>
            <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mt-1.5 ${roleInfo.color}`}>
              {roleInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 custom-scrollbar relative z-10">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 ${
                isActive
                  ? "text-white bg-indigo-600/10 border border-indigo-500/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                <Icon size={18} className={`flex-shrink-0 transition-transform ${isActive ? "text-indigo-400" : "group-hover:scale-110"}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={16} className="text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Shared Links */}
        <div className="pt-6 mt-6 border-t border-white/5 space-y-1.5">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 ${
                isActive
                  ? "text-white bg-indigo-600/10 border border-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <User size={18} /> Profile
          </NavLink>
          <NavLink
            to="/notifications"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 ${
                isActive
                  ? "text-white bg-indigo-600/10 border border-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <Bell size={18} /> Notifications
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-white/5 relative z-10 bg-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-200 group"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
          Sign out
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </aside>
  );
};

export default Sidebar;