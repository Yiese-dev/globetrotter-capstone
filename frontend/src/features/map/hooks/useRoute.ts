import { useCallback, useState } from "react";
import { fetchRoute } from "../services/mapService";
import type { LatLng, RouteResult } from "../services/mapService";

export function useRoute() {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const computeRoute = useCallback(async (points: LatLng[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRoute(points);
      setRoute(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute route.");
      setRoute(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { route, error, loading, computeRoute };
}
