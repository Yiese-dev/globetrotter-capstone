import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateItinerary } from "./useItineraries";
import type { Itinerary } from "@/types/itinerary";

interface ItineraryFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the newly created itinerary — lets callers (e.g. "add to itinerary") chain a
   * follow-up action instead of the destination silently going nowhere after creation. */
  onCreated?: (itinerary: Itinerary) => void;
}

export function ItineraryFormModal({ open, onClose, onCreated }: ItineraryFormModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const createItinerary = useCreateItinerary();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createItinerary.mutate(
      { title, start_date: startDate || null, end_date: endDate || null },
      {
        onSuccess: (itinerary) => {
          setTitle("");
          setStartDate("");
          setEndDate("");
          onClose();
          onCreated?.(itinerary);
        },
      }
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="New itinerary">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Yaoundé Weekend"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button type="submit" disabled={createItinerary.isPending} className="mt-2">
          {createItinerary.isPending ? "Creating..." : "Create itinerary"}
        </Button>
      </form>
    </Modal>
  );
}
