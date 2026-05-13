import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ParkingSquare, CheckCircle } from "lucide-react";

const ParkingLotAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setL]     = useState(true);

  useEffect(() => {
    axiosInstance.get("/api/super-admin/parking-lot-admins")
      .then((r) => setAdmins(r.data || []))
      .catch(() => setAdmins([]))
      .finally(() => setL(false));
  }, []);

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Parking Lot Admins</h1>
        <p className="text-gray-500 text-sm mt-1">{admins.length} registered admins</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      ) : admins.length === 0 ? (
        <div className="card text-center py-16">
          <ParkingSquare size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No parking lot admins registered yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <ParkingSquare size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.email}</p>
                </div>
              </div>
              <span className="badge bg-green-100 text-green-700 flex items-center gap-1 text-xs">
                <CheckCircle size={10} /> Admin
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ParkingLotAdminsPage;
