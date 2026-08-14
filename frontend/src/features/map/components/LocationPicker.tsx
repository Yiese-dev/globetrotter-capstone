import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { searchPlace } from "../services/mapService";
import type { GeocodeResult } from "../services/mapService";
import type { Destination } from "@/types/destination";

interface LocationPickerProps {
  label: string;
  placeholder: string;
  selected: GeocodeResult | null;
  onSelect: (place: GeocodeResult) => void;
  onClear: () => void;
  destinations?: Destination[];
  showCurrentLocation?: boolean;
  onUseCurrentLocation?: () => void;
  locatingCurrentLocation?: boolean;
}

/** One combobox that replaces what used to be a separate free-text search input AND a
 * separate "pick from your destinations" <select> — a single place to search the map,
 * pick a known destination, or (for the start point) use the browser's geolocation. */
export function LocationPicker({
  label,
  placeholder,
  selected,
  onSelect,
  onClear,
  destinations = [],
  showCurrentLocation = false,
  onUseCurrentLocation,
  locatingCurrentLocation = false,
}: LocationPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query, 400);

  const { data: geocodeResults, isFetching } = useQuery({
    queryKey: ["place-search", debounced],
    queryFn: () => searchPlace(debounced),
    enabled: debounced.trim().length > 2,
  });

  const matchingDestinations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = needle ? destinations.filter((d) => d.name.toLowerCase().includes(needle)) : destinations;
    return pool.slice(0, 5);
  }, [query, destinations]);

  function handleSelect(place: GeocodeResult) {
    onSelect(place);
    setQuery("");
    setOpen(false);
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5">
          <MapPin size={14} className="shrink-0 text-primary" />
          <span className="flex-1 truncate text-sm text-ink">{selected.label}</span>
          <button
            type="button"
            onClick={onClear}
            className="text-muted transition-colors hover:text-ink"
            aria-label={`Clear ${label}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  const showDropdown = open && (showCurrentLocation || matchingDestinations.length > 0 || debounced.trim().length > 2);

  return (
    <div className="relative">
      <Input
        label={label}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
      />
      {showDropdown && (
        <div className="absolute z-[1000] mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
          {showCurrentLocation && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onUseCurrentLocation?.();
                setOpen(false);
              }}
              disabled={locatingCurrentLocation}
              className="flex w-full items-center gap-2 border-b border-border px-4 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
            >
              <LocateFixed size={14} />
              {locatingCurrentLocation ? "Locating..." : "Use my current location"}
            </button>
          )}

          {matchingDestinations.length > 0 && (
            <div>
              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Destinations</p>
              {matchingDestinations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect({ label: d.name, lat: d.lat, lng: d.lng })}
                  className="block w-full truncate px-4 py-2 text-left text-sm text-ink transition-colors hover:bg-primary/5"
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}

          {debounced.trim().length > 2 && (
            <div>
              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {isFetching ? "Searching..." : "Places"}
              </p>
              {geocodeResults?.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink transition-colors hover:bg-primary/5"
                >
                  <Search size={12} className="shrink-0 text-muted" />
                  <span className="truncate">{result.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
