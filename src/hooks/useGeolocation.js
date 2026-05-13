import { useState, useEffect, useCallback } from "react";

const DEFAULT_LOCATION = { lat: 18.5204, lng: 73.8567 }; // Pune fallback

const useGeolocation = () => {
  const [location, setLocation]     = useState(null);
  const [error, setError]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
        setPermissionDenied(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError("Location access denied. Using default location.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location unavailable. Using default location.");
        } else {
          setError("Location request timed out. Using default location.");
        }
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Continuous tracking — call startTracking() when valet needs live GPS
  const startTracking = useCallback((onUpdate) => {
    if (!navigator.geolocation) return null;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLocation(coords);
        if (onUpdate) onUpdate(coords);
      },
      (err) => console.error("Watch position error:", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    location,
    error,
    loading,
    permissionDenied,
    refetch: fetchLocation,
    startTracking,
    DEFAULT_LOCATION,
  };
};

export default useGeolocation;
