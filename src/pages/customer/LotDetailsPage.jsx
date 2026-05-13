import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


import axiosInstance from "../../api/axiosInstance";
import SlotGrid from "../../components/shared/SlotGrid";
import { formatCurrency, formatDate, statusColor } from "../../utils/formatters";
import { MapPin, Star, ParkingSquare, ChevronLeft, Zap, Shield, Wifi, Camera, ArrowRight } from "lucide-react";

const FEATURE_ICON = { "EV Charging": Zap, "CCTV": Camera, "Security": Shield, "WiFi": Wifi };

const LotDetailsPage = () => {
  const { lotId }   = useParams();
  const navigate    = useNavigate();
  const [lot, setLot]           = useState(null);
  const [slots, setSlots]       = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("slots"); // slots | reviews

  useEffect(() => {
    const fetch = async () => {
      try {
        const [lotRes, slotsRes] = await Promise.all([
          axiosInstance.get(`/api/parking-lots/${lotId}`),
          axiosInstance.get(`/api/slots/lot/${lotId}`),
        ]);
        setLot(lotRes.data);
        setSlots(slotsRes.data || []);

        // Reviews (non-critical — don't block on failure)
        try {
          const [rvRes, avgRes] = await Promise.all([
            axiosInstance.get(`/api/feedback/lot/${lotId}`),
            axiosInstance.get(`/api/feedback/lot/${lotId}/average`),
          ]);
          setReviews(rvRes.data || []);
          setAvgRating(avgRes.data);
        } catch { /* reviews optional */ }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [lotId]);

  const available = slots.filter((s) => s.status === "AVAILABLE").length;

  const handleSlotSelect = (slot) => {
    navigate(`/customer/book/${lotId}?slotId=${slot.id}&slotType=${slot.slotType}&rate=${slot.hourlyRate}`);
  };

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  if (!lot) return (
    <div className="page-container text-center py-24">
      <p className="text-gray-500">Parking lot not found.</p>
    </div>
  );

  return (
    <div className="page-container space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} /> Back to map
      </button>

      {/* ── Header ── */}
      <div className="bg-sp-dark rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge text-xs ${lot.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                ● {lot.status}
              </span>
              {lot.companyVerified && (
                <span className="badge bg-blue-500/20 text-blue-400 text-xs">✓ Verified</span>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-white">{lot.name}</h1>
            <div className="flex items-center gap-1.5 text-sp-muted text-sm mt-1">
              <MapPin size={13} /> {lot.latitude?.toFixed(4)}, {lot.longitude?.toFixed(4)}
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} className={s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
                ))}
                <span className="text-sp-muted text-xs ml-1">{Number(avgRating).toFixed(1)} ({reviews.length} reviews)</span>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display text-3xl font-bold text-white">{available}</div>
            <div className="text-sp-muted text-sm">of {slots.length} available</div>
            {lot.status === "ACTIVE" && available > 0 && (
              <button onClick={() => navigate(`/customer/book/${lotId}`)}
                className="mt-3 btn-primary flex items-center gap-1.5 text-sm">
                Book Now <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        {lot.features?.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
            {lot.features.map((f) => {
              const Icon = FEATURE_ICON[f] || Shield;
              return (
                <span key={f} className="flex items-center gap-1.5 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">
                  <Icon size={11} /> {f}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {["slots","reviews"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t} {t === "reviews" && reviews.length > 0 && `(${reviews.length})`}
          </button>
        ))}
      </div>

      {/* ── Slot Grid ── */}
      {tab === "slots" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Available Slots</h2>
            <span className="text-xs text-gray-500">Click a green slot to book</span>
          </div>
          <SlotGrid
            lotId={Number(lotId)}
            initialSlots={slots}
            mode="customer"
            onSlotSelect={handleSlotSelect}
          />
        </div>
      )}

      {/* ── Reviews ── */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="card text-center py-12">
              <Star size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-gray-900">{r.customerName || "Anonymous"}</div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
export default LotDetailsPage;
