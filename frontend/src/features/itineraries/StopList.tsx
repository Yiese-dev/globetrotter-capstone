import { useState } from "react";
import { GripVertical, MapPin, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { resolveAssetUrl } from "@/services/api/resolveAssetUrl";
import { useRemoveStop, useUpdateStop } from "./useItineraries";
import type { ItineraryStop } from "@/types/itinerary";

export function StopList({ itineraryId, stops }: { itineraryId: string; stops: ItineraryStop[] }) {
  const removeStop = useRemoveStop(itineraryId);
  const updateStop = useUpdateStop(itineraryId);

  if (stops.length === 0) {
    return <p className="text-sm text-muted">No stops yet — add destinations from the Destinations page.</p>;
  }

  const ordered = [...stops].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-3">
      {ordered.map((stop, index) => (
        <Card key={stop.stop_id} className="flex gap-3 p-3">
          <div className="flex flex-col items-center justify-center text-muted">
            <GripVertical size={16} />
            <span className="text-xs font-semibold">{index + 1}</span>
          </div>
          <img src={resolveAssetUrl(stop.image_url)} alt={stop.name} className="h-16 w-16 rounded-lg object-cover" />
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-medium text-ink">{stop.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} /> {stop.category}
            </p>
            <StopNotes
              initialNotes={stop.notes}
              onSave={(notes) => updateStop.mutate({ stopId: stop.stop_id, input: { notes } })}
            />
          </div>
          <button
            onClick={() => removeStop.mutate(stop.stop_id)}
            className="self-start rounded-full p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label={`Remove ${stop.name}`}
          >
            <Trash2 size={16} />
          </button>
        </Card>
      ))}
    </div>
  );
}

function StopNotes({ initialNotes, onSave }: { initialNotes: string | null; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  return (
    <input
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={() => {
        if (notes !== (initialNotes ?? "")) onSave(notes);
      }}
      placeholder="Add a note..."
      className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
    />
  );
}
