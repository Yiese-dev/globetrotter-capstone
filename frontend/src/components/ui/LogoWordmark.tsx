import logo from "@/assets/brand/logo.png";

interface LogoWordmarkProps {
  className?: string;
  showText?: boolean;
}

// `logo` is the real PenielGo brand mark. If it's ever removed, the text span below
// still reads as a complete wordmark on its own — that's the documented fallback slot.
export function LogoWordmark({ className = "", showText = true }: LogoWordmarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="PenielGo" className="h-9 w-9 object-contain" />
      {showText && (
        <span className="font-display text-xl font-bold tracking-tight text-ink">
          Peniel<span className="text-secondary">Go</span>
        </span>
      )}
    </div>
  );
}
