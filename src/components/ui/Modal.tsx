import {
  useEffect,
  useId,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({
  isOpen,
  title,
  children,
  footer,
  size = "md",
  onClose,
  closeOnOverlayClick = true,
  className,
  ...props
}: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onMouseDown={handleOverlayClick}
    >
      <div
        {...props}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "w-full rounded-card border border-border bg-surface shadow-card",
          sizeClasses[size],
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id={titleId}
            className="text-lg font-semibold text-content"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-10 w-10 items-center justify-center rounded-control text-2xl text-muted transition hover:bg-white/10 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;