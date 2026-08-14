import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/** Leaflet only reads center/zoom on mount — this re-fits the viewport whenever the set of
 * points to display changes (new route, new markers, geolocation resolving, etc). */
export function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(points)]);

  return null;
}
