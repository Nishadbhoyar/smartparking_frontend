import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME_ROUTES, ROLES } from "../utils/constants";
import DashboardLayout from "../components/layout/DashboardLayout";

// Auth
import LoginPage           from "../pages/auth/LoginPage";
import RegisterPage        from "../pages/auth/RegisterPage";
import ForgotPasswordPage  from "../pages/auth/ForgotPasswordPage";

// Public
import LandingPage from "../pages/public/LandingPage";

const Placeholder = ({ title }) => (
  <div className="page-container">
    <div className="card flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sp-blue/10 flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="font-display text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-500 text-sm mt-2">This page is coming soon.</p>
    </div>
  </div>
);

const Guard = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user)                               return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME_ROUTES[user.role] || "/"} replace />;
  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_HOME_ROUTES[user.role] || "/login"} replace />;
  return <LandingPage />;
};

const { CUSTOMER: C, VALET: V, SUPER_ADMIN: SA, PARKING_LOT_ADMIN: LA, FLEET_ADMIN: FA, CAR_OWNER: CO } = ROLES;

// ── Customer ──────────────────────────────────────────────────────────────────
import CustomerDashboard  from "../pages/customer/CustomerDashboard";
import FindParkingPage    from "../pages/customer/FindParkingPage";
import LotDetailsPage     from "../pages/customer/LotDetailsPage";
import BookSlotPage       from "../pages/customer/BookSlotPage";
import MyBookingsPage     from "../pages/customer/MyBookingsPage";
import CheckoutPage       from "../pages/customer/CheckoutPage";
import RequestValetPage   from "../pages/customer/RequestValetPage";
import SubmitFeedbackPage from "../pages/customer/SubmitFeedbackPage";
import ValetTrackingPage  from "../pages/customer/ValetTrackingPage";
import BrowseRentalsPage  from "../pages/customer/BrowseRentalsPage";
import PaymentPage        from "../pages/customer/PaymentPage";

// ── Valet ─────────────────────────────────────────────────────────────────────
import ValetDashboard    from "../pages/valet/ValetDashboard";
import AvailableJobsPage from "../pages/valet/AvailableJobsPage";
import ActiveJobPage     from "../pages/valet/ActiveJobPage";
import MyEarningsPage    from "../pages/valet/MyEarningsPage";
import MyRatingsPage     from "../pages/valet/MyRatingsPage";

// ── Lot Admin ─────────────────────────────────────────────────────────────────
import LotAdminDashboard from "../pages/lot-admin/LotAdminDashboard";
import MyParkingLotsPage from "../pages/lot-admin/MyParkingLotsPage";
import LotDetailPage     from "../pages/lot-admin/LotDetailPage";
import SlotManagerPage   from "../pages/lot-admin/SlotManagerPage";
import LotBookingsPage   from "../pages/lot-admin/LotBookingsPage";
import AnalyticsPage     from "../pages/lot-admin/AnalyticsPage";
import FeedbackPage      from "../pages/lot-admin/FeedbackPage";

// ── Super Admin ───────────────────────────────────────────────────────────────
import SuperAdminDashboard  from "../pages/super-admin/SuperAdminDashboard";
import ParkingLotAdminsPage from "../pages/super-admin/ParkingLotAdminsPage";
import CarOwnersPage        from "../pages/super-admin/CarOwnersPage";
import FleetAdminsPage      from "../pages/super-admin/FleetAdminsPage";
import PromoCodesPage       from "../pages/super-admin/PromoCodesPage";
import AllUsersPage         from "../pages/super-admin/AllUsersPage";
import PendingCompaniesPage from "../pages/super-admin/PendingCompaniesPage";

// ── Fleet Admin ───────────────────────────────────────────────────────────────
import FleetDashboard           from "../pages/fleet-admin/FleetDashboard";
import MyFleetPage              from "../pages/fleet-admin/MyFleetPage";
import AddRentalCarPage         from "../pages/fleet-admin/AddRentalCarPage";
import RentalBookingsPage       from "../pages/fleet-admin/RentalBookingsPage";
import CompanyRegistrationPage  from "../pages/fleet-admin/CompanyRegistrationPage";
import CompanyPendingPage       from "../pages/fleet-admin/CompanyPendingPage";


// ── Car Owner ─────────────────────────────────────────────────────────────────
import CarOwnerDashboard     from "../pages/car-owner/CarOwnerDashboard";
import MyCarsPage            from "../pages/car-owner/MyCarsPage";
import AddCarPage            from "../pages/car-owner/AddCarPage";
import CarRentalBookingsPage from "../pages/car-owner/CarRentalBookingsPage";

// ── Shared ────────────────────────────────────────────────────────────────────
import ProfilePage       from "../pages/shared/ProfilePage";
import NotificationsPage from "../pages/shared/NotificationsPage";
import PaymentReceiptPage from "../../src/pages/shared/Paymentreceiptpage";

