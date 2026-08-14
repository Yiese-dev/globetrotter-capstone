import { useCallback, useState } from "react";
import type { LatLng } from "../services/mapService";

interface GeolocationState {
  position: LatLng | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ position: null, error: null, loading: false });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ position: null, error: "Geolocation is not supported by this browser.", loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({ position: { lat: pos.coords.latitude, lng: pos.coords.longitude }, error: null, loading: false });
      },
      (err) => {
        setState({ position: null, error: err.message || "Unable to retrieve your location.", loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, locate };
}
