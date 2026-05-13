/**
 * MapView.jsx — Base Leaflet map component
 *
 * Props:
 *  center       { lat, lng }   — map center
 *  zoom         number         — initial zoom (default 14)
 *  height       string         — CSS height (default "400px")
 *  children     ReactNode      — Markers, Popups, etc.
 *  onMapClick   (latlng) => void  — optional click handler
 */
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon broken by Vite bundling
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

// ── Custom icon helpers ──────────────────────────────────────────────────────

export const createPinIcon = (color = "#2563eb", label = "") =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        width:36px;height:36px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:#fff;
          font-size:11px;
          font-weight:700;
          font-family:system-ui,sans-serif;
        ">${label}</span>
      </div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -38],
  });

export const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        background:rgba(37,99,235,0.2);
        animation:pulse 2s infinite;
      "></div>
      <div style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:14px;height:14px;
        background:#2563eb;
        border-radius:50%;
        border:2px solid #fff;
        box-shadow:0 0 6px rgba(37,99,235,0.6);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%   { transform: scale(1);   opacity: 0.7; }
        70%  { transform: scale(2.2); opacity: 0;   }
        100% { transform: scale(1);   opacity: 0;   }
      }
    </style>`,
  iconSize:   [24, 24],
  iconAnchor: [12, 12],
});

export const valetIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background:#16a34a;
      width:40px;height:40px;
      border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:20px;
    ">🧑‍✈️</div>`,
  iconSize:   [40, 40],
  iconAnchor: [20, 20],
  popupAnchor:[0, -22],
});

// ── Click handler sub-component ─────────────────────────────────────────────
const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick && onMapClick(e.latlng) });
  return null;
};

// ── Main MapView ─────────────────────────────────────────────────────────────
const MapView = ({
  center,
  zoom = 14,
  height = "400px",
  children,
  onMapClick,
  className = "",
}) => {
  const mapCenter = center
    ? [center.lat, center.lng]
    : [18.5204, 73.8567]; // Pune default

  return (
    <div
      style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden", isolation: "isolate", position: "relative" }}
      className={className}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
        {children}
      </MapContainer>
    </div>
  );
};

export default MapView;