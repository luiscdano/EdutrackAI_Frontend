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
    "border border-primary-hover bg-primary-hover text-surface hover:bg-primary focus-visible:ring-primary",
  secondary:
    "border border-border bg-surface-muted text-content hover:border-primary/30 hover:bg-primary/10 focus-visible:ring-primary",
  outline:
    "border border-primary/45 bg-surface text-primary hover:bg-primary/10 focus-visible:ring-primary",
  ghost:
    "border border-transparent bg-transparent text-muted hover:bg-surface-muted hover:text-content focus-visible:ring-primary",
  danger:
    "border border-danger bg-danger text-white hover:opacity-90 focus-visible:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-xs",
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
        "inline-flex items-center justify-center gap-2 rounded-control font-semibold shadow-sm",
        "transition duration-200",
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
