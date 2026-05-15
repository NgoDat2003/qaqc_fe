
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ColumnDef<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  footerContent?: React.ReactNode;
  maxHeight?: string;
  className?: string;
  containerClassName?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyTitle = "Không có dữ liệu",
  emptyDescription = "Chưa có bản ghi nào. Hãy thêm mới để bắt đầu.",
  footerContent,
  maxHeight = "600px",
  className,
  containerClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full min-w-0", containerClassName)}>
      <div className={cn(
        "rounded-2xl border border-border/50 bg-card overflow-hidden",
        "shadow-[0_2px_12px_rgb(0,0,0,0.04)] transition-shadow duration-300",
        "hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        className
      )}>
        <div
          className="w-full overflow-auto"
          style={{ maxHeight }}
        >
          <Table className={cn("w-full")}>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-card border-b border-border/40"
                style={{ backgroundImage: "linear-gradient(to right, hsl(var(--muted)/0.6), hsl(var(--muted)/0.4), hsl(var(--muted)/0.6))" }}
              >
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      "h-11 px-5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider",
                      col.hideOnMobile && "hidden md:table-cell",
                      col.className
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent border-b border-border/30">
                    {columns.map((_, j) => (
                      <TableCell key={j} className="px-5 py-4">
                        <Skeleton className="h-4 w-full rounded-md bg-muted/60" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !data || data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0 h-72">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="rounded-none border-none bg-transparent"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group border-b border-border/30 last:border-0 transition-colors duration-150",
                      onRowClick && "cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                    )}
                  >
                    {columns.map((col, idx) => (
                      <TableCell
                        key={idx}
                        className={cn(
                          "px-5 py-3.5 text-sm font-medium text-foreground",
                          col.hideOnMobile && "hidden md:table-cell",
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? (item[col.accessorKey] as React.ReactNode)
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {footerContent && (
          <div className="px-5 py-2.5 border-t border-border/40 bg-muted/20">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
