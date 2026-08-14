import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, name, ...props }, ref) => {
    const inputId = id ?? name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={clsx(
            "rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
            error && "border-danger focus:ring-danger/40 focus:border-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
