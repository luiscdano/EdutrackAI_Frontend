import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
}

const Tabs = ({
  items,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Pestañas",
  className,
  ...props
}: TabsProps) => {
  const generatedId = useId();

  const firstEnabledValue =
    items.find((item) => !item.disabled)?.value ?? "";

  const [internalValue, setInternalValue] =
    useState(defaultValue ?? firstEnabledValue);

  const buttonRefs =
    useRef<Array<HTMLButtonElement | null>>([]);

  const activeValue = value ?? internalValue;

  const selectTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }

    onValueChange?.(newValue);
  };

 const handleKeyDown = (
  event: KeyboardEvent<HTMLButtonElement>,
  currentIndex: number,
) => {
  const enabledIndexes = items
    .map((item, index) =>
      item.disabled ? null : index,
    )
    .filter(
      (index): index is number => index !== null,
    );

  if (enabledIndexes.length === 0) {
    return;
  }

  const currentPosition =
    enabledIndexes.indexOf(currentIndex);

  if (currentPosition === -1) {
    return;
  }

  let nextPosition: number;

  if (event.key === "ArrowRight") {
    nextPosition =
      (currentPosition + 1) %
      enabledIndexes.length;
  } else if (event.key === "ArrowLeft") {
    nextPosition =
      (currentPosition - 1 + enabledIndexes.length) %
      enabledIndexes.length;
  } else if (event.key === "Home") {
    nextPosition = 0;
  } else if (event.key === "End") {
    nextPosition = enabledIndexes.length - 1;
  } else {
    return;
  }

  event.preventDefault();

  const nextIndex = enabledIndexes[nextPosition];
  const nextItem = items[nextIndex];

  if (!nextItem) {
    return;
  }

  selectTab(nextItem.value);
  buttonRefs.current[nextIndex]?.focus();
};
  return (
    <div
      {...props}
      className={cn("w-full", className)}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex w-full gap-1 overflow-x-auto border-b border-border"
      >
        {items.map((item, index) => {
          const isActive =
            item.value === activeValue;

          const tabId =
            `${generatedId}-tab-${index}`;

          const panelId =
            `${generatedId}-panel-${index}`;

          return (
            <button
              key={item.value}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item.value)}
              onKeyDown={(event) =>
                handleKeyDown(event, index)
              }
              className={cn(
                "min-h-11 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-content",
                item.disabled &&
                  "cursor-not-allowed opacity-50",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => {
        const isActive =
          item.value === activeValue;

        return (
          <div
            key={item.value}
            id={`${generatedId}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${generatedId}-tab-${index}`}
            tabIndex={0}
            hidden={!isActive}
            className="py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;