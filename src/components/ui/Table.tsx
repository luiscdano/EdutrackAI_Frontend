import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import { cn } from "../../utils/cn";

interface TableProps
  extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  containerClassName?: string;
}

interface TableSectionProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

interface TableHeadProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

interface TableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function Table({
  children,
  containerClassName,
  className,
  ...props
}: TableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-card border border-border",
        containerClassName,
      )}
    >
      <table
        {...props}
        className={cn(
          "w-full min-w-[640px] border-collapse text-left text-sm",
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className,
  ...props
}: TableSectionProps) {
  return (
    <thead
      {...props}
      className={cn(
        "border-b border-border bg-slate-900/60",
        className,
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
  ...props
}: TableSectionProps) {
  return (
    <tbody
      {...props}
      className={cn(
        "divide-y divide-border bg-surface",
        className,
      )}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      {...props}
      className={cn(
        "transition-colors hover:bg-white/5",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
  scope = "col",
  ...props
}: TableHeadProps) {
  return (
    <th
      {...props}
      scope={scope}
      className={cn(
        "whitespace-nowrap px-4 py-3 font-semibold text-content",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: TableCellProps) {
  return (
    <td
      {...props}
      className={cn(
        "px-4 py-3 text-slate-300",
        className,
      )}
    >
      {children}
    </td>
  );
}