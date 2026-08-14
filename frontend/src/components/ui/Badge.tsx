import type { ReactNode } from "react";
import clsx from "clsx";

const categoryColors: Record<string, string> = {
  nature: "bg-tertiary/10 text-tertiary",
  religious: "bg-primary/10 text-primary",
  historical: "bg-accent/10 text-accent",
  accommodation: "bg-secondary/10 text-secondary",
  dining: "bg-danger/10 text-danger",
};

interface BadgeProps {
  children: ReactNode;
  category?: string;
  className?: string;
}

export function Badge({ children, category, className }: BadgeProps) {
  const colorClass = (category && categoryColors[category]) ?? "bg-ink/5 text-ink";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}
