import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import { Tag, Plus, X, ToggleRight } from "lucide-react";

const PROMO_TYPES = ["PERCENT", "FLAT"];

const PromoCodesPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setL]     = useState(true);
  const [modal, setModal]   = useState(false);
  const [saving, setSave]   = useState(false);

  // FIX: field names now match CreatePromoRequestDTO exactly
  // "type" (was "promoType"), "minBookingAmount" (was "minOrderAmount")
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    discountValue: 10,
    minBookingAmount: 100,
    maxUses: 100,
    newUsersOnly: false,
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = () => {
    setL(true);
    axiosInstance
      .get("/api/promo/all")
      .then((r) => setPromos(r.data || []))
      .catch(() => setPromos([]))
      .finally(() => setL(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error("Promo code is required");
    setSave(true);
    try {
      await axiosInstance.post("/api/promo/create", {
        ...form,
        code: form.code.toUpperCase(),
      });
      toast.success("Promo code created!");
      setModal(false);
      setForm({ code: "", type: "PERCENT", discountValue: 10, minBookingAmount: 100, maxUses: 100, newUsersOnly: false });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create promo");
    } finally {
      setSave(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axiosInstance.put(`/api/promo/${id}/deactivate`);
      toast.success("Promo deactivated");
      load();
    } catch {
      toast.error("Failed to deactivate");
    }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {promos.filter((p) => p.active).length} active promos
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Create Promo
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-16 animate-pulse" />
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="card text-center py-16">
          <Tag size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No promo codes yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {promos.map((p) => (
            <div
              key={p.id}
              className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 ${
                p.active ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.active ? "bg-purple-50" : "bg-gray-50"}`}>
                  <Tag size={16} className={p.active ? "text-purple-600" : "text-gray-400"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-gray-900 tracking-wider">{p.code}</p>
                    {p.newUsersOnly && (
                      <span className="badge text-xs bg-blue-100 text-blue-700">New Users Only</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {/* FIX: p.type (was p.promoType) */}
                    {p.type === "PERCENT" ? `${p.discountValue}% off` : `₹${p.discountValue} off`}
                    {" · "}
                    {/* FIX: p.minBookingAmount (was p.minOrderAmount) */}
                    Min ₹{p.minBookingAmount ?? "—"}
                    {" · "}
                    {/* FIX: p.usedCount (was p.usageCount — this is why it always showed 0) */}
                    {p.usedCount ?? 0}/{p.maxUses ?? "∞"} used
                    {p.expiryDate && ` · Expires ${formatDate(p.expiryDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.active ? "Active" : "Inactive"}
                </span>
                {p.active && (
                  <button
                    onClick={() => handleDeactivate(p.id)}
                    className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <ToggleRight size={14} className="text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display text-lg font-bold text-gray-900">Create Promo Code</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="label">Code *</label>
                <input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="FIRST50"
                  className="input font-mono tracking-widest uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label">Type</label>
                  {/* FIX: key is "type" (was "promoType") */}
                  <select value={form.type} onChange={(e) => set("type", e.target.value)} className="input">
                    {PROMO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label">{form.type === "PERCENT" ? "% Off" : "₹ Off"}</label>
                  <input type="number" min="1" value={form.discountValue}
                    onChange={(e) => set("discountValue", e.target.value)} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  {/* FIX: key is "minBookingAmount" (was "minOrderAmount") */}
                  <label className="label">Min Booking (₹)</label>
                  <input type="number" min="0" value={form.minBookingAmount}
                    onChange={(e) => set("minBookingAmount", e.target.value)} className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Max Uses</label>
                  <input type="number" min="1" value={form.maxUses}
                    onChange={(e) => set("maxUses", e.target.value)} className="input" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="newUsersOnly"
                  checked={form.newUsersOnly}
                  onChange={(e) => set("newUsersOnly", e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
                <label htmlFor="newUsersOnly" className="label cursor-pointer">New customers only</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodesPage;