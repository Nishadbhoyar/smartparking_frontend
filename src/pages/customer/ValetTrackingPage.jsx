import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ValetTrackingMap from "../../components/shared/ValetTrackingMap";
import ValetCarImages from "../../pages/valet/ValetCarImages";
import useGeolocation from "../../hooks/useGeolocation";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  ChevronLeft, RefreshCw, Car, KeyRound, Copy, Camera, Battery, Zap,
  AlertTriangle, Clock, CheckCircle2, Shield
} from "lucide-react";

const normalise = (raw) => {
  if (!raw) return raw;
  if (raw === "RETURN_REQ" || raw === "RETURN_REQUESTED") return "RETURN_REQUESTED";
  return raw;
};

// ── Return Confirmation OTP countdown ─────────────────────────────────────────
// Shows the OTP the customer needs to confirm, with a live countdown.
const ReturnConfirmPanel = ({ otp, expiry, onConfirmed, onExpired }) => {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [confirmOtp, setConfirmOtp]   = useState("");
  const [loading, setLoading]         = useState(false);
  const intervalRef                    = useRef(null);

  useEffect(() => {
    if (!expiry) return;
    const expiryDate = new Date(expiry);

    const tick = () => {
      const diff = Math.max(0, Math.round((expiryDate - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        clearInterval(intervalRef.current);
        toast.error("Return confirmation OTP expired. You can try again.");
        onExpired();
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [expiry]);

  const mins = secondsLeft !== null ? Math.floor(secondsLeft / 60) : null;
  const secs = secondsLeft !== null ? secondsLeft % 60 : null;
  const isUrgent = secondsLeft !== null && secondsLeft < 60;

  const handleConfirm = async () => {
    if (!confirmOtp.trim()) return toast.error("Enter the OTP to confirm");
    setLoading(true);
    try {
      await onConfirmed(confirmOtp.trim());
    } catch (err) {
      toast.error(err.response?.data?.message || "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
          <Shield size={18} className="text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Confirm Return Request</p>
          <p className="text-xs text-gray-500">Enter the OTP below to confirm you really want your car</p>
        </div>
      </div>

      {/* OTP display — this is the OTP the customer needs to enter */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1 text-center">
        <p className="text-xs text-amber-700 font-medium">Your Confirmation OTP</p>
        <p className="font-mono text-3xl font-bold tracking-[0.4em] text-amber-800">{otp}</p>
        {secondsLeft !== null && (
          <p className={`text-xs font-medium flex items-center justify-center gap-1 ${
            isUrgent ? "text-red-600" : "text-amber-600"
          }`}>
            <Clock size={11} />
            Expires in {mins}:{String(secs).padStart(2, "0")}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
        <AlertTriangle size={11} className="inline mr-1 text-amber-500" />
        This step prevents accidental requests. If you don't confirm within 5 minutes,
        the request will be cancelled automatically.
      </p>

      {/* Customer types the OTP they see above to confirm */}
      <div className="space-y-2">
        <label className="label flex items-center gap-1.5">
          <KeyRound size={13} /> Enter OTP to confirm
        </label>
        <div className="relative">
          <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={confirmOtp}
            onChange={(e) => setConfirmOtp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder="Enter 4-digit OTP"
            maxLength={4}
            className="input pl-10 font-mono tracking-widest text-center text-lg"
          />
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={loading || !confirmOtp.trim() || secondsLeft === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <><CheckCircle2 size={15} /> Confirm — Yes, get my car back</>
        )}
      </button>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

const ValetTrackingPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { location } = useGeolocation();

  const [eta,                 setEta]       = useState(null);
  const [status,              setStatus]    = useState(null);
  const [pickupOtp,           setPickupOtp] = useState(null);
  const [dropoffOtp,          setDropOtp]   = useState(null);
  const [returnConfirmOtp,    setRetOtp]    = useState(null);
  const [returnConfirmExpiry, setRetExp]    = useState(null);
  const [vehicleType,         setVType]     = useState("CAR");
  const [batteryAtPickup,     setBatPick]   = useState(null);
  const [batteryAtParking,    setBatPark]   = useState(null);
  const [fare,                setFare]      = useState(null);
  const [requesting,          setReq]       = useState(false);

  // Photos split by phase
  const [pickupImageIds, setPickupImages] = useState([]);
  const [parkedImageIds, setParkedImages] = useState([]);

  // Poll ETA every 15s
  useEffect(() => {
    if (!location) return;
    const poll = async () => {
      try {
        const res = await axiosInstance.get("/api/valet/eta", {
          params: { lat: location.lat, lon: location.lng },
        });
        setEta(res.data?.valetEtaMinutes);
      } catch {}
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => clearInterval(t);
  }, [location]);

  // Poll request status every 10s
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      try {
        const res  = await axiosInstance.get(`/api/valet/request/${id}`);
        const data = res.data;

        if (data?.status)              setStatus(normalise(data.status));
        if (data?.pickupOtp)           setPickupOtp(data.pickupOtp);
        if (data?.dropoffOtp)          setDropOtp(data.dropoffOtp);
        if (data?.returnConfirmOtp)    setRetOtp(data.returnConfirmOtp);
        if (data?.returnConfirmOtpExpiry) setRetExp(data.returnConfirmOtpExpiry);
        if (data?.vehicleType)         setVType(data.vehicleType);
        if (data?.batteryLevelAtPickup  != null) setBatPick(data.batteryLevelAtPickup);
        if (data?.batteryLevelAtParking != null) setBatPark(data.batteryLevelAtParking);

        if (data?.pickupImageIds && data.pickupImageIds.length > 0)
          setPickupImages(data.pickupImageIds);
        if (data?.parkedImageIds && data.parkedImageIds.length > 0)
          setParkedImages(data.parkedImageIds);
      } catch {}
    };
    poll();
    const t = setInterval(poll, 10000);
    return () => clearInterval(t);
  }, [id]);

  // Fetch fare when COMPLETED
  useEffect(() => {
    if (status !== "COMPLETED" || !id) return;
    axiosInstance.get(`/api/valet/fare/${id}`)
      .then((r) => setFare(r.data))
      .catch(() => {});
  }, [status, id]);

  // Step 1: customer taps "Request Car Back" → generate confirm OTP
  const handleInitiateReturn = async () => {
    setReq(true);
    try {
      const res = await axiosInstance.post(`/api/valet/${id}/request-return`);
      const data = res.data;
      setStatus(normalise(data.status));
      setRetOtp(data.returnConfirmOtp);
      setRetExp(data.returnConfirmOtpExpiry);
      toast.success("Enter the confirmation OTP to finalise your request.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate return.");
    } finally {
      setReq(false);
    }
  };

  // Step 2: customer confirms the OTP
  const handleConfirmReturn = async (otp) => {
    const res = await axiosInstance.post(`/api/valet/${id}/confirm-return`, null, {
      params: { otp },
    });
    const data = res.data;
    setStatus(normalise(data.status));
    setRetOtp(null);
    setRetExp(null);
    toast.success("Return confirmed! Your valet is on the way.");
  };

  // OTP expired — revert UI back to PARKED so user can try again
  // FIXED — calls backend to reset DB, then updates local state
  const handleReturnExpired = async () => {
      try {
        // Hitting request-return again is now safe — backend handles expired OTP case
        const res = await axiosInstance.post(`/api/valet/${id}/request-return`);
        const data = res.data;
        setStatus(normalise(data.status));
        setRetOtp(data.returnConfirmOtp);
        setRetExp(data.returnConfirmOtpExpiry);
        toast.success("OTP expired. A new one has been generated — confirm to request your car back.");
      } catch {
        // Fallback: polling will correct the state in 10s
        setStatus("PARKED");
        setRetOtp(null);
        setRetExp(null);
      }
  };

  const copyOtp = (otp) => {
    navigator.clipboard?.writeText(otp).catch(() => {});
    toast.success("OTP copied!");
  };

  const isEVBike = vehicleType === "EV_BIKE";

  if (status === null) {
    return (
      <div className="page-container max-w-2xl flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw size={28} className="animate-spin" />
          <p className="text-sm">Loading your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <RefreshCw size={11} className="animate-spin" /> Live updates
        </span>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {isEVBike ? "Tracking Your Valet" : "Tracking Your Valet"}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-500 text-sm">Request #{id}</p>
          {isEVBike && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              <Zap size={10} /> EV Bike
            </span>
          )}
        </div>
      </div>

      <ValetTrackingMap
        mode="customer"
        requestId={Number(id)}
        customerLocation={location}
        etaMinutes={eta}
        status={status}
      />

      {/* EV Bike battery info — shown once any battery data is available */}
      {isEVBike && (batteryAtPickup != null || batteryAtParking != null) && (
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Battery size={14} /> Battery Status
          </p>
          <div className="grid grid-cols-2 gap-3">
            {batteryAtPickup != null && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-xs text-gray-500">At Pickup</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        batteryAtPickup > 50 ? "bg-green-500" :
                        batteryAtPickup > 20 ? "bg-amber-400" : "bg-red-500"
                      }`}
                      style={{ width: `${batteryAtPickup}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800">{batteryAtPickup}%</span>
                </div>
              </div>
            )}
            {batteryAtParking != null && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-xs text-gray-500">After Parking</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        batteryAtParking > 50 ? "bg-green-500" :
                        batteryAtParking > 20 ? "bg-amber-400" : "bg-red-500"
                      }`}
                      style={{ width: `${batteryAtParking}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800">{batteryAtParking}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickup OTP */}
      {(status === "ACCEPTED" || status === "REQUESTED") && pickupOtp && (
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <KeyRound size={14} /> Your Pickup OTP
          </p>
          <p className="text-xs text-gray-500">
            Share this with the valet when they arrive to hand over your keys.
          </p>
          <div className="flex items-center justify-between bg-sp-blue/5 border border-sp-blue/20 rounded-xl px-4 py-3">
            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-sp-blue">
              {pickupOtp}
            </span>
            <button onClick={() => copyOtp(pickupOtp)} className="text-sp-blue hover:text-sp-blue/70 transition-colors">
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PICKED_UP state — valet has the vehicle, driving to lot */}
      {status === "PICKED_UP" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-1">
          <p className="text-blue-700 font-semibold text-sm">
            🚗 Valet has picked up your {isEVBike ? "bike" : "car"}
          </p>
          <p className="text-blue-600 text-xs">Driving to the parking lot...</p>
        </div>
      )}

      {/* Parked state */}
      {status === "PARKED" && (
        <div className="card space-y-4">
          <div className="text-center space-y-1">
            <p className="text-gray-700 font-semibold text-sm">
              🅿️ Your {isEVBike ? "bike" : "car"} is safely parked
            </p>
            <p className="text-gray-500 text-xs">Ready to leave? Request it back below.</p>
          </div>

          {/* Pickup photos */}
          {pickupImageIds.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Camera size={13} /> Photos at pickup (before driving off)
              </p>
              <ValetCarImages imageIds={pickupImageIds} />
            </div>
          )}

          {/* Parking photos */}
          {parkedImageIds.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Camera size={13} /> Photos at parking spot
              </p>
              <ValetCarImages imageIds={parkedImageIds} />
            </div>
          )}

          <button
            onClick={handleInitiateReturn}
            disabled={requesting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {requesting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>{isEVBike ? <Zap size={15} /> : <Car size={15} />} Request My {isEVBike ? "Bike" : "Car"} Back</>
            }
          </button>
        </div>
      )}

      {/* Return confirmation OTP step */}
      {status === "RETURN_CONFIRM_PENDING" && returnConfirmOtp && (
        <ReturnConfirmPanel
          otp={returnConfirmOtp}
          expiry={returnConfirmExpiry}
          onConfirmed={handleConfirmReturn}
          onExpired={handleReturnExpired}
        />
      )}

      {/* Dropoff OTP */}
      {status === "RETURN_REQUESTED" && dropoffOtp && (
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <KeyRound size={14} /> Your Dropoff OTP
          </p>
          <p className="text-xs text-gray-500">
            Share this with the valet when they bring your {isEVBike ? "bike" : "car"} to complete the job.
          </p>
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-green-600">
              {dropoffOtp}
            </span>
            <button onClick={() => copyOtp(dropoffOtp)} className="text-green-600 hover:text-green-500 transition-colors">
              <Copy size={16} />
            </button>
          </div>

          {/* Still show photos while car is in transit */}
          {(pickupImageIds.length > 0 || parkedImageIds.length > 0) && (
            <div className="space-y-3 pt-2">
              {pickupImageIds.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Camera size={11} /> Pickup photos
                  </p>
                  <ValetCarImages imageIds={pickupImageIds} />
                </div>
              )}
              {parkedImageIds.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Camera size={11} /> Parking photos
                  </p>
                  <ValetCarImages imageIds={parkedImageIds} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Return requested status pill */}
      {status === "RETURN_REQUESTED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1 text-center">
          <p className="text-blue-700 font-semibold text-sm">
            🚗 Valet is bringing your {isEVBike ? "bike" : "car"} back
          </p>
          <p className="text-blue-600 text-xs">
            ETA: {eta ? `${eta} min` : "calculating..."}
          </p>
        </div>
      )}

      {/* Completed */}
      {status === "COMPLETED" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
          <p className="text-green-700 font-semibold text-sm text-center">
            🎉 Your {isEVBike ? "bike" : "car"} has been returned!
          </p>

          {fare ? (
            <div className="bg-white rounded-xl p-3 text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Base fare</span>
                <span>{formatCurrency(fare.baseFare ?? fare.totalAmount)}</span>
              </div>
              {fare.distanceFare > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Distance</span>
                  <span>{formatCurrency(fare.distanceFare)}</span>
                </div>
              )}
              {fare.parkingFare > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Parking</span>
                  <span>{formatCurrency(fare.parkingFare)}</span>
                </div>
              )}
              {fare.surgeFare > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Surge</span>
                  <span>{formatCurrency(fare.surgeFare)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Total</span>
                <span className="text-sp-blue">
                  {formatCurrency(fare.totalFare ?? fare.totalAmount ?? fare.total)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-green-600 text-center">
              Fare details will be available shortly.
            </p>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            {fare && (
              <button
                onClick={() =>
                  navigate(`/customer/payment/VALET/${id}`, {
                    state: {
                      serviceData: {
                        referenceCode: `VLT-${id}`,
                        amount:        fare.totalFare,
                        label:         "Valet Service",
                        lines: [
                          { key: "Base",     value: formatCurrency(fare.baseFare) },
                          fare.distanceFare > 0 ? { key: "Distance", value: formatCurrency(fare.distanceFare) } : null,
                          fare.parkingFare  > 0 ? { key: "Parking",  value: formatCurrency(fare.parkingFare)  } : null,
                          fare.surgeFare    > 0 ? { key: "Surge",    value: formatCurrency(fare.surgeFare)    } : null,
                        ].filter(Boolean),
                      },
                    },
                  })
                }
                className="btn-primary text-xs flex items-center gap-1"
              >
                💳 Pay Now
              </button>
            )}
            <button onClick={() => navigate("/customer/bookings")} className="btn-secondary text-xs">
              My Bookings
            </button>
            <button
              onClick={() => navigate(`/customer/feedback/valet/${id}`)}
              className="btn-secondary text-xs"
            >
              ⭐ Rate Valet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValetTrackingPage;
