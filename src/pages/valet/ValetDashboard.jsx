import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import { Briefcase, DollarSign, Star, Clock, TrendingUp, ChevronRight } from "lucide-react";

const ValetDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [avg, setAvg]           = useState(null);
  const [activeJob, setActive]  = useState(null);
  const [loading, setL]         = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      axiosInstance.get(`/api/valet/earnings/${user.id}`).then((r) => r.data).catch(() => null),
      axiosInstance.get(`/api/feedback/valet/${user.id}/average`).then((r) => r.data).catch(() => null),
      // FIX: was /api/valet/jobs/active (didn't exist) — now correct endpoint + handles 204 no content
      axiosInstance.get(`/api/valet/jobs/active`, { params: { valetId: user.id } })
        .then((r) => r.status === 204 ? null : r.data)
        .catch(() => null),
    ]).then(([e, a, job]) => {
      setEarnings(e);
      setAvg(a);
      setActive(job);
    }).finally(() => setL(false));
  }, [user]);

  const quickActions = [
    { icon: Briefcase,  label: "Available Jobs", sub: "Browse open jobs",     to: "/valet/jobs",     color: "bg-blue-50 text-blue-600" },
    { icon: DollarSign, label: "My Earnings",    sub: "View your income",     to: "/valet/earnings", color: "bg-green-50 text-green-600" },
    { icon: Star,       label: "My Ratings",     sub: "See customer reviews", to: "/valet/ratings",  color: "bg-amber-50 text-amber-600" },
    { icon: Clock,      label: "Active Job",     sub: "Continue a job",       to: activeJob ? `/valet/job/${activeJob.id}` : "/valet/jobs", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="page-container space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Welcome, <span className="text-sp-blue">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Ready to take on jobs today?</p>
        </div>
        <button onClick={() => navigate("/valet/jobs")} className="btn-primary flex items-center gap-2 text-sm">
          Browse Jobs <ChevronRight size={14} />
        </button>
      </div>

      {/* Active job banner */}
      {!loading && activeJob && (
        <div
          onClick={() => navigate(`/valet/job/${activeJob.id}`)}
          className="bg-sp-dark rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sp-blue/20 rounded-xl flex items-center justify-center">
              <Briefcase size={18} className="text-sp-blue" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Active Job in Progress</p>
              <p className="text-gray-400 text-xs mt-0.5">Request #{activeJob.id} · {activeJob.status}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-white flex-shrink-0" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Earnings", value: loading ? "—" : formatCurrency(earnings?.totalEarningsToday || 0),    icon: DollarSign, color: "text-sp-blue",    bg: "bg-sp-blue/10" },
          { label: "This Month",       value: loading ? "—" : formatCurrency(earnings?.totalEarningsThisMonth || 0), icon: TrendingUp, color: "text-green-600",  bg: "bg-green-50" },
          { label: "Jobs Completed",   value: loading ? "—" : (earnings?.totalJobsCompleted || 0),                   icon: Briefcase,  color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Avg Rating",       value: loading ? "—" : avg != null ? `${Number(avg).toFixed(1)} ⭐` : "No ratings", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, sub, to, color }) => (
            <button key={label} onClick={() => navigate(to)}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group active:scale-[0.97]">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
              <div className="font-semibold text-gray-900 text-sm">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Unpaid earnings callout */}
      {!loading && earnings?.totalUnpaidEarnings > 0 && (
        <div onClick={() => navigate("/valet/earnings")}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-3">
            <DollarSign size={18} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Unpaid Balance</p>
              <p className="text-amber-700 font-bold">{formatCurrency(earnings.totalUnpaidEarnings)}</p>
            </div>
          </div>
          <span className="text-xs text-amber-700 font-semibold">Request Payout →</span>
        </div>
      )}
    </div>
  );
};

export default ValetDashboard;