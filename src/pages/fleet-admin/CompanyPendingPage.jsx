import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { Clock, CheckCircle, XCircle, RefreshCw, Building2 } from "lucide-react";

const CompanyPendingPage = () => {
  const navigate  = useNavigate();
  const [company, setCompany]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    axiosInstance.get("/api/rental-company/my")
      .then((r) => setCompany(r.data))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStatus(); }, []);

  // If verified, redirect straight to dashboard
  useEffect(() => {
    if (company?.platformVerified) {
      navigate("/fleet-admin/dashboard", { replace: true });
    }
  }, [company, navigate]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-sp-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="page-container max-w-md text-center py-20">
        <XCircle size={40} className="mx-auto text-red-400 mb-4" />
        <h2 className="font-display font-bold text-gray-900 text-xl">No Company Found</h2>
        <p className="text-gray-500 text-sm mt-2">You haven't registered a company yet.</p>
        <button onClick={() => navigate("/fleet-admin/register-company")} className="btn-primary mt-6">
          Register Now
        </button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-md">
      <div className="card text-center py-12 space-y-5">
        {/* Icon */}
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
          <Clock size={28} className="text-amber-500" />
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Verification Pending</h2>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xs mx-auto">
            Your company <span className="font-semibold text-gray-700">{company.companyName}</span> is
            under review. You'll be able to list cars once approved.
          </p>
        </div>

        {/* Company details summary */}
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 size={13} className="text-gray-400 flex-shrink-0" />
            <span>{company.companyName}</span>
          </div>
          {company.city && (
            <div className="text-gray-500 text-xs pl-5">{company.city}</div>
          )}
          {company.registrationNumber && (
            <div className="text-gray-400 text-xs pl-5 font-mono">{company.registrationNumber}</div>
          )}
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Clock size={11} /> Awaiting super admin approval
        </div>

        <p className="text-gray-400 text-xs">Usually takes 24–48 hours</p>

        {/* Refresh */}
        <button
          onClick={fetchStatus}
          className="btn-secondary flex items-center gap-2 mx-auto text-sm"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Check Status
        </button>
      </div>
    </div>
  );
};

export default CompanyPendingPage;