// CarOwnersPage.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Car, CheckCircle, Clock } from "lucide-react";

const CarOwnersPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setL]     = useState(true);

  const load = () => {
    setL(true);
    axiosInstance.get("/api/super-admin/car-owners").then((r) => setOwners(r.data || [])).catch(() => setOwners([])).finally(() => setL(false));
  };
  useEffect(() => { load(); }, []);

  const handleVerify = async (id) => {
    try { await axiosInstance.put(`/api/super-admin/car-owners/${id}/verify`); toast.success("Car owner verified!"); load(); }
    catch { toast.error("Verification failed"); }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Car Owners</h1>
        <p className="text-gray-500 text-sm mt-1">{owners.length} registered car owners</p>
      </div>
      {loading ? <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      : owners.length === 0 ? (
        <div className="card text-center py-16"><Car size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500 text-sm">No car owners yet</p></div>
      ) : (
        <div className="space-y-2">
          {owners.map((o) => (
            <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Car size={16} className="text-orange-500" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{o.name}</p>
                  <p className="text-xs text-gray-500">{o.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {o.verified ? (
                  <span className="badge bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={11} /> Verified</span>
                ) : (
                  <button onClick={() => handleVerify(o.id)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Clock size={11} /> Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CarOwnersPage;
