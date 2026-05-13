import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import useNotificationSocket from "../../hooks/useNotificationSocket";
import { Bell, Menu, X, ChevronRight } from "lucide-react";

const getPageTitle = (pathname) => {
  const routes = {
    "/customer/dashboard":      "Dashboard",
    "/customer/find-parking":   "Find Parking",
    "/customer/bookings":       "My Bookings",
    "/customer/valet":          "Valet Service",
    "/customer/rentals":        "Rent a Car",
    "/customer/lot":            "Parking Lot",
    "/customer/book":           "Book a Slot",
    "/customer/checkout":       "Checkout",
    "/customer/feedback":       "Submit Feedback",
    "/valet/dashboard":         "Dashboard",
    "/valet/jobs":              "Available Jobs",
    "/valet/job":               "Active Job",
    "/valet/earnings":          "My Earnings",
    "/valet/ratings":           "My Ratings",
    "/lot-admin/dashboard":     "Dashboard",
    "/lot-admin/lots":          "My Parking Lots",
    "/lot-admin/lot":           "Lot Details",
    "/lot-admin/bookings":      "Bookings",
    "/lot-admin/analytics":     "Analytics",
    "/lot-admin/feedback":      "Feedback",
    "/super-admin/dashboard":   "Platform Dashboard",
    "/super-admin/lot-admins":  "Lot Admins",
    "/super-admin/car-owners":  "Car Owners",
    "/super-admin/fleet-admins":"Fleet Admins",
    "/super-admin/promos":      "Promo Codes",
    "/super-admin/users":       "All Users",
    "/fleet-admin/dashboard":   "Dashboard",
    "/fleet-admin/fleet":       "My Fleet",
    "/fleet-admin/add-car":     "Add Rental Car",
    "/fleet-admin/bookings":    "Rental Bookings",
    "/car-owner/dashboard":     "Dashboard",
    "/car-owner/cars":          "My Cars",
    "/car-owner/add-car":       "Add Car",
    "/car-owner/bookings":      "Rental Bookings",
    "/profile":                 "Profile",
    "/notifications":           "Notifications",
  };
  const match = Object.keys(routes).find((k) => pathname.startsWith(k));
  return match ? routes[match] : "SmartParking";
};

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user }   = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const title      = getPageTitle(location.pathname);
  const [unread, setUnread] = useState(0);

  // ── Initial load: fetch real unread count from DB ────────────────────────
  const fetchUnread = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axiosInstance.get(`/api/notifications/unread-count/${user.id}`);
      setUnread(res.data?.count ?? 0);
    } catch {}
  }, [user?.id]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  // ── WebSocket: increment badge the instant a new notification arrives ────
  // No more 30-second polling delay. The socket push fires from NotificationService
  // the moment any business event (booking, valet, rental) calls notify().
  useNotificationSocket(user?.id, useCallback(() => {
    setUnread((c) => c + 1);
  }, []));

  // ── Reset badge when user visits the notifications page ──────────────────
  useEffect(() => {
    if (location.pathname === "/notifications") {
      // Small delay so NotificationsPage has time to mark-all-read first
      const t = setTimeout(fetchUnread, 1500);
      return () => clearTimeout(t);
    }
  }, [location.pathname, fetchUnread]);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <h1 className="font-display text-sp-dark font-bold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Bell — real unread count via WebSocket, no polling */}
        <button onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500
              text-white text-[10px] font-bold rounded-full flex items-center justify-center
              px-1 ring-2 ring-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        <button onClick={() => navigate("/profile")}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-sp-blue/10 flex items-center justify-center">
            <span className="text-sp-blue font-display font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <span className="hidden sm:block text-xs font-semibold text-sp-dark max-w-[120px] truncate">
            {user?.name}
          </span>
          <ChevronRight size={13} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;