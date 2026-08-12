import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

const Input = ({
  id,
  label,
  error,
  helperText,
  containerClassName,
  leftElement,
  rightElement,
  className,
  disabled,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helperId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;
  const hasLeftElement = Boolean(leftElement);
  const hasRightElement = Boolean(rightElement);

  return (
    <div className={cn("w-full", containerClassName)}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-semibold text-content"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-danger">*</span>
        )}
      </label>

      <div className="relative">
        {hasLeftElement && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            {leftElement}
          </div>
        )}

        <input
          {...props}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-11 w-full rounded-control border bg-surface px-3.5 py-2.5",
            "text-content placeholder:text-placeholder shadow-sm",
            "outline-none transition duration-200",
            "focus:border-primary focus:ring-3 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
            error
              ? "border-danger focus:border-danger focus:ring-danger/15"
              : "border-border hover:border-primary/30",
            hasLeftElement && "pl-10",
            hasRightElement && "pr-12",
            className,
          )}
        />

        {hasRightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
