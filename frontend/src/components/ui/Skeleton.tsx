import clsx from "clsx";

/** CSS-only shimmer (see .skeleton-shimmer in styles/globals.css) — cheaper and always-on,
 * unlike a Framer Motion loop, since a loading state can be shown before React even settles. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton-shimmer rounded-lg", className)} />;
}
