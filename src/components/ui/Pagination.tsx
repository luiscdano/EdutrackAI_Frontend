import type { HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type PaginationItem =
  | number
  | "ellipsis-left"
  | "ellipsis-right";

interface PaginationProps
  extends HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  siblingCount?: number;
}

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const createItems = (): PaginationItem[] => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      );
    }

    const items: PaginationItem[] = [1];

    const startPage = Math.max(
      2,
      page - siblingCount,
    );

    const endPage = Math.min(
      totalPages - 1,
      page + siblingCount,
    );

    if (startPage > 2) {
      items.push("ellipsis-left");
    }

    for (
      let currentPage = startPage;
      currentPage <= endPage;
      currentPage += 1
    ) {
      items.push(currentPage);
    }

    if (endPage < totalPages - 1) {
      items.push("ellipsis-right");
    }

    items.push(totalPages);

    return items;
  };

  const items = createItems();

  const changePage = (newPage: number) => {
    if (
      disabled ||
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    onPageChange(newPage);
  };

  return (
    <nav
      {...props}
      aria-label="Paginación"
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => changePage(page - 1)}
        disabled={disabled || page === 1}
        className="min-h-11 rounded-control border border-border px-3 text-sm text-content transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>

      {items.map((item) => {
        if (typeof item !== "number") {
          return (
            <span
              key={item}
              aria-hidden="true"
              className="flex min-h-11 min-w-11 items-center justify-center text-muted"
            >
              …
            </span>
          );
        }

        const isCurrentPage = item === page;

        return (
          <button
            key={item}
            type="button"
            onClick={() => changePage(item)}
            disabled={disabled}
            aria-current={
              isCurrentPage ? "page" : undefined
            }
            aria-label={`Ir a la página ${item}`}
            className={cn(
              "min-h-11 min-w-11 rounded-control border px-3 text-sm font-medium",
              "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isCurrentPage
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-content hover:bg-white/10",
              disabled &&
                "cursor-not-allowed opacity-50",
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => changePage(page + 1)}
        disabled={disabled || page === totalPages}
        className="min-h-11 rounded-control border border-border px-3 text-sm text-content transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </nav>
  );
};

export default Pagination;