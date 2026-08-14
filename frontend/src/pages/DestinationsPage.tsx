import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DestinationCard } from "@/features/destinations/DestinationCard";
import { useDestinationCategories, useDestinations } from "@/features/destinations/useDestinations";
import { AddToItineraryModal } from "@/features/itineraries/AddToItineraryModal";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { Destination } from "@/types/destination";

export function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: categories } = useDestinationCategories();
  const { data, isLoading, isError, refetch } = useDestinations({
    search: debouncedSearch || undefined,
    category,
    page_size: 24,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Destinations</h1>
      <p className="mt-1 text-muted">Discover real places to visit, curated for your next trip.</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors",
              !category ? "border-primary bg-primary text-white" : "border-border bg-white text-muted hover:text-ink"
            )}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors",
                category === cat
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-muted hover:text-ink"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        )}

        {isError && <ErrorState message="Couldn't load destinations." onRetry={() => refetch()} />}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <EmptyState title="No destinations found" description="Try a different search term or category." />
        )}

        {!isLoading && !isError && data && data.items.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {data.items.map((destination) => (
              <motion.div
                key={destination.id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              >
                <DestinationCard destination={destination} onAddToItinerary={setSelectedDestination} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AddToItineraryModal destination={selectedDestination} onClose={() => setSelectedDestination(null)} />
    </div>
  );
}
