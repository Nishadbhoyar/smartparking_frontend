import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import useGeolocation from "../../hooks/useGeolocation";
import MapView, { createPinIcon, userLocationIcon } from "../../components/shared/MapView";
import { formatCurrency, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  Car, Zap, Fuel, Users, MapPin, RefreshCw,
  X, CheckCircle, Calendar, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLOR = { AVAILABLE: "#16a34a", RENTED: "#dc2626", MAINTENANCE: "#9ca3af" };

// ── Booking Modal ─────────────────────────────────────────────────────────────
const BookingModal = ({ car, onClose, onBooked, userId }) => {
  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const fmt = (d) => d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

  const [startTime, setStart] = useState(fmt(today));
  const [endTime,   setEnd]   = useState(fmt(tomorrow));
  const [loading,   setL]     = useState(false);
  const [done,      setDone]  = useState(null);
  const navigate = useNavigate();
  // Calculate estimated cost
  const ms    = new Date(endTime) - new Date(startTime);
  const hours = Math.max(0, ms / 3600000);
  const days  = Math.max(1, Math.ceil(hours / 24));
  const total = (car.dailyRate || 0) * days;
  const valid = ms > 0;

  const handleBook = async () => {
    if (!valid) return toast.error("End time must be after start time");
    setL(true);
    try {
      const res = await axiosInstance.post(`/api/rental-cars/${car.id}/book`, {
        customerId: userId,
        startTime,
        endTime,
      });
      setDone(res.data);
      toast.success(`Booked! Code: ${res.data.bookingCode}`);
      onBooked?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Try again.");
    } finally { setL(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900">
              Book {car.make} {car.model}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">{car.licensePlate} · {car.color}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="p-5 space-y-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">Booking Confirmed!</h3>
              <p className="text-gray-500 text-sm mt-1">Your car rental is reserved.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Code</span>
                <span className="font-mono font-bold text-sp-blue">{done.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Car</span>
                <span className="font-semibold">{done.carMake} {done.carModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup OTP</span>
                <span className="font-mono font-bold text-amber-600">{done.pickupOtp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">From</span>
                <span className="font-semibold">{formatDate(done.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">To</span>
                <span className="font-semibold">{formatDate(done.endTime)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-base">
                <span>Total</span>
                <span className="text-sp-blue">{formatCurrency(done.totalAmount)}</span>
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              Save your pickup OTP — you'll need it to collect the car.
            </p>
            <div className="flex gap-3">
  <button onClick={onClose} className="btn-secondary flex-1 text-sm">
    Pay Later
  </button>
  <button 
    onClick={() => {
      onClose(); // Close the modal
      // Send them to the dynamic payment page!
      navigate(`/customer/payment/CAR_RENTAL/${done.id}`, {
        state: {
          serviceData: {
            referenceCode: done.bookingCode,
            amount: done.totalAmount,
            label: "Car Rental",
            lines: [
              { key: "Car", value: `${done.carMake} ${done.carModel}` },
              { key: "From", value: new Date(done.startTime).toLocaleDateString() },
              { key: "To", value: new Date(done.endTime).toLocaleDateString() }
            ]
          }
        }
      });
    }} 
    className="btn-primary flex-1 text-sm"
  >
    💳 Pay Now
  </button>
</div>
          </div>
        ) : (
          /* Booking form */
          <div className="p-5 space-y-4">
            {/* Car summary */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users size={12} /> {car.seatingCapacity} seats
                  <span>·</span>
                  {car.fuelType}
                  <span>·</span>
                  {car.transmission}
                </div>
                <span className="text-sm font-bold text-sp-blue">
                  {formatCurrency(car.dailyRate)}/day
                </span>
              </div>
              {car.securityDeposit > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Shield size={11} /> Deposit: {formatCurrency(car.securityDeposit)}
                </div>
              )}
              {car.pickupAddress && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={11} /> {car.pickupAddress}
                </div>
              )}
            </div>

            {/* Date pickers */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="label flex items-center gap-1.5">
                  <Calendar size={12} /> Pickup Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStart(e.target.value)}
                  className="input text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label flex items-center gap-1.5">
                  <Calendar size={12} /> Return Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEnd(e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Cost summary */}
            {valid && (
              <div className="bg-blue-50 rounded-xl p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(car.dailyRate)} × {days} day{days > 1 ? "s" : ""}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {car.securityDeposit > 0 && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Security deposit (refundable)</span>
                    <span>{formatCurrency(car.securityDeposit)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-blue-200 text-base">
                  <span>Total</span>
                  <span className="text-sp-blue">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={loading || !valid}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Car size={16} /> Confirm Booking</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Browse Rentals Page ───────────────────────────────────────────────────────
const BrowseRentalsPage = () => {
  const { user }                       = useAuth();
  const { location, loading: geoLoading } = useGeolocation();
  const [cars, setCars]                = useState([]);
  const [loading, setL]                = useState(false);
  const [selected, setSel]             = useState(null);   // selected car id (map)
  const [booking,  setBooking]         = useState(null);   // car to book (modal)

  const load = async () => {
    if (!location) return;
    setL(true);
    try {
      const res = await axiosInstance.get("/api/rental-cars/nearby", {
        params: { lat: location.lat, lng: location.lng, limit: 15 },
      });
      setCars(res.data || []);
    } catch { setCars([]); }
    finally { setL(false); }
  };

  useEffect(() => { load(); }, [location]);

  const available = cars.filter((c) => c.status === "AVAILABLE");

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="px-5 lg:px-8 py-5 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">Rent a Car</h1>
              <p className="text-gray-500 text-sm mt-0.5">{available.length} available near you</p>
            </div>
            <button onClick={load} className="btn-secondary text-xs flex items-center gap-1.5">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Car list */}
          <div className="w-full lg:w-80 flex-shrink-0 overflow-y-auto border-r border-gray-100 bg-white">
            {geoLoading || loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : cars.length === 0 ? (
              <div className="p-8 text-center">
                <Car size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No rental cars nearby</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {cars.map((car) => (
                  <div key={car.id}
                    onClick={() => setSel(car.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all hover:shadow-sm cursor-pointer ${
                      selected === car.id ? "border-sp-blue shadow-md ring-1 ring-blue-100" : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {car.make} {car.model}{" "}
                          <span className="text-gray-400 font-normal">{car.year}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{car.licensePlate} · {car.color}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5"><Users size={10} /> {car.seatingCapacity}</span>
                          <span>{car.transmission}</span>
                          <span>{car.fuelType}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-sp-blue block">
                          {formatCurrency(car.dailyRate)}/day
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                          car.status === "AVAILABLE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {car.status}
                        </span>
                      </div>
                    </div>

                    {car.pickupAddress && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 truncate">
                        <MapPin size={10} /> {car.pickupAddress}
                      </p>
                    )}

                    {/* Book button — only for available cars */}
                    {car.status === "AVAILABLE" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setBooking(car); }}
                        className="mt-2.5 w-full btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5"
                      >
                        <Car size={12} /> Book this car
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 min-h-[300px]">
            <MapView center={location} zoom={13} height="100%" className="min-h-[300px]">
              {location && (
                <Marker position={[location.lat, location.lng]} icon={userLocationIcon}>
                  <Popup><div className="text-sm font-medium">📍 You</div></Popup>
                </Marker>
              )}
              {cars.map((car) => car.pickupLatitude && car.pickupLongitude ? (
                <Marker
                  key={car.id}
                  position={[car.pickupLatitude, car.pickupLongitude]}
                  icon={createPinIcon(STATUS_COLOR[car.status] || "#888", "🚗")}
                  eventHandlers={{ click: () => setSel(car.id) }}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{car.make} {car.model}</p>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>{car.licensePlate} · {car.color}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>
                        {formatCurrency(car.dailyRate)}/day
                      </p>
                      {car.status === "AVAILABLE" && (
                        <button
                          onClick={() => setBooking(car)}
                          style={{
                            marginTop: 8, width: "100%", padding: "6px 0",
                            background: "#2563eb", color: "#fff", borderRadius: 8,
                            border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600
                          }}
                        >
                          Book
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ) : null)}
            </MapView>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {booking && (
        <BookingModal
          car={booking}
          userId={user?.id}
          onClose={() => setBooking(null)}
          onBooked={() => {
            load();           // refresh availability
            setBooking(null); // close after short delay handled by done state
          }}
        />
      )}
    </>
  );
};

export default BrowseRentalsPage;