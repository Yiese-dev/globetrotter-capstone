import { motion } from "framer-motion";
import clsx from "clsx";

const AVAILABLE_TAGS = [
  "nature",
  "hiking",
  "viewpoint",
  "adventure",
  "religious",
  "historical",
  "architecture",
  "culture",
  "monument",
  "accommodation",
  "luxury",
  "business",
  "budget-friendly",
  "dining",
  "nightlife",
  "local-cuisine",
  "lounge",
  "modern",
  "park",
  "relaxation",
];

interface PreferenceChipsProps {
  selected: string[];
  onToggle: (tag: string) => void;
}

export function PreferenceChips({ selected, onToggle }: PreferenceChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_TAGS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <motion.button
            key={tag}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(tag)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors",
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-muted hover:border-primary/40 hover:text-ink"
            )}
          >
            {tag}
          </motion.button>
        );
      })}
    </div>
  );
}
