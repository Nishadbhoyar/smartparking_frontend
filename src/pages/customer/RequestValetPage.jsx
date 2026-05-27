import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import useGeolocation from "../../hooks/useGeolocation";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { Car, Clock, MapPin, ChevronLeft, Navigation, Zap, Battery } from "lucide-react";
import { validateLicensePlate, validatePhone } from "../../hooks/Valid";

const RequestValetPage = () => {
  const { user }             = useAuth();
  const navigate             = useNavigate();
  const { location, loading: geoLoading, permissionDenied } = useGeolocation();

  const [form, setForm]        = useState({ carPlateNo: "", mobileNo: "" });
  const [vehicleType, setType] = useState("CAR"); // "CAR" | "EV_BIKE"
  const [batteryLevel, setBat] = useState(80);    // % — only used for EV_BIKE
  const [estimate, setEst]     = useState(null);
  const [loading, setL]        = useState(false);

  useEffect(() => {
    if (!location) return;
    axiosInstance
      .get("/api/valet/fare-estimate", { params: { lat: location.lat, lon: location.lng } })
      .then((r) => setEst(r.data))
      .catch(() => {});
  }, [location]);

  const handleSubmit = async () => {
    // Validation checks from File 2
    const plateCheck = validateLicensePlate(form.carPlateNo);
    if (!plateCheck.valid) return toast.error(plateCheck.message);
    
    // Phone is optional — validate only if overridden
    if (form.mobileNo.trim()) {
      const phoneCheck = validatePhone(form.mobileNo);
      if (!phoneCheck.valid) return toast.error(phoneCheck.message);
    }

    // H-3 FIX: hard-block when permission denied
    if (permissionDenied)
      return toast.error("Location permission denied. We need your real location to dispatch a valet.");
    if (!location) return toast.error("Location not available. Please wait or refresh.");

    setL(true);
    try {
      // Merged payload combining location, vehicle types, and battery level
      const payload = {
        customerId:      user.id,
        mobileNo:        form.mobileNo || user.phoneNumber,
        carPlateNo:      form.carPlateNo.trim().toUpperCase(),
        pickupLatitude:  location.lat,
        pickupLongitude: location.lng,
        vehicleType,
        batteryLevel:    vehicleType === "EV_BIKE" ? batteryLevel : null,
      };

      const res = await axiosInstance.post("/api/valet/request", payload);
      toast.success("Valet requested! Your pickup OTP: " + res.data.pickupOtp);
      navigate(`/customer/valet/track/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed. Try again.");
    } finally {
      setL(false);
    }
  };

  return (
    <div className="page-container max-w-lg space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Request Valet</h1>
        <p className="text-gray-500 text-sm mt-1">A driver will pick up and park your vehicle</p>
      </div>

      {/* H-3 FIX: show hard-block banner when permission is denied */}
      {permissionDenied && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-medium">
          Location permission is denied. Please enable it in your browser settings — we need your
          real GPS coordinates to dispatch a valet to you.
        </div>
      )}

      {/* Location status */}
      <div
        className={`flex items-center gap-3 rounded-2xl p-4 border ${
          location && !permissionDenied ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            location ? "bg-green-100" : "bg-gray-200"
          }`}
        >
          {geoLoading ? (
            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MapPin size={16} className={location ? "text-green-600" : "text-gray-400"} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {geoLoading ? "Detecting location..." : location ? "Location detected" : "Location unavailable"}
          </p>
          {location && (
            <p className="text-xs text-gray-500">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
        </div>
      </div>

      {/* Vehicle type selector */}
      <div className="card space-y-3">
        <h2 className="section-title">Vehicle Type</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "CAR",     label: "Car",     icon: Car,  desc: "Sedan, SUV, hatchback" },
            { key: "EV_BIKE", label: " EV Vehicle", icon: Zap,  desc: "(BEV),(PHEVs),(HEVs) " },
          ].map(({ key, label, icon: Icon, desc }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className={`rounded-2xl p-4 border-2 text-left transition-all ${
                vehicleType === key
                  ? "border-sp-blue bg-sp-blue/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                vehicleType === key ? "bg-sp-blue/10" : "bg-gray-100"
              }`}>
                <Icon size={18} className={vehicleType === key ? "text-sp-blue" : "text-gray-500"} />
              </div>
              <p className={`font-semibold text-sm ${vehicleType === key ? "text-sp-blue" : "text-gray-800"}`}>
                {label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* EV Bike battery level — only shown when EV_BIKE is selected */}
        {vehicleType === "EV_BIKE" && (
          <div className="space-y-2 pt-1">
            <label className="label flex items-center gap-1.5">
              <Battery size={13} /> Current Battery Level
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={batteryLevel}
                onChange={(e) => setBat(Number(e.target.value))}
                className="flex-1 accent-sp-blue"
              />
              <span className="text-sm font-bold text-gray-800 w-12 text-right">
                {batteryLevel}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  batteryLevel > 50 ? "bg-green-500" :
                  batteryLevel > 20 ? "bg-amber-400" : "bg-red-500"
                }`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              The valet will verify and record the actual battery level when they pick up your bike.
            </p>
          </div>
        )}
      </div>

      {/* Vehicle details */}
      <div className="card space-y-4">
        <h2 className="section-title">
          {vehicleType === "EV_BIKE" ? "Your Bike" : "Your Car"}
        </h2>
        <div className="space-y-1.5">
          <label className="label">Plate Number *</label>
          <div className="relative">
            {vehicleType === "EV_BIKE"
              ? <Zap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              : <Car size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            }
            <input
              value={form.carPlateNo}
              onChange={(e) => setForm({ ...form, carPlateNo: e.target.value.toUpperCase() })}
              placeholder="MH 12 AB 3456"
              className="input pl-10 font-mono tracking-wider uppercase"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="label">
            Mobile <span className="text-gray-400 normal-case font-normal">(optional)</span>
          </label>
          <input
            value={form.mobileNo}
            onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
            placeholder={user?.phoneNumber || "+91 98765 43210"}
            className="input"
          />
        </div>
      </div>

      {/* Fare estimate */}
      {estimate && (
        <div className="card space-y-3">
          <h2 className="section-title">Fare Estimate</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "ETA",         value: `${estimate.valetEtaMinutes} min`, icon: Clock },
              { label: "Nearest Lot", value: estimate.nearestLotName,           icon: MapPin },
              { label: "Distance",    value: `${estimate.nearestLotDistanceKm} km`, icon: Navigation },
              { label: "Est. Fare",   value: formatCurrency(estimate.totalFare), icon: Car },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Icon size={11} /> {label}
                </p>
                <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
            ⚡ This is an estimate based on 3hrs parking. Final fare calculated at checkout.
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || geoLoading || !location || permissionDenied}
        className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {vehicleType === "EV_BIKE" ? <Zap size={17} /> : <Car size={17} />}
            {permissionDenied ? "Location Required" : "Request Valet Now"}
          </>
        )}
      </button>
    </div>
  );
};

export default RequestValetPage;