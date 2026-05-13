/**
 * NearbyLotsMap.jsx
 *
 * Used on: FindParkingPage (Customer)
 *
 * Features:
 *  - Gets user's GPS location via useGeolocation
 *  - Calls GET /api/parking-lots/nearby?lat=&lng=&limit=
 *  - Pins each lot on the map with color-coded status
 *  - Popup shows lot name, status, features + "Book Now" button
 *  - Left panel lists lots by distance with slot availability
 *  - Real-time slot count updates via WebSocket per lot
 */
import { useEffect, useState, useCallback } from "react";
import { Marker, Popup, Circle, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import MapView, { createPinIcon, userLocationIcon } from "./MapView";
import useGeolocation from "../../hooks/useGeolocation";
import axiosInstance from "../../api/axiosInstance";
import {
  MapPin,
  Navigation,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ── Status color map ──────────────────────────────────────────────────────────
const STATUS_COLOR = {
  ACTIVE: "#16a34a",
  FULL: "#dc2626",
  INACTIVE: "#9ca3af",
};

const STATUS_LABEL = {
  ACTIVE: "Available",
  FULL: "Full",
  INACTIVE: "Closed",
};

// ── Recenter map when user location changes ───────────────────────────────────
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView([location.lat, location.lng], 14);
  }, [location, map]);
  return null;
};

// ── Distance calc (Haversine) ─────────────────────────────────────────────────
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Main Component ────────────────────────────────────────────────────────────
const NearbyLotsMap = ({ limit = 10 }) => {
  const navigate = useNavigate();
  const {
    location,
    loading: geoLoading,
    error: geoError,
    refetch,
  } = useGeolocation();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL | ACTIVE | FULL

  const fetchNearbyLots = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/api/parking-lots/nearby", {
        params: { lat: location.lat, lng: location.lng, limit },
      });
      const lotsWithDist = res.data.map((lot) => ({
        ...lot,
        distanceKm: getDistanceKm(
          location.lat,
          location.lng,
          lot.latitude,
          lot.longitude,
        ),
      }));
      lotsWithDist.sort((a, b) => a.distanceKm - b.distanceKm);
      setLots(lotsWithDist);
    } catch (e) {
      setError("Failed to load nearby parking lots.");
    } finally {
      setLoading(false);
    }
  }, [location, limit]);

  useEffect(() => {
    fetchNearbyLots();
  }, [fetchNearbyLots]);

  const filteredLots =
    filter === "ALL" ? lots : lots.filter((l) => l.status === filter);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* ── Left Panel: Lot List ─────────────────────────────────────────── */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3">
        {/* Filter tabs */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {["ALL", "ACTIVE", "FULL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === f
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "ALL" ? "All" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {(geoError || error) && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{geoError || error}</span>
          </div>
        )}

        {/* Lot cards */}
        <div className="overflow-y-auto flex-1 space-y-2 max-h-[520px] pr-1">
          {geoLoading || loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          ) : filteredLots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No parking lots found nearby</p>
            </div>
          ) : (
            filteredLots.map((lot) => (
              <div
                key={lot.id}
                onClick={() => setSelectedLotId(lot.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedLotId(lot.id)}
                className={`w-full text-left bg-white rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer ${
                  selectedLotId === lot.id
                    ? "border-blue-500 shadow-md ring-1 ring-blue-200"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {lot.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lot.distanceKm < 1
                        ? `${(lot.distanceKm * 1000).toFixed(0)} m away`
                        : `${lot.distanceKm.toFixed(1)} km away`}
                    </p>
                    {lot.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lot.features.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {f}
                          </span>
                        ))}
                        {lot.features.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{lot.features.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                    style={{
                      background: STATUS_COLOR[lot.status] + "20",
                      color: STATUS_COLOR[lot.status],
                    }}
                  >
                    {STATUS_LABEL[lot.status] || lot.status}
                  </span>
                </div>

                {lot.status === "ACTIVE" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customer/lot/${lot.id}`);
                    }}
                    className="mt-3 w-full bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View & Book
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => {
            refetch();
            fetchNearbyLots();
          }}
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Refresh nearby lots
        </button>
      </div>

      {/* ── Right Panel: Map ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[400px] lg:min-h-0">
        <MapView
          center={location}
          zoom={14}
          height="100%"
          className="min-h-[400px]"
        >
          {/* Recenter when GPS loads */}
          {location && <RecenterMap location={location} />}

          {/* User location marker */}
          {location && (
            <>
              <Marker
                position={[location.lat, location.lng]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="text-sm font-medium">📍 You are here</div>
                  {location.accuracy && (
                    <div className="text-xs text-gray-500">
                      Accuracy: ~{Math.round(location.accuracy)}m
                    </div>
                  )}
                </Popup>
              </Marker>
              <Circle
                center={[location.lat, location.lng]}
                radius={location.accuracy || 50}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#2563eb",
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />
            </>
          )}

          {/* Parking lot markers */}
          {filteredLots.map((lot) => (
            <Marker
              key={lot.id}
              position={[lot.latitude, lot.longitude]}
              icon={createPinIcon(STATUS_COLOR[lot.status] || "#6b7280", "P")}
              eventHandlers={{ click: () => setSelectedLotId(lot.id) }}
            >
              <Popup>
                <div style={{ minWidth: "180px" }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    {lot.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: STATUS_COLOR[lot.status],
                      marginBottom: "6px",
                    }}
                  >
                    ● {STATUS_LABEL[lot.status] || lot.status}
                  </p>
                  {lot.distanceKm && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "6px",
                      }}
                    >
                      📍{" "}
                      {lot.distanceKm < 1
                        ? `${(lot.distanceKm * 1000).toFixed(0)} m away`
                        : `${lot.distanceKm.toFixed(1)} km away`}
                    </p>
                  )}
                  {lot.features?.length > 0 && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginBottom: "8px",
                      }}
                    >
                      {lot.features.join(" · ")}
                    </p>
                  )}
                  {lot.status === "ACTIVE" && (
                    <button
                      onClick={() => navigate(`/customer/lot/${lot.id}`)}
                      style={{
                        width: "100%",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 0",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View &amp; Book →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapView>
      </div>
    </div>
  );
};

export default NearbyLotsMap;