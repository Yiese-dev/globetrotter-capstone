import { useState } from "react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAddStop, useItineraries } from "./useItineraries";
import { addStop as addStopRequest } from "./api";
import { ItineraryFormModal } from "./ItineraryFormModal";
import { useUIStore } from "@/store/uiStore";
import { extractErrorMessage } from "@/lib/apiError";
import type { Destination } from "@/types/destination";
import type { Itinerary } from "@/types/itinerary";

interface AddToItineraryModalProps {
  destination: Destination | null;
  onClose: () => void;
}

export function AddToItineraryModal({ destination, onClose }: AddToItineraryModalProps) {
  const { data: itineraries, isLoading } = useItineraries();
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);

  // A brand-new itinerary has no bound useAddStop(id) hook yet (the id doesn't exist until
  // creation succeeds), so this flow calls the request directly instead of going through it.
  async function handleCreatedThenAdd(itinerary: Itinerary) {
    if (!destination) return;
    try {
      await addStopRequest(itinerary.id, {
        destination_id: destination.id,
        name: destination.name,
        category: destination.category,
        image_url: destination.image_url,
        lat: destination.lat,
        lng: destination.lng,
      });
      queryClient.invalidateQueries({ queryKey: ["itinerary", itinerary.id] });
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      pushToast("Added to itinerary", "success");
    } catch (error) {
      pushToast(extractErrorMessage(error), "error");
    }
    onClose();
  }

  return (
    <>
      <Modal open={Boolean(destination)} onClose={onClose} title={`Add "${destination?.name}" to...`}>
        {isLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {!isLoading && itineraries && itineraries.length === 0 && (
          <p className="mb-3 text-sm text-muted">You don't have any itineraries yet.</p>
        )}
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {itineraries?.map((itinerary) => (
            <ItineraryOption
              key={itinerary.id}
              itineraryId={itinerary.id}
              title={itinerary.title}
              destination={destination}
              onDone={onClose}
            />
          ))}
        </div>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Create new itinerary
        </Button>
      </Modal>
      <ItineraryFormModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreatedThenAdd} />
    </>
  );
}

function ItineraryOption({
  itineraryId,
  title,
  destination,
  onDone,
}: {
  itineraryId: string;
  title: string;
  destination: Destination | null;
  onDone: () => void;
}) {
  const addStop = useAddStop(itineraryId);

  function handleClick() {
    if (!destination) return;
    addStop.mutate(
      {
        destination_id: destination.id,
        name: destination.name,
        category: destination.category,
        image_url: destination.image_url,
        lat: destination.lat,
        lng: destination.lng,
      },
      { onSuccess: onDone }
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={addStop.isPending}
      className="rounded-xl border border-border px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
    >
      {title}
    </button>
  );
}
