import {
  useId,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "../../utils/cn";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Textarea = ({
  id,
  label,
  error,
  helperText,
  containerClassName,
  className,
  disabled,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const helperId = helperText ? `${textareaId}-helper` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helperId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      <label htmlFor={textareaId} className="mb-1.5 block text-xs font-semibold text-content">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-danger">*</span>}
      </label>

      <textarea
        {...props}
        id={textareaId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-28 w-full resize-y rounded-control border bg-surface px-3.5 py-3",
          "text-content placeholder:text-placeholder shadow-sm outline-none transition duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/10",
          "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
          error
            ? "border-danger focus:border-danger focus:ring-danger/15"
            : "border-border hover:border-primary/30",
          className,
        )}
      />

      {helperText && !error && <p id={helperId} className="mt-1.5 text-xs text-muted">{helperText}</p>}
      {error && <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Textarea;
