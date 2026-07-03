import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "bg-slate-700 text-slate-100",

  primary:
    "bg-primary/15 text-blue-300 ring-1 ring-inset ring-primary/30",

  success:
    "bg-success/15 text-green-300 ring-1 ring-inset ring-success/30",

  warning:
    "bg-warning/15 text-amber-300 ring-1 ring-inset ring-warning/30",

  danger:
    "bg-danger/15 text-red-300 ring-1 ring-inset ring-danger/30",

  info:
    "bg-info/15 text-sky-300 ring-1 ring-inset ring-info/30",

  outline:
    "border border-border bg-transparent text-muted",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "min-h-5 px-2 py-0.5 text-xs",
  md: "min-h-6 px-2.5 py-1 text-sm",
};

const Badge = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "font-medium leading-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;