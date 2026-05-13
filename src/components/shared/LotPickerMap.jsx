/**
 * LotPickerMap.jsx
 *
 * Used on: MyParkingLotsPage → Add/Edit Lot form (Lot Admin)
 *
 * Features:
 *  - Click on map to place a pin and auto-fill lat/lng in the form
 *  - Shows user's current location as a reference point
 *  - Reverse geocodes the selected point for display label
 */
import { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import MapView, { createPinIcon, userLocationIcon } from "./MapView";
import useGeolocation from "../../hooks/useGeolocation";
import { MapPin, X } from "lucide-react";

const LotPickerMap = ({ value, onChange, height = "300px" }) => {
  const { location } = useGeolocation();
  const [selected, setSelected]   = useState(
    value?.latitude && value?.longitude
      ? { lat: value.latitude, lng: value.longitude }
      : null
  );
  const [address, setAddress]     = useState("");

  const handleMapClick = async (latlng) => {
    const coords = { lat: latlng.lat, lng: latlng.lng };
    setSelected(coords);
    onChange && onChange({ latitude: latlng.lat, longitude: latlng.lng });

    // Reverse geocode using Nominatim (free, no API key needed)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      setAddress(data.display_name || "");
    } catch {
      setAddress("");
    }
  };

  const clearSelection = () => {
    setSelected(null);
    setAddress("");
    onChange && onChange({ latitude: null, longitude: null });
  };

  return (
    <div className="space-y-2">
      {/* Instruction */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl px-3 py-2">
        <MapPin size={14} className="text-blue-600 flex-shrink-0" />
        Click anywhere on the map to set the parking lot location.
      </div>

      {/* Selected coords display */}
      {selected && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm">
          <div>
            <p className="font-medium text-green-800">
              {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
            </p>
            {address && (
              <p className="text-xs text-green-700 mt-0.5 truncate max-w-xs">{address}</p>
            )}
          </div>
          <button onClick={clearSelection} className="text-green-600 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Map */}
      <MapView
        center={selected || location}
        zoom={14}
        height={height}
        onMapClick={handleMapClick}
      >
        {/* User location reference */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={userLocationIcon}>
            <Popup><div className="text-sm">📍 Your location</div></Popup>
          </Marker>
        )}

        {/* Selected lot location */}
        {selected && (
          <Marker
            position={[selected.lat, selected.lng]}
            icon={createPinIcon("#2563eb", "P")}
          >
            <Popup>
              <div className="text-sm font-medium">🅿️ Parking lot location</div>
              <div className="text-xs text-gray-500 mt-1">
                {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapView>
    </div>
  );
};

export default LotPickerMap;
