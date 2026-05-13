import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import useGeolocation from "../../hooks/useGeolocation";
import ValetTrackingMap from "../../components/shared/ValetTrackingMap";
import toast from "react-hot-toast";
import {
  KeyRound, Camera, ParkingSquare, Check, Clock, Loader2,
  Battery, Zap, Upload, CheckCircle2, Shield
} from "lucide-react";

const normalise = (raw) => {
  if (!raw) return raw;
  if (raw === "RETURN_REQ" || raw === "RETURN_REQUESTED") return "RETURN_REQUESTED";
  return raw;
};

const STEPS = [
  { key: "REQUESTED",             label: "Requested",      desc: "Job request received" },
  { key: "PENDING",               label: "Pending",        desc: "Awaiting assignment" },
  { key: "ACCEPTED",              label: "Accepted",       desc: "Head to customer location" },
  { key: "PICKED_UP",             label: "Picked Up",      desc: "Drive to nearest lot" },
  { key: "IN_PROGRESS",           label: "In Progress",    desc: "Driving to parking lot" },
  { key: "PARKED",                label: "Parked",         desc: "Vehicle is safely parked" },
  { key: "RETURN_CONFIRM_PENDING",label: "Return Confirm", desc: "Customer confirming return OTP" },
  { key: "RETURN_REQUESTED",      label: "Return Req",     desc: "Customer wants vehicle back" },
  { key: "COMPLETED",             label: "Done",           desc: "Job complete!" },
  { key: "CANCELLED",             label: "Cancelled",      desc: "Job was cancelled" },
];

