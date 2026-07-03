import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

interface DropdownContextValue {
  close: () => void;
}

const DropdownContext =
  createContext<DropdownContextValue | null>(null);

type DropdownAlign = "start" | "end";

interface DropdownProps
  extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children: ReactNode;
  label?: string;
  align?: DropdownAlign;
}

const Dropdown = ({
  trigger,
  children,
  label = "Abrir menú",
  align = "end",
  className,
  ...props
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      const target = event.target as Node;

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen]);

  return (
    <div
      {...props}
      ref={containerRef}
      className={cn(
        "relative inline-block",
        className,
      )}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((currentValue) => !currentValue)
        }
        className="inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-content transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {trigger}
      </button>

      {isOpen && (
        <DropdownContext.Provider
          value={{
            close: () => setIsOpen(false),
          }}
        >
          <div
            role="menu"
            className={cn(
              "absolute top-full z-40 mt-2 min-w-48 overflow-hidden rounded-control border border-border bg-surface p-1 shadow-card",
              align === "end"
                ? "right-0"
                : "left-0",
            )}
          >
            {children}
          </div>
        </DropdownContext.Provider>
      )}
    </div>
  );
};

interface DropdownItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  danger?: boolean;
}

export function DropdownItem({
  children,
  danger = false,
  className,
  onClick,
  ...props
}: DropdownItemProps) {
  const context = useContext(DropdownContext);

  const handleClick: MouseEventHandler<
    HTMLButtonElement
  > = (event) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      context?.close();
    }
  };

  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      onClick={handleClick}
      className={cn(
        "flex min-h-10 w-full items-center rounded-md px-3 py-2 text-left text-sm",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        danger
          ? "text-red-300 hover:bg-danger/10"
          : "text-content hover:bg-white/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default Dropdown;