const AppRouter = () => (
  <Routes>
    {/* ── Public ── */}
    <Route path="/"                element={<RootRedirect />} />
    <Route path="/login"           element={<LoginPage />} />
    <Route path="/register"        element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

    {/* ── All protected pages live inside DashboardLayout ── */}
    <Route element={<Guard><DashboardLayout /></Guard>}>

      {/* Shared */}
      <Route path="/profile"       element={<ProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Customer */}
      <Route path="/customer/dashboard"           element={<Guard roles={[C]}><CustomerDashboard /></Guard>} />
      <Route path="/customer/find-parking"        element={<Guard roles={[C]}><FindParkingPage /></Guard>} />
      <Route path="/customer/lot/:lotId"          element={<Guard roles={[C]}><LotDetailsPage /></Guard>} />
      <Route path="/customer/book/:lotId"         element={<Guard roles={[C]}><BookSlotPage /></Guard>} />
      <Route path="/customer/bookings"            element={<Guard roles={[C]}><MyBookingsPage /></Guard>} />
      <Route path="/customer/checkout/:bookingId" element={<Guard roles={[C]}><CheckoutPage /></Guard>} />
      <Route path="/customer/payment/:serviceType/:referenceId" element={<Guard roles={[C]}><PaymentPage /></Guard>} />
      <Route path="/customer/receipt/:bookingId"  element={<Guard roles={[C]}><PaymentReceiptPage /></Guard>} />
      <Route path="/customer/valet/request"       element={<Guard roles={[C]}><RequestValetPage /></Guard>} />
      <Route path="/customer/valet/track/:id"     element={<Guard roles={[C]}><ValetTrackingPage /></Guard>} />
      <Route path="/customer/rentals"             element={<Guard roles={[C]}><BrowseRentalsPage /></Guard>} />
      <Route path="/customer/feedback/:type/:id"  element={<Guard roles={[C]}><SubmitFeedbackPage /></Guard>} />

      {/* Valet */}
      <Route path="/valet/dashboard"      element={<Guard roles={[V]}><ValetDashboard /></Guard>} />
      <Route path="/valet/jobs"           element={<Guard roles={[V]}><AvailableJobsPage /></Guard>} />
      <Route path="/valet/job/:requestId" element={<Guard roles={[V]}><ActiveJobPage /></Guard>} />
      <Route path="/valet/earnings"       element={<Guard roles={[V]}><MyEarningsPage /></Guard>} />
      <Route path="/valet/ratings"        element={<Guard roles={[V]}><MyRatingsPage /></Guard>} />

      {/* Lot Admin */}
      <Route path="/lot-admin/dashboard"        element={<Guard roles={[LA]}><LotAdminDashboard /></Guard>} />
      <Route path="/lot-admin/lots"             element={<Guard roles={[LA]}><MyParkingLotsPage /></Guard>} />
      <Route path="/lot-admin/lot/:lotId"       element={<Guard roles={[LA]}><LotDetailPage /></Guard>} />
      <Route path="/lot-admin/lot/:lotId/slots" element={<Guard roles={[LA]}><SlotManagerPage /></Guard>} />
      <Route path="/lot-admin/bookings"         element={<Guard roles={[LA]}><LotBookingsPage /></Guard>} />
      <Route path="/lot-admin/analytics/:lotId" element={<Guard roles={[LA]}><AnalyticsPage /></Guard>} />
      <Route path="/lot-admin/feedback"         element={<Guard roles={[LA]}><FeedbackPage /></Guard>} />

      {/* Super Admin */}
      <Route path="/super-admin/dashboard"    element={<Guard roles={[SA]}><SuperAdminDashboard /></Guard>} />
      <Route path="/super-admin/lot-admins"   element={<Guard roles={[SA]}><ParkingLotAdminsPage /></Guard>} />
      <Route path="/super-admin/car-owners"   element={<Guard roles={[SA]}><CarOwnersPage /></Guard>} />
      <Route path="/super-admin/fleet-admins"      element={<Guard roles={[SA]}><FleetAdminsPage /></Guard>} />
      <Route path="/super-admin/promos"             element={<Guard roles={[SA]}><PromoCodesPage /></Guard>} />
      <Route path="/super-admin/users"              element={<Guard roles={[SA]}><AllUsersPage /></Guard>} />
      <Route path="/super-admin/rental-companies"   element={<Guard roles={[SA]}><PendingCompaniesPage /></Guard>} />

      {/* Fleet Admin */}
      <Route path="/fleet-admin/dashboard"          element={<Guard roles={[FA]}><FleetDashboard /></Guard>} />
      <Route path="/fleet-admin/fleet"              element={<Guard roles={[FA]}><MyFleetPage /></Guard>} />
      <Route path="/fleet-admin/add-car"            element={<Guard roles={[FA]}><AddRentalCarPage /></Guard>} />
      <Route path="/fleet-admin/bookings"           element={<Guard roles={[FA]}><RentalBookingsPage /></Guard>} />
      <Route path="/fleet-admin/register-company"   element={<Guard roles={[FA]}><CompanyRegistrationPage /></Guard>} />
      <Route path="/fleet-admin/company-pending"    element={<Guard roles={[FA]}><CompanyPendingPage /></Guard>} />

      {/* Car Owner */}
      <Route path="/car-owner/dashboard" element={<Guard roles={[CO]}><CarOwnerDashboard /></Guard>} />
      <Route path="/car-owner/cars"      element={<Guard roles={[CO]}><MyCarsPage /></Guard>} />
      <Route path="/car-owner/add-car"   element={<Guard roles={[CO]}><AddCarPage /></Guard>} />
      <Route path="/car-owner/bookings"  element={<Guard roles={[CO]}><CarRentalBookingsPage /></Guard>} />

    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;