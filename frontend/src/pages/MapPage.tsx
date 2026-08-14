import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, LocateFixed, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { MapView } from "@/features/map/components/MapView";
import { DestinationMarkers } from "@/features/map/components/DestinationMarkers";
import type { MarkerPoint } from "@/features/map/components/DestinationMarkers";
import { UserLocationMarker } from "@/features/map/components/UserLocationMarker";
import { RouteLayer } from "@/features/map/components/RouteLayer";
import { FitBounds } from "@/features/map/components/FitBounds";
import { LocationPicker } from "@/features/map/components/LocationPicker";
import { useGeolocation } from "@/features/map/hooks/useGeolocation";
import { useRoute } from "@/features/map/hooks/useRoute";
import type { GeocodeResult } from "@/features/map/services/mapService";
import { useItinerary } from "@/features/itineraries/useItineraries";
import { useDestinations } from "@/features/destinations/useDestinations";

const YAOUNDE_CENTER: [number, number] = [3.848, 11.5021];

export function MapPage() {
  const [searchParams] = useSearchParams();
  const itineraryId = searchParams.get("itinerary") ?? undefined;

  const { data: itinerary, isLoading: itineraryLoading } = useItinerary(itineraryId);
  const { data: catalog } = useDestinations({ page_size: 50 });
  const { position: userPosition, error: geoError, loading: geoLoading, locate } = useGeolocation();
  const { route, error: routeError, loading: routeLoading, computeRoute } = useRoute();

  const [origin, setOrigin] = useState<GeocodeResult | null>(null);
  const [destination, setDestination] = useState<GeocodeResult | null>(null);
  // "Use my current location" may be clicked before a position has resolved — this defers
  // setting it as the origin until useGeolocation actually reports one back.
  const [pendingLocationAsOrigin, setPendingLocationAsOrigin] = useState(false);

  useEffect(() => {
    if (pendingLocationAsOrigin && userPosition) {
      setOrigin({ label: "My current location", lat: userPosition.lat, lng: userPosition.lng });
      setPendingLocationAsOrigin(false);
    }
  }, [pendingLocationAsOrigin, userPosition]);

  function handleUseCurrentLocationAsOrigin() {
    if (userPosition) {
      setOrigin({ label: "My current location", lat: userPosition.lat, lng: userPosition.lng });
    } else {
      setPendingLocationAsOrigin(true);
      locate();
    }
  }

  const itineraryStops = useMemo(
    () => (itinerary ? [...itinerary.stops].sort((a, b) => a.order - b.order) : []),
    [itinerary]
  );

  const markers = useMemo<MarkerPoint[]>(() => {
    if (itineraryId) {
      return itineraryStops.map((stop) => ({
        id: stop.stop_id,
        label: stop.name,
        sublabel: stop.category,
        lat: stop.lat,
        lng: stop.lng,
      }));
    }
    const points: MarkerPoint[] = [];
    if (origin) points.push({ id: "origin", label: origin.label, lat: origin.lat, lng: origin.lng });
    if (destination) points.push({ id: "destination", label: destination.label, lat: destination.lat, lng: destination.lng });
    return points;
  }, [itineraryId, itineraryStops, origin, destination]);

  const fitPoints = useMemo<[number, number][]>(() => {
    if (route && route.coordinates.length > 0) return route.coordinates;
    if (markers.length > 0) return markers.map((m) => [m.lat, m.lng]);
    if (userPosition) return [[userPosition.lat, userPosition.lng]];
    return [];
  }, [route, markers, userPosition]);

  async function handleGetDirections() {
    if (!origin || !destination) return;
    await computeRoute([origin, destination]);
  }

  // Routes from wherever the user actually is, through every stop in order — not just
  // stop-to-stop. Falls back to stop-to-stop only if location isn't available.
  const canRouteItinerary = itineraryStops.length >= 2 || (Boolean(userPosition) && itineraryStops.length >= 1);

  async function handleRouteItinerary() {
    const stopPoints = itineraryStops.map((s) => ({ lat: s.lat, lng: s.lng }));
    const points = userPosition ? [userPosition, ...stopPoints] : stopPoints;
    if (points.length < 2) return;
    await computeRoute(points);
  }

  const center: [number, number] = markers[0] ? [markers[0].lat, markers[0].lng] : YAOUNDE_CENTER;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Map</h1>
        <p className="mt-1 text-muted">
          {itineraryId ? "Route from wherever you are through your itinerary's stops." : "Find your way between two places."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="flex flex-col gap-4 p-5">
          <Button variant="ghost" size="sm" onClick={locate} disabled={geoLoading} className="self-start">
            <LocateFixed size={16} /> {geoLoading ? "Locating..." : "Use my location"}
          </Button>
          {geoError && <p className="text-xs text-danger">{geoError}</p>}

          {itineraryId ? (
            <>
              {itineraryLoading && <Skeleton className="h-24 w-full" />}
              {itinerary && (
                <>
                  <Link
                    to={`/itineraries/${itinerary.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
                  >
                    <ArrowLeft size={14} /> Back to {itinerary.title}
                  </Link>
                  <p className="text-sm text-muted">{itineraryStops.length} stops, in order</p>
                  <Button size="sm" onClick={handleRouteItinerary} disabled={routeLoading || !canRouteItinerary}>
                    <Navigation size={16} />
                    {routeLoading ? "Routing..." : userPosition ? "Route from my location" : "Route between stops"}
                  </Button>
                  {!canRouteItinerary && (
                    <p className="text-xs text-muted">
                      {userPosition
                        ? "Add at least one stop to draw a route."
                        : "Use my location, or add at least two stops, to draw a route."}
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <LocationPicker
                label="Start"
                placeholder="Search a starting point..."
                selected={origin}
                onSelect={setOrigin}
                onClear={() => setOrigin(null)}
                destinations={catalog?.items}
                showCurrentLocation
                onUseCurrentLocation={handleUseCurrentLocationAsOrigin}
                locatingCurrentLocation={geoLoading}
              />
              <LocationPicker
                label="Destination"
                placeholder="Search a destination..."
                selected={destination}
                onSelect={setDestination}
                onClear={() => setDestination(null)}
                destinations={catalog?.items}
              />
              <Button size="sm" onClick={handleGetDirections} disabled={!origin || !destination || routeLoading}>
                <Navigation size={16} /> {routeLoading ? "Routing..." : "Get directions"}
              </Button>
            </>
          )}

          {routeError && <p className="text-xs text-danger">{routeError}</p>}
          {route && (
            <div className="rounded-xl bg-primary/5 p-3 text-sm text-ink">
              <p className="font-semibold">{(route.distanceMeters / 1000).toFixed(1)} km</p>
              <p className="text-xs text-muted">{Math.round(route.durationSeconds / 60)} min drive</p>
            </div>
          )}

          <p className="mt-auto text-[11px] leading-snug text-muted">
            Map data © OpenStreetMap contributors. Routing via the public OSRM demo server —
            not for heavy or production use.
          </p>
        </Card>

        <div className="h-[520px] overflow-hidden rounded-2xl border border-border shadow-sm">
          <MapView center={center}>
            <FitBounds points={fitPoints} />
            {userPosition && <UserLocationMarker position={userPosition} />}
            <DestinationMarkers points={markers} />
            {route && <RouteLayer coordinates={route.coordinates} />}
          </MapView>
        </div>
      </div>
    </div>
  );
}
