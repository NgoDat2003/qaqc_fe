"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import { PaginationControls } from "./pagination-controls";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface SortableColumnDef<T> {
  header: string;
  sortKey?: keyof T;
  cell: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface SortableTableProps<T extends { id: string | number }> {
  columns: SortableColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  defaultPageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
}

export function SortableTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  defaultPageSize = 20,
  emptyTitle = "Không có dữ liệu",
  emptyDescription = "Chưa có bản ghi nào.",
  onRowClick,
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / defaultPageSize);
  const pageData = useMemo(
    () => sorted.slice((page - 1) * defaultPageSize, page * defaultPageSize),
    [sorted, page, defaultPageSize]
  );

  return (
    <div className="w-full min-w-0">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300">
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10">
              <TableRow
                className="bg-card border-b border-border/40"
                style={{ backgroundImage: "linear-gradient(to right, hsl(var(--muted)/0.6), hsl(var(--muted)/0.4), hsl(var(--muted)/0.6))" }}
              >
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={cn(
                      "h-11 px-5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider",
                      col.sortKey && "cursor-pointer select-none hover:text-foreground transition-colors",
                      col.hideOnMobile && "hidden md:table-cell",
                      col.className
                    )}
                    onClick={() => col.sortKey && handleSort(col.sortKey)}
                  >
                    {col.sortKey ? (
                      <span className="flex items-center gap-1">
                        {col.header}
                        {sortKey === col.sortKey ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-primary" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                    ) : (
                      col.header
                    )}
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
              ) : pageData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0 h-72">
                    <EmptyState title={emptyTitle} description={emptyDescription} className="rounded-none border-none bg-transparent" />
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group border-b border-border/30 last:border-0 transition-colors duration-150",
                      onRowClick && "cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                    )}
                  >
                    {columns.map((col, i) => (
                      <TableCell
                        key={i}
                        className={cn(
                          "px-5 py-3.5 text-sm font-medium text-foreground",
                          col.hideOnMobile && "hidden md:table-cell",
                          col.className
                        )}
                      >
                        {col.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination — always show if more than 1 page */}
        {!isLoading && sorted.length > 0 && (
          <div className="border-t border-border/40 bg-muted/20">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={sorted.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
