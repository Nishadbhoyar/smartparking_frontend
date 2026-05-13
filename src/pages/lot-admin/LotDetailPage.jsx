import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import axiosInstance from "../../api/axiosInstance";
import SlotGrid from "../../components/shared/SlotGrid";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { ChevronLeft, Layers, BarChart2, ToggleLeft, ToggleRight, MapPin, ParkingSquare } from "lucide-react";

const LotDetailPage = () => {
  const { lotId }     = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [lot, setLot] = useState(null);
  const [slots, setSl] = useState([]);
  const [loading, setL] = useState(true);

  const load = async () => {
    setL(true);
    try {
      const [lotRes, slotsRes] = await Promise.all([axiosInstance.get(`/api/parking-lots/${lotId}`), axiosInstance.get(`/api/slots/lot/${lotId}`)]);
      setLot(lotRes.data);
      setSl(slotsRes.data || []);
    } finally { setL(false); }
  };

  useEffect(() => { load(); }, [lotId]);

  const handleToggle = async () => {
    const next = lot.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axiosInstance.put(`/api/parking-lots/${lot.id}/status`, null, { params: { adminId: user.id, status: next } });
      toast.success(`Lot marked as ${next}`);
      load();
    } catch { toast.error("Status update failed"); }
  };

  const available = slots.filter((s) => s.status === "AVAILABLE").length;
  const occupied  = slots.filter((s) => s.status === "OCCUPIED").length;

  if (loading) return <div className="page-container"><div className="animate-pulse space-y-4"><div className="h-32 bg-gray-100 rounded-2xl" /><div className="h-48 bg-gray-100 rounded-2xl" /></div></div>;
  if (!lot)    return <div className="page-container text-center py-24 text-gray-500">Lot not found.</div>;

  return (
    <div className="page-container space-y-6 max-w-4xl">
      <button onClick={() => navigate("/lot-admin/lots")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} /> My Lots
      </button>

      {/* Header */}
      <div className="bg-sp-dark rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge text-xs ${lot.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>● {lot.status}</span>
              {lot.companyVerified && <span className="badge bg-blue-500/20 text-blue-400 text-xs">✓ Verified</span>}
            </div>
            <h1 className="font-display text-2xl font-bold text-white">{lot.name}</h1>
            <div className="flex items-center gap-1.5 text-sp-muted text-sm mt-1">
              <MapPin size={12} /> {lot.latitude?.toFixed(5)}, {lot.longitude?.toFixed(5)}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => navigate(`/lot-admin/lot/${lotId}/slots`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors">
              <Layers size={13} /> Manage Slots
            </button>
            <button onClick={() => navigate(`/lot-admin/analytics/${lotId}`)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors">
              <BarChart2 size={13} /> Analytics
            </button>
            <button onClick={handleToggle}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors">
              {lot.status === "ACTIVE" ? <ToggleRight size={13} className="text-green-400" /> : <ToggleLeft size={13} />}
              {lot.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          {[
            { label: "Total Slots", value: slots.length },
            { label: "Available",   value: available, color: "text-green-400" },
            { label: "Occupied",    value: occupied,  color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className={`font-display text-2xl font-bold ${color || "text-white"}`}>{value}</div>
              <div className="text-sp-muted text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      {lot.features?.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {lot.features.map((f) => <span key={f} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">{f}</span>)}
          </div>
        </div>
      )}

      {/* Live slot grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Live Slot Map</h2>
          <button onClick={() => navigate(`/lot-admin/lot/${lotId}/slots`)} className="text-xs text-sp-blue font-semibold hover:underline flex items-center gap-1">
            Manage slots →
          </button>
        </div>
        {slots.length === 0 ? (
          <div className="text-center py-10">
            <ParkingSquare size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No slots yet.</p>
            <button onClick={() => navigate(`/lot-admin/lot/${lotId}/slots`)} className="btn-primary mt-3 text-xs">Generate Slots</button>
          </div>
        ) : (
          <SlotGrid lotId={Number(lotId)} initialSlots={slots} mode="admin" />
        )}
      </div>
    </div>
  );
};
export default LotDetailPage;
