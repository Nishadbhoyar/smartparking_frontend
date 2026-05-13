import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import axiosInstance from "../../api/axiosInstance";
import { formatCurrency, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import { DollarSign, TrendingUp, CheckCircle, Clock, Star } from "lucide-react";

// ── My Earnings ───────────────────────────────────────────────────────────────
export const MyEarningsPage = () => {
  const { user }          = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setL]   = useState(true);
  const [paying, setPay]  = useState(false);

  useEffect(() => {
    axiosInstance.get(`/api/valet/earnings/${user.id}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setL(false));
  }, [user]);

  const handlePayout = async () => {
    setPay(true);
    try {
      await axiosInstance.post(`/api/valet/earnings/${user.id}/payout`);
      toast.success("Payout requested! Processing in 1–2 business days.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payout request failed");
    } finally { setPay(false); }
  };

  if (loading) return <div className="page-container"><div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div></div>;

  return (
    <div className="page-container space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">My Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today",       value: formatCurrency(data?.totalEarningsToday || 0),     icon: Clock,       color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "This Week",   value: formatCurrency(data?.totalEarningsThisWeek || 0),  icon: TrendingUp,  color: "text-green-600",  bg: "bg-green-50" },
          { label: "This Month",  value: formatCurrency(data?.totalEarningsThisMonth || 0), icon: DollarSign,  color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Jobs Done",   value: data?.totalJobsCompleted || 0,                      icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}><Icon size={18} className={color} /></div>
            <div><div className={`font-display text-xl font-bold ${color}`}>{value}</div><div className="text-xs text-gray-500 mt-0.5">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Payout */}
      {(data?.totalUnpaidEarnings || 0) > 0 && (
        <div className="bg-sp-dark rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Unpaid Balance</p>
            <p className="font-display text-2xl font-bold text-sp-blue mt-0.5">{formatCurrency(data.totalUnpaidEarnings)}</p>
          </div>
          <button onClick={handlePayout} disabled={paying}
            className="btn-primary flex items-center gap-2 flex-shrink-0">
            {paying ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Request Payout"}
          </button>
        </div>
      )}

      {/* Recent earnings */}
      <div>
        <h2 className="section-title mb-4">Recent Jobs</h2>
        {!data?.recentEarnings?.length ? (
          <div className="card text-center py-12"><DollarSign size={28} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500 text-sm">No earnings yet. Complete a job to get started!</p></div>
        ) : (
          <div className="space-y-2">
            {data.recentEarnings.map((e) => (
              <div key={e.jobId} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">Job #{e.jobId}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(e.earnedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(e.valetCut)}</p>
                  <p className="text-xs text-gray-400">of {formatCurrency(e.jobAmount)}</p>
                  <span className={`badge text-xs mt-1 ${e.paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{e.paid ? "Paid" : "Pending"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyEarningsPage;
