import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type AlertVariant =
  | "info"
  | "success"
  | "warning"
  | "danger";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  variant?: AlertVariant;
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  info:
    "border-info/40 bg-info/10 text-sky-100",

  success:
    "border-success/40 bg-success/10 text-green-100",

  warning:
    "border-warning/40 bg-warning/10 text-amber-100",

  danger:
    "border-danger/40 bg-danger/10 text-red-100",
};

const iconClasses: Record<AlertVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const icons: Record<AlertVariant, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  danger: "×",
};

const Alert = ({
  children,
  title,
  variant = "info",
  onClose,
  className,
  ...props
}: AlertProps) => {
  return (
    <div
      {...props}
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex w-full items-start gap-3 rounded-control border p-4",
        variantClasses[variant],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-sm font-bold",
          iconClasses[variant],
        )}
      >
        {icons[variant]}
      </span>

      <div className="min-w-0 flex-1">
        {title && (
          <p className="font-semibold">
            {title}
          </p>
        )}

        <div
          className={cn(
            "text-sm leading-relaxed",
            title && "mt-1",
          )}
        >
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar mensaje"
          className="rounded-md px-2 py-1 text-current opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;