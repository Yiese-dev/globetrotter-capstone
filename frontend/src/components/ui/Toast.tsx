import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import type { ToastVariant } from "@/store/uiStore";

const variantStyles: Record<ToastVariant, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: "bg-tertiary text-white" },
  error: { icon: XCircle, className: "bg-danger text-white" },
  info: { icon: Info, className: "bg-ink text-white" },
};

export function ToastViewport() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, className } = variantStyles[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg ${className}`}
            >
              <Icon size={18} />
              <span>{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-1 opacity-70 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
