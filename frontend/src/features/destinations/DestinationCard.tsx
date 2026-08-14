import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { resolveAssetUrl } from "@/services/api/resolveAssetUrl";
import type { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  matchScore?: number;
  onAddToItinerary?: (destination: Destination) => void;
}

export function DestinationCard({ destination, matchScore, onAddToItinerary }: DestinationCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="group flex h-full flex-col overflow-hidden">
        <Link to={`/destinations/${destination.id}`} className="relative block overflow-hidden">
          <img
            src={resolveAssetUrl(destination.image_url)}
            alt={destination.name}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {typeof matchScore === "number" && (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-primary shadow">
              {Math.round(matchScore * 100)}% match
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Badge category={destination.category}>{destination.category}</Badge>
          <Link to={`/destinations/${destination.id}`}>
            <h3 className="font-display text-base font-semibold text-ink hover:text-primary">{destination.name}</h3>
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} /> {destination.address}
          </p>
          <p className="line-clamp-2 text-sm text-muted">{destination.description}</p>
          {onAddToItinerary && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-auto self-start"
              onClick={() => onAddToItinerary(destination)}
            >
              <Plus size={14} /> Add to itinerary
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
