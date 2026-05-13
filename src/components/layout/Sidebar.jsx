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
    { to: "/super-admin/lot-admins",  icon: ParkingSquare,   label: "Lot Admins" },
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
  [ROLES.CUSTOMER]:          { label: "Customer",     color: "bg-blue-500/10 text-blue-400" },
  [ROLES.VALET]:             { label: "Valet Driver", color: "bg-emerald-500/10 text-emerald-400" },
  [ROLES.PARKING_LOT_ADMIN]: { label: "Lot Admin",    color: "bg-amber-500/10 text-amber-400" },
  [ROLES.SUPER_ADMIN]:       { label: "Super Admin",  color: "bg-red-500/10 text-red-400" },
  [ROLES.FLEET_ADMIN]:       { label: "Fleet Admin",  color: "bg-purple-500/10 text-purple-400" },
  [ROLES.CAR_OWNER]:         { label: "Car Owner",    color: "bg-cyan-500/10 text-cyan-400" },
};

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const navItems         = NAV_BY_ROLE[user?.role] || [];
  const roleInfo         = ROLE_LABEL[user?.role]  || { label: user?.role, color: "bg-gray-500/10 text-gray-400" };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside className="flex flex-col h-full bg-sp-dark w-64 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sp-blue rounded-xl flex items-center justify-center shadow-lg shadow-sp-blue/30 flex-shrink-0">
            <span className="text-white font-display font-bold">S</span>
          </div>
          <div>
            <div className="font-display text-white font-bold text-base leading-none">SmartParking</div>
            <div className="text-sp-muted text-[10px] mt-0.5">Management Platform</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3">
          <div className="w-9 h-9 rounded-xl bg-sp-blue/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sp-blue font-display font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className={`text-xs font-medium px-1.5 py-0.5 rounded-full w-fit mt-0.5 ${roleInfo.color}`}>
              {roleInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-sp-blue text-white shadow-lg shadow-sp-blue/20"
                  : "text-sp-muted hover:text-white hover:bg-white/[0.06]"
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Shared links */}
        <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-0.5">
          <NavLink to="/profile" onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-white/10 text-white" : "text-sp-muted hover:text-white hover:bg-white/[0.06]"
              }`}>
            <User size={16} /> Profile
          </NavLink>
          <NavLink to="/notifications" onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-white/10 text-white" : "text-sp-muted hover:text-white hover:bg-white/[0.06]"
              }`}>
            <Bell size={16} /> Notifications
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sp-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
