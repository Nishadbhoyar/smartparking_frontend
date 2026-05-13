import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatDate } from "../../utils/formatters";
import { Star } from "lucide-react";

const MyRatingsPage = () => {
  const { user }            = useAuth();
  const [reviews, setRev]   = useState([]);
  const [avg, setAvg]       = useState(null);
  const [loading, setL]     = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get(`/api/feedback/valet/${user.id}`),
      axiosInstance.get(`/api/feedback/valet/${user.id}/average`),
    ])
      .then(([rv, avgRes]) => { setRev(rv.data || []); setAvg(avgRes.data); })
      .catch(() => {})
      .finally(() => setL(false));
  }, [user]);

  const dist = [5,4,3,2,1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === s).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="page-container space-y-6 max-w-xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">My Ratings</h1>

      {/* Average */}
      {avg !== null && (
        <div className="card flex items-center gap-6">
          <div className="text-center">
            <div className="font-display text-5xl font-bold text-gray-900">{Number(avg).toFixed(1)}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{reviews.length} reviews</div>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 text-right">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-16 animate-pulse" />)}</div>
      : reviews.length === 0 ? (
        <div className="card text-center py-12">
          <Star size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No reviews yet. Complete jobs to receive ratings!</p>
        </div>
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
export default MyRatingsPage;