const ActiveJobPage = () => {
  const { requestId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { location }  = useGeolocation();

  const [status, setStatus]         = useState(null);
  const [statusLoading, setStatusL] = useState(true);
  const [vehicleType, setVType]     = useState("CAR");
  const [otp, setOtp]               = useState("");
  const [lotId, setLotId]           = useState("");
  const [slotId, setSlotId]         = useState("");
  const [nearbyLots, setNearby]     = useState([]);
  const [slots, setSlots]           = useState([]);

  // Pickup photos (ACCEPTED/PICKED_UP phase)
  const [pickupImages, setPickupImages]       = useState([]);
  const [pickupBattery, setPickupBattery]     = useState(80);
  const [uploadingPickup, setUploadingPickup] = useState(false);

  // Parking photos (PARKED phase)
  const [parkImages, setParkImages]       = useState([]);
  const [parkBattery, setParkBattery]     = useState(80);

  const [loading, setL] = useState(false);
  const pickupFileRef   = useRef();
  const parkFileRef     = useRef();

  // Load real status from DB on mount (survives page refresh)
  useEffect(() => {
    axiosInstance
      .get(`/api/valet/request/${requestId}`)
      .then((r) => {
        setStatus(normalise(r.data?.status));
        setVType(r.data?.vehicleType || "CAR");
        if (r.data?.batteryLevelAtPickup  != null) setPickupBattery(r.data.batteryLevelAtPickup);
        if (r.data?.batteryLevelAtParking != null) setParkBattery(r.data.batteryLevelAtParking);
      })
      .catch(() => toast.error("Could not load job status"))
      .finally(() => setStatusL(false));
  }, [requestId]);

  useEffect(() => {
    if (location) {
      axiosInstance
        .get("/api/parking-lots/nearby", {
          params: { lat: location.lat, lng: location.lng, limit: 5 },
        })
        .then((r) => setNearby(r.data || []))
        .catch(() => {});
    }
  }, [location]);

  useEffect(() => {
    if (lotId) {
      axiosInstance
        .get(`/api/slots/lot/${lotId}`)
        .then((r) => setSlots(r.data?.filter((s) => s.status === "AVAILABLE") || []))
        .catch(() => {});
    }
  }, [lotId]);

  // Poll while PARKED or RETURN_CONFIRM_PENDING — auto-advance when customer acts
  useEffect(() => {
    if (status !== "PARKED" && status !== "RETURN_CONFIRM_PENDING") return;
    const t = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/api/valet/request/${requestId}`);
        const s = normalise(res.data?.status);
        if (s === "RETURN_CONFIRM_PENDING" && status === "PARKED") {
          setStatus("RETURN_CONFIRM_PENDING");
          toast("Customer is confirming their return request...", { icon: "⏳" });
        }
        if (s === "RETURN_REQUESTED") {
          setStatus("RETURN_REQUESTED");
          toast.success("Customer confirmed! They want their vehicle back.");
        }
      } catch {}
    }, 8000);
    return () => clearInterval(t);
  }, [status, requestId]);

  const isEVBike = vehicleType === "EV_BIKE";

  const act = async (fn, next) => {
    setL(true);
    try {
      await fn();
      setStatus(next);
      toast.success("Done!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setL(false);
    }
  };

  // Upload pickup photos (before or after OTP, while status is ACCEPTED or PICKED_UP)
  const handleUploadPickupImages = async () => {
    if (pickupImages.length === 0) return toast.error("Select at least one photo");
    setUploadingPickup(true);
    try {
      const fd = new FormData();
      pickupImages.forEach((img) => fd.append("images", img));
      if (isEVBike) fd.append("batteryLevelAtPickup", pickupBattery);
      await axiosInstance.post(`/api/valet/${requestId}/upload-pickup-images`, fd);
      toast.success(`${pickupImages.length} pickup photo(s) uploaded`);
      setPickupImages([]); // clear after upload
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingPickup(false);
    }
  };

  const handlePark = async () => {
    if (!lotId || !slotId) return toast.error("Select lot and slot first");
    const fd = new FormData();
    fd.append("lotId", lotId);
    fd.append("slotId", slotId);
    parkImages.forEach((img) => fd.append("carImages", img));
    if (isEVBike) fd.append("batteryLevelAtParking", parkBattery);
    await act(() => axiosInstance.post(`/api/valet/${requestId}/park`, fd), "PARKED");
  };

  const onPickupKey  = (e) => e.key === "Enter" && otp.trim() &&
    act(() => axiosInstance.post(`/api/valet/${requestId}/verify-pickup`, null, { params: { otp: otp.trim() } }), "PICKED_UP");
  const onDropoffKey = (e) => e.key === "Enter" && otp.trim() &&
    act(() => axiosInstance.post(`/api/valet/${requestId}/verify-dropoff`, null, { params: { otp: otp.trim() } }), "COMPLETED");

  if (statusLoading) {
    return (
      <div className="page-container max-w-2xl flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading job status...</p>
        </div>
      </div>
    );
  }

  const stepIdx = STEPS.findIndex((s) => s.key === status);

  if (stepIdx === -1) {
    return (
      <div className="page-container max-w-2xl flex items-center justify-center py-20">
        <div className="card max-w-md text-center space-y-4">
          <p className="font-bold text-gray-900">Invalid Job Status</p>
          <p className="text-sm text-gray-500">
            Status: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{status || "null"}</code>
          </p>
          <button onClick={() => navigate("/valet/jobs")} className="btn-primary w-full">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // ── Battery slider — reusable for EV bike ────────────────────────────────
  const BatterySlider = ({ value, onChange, label }) => (
    <div className="space-y-1.5">
      <label className="label flex items-center gap-1.5">
        <Battery size={13} /> {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range" min={0} max={100} step={5} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-sp-blue"
        />
        <span className="text-sm font-bold text-gray-800 w-12 text-right">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            value > 50 ? "bg-green-500" : value > 20 ? "bg-amber-400" : "bg-red-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="page-container max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Active Job</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-500 text-sm">Request #{requestId}</p>
          {isEVBike && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              <Zap size={10} /> EV Bike
            </span>
          )}
        </div>
      </div>

      <ValetTrackingMap mode="valet" valetId={user?.id} requestId={Number(requestId)} status={status} />

      <div className="card space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sp-blue/10 rounded-xl flex items-center justify-center">
            <span className="text-sp-blue font-display font-bold text-sm">{stepIdx + 1}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{STEPS[stepIdx]?.label}</p>
            <p className="text-xs text-gray-500">{STEPS[stepIdx]?.desc}</p>
          </div>
        </div>

        {/* ACCEPTED — verify pickup OTP + option to take pickup photos */}
        {status === "ACCEPTED" && (
          <div className="space-y-4">
            {/* Pickup photos section — before keys are handed over */}
            <div className="bg-blue-50 rounded-xl p-3 space-y-3">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                <Camera size={13} /> Take pickup photos first (before touching the vehicle)
              </p>
              <input
                ref={pickupFileRef}
                type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => setPickupImages(Array.from(e.target.files))}
              />
              <button
                onClick={() => pickupFileRef.current?.click()}
                className="btn-secondary w-full text-xs flex items-center justify-center gap-2"
              >
                <Camera size={13} />
                {pickupImages.length > 0
                  ? `${pickupImages.length} photo(s) selected`
                  : "Select pickup photos"}
              </button>

              {/* EV Bike battery at pickup */}
              {isEVBike && (
                <BatterySlider
                  value={pickupBattery}
                  onChange={setPickupBattery}
                  label="Battery at pickup"
                />
              )}

              {pickupImages.length > 0 && (
                <button
                  onClick={handleUploadPickupImages}
                  disabled={uploadingPickup}
                  className="btn-primary w-full text-xs flex items-center justify-center gap-2"
                >
                  {uploadingPickup
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Upload size={13} /> Upload Pickup Photos</>
                  }
                </button>
              )}
            </div>

            {/* OTP verification */}
            <p className="text-sm text-gray-600">
              Then ask the customer for their <strong>pickup OTP</strong>.
            </p>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={onPickupKey}
                placeholder="Enter pickup OTP"
                className="input pl-10 font-mono tracking-widest text-center text-lg"
              />
            </div>
            <button
              onClick={() => act(
                () => axiosInstance.post(`/api/valet/${requestId}/verify-pickup`, null, { params: { otp: otp.trim() } }),
                "PICKED_UP"
              )}
              disabled={loading || !otp.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Check size={15} /> Verify Pickup</>
              }
            </button>
          </div>
        )}

        {/* PICKED_UP — select lot/slot, optional more photos, then mark parked */}
        {status === "PICKED_UP" && (
          <div className="space-y-3">
            {/* Allow uploading pickup photos here too if not done yet */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Camera size={12} /> Add more pickup photos (optional)
              </p>
              <input
                ref={pickupFileRef}
                type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => setPickupImages(Array.from(e.target.files))}
              />
              <button
                onClick={() => pickupFileRef.current?.click()}
                className="btn-secondary w-full text-xs flex items-center justify-center gap-2"
              >
                {pickupImages.length > 0
                  ? `${pickupImages.length} pickup photo(s) selected`
                  : "Add pickup photos"}
              </button>
              {pickupImages.length > 0 && (
                <button
                  onClick={handleUploadPickupImages}
                  disabled={uploadingPickup}
                  className="btn-primary w-full text-xs flex items-center justify-center gap-2"
                >
                  {uploadingPickup
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Upload size={13} /> Upload Pickup Photos</>
                  }
                </button>
              )}
            </div>

            {/* Lot & slot selection */}
            <div className="space-y-1.5">
              <label className="label">Select Parking Lot</label>
              <select value={lotId} onChange={(e) => setLotId(e.target.value)} className="input">
                <option value="">-- Choose a lot --</option>
                {nearbyLots.filter((l) => l.status === "ACTIVE").map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {slots.length > 0 && (
              <div className="space-y-1.5">
                <label className="label">Select Slot</label>
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="input">
                  <option value="">-- Choose a slot --</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>{s.slotNumber} ({s.slotType})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Parking photos */}
            <div className="space-y-1.5">
              <label className="label flex items-center gap-1.5">
                <Camera size={13} /> Parking spot photos (required)
              </label>
              <input
                ref={parkFileRef}
                type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => setParkImages(Array.from(e.target.files))}
              />
              <button
                onClick={() => parkFileRef.current?.click()}
                className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
              >
                <Camera size={14} />
                {parkImages.length > 0
                  ? `${parkImages.length} parking photo(s) selected`
                  : "Add parking photos"}
              </button>
            </div>

            {/* EV Bike battery at parking */}
            {isEVBike && (
              <BatterySlider
                value={parkBattery}
                onChange={setParkBattery}
                label="Battery after parking"
              />
            )}

            <button
              onClick={handlePark}
              disabled={loading || !lotId || !slotId}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ParkingSquare size={15} /> Mark as Parked</>
              }
            </button>
          </div>
        )}

        {/* PARKED — waiting for customer return confirmation */}
        {status === "PARKED" && (
          <div className="bg-green-50 rounded-xl p-4 text-center space-y-2">
            <ParkingSquare size={28} className="mx-auto text-green-500" />
            <p className="text-green-700 font-semibold text-sm">
              {isEVBike ? "Bike" : "Car"} is safely parked
            </p>
            <p className="text-green-600 text-xs">
              Waiting for customer to request return...
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
              <Clock size={11} className="animate-pulse" /> Auto-updates every 8s
            </div>
          </div>
        )}

        {/* RETURN_CONFIRM_PENDING — customer is entering their confirm OTP */}
        {status === "RETURN_CONFIRM_PENDING" && (
          <div className="bg-amber-50 rounded-xl p-4 text-center space-y-2">
            <Shield size={28} className="mx-auto text-amber-500" />
            <p className="text-amber-700 font-semibold text-sm">
              Customer is confirming the return request
            </p>
            <p className="text-amber-600 text-xs">
              They need to enter their confirmation OTP. Stand by...
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
              <Clock size={11} className="animate-pulse" /> Auto-updates every 8s
            </div>
          </div>
        )}

        {/* RETURN_REQUESTED — ask for dropoff OTP */}
        {status === "RETURN_REQUESTED" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Ask the customer for their <strong>dropoff OTP</strong> to complete the job.
            </p>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={onDropoffKey}
                placeholder="Enter dropoff OTP"
                className="input pl-10 font-mono tracking-widest text-center text-lg"
              />
            </div>
            <button
              onClick={() => act(
                () => axiosInstance.post(`/api/valet/${requestId}/verify-dropoff`, null, { params: { otp: otp.trim() } }),
                "COMPLETED"
              )}
              disabled={loading || !otp.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Check size={15} /> Complete Job</>
              }
            </button>
          </div>
        )}

        {/* COMPLETED */}
        {status === "COMPLETED" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="font-bold text-gray-900">Job Complete! 🎉</p>
            <p className="text-sm text-gray-500">Great work. Your earnings have been recorded.</p>
            <button onClick={() => navigate("/valet/jobs")} className="btn-primary w-full">
              Find Next Job
            </button>
          </div>
        )}

        {(status === "REQUESTED" || status === "PENDING") && (
          <div className="bg-blue-50 rounded-xl p-4 text-center space-y-2">
            <Clock size={28} className="mx-auto text-blue-500" />
            <p className="text-blue-700 font-semibold text-sm">
              Job {status === "REQUESTED" ? "Requested" : "Pending"}
            </p>
            <p className="text-blue-600 text-xs">This job hasn't been assigned to you yet.</p>
            <button onClick={() => navigate("/valet/jobs")} className="btn-secondary w-full mt-3">
              Back to Jobs
            </button>
          </div>
        )}

        {status === "CANCELLED" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-gray-500 text-2xl">✕</span>
            </div>
            <p className="font-bold text-gray-900">Job Cancelled</p>
            <button onClick={() => navigate("/valet/jobs")} className="btn-primary w-full">
              Find Next Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveJobPage;
