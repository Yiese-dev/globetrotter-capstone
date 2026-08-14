import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { resolveAssetUrl } from "@/services/api/resolveAssetUrl";
import type { Itinerary } from "@/types/itinerary";

interface ItineraryCardProps {
  itinerary: Itinerary;
  onDelete?: (id: string) => void;
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "No dates set";
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt((start ?? end) as string);
}

export function ItineraryCard({ itinerary, onDelete }: ItineraryCardProps) {
  const cover = itinerary.stops[0]?.image_url;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Card className="flex h-full flex-col overflow-hidden">
        <Link to={`/itineraries/${itinerary.id}`} className="block">
          {cover ? (
            <img src={resolveAssetUrl(cover)} alt={itinerary.title} className="h-36 w-full object-cover" />
          ) : (
            <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-muted">
              <MapPin size={28} />
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Link to={`/itineraries/${itinerary.id}`}>
            <h3 className="font-display text-base font-semibold text-ink hover:text-primary">{itinerary.title}</h3>
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted">
            <Calendar size={12} /> {formatDateRange(itinerary.start_date, itinerary.end_date)}
          </p>
          <p className="text-xs text-muted">
            {itinerary.stops.length} stop{itinerary.stops.length === 1 ? "" : "s"}
          </p>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-auto self-start text-danger hover:bg-danger/10"
              onClick={() => onDelete(itinerary.id)}
            >
              <Trash2 size={14} /> Delete
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
