import { MapContainer, TileLayer } from "react-leaflet";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "../leafletIconSetup";

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  children?: ReactNode;
  className?: string;
}

export function MapView({ center, zoom = 13, children, className }: MapViewProps) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className={className ?? "h-full w-full"}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
