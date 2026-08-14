import { LogoWordmark } from "./LogoWordmark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-raised">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
        <LogoWordmark className="justify-center sm:justify-start" />
        <p className="text-sm text-muted">
          Built as a university project demonstrating monolith → microservices evolution.
        </p>
      </div>
    </footer>
  );
}
