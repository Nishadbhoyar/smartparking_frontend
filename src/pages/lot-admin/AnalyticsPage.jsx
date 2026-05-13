import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import { ChevronLeft, ParkingSquare, DollarSign, TrendingUp, Activity, BarChart2 } from "lucide-react";

const AnalyticsPage = () => {
  const { lotId }     = useParams();
  const navigate      = useNavigate();
  const [lot, setLot] = useState(null);
  const [overview, setOv] = useState(null);
  const [finance, setFin] = useState(null);
  const [loading, setL]   = useState(true);

  useEffect(() => {
    Promise.all([axiosInstance.get(`/api/parking-lots/${lotId}`), axiosInstance.get(`/api/analytics/overview/lot/${lotId}`), axiosInstance.get(`/api/analytics/finance/lot/${lotId}`)])
      .then(([l, ov, fin]) => { setLot(l.data); setOv(ov.data); setFin(fin.data); })
      .catch(() => {})
      .finally(() => setL(false));
  }, [lotId]);

  const occupancyPct = overview
    ? overview.totalSlots > 0 ? Math.round((overview.occupiedSlots / overview.totalSlots) * 100) : 0
    : 0;

  return (
    <div className="page-container space-y-6 max-w-4xl">
      <button onClick={() => navigate("/lot-admin/lots")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} /> My Lots
      </button>
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">{lot?.name}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[1,2,3,4].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />)}</div>
      ) : (
        <>
          {/* Slot overview */}
          <div>
            <h2 className="section-title mb-4">Slot Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Slots",    value: overview?.totalSlots || 0,     icon: ParkingSquare, color: "text-gray-700",  bg: "bg-gray-50" },
                { label: "Occupied",       value: overview?.occupiedSlots || 0,  icon: Activity,      color: "text-red-600",   bg: "bg-red-50" },
                { label: "Available",      value: overview?.availableSlots || 0, icon: ParkingSquare, color: "text-green-600", bg: "bg-green-50" },
                { label: "Today's Revenue",value: formatCurrency(overview?.todaysEarnings || 0), icon: DollarSign, color: "text-sp-blue", bg: "bg-blue-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="stat-card">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}><Icon size={18} className={color} /></div>
                  <div><div className={`font-display text-xl font-bold ${color}`}>{value}</div><div className="text-xs text-gray-500">{label}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy bar */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Current Occupancy</h2>
              <span className="font-display text-2xl font-bold text-sp-blue">{occupancyPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div className={`h-4 rounded-full transition-all duration-700 ${occupancyPct > 80 ? "bg-red-500" : occupancyPct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${occupancyPct}%` }} />
            </div>
            <p className="text-xs text-gray-500">{overview?.occupiedSlots} of {overview?.totalSlots} slots occupied</p>
          </div>

          {/* Financial overview */}
          {finance && (
            <div>
              <h2 className="section-title mb-4">Financial Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Revenue",     value: formatCurrency(finance.totalRevenue || 0),           icon: DollarSign,  color: "text-green-600", bg: "bg-green-50" },
                  { label: "Transactions",       value: finance.totalTransactions || 0,                      icon: BarChart2,   color: "text-sp-blue",   bg: "bg-blue-50" },
                  { label: "Avg. Transaction",   value: formatCurrency(finance.averageTransactionValue || 0),icon: TrendingUp,  color: "text-amber-600", bg: "bg-amber-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="stat-card">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}><Icon size={18} className={color} /></div>
                    <div><div className={`font-display text-xl font-bold ${color}`}>{value}</div><div className="text-xs text-gray-500">{label}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AnalyticsPage;
