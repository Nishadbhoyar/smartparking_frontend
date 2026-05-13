import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AddCarPage — Immediately redirects to MyCarsPage with ?add=1
 * so the "Add Car" modal opens automatically.
 */
const AddCarPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/car-owner/cars?add=1", { replace: true });
  }, [navigate]);
  return null;
};

export default AddCarPage;