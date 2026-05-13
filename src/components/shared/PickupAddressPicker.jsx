import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Crosshair, Loader } from "lucide-react";

/**
 * PickupAddressPicker
 *
 * Props:
 *   value    {string}                  — current address string (controlled)
 *   onChange {(addr, lat, lng) => void} — called when address + coords are resolved
 *
 * How it works:
 *   1. User types → Nominatim suggestions appear (free, no API key)
 *   2. User picks a suggestion → address + coords are set
 *   3. "Use my location" button → reverse-geocodes the browser GPS position
 */
const PickupAddressPicker = ({ value, onChange }) => {
  const [query, setQuery]         = useState(value || "");
  const [suggestions, setSugg]    = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating]   = useState(false);
  const [open, setOpen]           = useState(false);
  const debounceRef               = useRef(null);
  const wrapperRef                = useRef(null);

  // Keep local query in sync if parent resets value
  useEffect(() => { setQuery(value || ""); }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced Nominatim search
  const search = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (!q || q.length < 3) { setSugg([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        setSugg(data);
        setOpen(data.length > 0);
      } catch {
        setSugg([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    // If user clears the field, reset parent
    if (!v) onChange("", null, null);
    search(v);
  };

  const handleSelect = (item) => {
    const addr = item.display_name;
    const lat  = parseFloat(item.lat);
    const lng  = parseFloat(item.lon);
    setQuery(addr);
    setSugg([]);
    setOpen(false);
    onChange(addr, lat, lng);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
          const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQuery(addr);
          onChange(addr, lat, lng);
        } catch {
          const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQuery(fallback);
          onChange(fallback, lat, lng);
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        {/* Address text input */}
        <div className="relative flex-1">
          <MapPin
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search for an address…"
            className="input pl-9 pr-8 text-sm"
            autoComplete="off"
          />
          {searching && (
            <Loader
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
            />
          )}
        </div>

        {/* Use my location button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          title="Use my current location"
          className="w-10 h-10 flex-shrink-0 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
        >
          {locating
            ? <Loader size={15} className="text-green-600 animate-spin" />
            : <Crosshair size={15} className="text-green-600" />
          }
        </button>
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((item) => (
            <li key={item.place_id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-2"
              >
                <MapPin size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-400 mt-1.5">
        Type to search, or use <span className="font-medium text-green-600">⊕</span> to auto-fill your current location.
      </p>
    </div>
  );
};

export default PickupAddressPicker;