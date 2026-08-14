import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ItineraryCard } from "@/features/itineraries/ItineraryCard";
import { ItineraryFormModal } from "@/features/itineraries/ItineraryFormModal";
import { useDeleteItinerary, useItineraries } from "@/features/itineraries/useItineraries";

export function ItinerariesPage() {
  const { data: itineraries, isLoading, isError, refetch } = useItineraries();
  const deleteItinerary = useDeleteItinerary();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Your itineraries</h1>
          <p className="mt-1 text-muted">Plan multi-stop trips and keep them all in one place.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New itinerary
        </Button>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        )}

        {isError && <ErrorState message="Couldn't load your itineraries." onRetry={() => refetch()} />}

        {!isLoading && !isError && itineraries && itineraries.length === 0 && (
          <EmptyState
            title="No itineraries yet"
            description="Create your first itinerary and start adding destinations."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus size={16} /> New itinerary
              </Button>
            }
          />
        )}

        {!isLoading && !isError && itineraries && itineraries.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                onDelete={(id) => deleteItinerary.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      <ItineraryFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
