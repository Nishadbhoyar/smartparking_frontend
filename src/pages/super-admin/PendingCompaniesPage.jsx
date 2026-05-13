import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Building2, CheckCircle, XCircle, RefreshCw, Phone, Mail, MapPin } from "lucide-react";

const PendingCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("pending"); // "pending" | "verified" | "all"
  const [busy, setBusy]           = useState(null); // id of company being acted on

  const load = () => {
    setLoading(true);
    const params = filter === "pending" ? "?verified=false"
                 : filter === "verified" ? "?verified=true"
                 : "";
    axiosInstance.get(`/api/super-admin/rental-companies${params}`)
      .then((r) => setCompanies(r.data || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleVerify = async (id, companyName) => {
    setBusy(id);
    try {
      await axiosInstance.put(`/api/super-admin/rental-companies/${id}/verify`);
      toast.success(`${companyName} verified!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (id, companyName) => {
    if (!window.confirm(`Reject ${companyName}? They won't be able to use the fleet feature.`)) return;
    setBusy(id);
    try {
      await axiosInstance.put(`/api/super-admin/rental-companies/${id}/reject`);
      toast.success(`${companyName} rejected`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Rental Companies</h1>
          <p className="text-gray-500 text-sm mt-1">Review and verify fleet operator registrations</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-xs">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "pending",  label: "Pending" },
          { key: "verified", label: "Verified" },
          { key: "all",      label: "All" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === key
                ? "bg-sp-blue text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <Building2 size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium text-sm">
            No {filter !== "all" ? filter : ""} companies found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    c.platformVerified ? "bg-green-50" : "bg-amber-50"
                  }`}>
                    <Building2 size={18} className={c.platformVerified ? "text-green-600" : "text-amber-500"} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{c.companyName}</p>
                      <span className={`badge text-xs ${
                        c.platformVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {c.platformVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Admin: <span className="font-medium">{c.fleetAdminName}</span>
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                      {c.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {c.city}
                        </span>
                      )}
                      {c.contactEmail && (
                        <span className="flex items-center gap-1">
                          <Mail size={10} /> {c.contactEmail}
                        </span>
                      )}
                      {c.contactPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={10} /> {c.contactPhone}
                        </span>
                      )}
                      {c.registrationNumber && (
                        <span className="font-mono">{c.registrationNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {!c.platformVerified ? (
                    <button
                      onClick={() => handleVerify(c.id, c.companyName)}
                      disabled={busy === c.id}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      {busy === c.id
                        ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <CheckCircle size={12} />
                      }
                      Verify
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(c.id, c.companyName)}
                      disabled={busy === c.id}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-red-500 border-red-100 hover:bg-red-50"
                    >
                      {busy === c.id
                        ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        : <XCircle size={12} />
                      }
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCompaniesPage;