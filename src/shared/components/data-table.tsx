"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { EmptyState } from "./empty-state";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[] | undefined;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyTitle = "No results found",
  emptyDescription = "Adjust your filters or add new records to see them here.",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group transition-colors hover:bg-muted/30",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      "px-4 py-3.5 text-foreground group-hover:text-primary transition-colors",
                      col.className
                    )}
                  >
                    {col.cell
                      ? col.cell(item)
                      : (item[col.accessorKey!] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
