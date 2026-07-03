import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: string;
  error?: string;
  containerClassName?: string;
}

const Radio = ({
  id,
  label,
  description,
  error,
  containerClassName,
  className,
  disabled,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioProps) => {
  const generatedId = useId();
  const radioId = id ?? generatedId;

  const descriptionId = description
    ? `${radioId}-description`
    : undefined;

  const errorId = error
    ? `${radioId}-error`
    : undefined;

  const describedBy =
    [
      ariaDescribedBy,
      descriptionId,
      errorId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={radioId}
          type="radio"
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 rounded-full",
            "border border-border bg-surface-muted accent-primary",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary focus-visible:ring-offset-2",
            "focus-visible:ring-offset-app-bg",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "ring-1 ring-danger",
            className,
          )}
        />

        <div className="min-w-0">
          <label
            htmlFor={radioId}
            className={cn(
              "block text-sm font-medium text-content",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer",
            )}
          >
            {label}

            {required && (
              <span
                aria-hidden="true"
                className="ml-1 text-danger"
              >
                *
              </span>
            )}
          </label>

          {description && !error && (
            <p
              id={descriptionId}
              className="mt-1 text-sm text-muted"
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 pl-8 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Radio;