// The only file in the app that talks to OSRM/Nominatim. Both are the free public demo
// instances — rate-limited (~1 req/sec) and not for heavy or production use. Fine for a
// university project's manual testing; a self-hosted OSRM/Nominatim would replace these
// base URLs without touching any calling code (mapService is the whole integration surface).

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  /** [lat, lng] pairs, ready for react-leaflet's <Polyline positions=... />. */
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

const OSRM_BASE = "https://router.project-osrm.org";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/** Routes through every point in order in a single request — OSRM accepts N waypoints,
 * so a multi-stop itinerary doesn't need to be chained leg-by-leg. */
export async function fetchRoute(points: LatLng[]): Promise<RouteResult> {
  if (points.length < 2) {
    throw new Error("At least two points are required to draw a route.");
  }

  const coordsParam = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `${OSRM_BASE}/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("The routing service returned an error. Please try again.");
  }

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No route could be found between these points.");
  }

  const route = data.routes[0];
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng]
  );

  return { coordinates, distanceMeters: route.distance, durationSeconds: route.duration };
}

export async function searchPlace(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  const url = `${NOMINATIM_BASE}/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error("The search service returned an error. Please try again.");
  }

  const data: Array<{ display_name: string; lat: string; lon: string }> = await response.json();
  return data.map((item) => ({
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
