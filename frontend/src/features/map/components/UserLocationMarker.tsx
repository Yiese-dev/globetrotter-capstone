import { Circle, Marker, Popup } from "react-leaflet";
import type { LatLng } from "../services/mapService";

export function UserLocationMarker({ position }: { position: LatLng }) {
  return (
    <>
      <Marker position={[position.lat, position.lng]}>
        <Popup>You are here</Popup>
      </Marker>
      <Circle
        center={[position.lat, position.lng]}
        radius={80}
        pathOptions={{ color: "#2563eb", fillOpacity: 0.15 }}
      />
    </>
  );
}
