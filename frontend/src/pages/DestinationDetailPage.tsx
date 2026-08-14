import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDestination } from "@/features/destinations/useDestinations";
import { AddToItineraryModal } from "@/features/itineraries/AddToItineraryModal";
import { resolveAssetUrl } from "@/services/api/resolveAssetUrl";

export function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: destination, isLoading, isError, refetch } = useDestination(id);
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ErrorState message="Couldn't load this destination." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/destinations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to destinations
      </Link>

      <img
        src={resolveAssetUrl(destination.image_url)}
        alt={destination.name}
        className="h-80 w-full rounded-2xl object-cover shadow-md"
      />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge category={destination.category}>{destination.category}</Badge>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">{destination.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={14} /> {destination.address}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add to itinerary
        </Button>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{destination.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {destination.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium capitalize text-ink">
            {tag}
          </span>
        ))}
      </div>

      <AddToItineraryModal destination={showAddModal ? destination : null} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
