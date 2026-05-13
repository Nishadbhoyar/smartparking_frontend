import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";

// AddRentalCarPage just redirects to MyFleet which has the modal
const AddRentalCarPage = () => {
  const navigate = useNavigate();
  // Auto-redirect to fleet page where Add Car modal lives
  return (
    <div className="page-container max-w-md">
      <div className="card text-center py-16 space-y-4">
        <Truck size={36} className="mx-auto text-gray-300" />
        <p className="text-gray-700 font-semibold">Add a rental car to your fleet</p>
        <p className="text-gray-500 text-sm">Use the My Fleet page to add and manage your cars.</p>
        <button onClick={() => navigate("/fleet-admin/fleet")} className="btn-primary text-sm">
          Go to My Fleet →
        </button>
      </div>
    </div>
  );
};
export default AddRentalCarPage;
