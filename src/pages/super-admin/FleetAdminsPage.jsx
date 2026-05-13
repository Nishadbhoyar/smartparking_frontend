import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Truck, CheckCircle, Clock } from "lucide-react";

const FleetAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true); // FIX: was setloading (lowercase L)

  const load = () => {
    setLoading(true);
    axiosInstance
      .get("/api/super-admin/fleet-admins")
      .then((r) => {
        // FIX: r.data || [] won't catch the case where r.data is a non-array
        // object (e.g. an error body like { message: "..." }). Array.isArray is the
        // correct guard — it only passes through real arrays.
        setAdmins(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false)); // FIX: was setL(false) — setL doesn't exist
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (id) => {
    try {
      await axiosInstance.put(`/api/super-admin/fleet-admins/${id}/verify`);
      toast.success("Fleet admin verified!");
      load();
    } catch {
      toast.error("Verification failed");
    }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Fleet Admins</h1>
        <p className="text-gray-500 text-sm mt-1">{admins.length} registered fleet admins</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <div className="card text-center py-16">
          <Truck size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No fleet admins registered yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Truck size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.verified ? (
                  <span className="badge bg-green-100 text-green-700 flex items-center gap-1 text-xs">
                    <CheckCircle size={10} /> Verified
                  </span>
                ) : (
                  <button
                    onClick={() => handleVerify(a.id)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
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

export default FleetAdminsPage;