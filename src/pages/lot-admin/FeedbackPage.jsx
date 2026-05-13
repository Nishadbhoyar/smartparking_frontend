import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import axiosInstance from "../../api/axiosInstance";
import { formatDate } from "../../utils/formatters";
import { Star, MessageSquare } from "lucide-react";

const FeedbackPage = () => {
  const { user }         = useAuth();
  const [lots, setLots]  = useState([]);
  const [selLot, setSel] = useState(null);
  const [reviews, setRev] = useState([]);
  const [avg, setAvg]    = useState(null);
  const [loading, setL]  = useState(false);

  useEffect(() => {
    axiosInstance.get(`/api/parking-lots/admin/${user.id}`).then((r) => {
      const data = r.data || [];
      setLots(data);
      if (data.length) setSel(data[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!selLot) return;
    setL(true);
    Promise.all([axiosInstance.get(`/api/feedback/lot/${selLot}`), axiosInstance.get(`/api/feedback/lot/${selLot}/average`)])
      .then(([rv, avgRes]) => { setRev(rv.data || []); setAvg(avgRes.data); })
      .catch(() => {})
      .finally(() => setL(false));
  }, [selLot]);

  return (
    <div className="page-container space-y-6 max-w-xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Customer Feedback</h1>

      {lots.length > 1 && (
        <select value={selLot || ""} onChange={(e) => setSel(Number(e.target.value))} className="input max-w-xs">
          {lots.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      )}

      {avg !== null && (
        <div className="card flex items-center gap-4">
          <div className="text-center">
            <div className="font-display text-4xl font-bold text-gray-900">{Number(avg).toFixed(1)}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map((s) => {
              const cnt = reviews.filter((r) => r.rating === s).length;
              const pct = reviews.length ? (cnt / reviews.length) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-gray-500 text-right">{s}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-gray-500">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-12"><MessageSquare size={28} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500 text-sm">No reviews yet</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">{r.customerName || "Customer"}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default FeedbackPage;
