"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { PaginationControls } from "./pagination-controls";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortableColumnDef<T> {
  header: string;
  sortKey?: keyof T;
  /** Field to derive filter values from. Also enables the filter dropdown for this column. */
  filterKey?: keyof T;
  /** Explicit filter options. If omitted and filterKey is set, options are auto-derived from data. */
  filterOptions?: FilterOption[];
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

// --- Column Filter Dropdown ---

interface FilterDropdownProps {
  options: FilterOption[];
  active: Set<string>;
  /** Viewport-relative rect of the filter button — used for fixed positioning to escape overflow clipping */
  anchor: DOMRect;
  onApply: (selected: Set<string>) => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterDropdown({ options, active, anchor, onApply, onClear, onClose }: FilterDropdownProps) {
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set(active));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close on outside click
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    // Close on scroll (any ancestor) — dropdown is fixed so it won't follow the button
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [onClose]);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: anchor.bottom + 4, left: anchor.left, zIndex: 9999 }}
      className="min-w-[200px] w-max max-w-[260px] bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search */}
      <div className="p-2 border-b border-border">
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm bộ lọc"
          className="w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground px-1"
        />
      </div>

      {/* Options */}
      <div className="max-h-52 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-center text-muted-foreground py-3">Không tìm thấy</p>
        ) : (
          filtered.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted text-sm">
              <input
                type="checkbox"
                checked={pending.has(opt.value)}
                onChange={() => toggle(opt.value)}
                className="accent-primary"
              />
              <span className="truncate">{opt.label}</span>
            </label>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/30">
        <button
          onClick={() => { onClear(); onClose(); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Bỏ lọc
        </button>
        <Button size="sm" className="h-7 text-xs px-3" onClick={() => { onApply(pending); onClose(); }}>
          Đồng ý
        </Button>
      </div>
    </div>
  );
}

// --- Main Table ---

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
  // activeFilters: colIndex → Set of selected values
  const [activeFilters, setActiveFilters] = useState<Record<number, Set<string>>>({});
  const [openFilterCol, setOpenFilterCol] = useState<number | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<DOMRect | null>(null);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Auto-derive filter options from data for a column
  const getFilterOptions = (col: SortableColumnDef<T>): FilterOption[] => {
    if (!col.filterKey) return [];
    if (col.filterOptions) return col.filterOptions;
    const seen = new Map<string, string>();
    data.forEach((item) => {
      const v = String(item[col.filterKey!] ?? "");
      if (v && !seen.has(v)) seen.set(v, v);
    });
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  };

  // Apply column filters first, then sort
  const filtered = useMemo(() => {
    let result = data;
    Object.entries(activeFilters).forEach(([colIdxStr, selected]) => {
      if (selected.size === 0) return;
      const col = columns[Number(colIdxStr)];
      if (!col?.filterKey) return;
      result = result.filter((item) => selected.has(String(item[col.filterKey!] ?? "")));
    });
    return result;
  }, [data, activeFilters, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / defaultPageSize);
  const pageData = useMemo(
    () => sorted.slice((page - 1) * defaultPageSize, page * defaultPageSize),
    [sorted, page, defaultPageSize]
  );

  const applyFilter = (colIdx: number, selected: Set<string>) => {
    setActiveFilters((prev) => ({ ...prev, [colIdx]: selected }));
    setPage(1);
  };

  const clearFilter = (colIdx: number) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[colIdx];
      return next;
    });
    setPage(1);
  };

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
                {columns.map((col, i) => {
                  const hasFilter = !!col.filterKey;
                  const isFilterActive = hasFilter && (activeFilters[i]?.size ?? 0) > 0;
                  const isFilterOpen = openFilterCol === i;

                  return (
                    <TableHead
                      key={i}
                      className={cn(
                        "h-11 px-5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider",
                        col.sortKey && "cursor-pointer select-none",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.className
                      )}
                      onClick={() => col.sortKey && !hasFilter && handleSort(col.sortKey)}
                    >
                      <div className="flex items-center gap-1 relative">
                        {/* Sort area */}
                        <span
                          className={cn("flex items-center gap-1", col.sortKey && "cursor-pointer hover:text-foreground transition-colors")}
                          onClick={(e) => { if (col.sortKey) { e.stopPropagation(); handleSort(col.sortKey); } }}
                        >
                          {col.header}
                          {col.sortKey && (
                            sortKey === col.sortKey ? (
                              sortDir === "asc"
                                ? <ChevronUp className="h-3 w-3 text-primary" />
                                : <ChevronDown className="h-3 w-3 text-primary" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            )
                          )}
                        </span>

                        {/* Filter icon */}
                        {hasFilter && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isFilterOpen) {
                                setOpenFilterCol(null);
                                setFilterAnchor(null);
                              } else {
                                setFilterAnchor(e.currentTarget.getBoundingClientRect());
                                setOpenFilterCol(i);
                              }
                            }}
                            className={cn(
                              "relative ml-0.5 p-0.5 rounded transition-colors",
                              isFilterActive ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
                            )}
                            title="Lọc"
                          >
                            <ListFilter className="h-3 w-3" />
                            {isFilterActive && (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                                {activeFilters[i].size}
                              </span>
                            )}
                          </button>
                        )}

                        {/* Filter dropdown — fixed positioned to escape overflow clipping */}
                        {isFilterOpen && filterAnchor && (
                          <FilterDropdown
                            options={getFilterOptions(col)}
                            active={activeFilters[i] ?? new Set()}
                            anchor={filterAnchor}
                            onApply={(sel) => applyFilter(i, sel)}
                            onClear={() => clearFilter(i)}
                            onClose={() => { setOpenFilterCol(null); setFilterAnchor(null); }}
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
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

        {/* Pagination */}
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
