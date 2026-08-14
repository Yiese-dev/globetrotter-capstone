import { Marker, Popup } from "react-leaflet";
import type { LatLng } from "../services/mapService";

export interface MarkerPoint extends LatLng {
  id: string;
  label: string;
  sublabel?: string;
}

export function DestinationMarkers({ points }: { points: MarkerPoint[] }) {
  return (
    <>
      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]}>
          <Popup>
            <strong>{point.label}</strong>
            {point.sublabel && <div className="text-xs capitalize text-muted">{point.sublabel}</div>}
          </Popup>
        </Marker>
      ))}
    </>
  );
}
