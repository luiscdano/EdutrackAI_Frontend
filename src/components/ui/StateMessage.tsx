import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../utils/cn";

export type StateMessageTone =
  | "neutral"
  | "danger";

export interface StateMessageProps
  extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: StateMessageTone;
}

const toneClasses: Record<StateMessageTone, string> = {
  neutral:
    "border-border bg-surface text-content",

  danger:
    "border-danger/40 bg-danger/5 text-content",
};

const iconClasses: Record<StateMessageTone, string> = {
  neutral:
    "border-border bg-slate-700 text-muted",

  danger:
    "border-danger/30 bg-danger/10 text-danger",
};

const StateMessage = ({
  title,
  description,
  icon,
  action,
  tone = "neutral",
  className,
  ...props
}: StateMessageProps) => {
  return (
    <div
      {...props}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-card border border-dashed px-6 py-10 text-center",
        toneClasses[tone],
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold",
            iconClasses[tone],
          )}
        >
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      {description && (
        <div className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </div>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default StateMessage;