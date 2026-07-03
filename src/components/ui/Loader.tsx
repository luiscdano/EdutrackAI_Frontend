import type { HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoaderSize;
  label?: string;
  showLabel?: boolean;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
};

const Loader = ({
  size = "md",
  label = "Cargando",
  showLabel = false,
  className,
  ...props
}: LoaderProps) => {
  return (
    <div
      {...props}
      role="status"
      className={cn(
        "inline-flex items-center justify-center gap-3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "animate-spin rounded-full border-primary border-r-transparent",
          sizeClasses[size],
        )}
      />

      {showLabel ? (
        <span className="text-sm text-muted">
          {label}
        </span>
      ) : (
        <span className="sr-only">
          {label}
        </span>
      )}
    </div>
  );
};

export default Loader;