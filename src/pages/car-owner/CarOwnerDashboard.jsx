import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import { Car, Key, ClipboardList, TrendingUp, DollarSign, Clock } from "lucide-react";

const CarOwnerDashboard = () => {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [cars, setCars]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

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
    { icon: Car,          label: "My Cars",         sub: "View & manage",     to: "/car-owner/cars",          color: "bg-blue-50 text-blue-600" },
    { icon: Key,          label: "Add Car",          sub: "List a new car",    to: "/car-owner/cars?add=1",    color: "bg-green-50 text-green-600" },
    { icon: ClipboardList,label: "Rental Bookings",  sub: "Booking history",   to: "/car-owner/bookings",      color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="page-container space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Car Owner Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-medium text-gray-700">{user?.name?.split(" ")[0]}</span> 🚗
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Cars",       value: loading ? "—" : cars.length,   icon: Car,         color: "text-sp-blue",    bg: "bg-sp-blue/10" },
          { label: "Available",        value: loading ? "—" : available,      icon: TrendingUp,  color: "text-green-600",  bg: "bg-green-50" },
          { label: "Currently Rented", value: loading ? "—" : rented,         icon: Clock,       color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Total Earned",     value: loading ? "—" : formatCurrency(earned), icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map(({ icon: Icon, label, sub, to, color }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group active:scale-[0.97]"
            >
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
              <div className="font-semibold text-gray-900 text-sm">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      {!loading && bookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Bookings</h2>
            <button onClick={() => navigate("/car-owner/bookings")} className="text-xs text-sp-blue font-semibold hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car size={15} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {b.rentalCar?.make} {b.rentalCar?.model}
                    </p>
                    <p className="text-xs text-gray-400">{b.customerName ?? `Customer #${b.customerId}`}</p>
                  </div>
                </div>
                <div className="text-right">
                  {b.totalAmount != null && (
                    <p className="text-sm font-bold text-sp-blue">{formatCurrency(b.totalAmount)}</p>
                  )}
                  <span className={`badge text-xs ${
                    b.status === "ACTIVE"    ? "bg-green-100 text-green-700"  :
                    b.status === "COMPLETED" ? "bg-gray-100 text-gray-600"    :
                    b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700":
                    "bg-gray-100 text-gray-600"
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && cars.length === 0 && (
        <div className="card text-center py-14">
          <Car size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No cars listed yet</p>
          <p className="text-gray-400 text-xs mt-1">Add your first car to start earning</p>
          <button onClick={() => navigate("/car-owner/cars?add=1")} className="btn-primary mt-4 text-xs">
            List a Car
          </button>
        </div>
      )}
    </div>
  );
};

export default CarOwnerDashboard;