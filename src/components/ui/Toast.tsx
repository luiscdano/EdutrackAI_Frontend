import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type ToastVariant =
  | "info"
  | "success"
  | "warning"
  | "danger";

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children?: ReactNode;
  variant?: ToastVariant;
  onClose?: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  info:
    "border-info/40 bg-surface text-sky-200",

  success:
    "border-success/40 bg-surface text-green-200",

  warning:
    "border-warning/40 bg-surface text-amber-200",

  danger:
    "border-danger/40 bg-surface text-red-200",
};

const icons: Record<ToastVariant, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  danger: "×",
};

const Toast = ({
  title,
  children,
  variant = "info",
  onClose,
  className,
  ...props
}: ToastProps) => {
  return (
    <div
      {...props}
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-card border p-4 shadow-card",
        variantClasses[variant],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current font-bold"
      >
        {icons[variant]}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {title}
        </p>

        {children && (
          <div className="mt-1 text-sm leading-relaxed text-muted">
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="rounded-md px-2 py-1 text-muted transition hover:bg-white/10 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;