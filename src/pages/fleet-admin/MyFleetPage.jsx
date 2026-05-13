import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { Truck, Plus, X, ToggleLeft, ToggleRight, Users, Fuel, MapPin, Camera } from "lucide-react";
import PickupAddressPicker from "../../components/shared/PickupAddressPicker";
import CarImageManager     from "../../pages/car-owner/Carimagemanager";

const FUEL_TYPES         = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];
const TRANSMISSION_TYPES = ["MANUAL", "AUTOMATIC"];
const STATUS_COLOR       = {
  AVAILABLE:   "bg-green-100 text-green-700",
  RENTED:      "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-gray-100 text-gray-600",
};

const BLANK_FORM = {
  make: "", model: "", year: new Date().getFullYear(),
  licensePlate: "", color: "", seatingCapacity: 5,
  fuelType: "PETROL", transmission: "MANUAL",
  dailyRate: 1500, securityDeposit: 5000,
  pickupAddress: "", pickupLat: null, pickupLng: null,
};

const MyFleetPage = () => {
  const { user }        = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setL] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSave] = useState(false);
  const [form, setForm]   = useState(BLANK_FORM);

  const [imageModal, setImageModal] = useState(null);

  const companyId = user?.companyId || user?.id;
  const set   = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const open  = () => { setForm(BLANK_FORM); setModal(true); };
  const close = () => {
    setModal(false);
    if (searchParams.has("add")) {
      searchParams.delete("add");
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    if (searchParams.get("add") === "1") open();
  }, []); // eslint-disable-line

  const load = () => {
    setL(true);
    axiosInstance.get(`/api/rental-cars/company/${companyId}`)
      .then((r) => setCars(r.data || []))
      .catch(() => setCars([]))
      .finally(() => setL(false));
  };
  useEffect(() => { if (user?.id) load(); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.make || !form.licensePlate) return toast.error("Make and license plate are required");
    setSave(true);
    try {
      await axiosInstance.post(`/api/rental-cars/company/${companyId}/list`, {
        make:            form.make,
        model:           form.model,
        year:            Number(form.year),
        licensePlate:    form.licensePlate,
        color:           form.color,
        seatingCapacity: Number(form.seatingCapacity),
        fuelType:        form.fuelType,
        transmission:    form.transmission,
        dailyRate:       Number(form.dailyRate),
        securityDeposit: Number(form.securityDeposit),
        pickupAddress:   form.pickupAddress,
        ...(form.pickupLat != null ? { pickupLatitude:  form.pickupLat  } : {}),
        ...(form.pickupLng != null ? { pickupLongitude: form.pickupLng  } : {}),
      });
      toast.success("Car listed successfully!");
      close();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to list car");
    } finally { setSave(false); }
  };

  const handleToggle = async (car) => {
    if (car.status === "RENTED") return toast.error("Cannot change status while car is rented out.");
    const next = car.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    try {
      await axiosInstance.put(`/api/rental-cars/${car.id}/status`, null, { params: { status: next } });
      toast.success(`Car marked as ${next}`);
      load();
    } catch { toast.error("Status update failed"); }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Fleet</h1>
          <p className="text-gray-500 text-sm mt-1">
            {cars.length} car{cars.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        <button onClick={open} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Car
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="card text-center py-16">
          <Truck size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No cars in your fleet yet</p>
          <button onClick={open} className="btn-primary mt-4 text-xs">Add First Car</button>
        </div>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
            <div key={car.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {car.make} {car.model}{" "}
                      <span className="text-gray-400 font-normal text-sm">{car.year}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{car.licensePlate} · {car.color}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users size={10} /> {car.seatingCapacity} seats</span>
                      <span className="flex items-center gap-1"><Fuel size={10} /> {car.fuelType}</span>
                      <span>{car.transmission}</span>
                    </div>
                    {car.pickupAddress && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={10} className="text-green-500" />
                        {car.pickupAddress}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-sp-blue">{formatCurrency(car.dailyRate)}/day</p>
                    <span className={`badge text-xs mt-1 ${STATUS_COLOR[car.status] || "bg-gray-100 text-gray-600"}`}>
                      {car.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle(car)}
                    disabled={car.status === "RENTED"}
                    className="w-8 h-8 ml-2 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    {car.status === "AVAILABLE"
                      ? <ToggleRight size={16} className="text-green-600" />
                      : <ToggleLeft  size={16} className="text-gray-400"  />}
                  </button>
                </div>
              </div>

              {/* Car image strip */}
              <div className="mt-3 pt-3 border-t border-gray-50">
                <CarImageManager carId={car.id} readOnly className="mb-2" />
                <button
                  onClick={() => setImageModal(car.id)}
                  className="w-full text-xs text-gray-500 hover:text-sp-blue border border-gray-100 hover:border-sp-blue/30 rounded-xl py-2 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Camera size={12} /> Manage Photos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Car Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-modal flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-6">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">List a New Car</h2>
                <p className="text-gray-500 text-xs mt-0.5">Add a vehicle to your rental fleet</p>
              </div>
              <button onClick={close} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label">Make *</label>
                  <input value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="Maruti" className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Model *</label>
                  <input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Swift" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label">Year</label>
                  <input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Color</label>
                  <input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="White" className="input" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label">License Plate *</label>
                <input
                  value={form.licensePlate}
                  onChange={(e) => set("licensePlate", e.target.value.toUpperCase())}
                  placeholder="MH 12 AB 3456"
                  className="input font-mono tracking-wider uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="label">Seats</label>
                  <input type="number" min="2" max="12" value={form.seatingCapacity} onChange={(e) => set("seatingCapacity", e.target.value)} className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Fuel</label>
                  <select value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)} className="input">
                    {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label">Gearbox</label>
                  <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} className="input">
                    {TRANSMISSION_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label">Daily Rate (₹)</label>
                  <input type="number" value={form.dailyRate} onChange={(e) => set("dailyRate", e.target.value)} className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Security Deposit (₹)</label>
                  <input type="number" value={form.securityDeposit} onChange={(e) => set("securityDeposit", e.target.value)} className="input" />
                </div>
              </div>

              {/* Pickup Address with Map Picker */}
              <div className="space-y-1.5">
                <label className="label flex items-center gap-1.5">
                  <MapPin size={12} className="text-green-600" />
                  Pickup Address
                  <span className="text-gray-400 font-normal text-xs ml-1">— type or click on loaction button </span>
                </label>
                <PickupAddressPicker
                  value={form.pickupAddress}
                  onChange={(addr, lat, lng) =>
                    setForm((p) => ({ ...p, pickupAddress: addr, pickupLat: lat, pickupLng: lng }))
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : "List Car"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Management Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/50 z-modal flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-6">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">Vehicle Photos</h2>
                <p className="text-gray-500 text-xs mt-0.5">Upload up to 6 photos · JPG, PNG or WebP · Max 5MB each</p>
              </div>
              <button onClick={() => { setImageModal(null); load(); }}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <CarImageManager carId={imageModal} />
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => { setImageModal(null); load(); }} className="w-full btn-primary text-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyFleetPage;