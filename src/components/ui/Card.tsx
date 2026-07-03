import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type CardVariant = "default" | "bordered" | "elevated";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "border border-border bg-surface",

  bordered:
    "border-2 border-border bg-surface",

  elevated:
    "border border-border bg-surface shadow-card",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = ({
  children,
  variant = "elevated",
  padding = "lg",
  interactive = false,
  className,
  ...props
}: CardProps) => {
  return (
    <div
      {...props}
      className={cn(
        "w-full rounded-card",
        "transition duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;