/**
 * ValetTrackingMap.jsx  — REBUILT
 *
 * What was broken:
 *   • The old file was a placeholder stub (dashed box, zero map code, zero polling).
 *
 * What this file does:
 *   1. Polls  GET /api/valet/{requestId}/valet-location  every 5 s for the
 *      valet's live GPS coordinates.
 *   2. Renders a Leaflet map (OpenStreetMap tiles, no API key needed).
 *   3. Shows two markers: 🔵 customer, 🟠 valet.
 *   4. Updates the valet marker smoothly as new pings arrive.
 *   5. Falls back gracefully when location is not yet available.
 *
 * Requires:  npm install leaflet
 * CSS import: add  import "leaflet/dist/leaflet.css"  once in main.jsx / App.jsx
 */

import { useEffect, useRef, useState } from "react";
import { Navigation, Clock, MapPin, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

// ─── Fix Leaflet's default marker icon path issue with bundlers ───────────────
// Leaflet resolves marker PNGs relative to its own CSS, which breaks in Vite/CRA.
// We override the default icon with inline CDN URLs so no extra asset config needed.
function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// ─── Coloured SVG circle marker factory ──────────────────────────────────────
function makeDotIcon(L, color) {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
             <circle cx="11" cy="11" r="9" fill="${color}" stroke="white" stroke-width="2.5"/>
           </svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

const ValetTrackingMap = ({ mode, requestId, customerLocation, etaMinutes, status }) => {
  const mapContainerRef = useRef(null); // DOM node for Leaflet
  const mapRef          = useRef(null); // L.Map instance
  const valetMarkerRef  = useRef(null); // valet marker
  const customerMarkerRef = useRef(null); // customer marker

  const [valetLocation,  setValetLocation]  = useState(null);
  const [locationError,  setLocationError]  = useState(false);
  const [mapReady,       setMapReady]       = useState(false);

  // ── 1. Poll backend for valet's live location ─────────────────────────────
  useEffect(() => {
    if (!requestId) return;

    // Statuses where the valet is actually moving and we should poll.
    // When PARKED the valet stopped moving; show parked coords from status poll instead.
    const ACTIVE_STATUSES = ["ACCEPTED", "RETURN_REQUESTED"];
    if (!ACTIVE_STATUSES.includes(status)) return;

    const fetchLocation = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/valet/${requestId}/valet-location`
        );
        const { latitude, longitude } = res.data;
        if (latitude != null && longitude != null) {
          setValetLocation({ lat: latitude, lng: longitude });
          setLocationError(false);
        }
      } catch {
        setLocationError(true);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [requestId, status]);

  // ── 2. Initialise Leaflet map once the container div is mounted ───────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dynamic import keeps Leaflet out of the initial bundle if unused
    import("leaflet").then((L) => {
      fixLeafletIcons(L);

      const defaultCenter = customerLocation
        ? [customerLocation.lat, customerLocation.lng]
        : [20.5937, 78.9629]; // India centre fallback

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Customer marker (blue)
      if (customerLocation) {
        const cMarker = L.marker(
          [customerLocation.lat, customerLocation.lng],
          { icon: makeDotIcon(L, "#3b82f6") }
        )
          .addTo(map)
          .bindPopup("📍 Your location");
        customerMarkerRef.current = cMarker;
      }

      mapRef.current = map;
      setMapReady(true);
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        valetMarkerRef.current = null;
        customerMarkerRef.current = null;
      }
    };
  }, []); // run once on mount — intentionally no deps

  // ── 3. Add/update the valet marker whenever valetLocation changes ─────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !valetLocation) return;

    import("leaflet").then((L) => {
      const { lat, lng } = valetLocation;

      if (valetMarkerRef.current) {
        // Smoothly slide existing marker to new position
        valetMarkerRef.current.setLatLng([lat, lng]);
      } else {
        // Create valet marker (orange) on first location ping
        const vMarker = L.marker([lat, lng], {
          icon: makeDotIcon(L, "#f97316"),
        })
          .addTo(mapRef.current)
          .bindPopup("🚗 Your valet");
        valetMarkerRef.current = vMarker;
      }

      // Pan map to keep both markers visible
      if (customerLocation) {
        const bounds = L.latLngBounds(
          [lat, lng],
          [customerLocation.lat, customerLocation.lng]
        );
        mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
      } else {
        mapRef.current.panTo([lat, lng]);
      }
    });
  }, [valetLocation, mapReady, customerLocation]);

  // ── 4. Update customer marker if their location prop changes ─────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !customerLocation) return;

    import("leaflet").then((L) => {
      if (customerMarkerRef.current) {
        customerMarkerRef.current.setLatLng([
          customerLocation.lat,
          customerLocation.lng,
        ]);
      } else {
        const cMarker = L.marker(
          [customerLocation.lat, customerLocation.lng],
          { icon: makeDotIcon(L, "#3b82f6") }
        )
          .addTo(mapRef.current)
          .bindPopup("📍 Your location");
        customerMarkerRef.current = cMarker;
      }
    });
  }, [customerLocation, mapReady]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

      {/* Map container — Leaflet renders into this div */}
      <div
        ref={mapContainerRef}
        style={{ height: "280px", width: "100%", background: "#e5e7eb" }}
      />

      {/* Status bar below the map */}
      <div className="grid grid-cols-3 gap-0 bg-white border-t border-gray-100">

        {/* Status */}
        <div className="flex flex-col items-center justify-center py-3 px-2 border-r border-gray-100">
          <Navigation size={13} className="text-sp-blue mb-1" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Status</span>
          <p className="text-xs font-semibold text-gray-900 mt-0.5 text-center leading-tight">
            {status
              ? status.replace(/_/g, " ")
              : <span className="text-gray-400">—</span>}
          </p>
        </div>

        {/* ETA */}
        <div className="flex flex-col items-center justify-center py-3 px-2 border-r border-gray-100">
          <Clock size={13} className="text-amber-500 mb-1" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">ETA</span>
          <p className="text-xs font-semibold text-gray-900 mt-0.5">
            {etaMinutes ? `${etaMinutes} min` : "—"}
          </p>
        </div>

        {/* Valet location status */}
        <div className="flex flex-col items-center justify-center py-3 px-2">
          {valetLocation ? (
            <>
              <MapPin size={13} className="text-orange-500 mb-1" />
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Valet</span>
              <p className="text-xs font-semibold text-green-600 mt-0.5">Live</p>
            </>
          ) : locationError ? (
            <>
              <MapPin size={13} className="text-red-400 mb-1" />
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Valet</span>
              <p className="text-xs font-semibold text-red-500 mt-0.5">Offline</p>
            </>
          ) : (
            <>
              <Loader2 size={13} className="text-gray-400 mb-1 animate-spin" />
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Valet</span>
              <p className="text-xs text-gray-400 mt-0.5">Locating...</p>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          You
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          Valet
        </span>
        <span className="ml-auto text-[10px] text-gray-400">Updates every 5s</span>
      </div>
    </div>
  );
};

export default ValetTrackingMap;