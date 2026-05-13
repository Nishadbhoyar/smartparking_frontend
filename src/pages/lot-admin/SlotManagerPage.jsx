import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";
import SlotGrid from "../../components/shared/SlotGrid";
import toast from "react-hot-toast";
import { Zap, ParkingSquare, Layers, ChevronLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SlotManagerPage = () => {
  const { lotId }     = useParams();
  const navigate      = useNavigate();
  const [lot, setLot] = useState(null);
  const [slots, setSl] = useState([]);
  const [loading, setL] = useState(true);
  const [genLoading, setGL] = useState(false);
  
  // Clean State: No more 'defaultHourlyRate'. Pre-filled with sensible prices.
  const [form, setForm] = useState({
    regularCount: 10, evCount: 4, heavyVehicleCount: 0, bikeCount: 0, 
    regularRate: 50, evRate: 60, heavyVehicleRate: 100, bikeRate: 20
  });
  
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v === "" ? "" : Number(v) }));
  const [deleting, setDel] = useState(null);

  const handleDelete = async (slotId) => {
    if (!window.confirm("Delete this slot? This cannot be undone.")) return;
    setDel(slotId);
    try {
      await axiosInstance.delete(`/api/slots/${slotId}`);
      toast.success("Slot deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally { setDel(null); }
  };

  const load = async () => {
    setL(true);
    try {
      const [lotRes, slotsRes] = await Promise.all([
        axiosInstance.get(`/api/parking-lots/${lotId}`), 
        axiosInstance.get(`/api/slots/lot/${lotId}`)
      ]);
      setLot(lotRes.data);
      setSl(slotsRes.data || []);
    } finally { setL(false); }
  };

  useEffect(() => { load(); }, [lotId]);

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    
    // Validation: Ensure a rate is provided if slots are being generated
    if (form.regularCount > 0 && !form.regularRate) return toast.error("Enter a rate for Regular slots");
    if (form.evCount > 0 && !form.evRate) return toast.error("Enter a rate for EV slots");
    if (form.heavyVehicleCount > 0 && !form.heavyVehicleRate) return toast.error("Enter a rate for Heavy slots");
    if (form.bikeCount > 0 && !form.bikeRate) return toast.error("Enter a rate for Bike slots");

    setGL(true);
    try {
      const res = await axiosInstance.post("/api/slots/bulk-generate", { parkingLotId: Number(lotId), ...form });
      toast.success(res.data || "Slots generated!");
      load();
    } catch (err) {
      toast.error(err.response?.data || "Failed to generate slots");
    } finally { setGL(false); }
  };

  const available = slots.filter((s) => s.status === "AVAILABLE").length;

  return (
    <div className="page-container space-y-6">
      <button onClick={() => navigate("/lot-admin/lots")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} /> My Lots
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Slot Manager</h1>
          <p className="text-gray-500 text-sm mt-1">{lot?.name} · {slots.length} total · {available} available</p>
        </div>
      </div>

      {/* Bulk Generate */}
      <div className="card space-y-4 bg-amber-50/30 border border-amber-100/50">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          <h2 className="section-title">Bulk Generate Slots</h2>
        </div>
        <form onSubmit={handleBulkGenerate} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { cKey: "regularCount",      rKey: "regularRate",      label: "Regular", color: "text-blue-600" },
              { cKey: "evCount",           rKey: "evRate",           label: "EV",      color: "text-green-600" },
              { cKey: "heavyVehicleCount", rKey: "heavyVehicleRate", label: "Heavy",   color: "text-amber-600" },
              { cKey: "bikeCount",         rKey: "bikeRate",         label: "Bike",    color: "text-purple-600" },
            ].map(({ cKey, rKey, label, color }) => (
              <div key={cKey} className="bg-white border border-gray-100 rounded-xl p-3 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`text-xs font-bold uppercase tracking-wider ${color}`}>
                  {label}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium text-xs">Count</span>
                    <input type="number" min="0" max="200" value={form[cKey]}
                      onChange={(e) => set(cKey, e.target.value)}
                      className="input w-16 text-center py-1 px-1 h-8 font-semibold" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium text-xs">Rate (₹)</span>
                    <input type="number" min="0" value={form[rKey]} 
                      onChange={(e) => set(rKey, e.target.value)}
                      className="input w-16 text-center py-1 px-1 h-8 font-semibold text-green-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">
              Total new slots: <span className="font-bold text-gray-700">{form.regularCount + form.evCount + form.heavyVehicleCount + form.bikeCount}</span>
            </p>
            <button type="submit" disabled={genLoading || (form.regularCount + form.evCount + form.heavyVehicleCount + form.bikeCount === 0)}
              className="btn-primary flex items-center gap-2 px-8 h-11 disabled:opacity-50">
              {genLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Layers size={15} /> Generate Slots</>}
            </button>
          </div>
        </form>
      </div>

      {/* Live Slot Grid */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <ParkingSquare size={16} className="text-sp-blue" />
          <h2 className="section-title">Live Slot Map</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <SlotGrid lotId={Number(lotId)} initialSlots={slots} mode="admin" />

            {/* Slot list with delete */}
            {slots.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Manage Individual Slots</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{s.slotNumber}</p>
                        <p className="text-[10px] font-medium text-gray-500">{s.slotType} • ₹{s.hourlyRate}/hr</p>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id || s.status === "OCCUPIED"}
                        title={s.status === "OCCUPIED" ? "Cannot delete occupied slot" : "Delete slot"}
                        className="w-6 h-6 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleting === s.id
                          ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={11} />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default SlotManagerPage;