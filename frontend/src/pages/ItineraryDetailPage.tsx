import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Map as MapIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { StopList } from "@/features/itineraries/StopList";
import { useItinerary, useUpdateItinerary } from "@/features/itineraries/useItineraries";

export function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: itinerary, isLoading, isError, refetch } = useItinerary(id);
  const updateItinerary = useUpdateItinerary(id ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !itinerary) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ErrorState message="Couldn't load this itinerary." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/itineraries"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to itineraries
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">{itinerary.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Calendar size={14} />
            {itinerary.start_date ?? "No start date"} – {itinerary.end_date ?? "No end date"}
          </p>
        </div>
        {itinerary.stops.length > 0 && (
          <Link to={`/map?itinerary=${itinerary.id}`}>
            <Button variant="secondary">
              <MapIcon size={16} /> View on map
            </Button>
          </Link>
        )}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-2 font-display text-sm font-semibold text-ink">Notes</h2>
        {editingNotes ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  updateItinerary.mutate({ notes });
                  setEditingNotes(false);
                }}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setNotes(itinerary.notes ?? "");
              setEditingNotes(true);
            }}
            className="text-left text-sm text-muted hover:text-ink"
          >
            {itinerary.notes || "Add notes about this trip..."}
          </button>
        )}
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Stops ({itinerary.stops.length})</h2>
        <StopList itineraryId={itinerary.id} stops={itinerary.stops} />
      </div>
    </div>
  );
}
