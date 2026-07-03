import {
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { cn } from "../../utils/cn";

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Select = ({
  id,
  label,
  children,
  error,
  helperText,
  containerClassName,
  className,
  disabled,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const helperId = helperText
    ? `${selectId}-helper`
    : undefined;

  const errorId = error
    ? `${selectId}-error`
    : undefined;

  const describedBy =
    [
      ariaDescribedBy,
      helperId,
      errorId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      <label
        htmlFor={selectId}
        className="mb-2 block text-sm font-medium text-content"
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

      <div className="relative">
        <select
          {...props}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-11 w-full appearance-none rounded-control border",
            "bg-surface-muted px-4 py-2.5 pr-10",
            "text-content outline-none transition-colors duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-danger focus:border-danger focus:ring-danger/25"
              : "border-border",
            className,
          )}
        >
          {children}
        </select>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted"
        >
          ▼
        </span>
      </div>

      {helperText && !error && (
        <p
          id={helperId}
          className="mt-1.5 text-sm text-muted"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;