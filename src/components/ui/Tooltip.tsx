import {
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right";

interface TooltipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
}

const placementClasses: Record<
  TooltipPlacement,
  string
> = {
  top:
    "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom:
    "left-1/2 top-full mt-2 -translate-x-1/2",
  left:
    "right-full top-1/2 mr-2 -translate-y-1/2",
  right:
    "left-full top-1/2 ml-2 -translate-y-1/2",
};

const Tooltip = ({
  content,
  children,
  placement = "top",
  className,
  ...props
}: TooltipProps) => {
  const tooltipId = useId();
  const [isVisible, setIsVisible] =
    useState(false);

  return (
    <span
      {...props}
      className={cn(
        "relative inline-flex",
        className,
      )}
      aria-describedby={
        isVisible ? tooltipId : undefined
      }
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocusCapture={() => setIsVisible(true)}
      onBlurCapture={() => setIsVisible(false)}
    >
      {children}

      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-56 rounded-md bg-slate-950 px-3 py-2 text-xs text-white shadow-lg",
          "transition duration-150",
          placementClasses[placement],
          isVisible
            ? "visible opacity-100"
            : "invisible opacity-0",
        )}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;