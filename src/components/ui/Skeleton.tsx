import type { HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type SkeletonVariant =
  | "text"
  | "rectangular"
  | "circular";

interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 rounded-md",
  rectangular: "rounded-card",
  circular: "rounded-full",
};

const Skeleton = ({
  variant = "rectangular",
  className,
  ...props
}: SkeletonProps) => {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-slate-700/70",
        variantClasses[variant],
        className,
      )}
    />
  );
};

export default Skeleton;