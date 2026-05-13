// ── AvailableJobsPage.jsx ─────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Car, MapPin, RefreshCw, Briefcase, ChevronRight } from "lucide-react";

const AvailableJobsPage = () => {
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [jobs, setJobs]   = useState([]);
  const [loading, setL]   = useState(true);
  const [accepting, setA] = useState(null);

  const load = async () => {
    setL(true);
    try { const r = await axiosInstance.get("/api/valet/jobs/available"); setJobs(r.data || []); }
    catch { setJobs([]); }
    finally { setL(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (requestId) => {
    setA(requestId);
    try {
      await axiosInstance.post(`/api/valet/${requestId}/accept`, null, { params: { valetId: user.id } });
      toast.success("Job accepted!");
      navigate(`/valet/job/${requestId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not accept job");
    } finally { setA(null); }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} waiting</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-24" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium text-sm">No jobs available right now</p>
          <p className="text-gray-400 text-xs mt-1">Check back in a few minutes</p>
          <button onClick={load} className="btn-primary mt-4 text-xs">Refresh</button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{job.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Car size={11} /> {job.carPlateNo}
                    </p>
                    <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full mt-1.5 inline-block">
                      Awaiting pickup
                    </span>
                  </div>
                </div>
                <button onClick={() => handleAccept(job.id)} disabled={accepting === job.id}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 flex-shrink-0">
                  {accepting === job.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Accept</span><ChevronRight size={13} /></>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AvailableJobsPage;
