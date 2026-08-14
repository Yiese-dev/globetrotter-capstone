import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DestinationCard } from "@/features/destinations/DestinationCard";
import { PreferenceChips } from "@/features/recommendations/PreferenceChips";
import { useRecommendations, useUpdatePreferences } from "@/features/recommendations/useRecommendations";
import { AddToItineraryModal } from "@/features/itineraries/AddToItineraryModal";
import { useAuthStore } from "@/store/authStore";
import type { Destination } from "@/types/destination";

export function RecommendationsPage() {
  const user = useAuthStore((s) => s.user);
  const [draftPreferences, setDraftPreferences] = useState<string[]>(user?.preferences ?? []);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const updatePreferences = useUpdatePreferences();
  const { data, isLoading, isError, refetch } = useRecommendations(12);

  function toggleTag(tag: string) {
    setDraftPreferences((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const preferencesChanged =
    JSON.stringify([...draftPreferences].sort()) !== JSON.stringify([...(user?.preferences ?? [])].sort());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Recommended for you</h1>
      <p className="mt-1 text-muted">Tell us what you're into, and we'll score destinations against it.</p>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink">
          <Sparkles size={16} className="text-primary" /> Your travel preferences
        </h2>
        <PreferenceChips selected={draftPreferences} onToggle={toggleTag} />
        {preferencesChanged && (
          <Button
            size="sm"
            className="mt-4"
            disabled={updatePreferences.isPending}
            onClick={() => updatePreferences.mutate(draftPreferences)}
          >
            {updatePreferences.isPending ? "Saving..." : "Save preferences"}
          </Button>
        )}
      </Card>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        )}

        {isError && <ErrorState message="Couldn't load recommendations." onRetry={() => refetch()} />}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <EmptyState
            title="No matches yet"
            description="Select a few preferences above and save them to see personalized picks."
          />
        )}

        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            {data.fallback && (
              <p className="mb-4 text-sm text-muted">
                Showing the full catalog — set your preferences above for picks tailored to you.
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map(({ destination, score }) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  matchScore={data.fallback ? undefined : score}
                  onAddToItinerary={setSelectedDestination}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <AddToItineraryModal destination={selectedDestination} onClose={() => setSelectedDestination(null)} />
    </div>
  );
}
