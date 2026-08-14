import { Polyline } from "react-leaflet";

export function RouteLayer({ coordinates }: { coordinates: [number, number][] }) {
  if (coordinates.length === 0) return null;
  return <Polyline positions={coordinates} pathOptions={{ color: "#14b8a6", weight: 5, opacity: 0.85 }} />;
}
