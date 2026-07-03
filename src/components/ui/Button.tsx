import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary",

  secondary:
    "border border-border bg-surface text-content hover:bg-slate-700 focus-visible:ring-slate-400",

  outline:
    "border border-primary bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-primary",

  ghost:
    "bg-transparent text-content hover:bg-white/10 focus-visible:ring-slate-400",

  danger:
    "bg-danger text-white hover:bg-red-600 focus-visible:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  type = "button",
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-semibold",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-app-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}

      <span>{children}</span>
    </button>
  );
};

export default Button;