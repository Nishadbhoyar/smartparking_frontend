import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import LotPickerMap from "../../components/shared/LotPickerMap";
import toast from "react-hot-toast";
import { Plus, ParkingSquare, BarChart2, Layers, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

const STATUSES = ["ACTIVE","INACTIVE"];

const MyParkingLotsPage = () => {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const [lots, setLots] = useState([]);
  const [loading, setL] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSave] = useState(false);
  const [form, setForm] = useState({ name: "", latitude: null, longitude: null });

  const load = () => {
    setL(true);
    axiosInstance.get(`/api/parking-lots/admin/${user.id}`)
      .then((r) => setLots(r.data || []))
      .catch(() => setLots([]))
      .finally(() => setL(false));
  };

  useEffect(() => { load(); }, [user]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Lot name is required");
    if (!form.latitude || !form.longitude) return toast.error("Click the map to set location");
    setSave(true);
    try {
      await axiosInstance.post("/api/parking-lots/add", { ...form, adminId: user.id });
      toast.success("Parking lot created!");
      setModal(false);
      setForm({ name: "", latitude: null, longitude: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lot");
    } finally { setSave(false); }
  };

  const handleToggleStatus = async (lot) => {
    const next = lot.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axiosInstance.put(`/api/parking-lots/${lot.id}/status`, null, { params: { adminId: user.id, status: next } });
      toast.success(`Lot marked as ${next}`);
      load();
    } catch { toast.error("Status update failed"); }
  };

  const handleDelete = async (lot) => {
    if (!window.confirm(`Delete "${lot.name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/api/parking-lots/${lot.id}/admin/${user.id}`);
      toast.success("Lot deleted");
      load();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Parking Lots</h1>
          <p className="text-gray-500 text-sm mt-1">{lots.length} lot{lots.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Lot
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />)}</div>
      ) : lots.length === 0 ? (
        <div className="card text-center py-16">
          <ParkingSquare size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No parking lots yet</p>
          <button onClick={() => setModal(true)} className="btn-primary mt-4 text-xs">Add Your First Lot</button>
        </div>
      ) : (
        <div className="space-y-3">
          {lots.map((lot) => (
            <div key={lot.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${lot.status === "ACTIVE" ? "bg-green-50" : "bg-gray-50"}`}>
                    <ParkingSquare size={18} className={lot.status === "ACTIVE" ? "text-green-600" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{lot.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lot.latitude?.toFixed(4)}, {lot.longitude?.toFixed(4)}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <span className={`badge text-xs ${lot.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{lot.status}</span>
                      {lot.companyVerified && <span className="badge bg-blue-100 text-blue-700 text-xs">✓ Verified</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => navigate(`/lot-admin/lot/${lot.id}/slots`)} title="Manage Slots"
                    className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors">
                    <Layers size={14} className="text-blue-600" />
                  </button>
                  <button onClick={() => navigate(`/lot-admin/analytics/${lot.id}`)} title="Analytics"
                    className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center hover:bg-amber-100 transition-colors">
                    <BarChart2 size={14} className="text-amber-600" />
                  </button>
                  <button onClick={() => handleToggleStatus(lot)} title="Toggle status"
                    className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    {lot.status === "ACTIVE" ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-gray-400" />}
                  </button>
                  <button onClick={() => handleDelete(lot)} title="Delete lot"
                    className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
              {lot.features?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
                  {lot.features.map((f) => <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Add Lot Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-modal flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display text-lg font-bold text-gray-900">Add Parking Lot</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="label">Lot Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Central Square Parking" className="input" />
              </div>
              <div className="space-y-1.5">
                <label className="label">Location * <span className="text-gray-400 normal-case font-normal">(click on map)</span></label>
                <LotPickerMap
                  value={form}
                  onChange={({ latitude, longitude }) => setForm((p) => ({ ...p, latitude, longitude }))}
                  height="240px"
                />
                {form.latitude && (
                  <p className="text-xs text-green-600 font-medium">✓ {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Lot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyParkingLotsPage;
