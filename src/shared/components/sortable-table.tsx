"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import { PaginationControls } from "./pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface FilterOption {
  label: string;
  value: string;
}

type ColumnValue = string | number | boolean | Date | null | undefined;
type ColumnMatchValue = ColumnValue | ColumnValue[];

export interface SortableColumnDef<T> {
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  sortKey?: keyof T;
  filterKey?: keyof T;
  searchKey?: keyof T;
  getSortValue?: (item: T) => ColumnValue;
  getFilterValue?: (item: T) => ColumnMatchValue;
  getSearchValue?: (item: T) => string;
  filterOptions?: FilterOption[];
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

interface ControlAnchor {
  colIndex: number;
  type: "search" | "filter";
  rect: DOMRect;
}

interface SearchDropdownProps {
  header: string;
  activeValue: string;
  anchor: DOMRect;
  onApply: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function valueToText(value: ColumnValue) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function getColumnValue<T>(item: T, col: SortableColumnDef<T>, mode: "sort" | "filter" | "search"): ColumnMatchValue {
  if (mode === "sort" && col.getSortValue) return col.getSortValue(item);
  if (mode === "filter" && col.getFilterValue) return col.getFilterValue(item);
  if (mode === "search" && col.getSearchValue) return col.getSearchValue(item);

  const key = mode === "sort" ? col.sortKey : mode === "filter" ? col.filterKey : col.searchKey;
  return key ? item[key] as ColumnValue : "";
}

function valueToTextList(value: ColumnMatchValue) {
  if (Array.isArray(value)) return value.map(valueToText).filter(Boolean);
  const text = valueToText(value);
  return text ? [text] : [];
}

function normalizeSortValue(value: ColumnValue) {
  if (value == null) return "";
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;

  const text = String(value);
  const time = Date.parse(text);
  if (!Number.isNaN(time) && /^\d{4}-\d{2}-\d{2}/.test(text)) return time;
  return text.toLocaleLowerCase("vi");
}

function SearchDropdown({
  header,
  activeValue,
  anchor,
  onApply,
  onClear,
  onClose,
}: SearchDropdownProps) {
  const [value, setValue] = useState(activeValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: anchor.bottom + 8, left: anchor.left, zIndex: 9999 }}
      className="w-[300px] rounded-xl border border-border bg-popover p-3 shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-2 text-sm font-semibold text-foreground">{header}</div>
      <Input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onApply(value);
            onClose();
          }
        }}
        placeholder={`Tìm theo ${header.toLowerCase()}`}
        className="h-10"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setValue("");
            onClear();
            onClose();
          }}
        >
          Xóa
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onApply(value);
            onClose();
          }}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  header: string;
  options: FilterOption[];
  active: Set<string>;
  anchor: DOMRect;
  onApply: (selected: Set<string>) => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterDropdown({ header, options, active, anchor, onApply, onClear, onClose }: FilterDropdownProps) {
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set(active));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [onClose]);

  const filteredOptions = search
    ? options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: anchor.bottom + 8, left: anchor.left, zIndex: 9999 }}
      className="w-[280px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-border p-3">
        <div className="mb-2 text-sm font-semibold text-foreground">{header}</div>
        <Input
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm kiếm bộ lọc"
          className="h-9"
        />
      </div>

      <div className="max-h-56 overflow-y-auto py-1">
        {filteredOptions.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Không tìm thấy</p>
        ) : (
          filteredOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={pending.has(option.value)}
                onChange={() => toggle(option.value)}
                className="accent-primary"
              />
              <span className="truncate">{option.label}</span>
            </label>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onClear();
            onClose();
          }}
        >
          Xóa
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onApply(pending);
            onClose();
          }}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
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
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Record<number, Set<string>>>({});
  const [activeSearches, setActiveSearches] = useState<Record<number, string>>({});
  const [openControl, setOpenControl] = useState<ControlAnchor | null>(null);

  const filterOptions = useMemo(() => {
    return columns.map((col) => {
      if (!col.filterKey && !col.getFilterValue) return [];
      if (col.filterOptions) return col.filterOptions;

      const seen = new Map<string, string>();
      data.forEach((item) => {
        valueToTextList(getColumnValue(item, col, "filter")).forEach((value) => {
          if (value && !seen.has(value)) seen.set(value, value);
        });
      });
      return [...seen.entries()].map(([value, label]) => ({ value, label }));
    });
  }, [columns, data]);

  const filtered = useMemo(() => {
    let result = data;

    Object.entries(activeSearches).forEach(([colIdx, query]) => {
      const trimmed = query.trim().toLocaleLowerCase("vi");
      if (!trimmed) return;
      const col = columns[Number(colIdx)];
      if (!col) return;
      result = result.filter((item) =>
        valueToTextList(getColumnValue(item, col, "search")).join(" ").toLocaleLowerCase("vi").includes(trimmed)
      );
    });

    Object.entries(activeFilters).forEach(([colIdx, selected]) => {
      if (selected.size === 0) return;
      const col = columns[Number(colIdx)];
      if (!col) return;
      result = result.filter((item) =>
        valueToTextList(getColumnValue(item, col, "filter")).some((value) => selected.has(value))
      );
    });

    return result;
  }, [activeFilters, activeSearches, columns, data]);

  const sorted = useMemo(() => {
    if (sortCol == null) return filtered;
    const col = columns[sortCol];
    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const av = normalizeSortValue(valueToTextList(getColumnValue(a, col, "sort"))[0] ?? "");
      const bv = normalizeSortValue(valueToTextList(getColumnValue(b, col, "sort"))[0] ?? "");
      let cmp = 0;

      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv), "vi", { numeric: true, sensitivity: "base" });

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [columns, filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / defaultPageSize));
  const pageData = useMemo(
    () => sorted.slice((page - 1) * defaultPageSize, page * defaultPageSize),
    [defaultPageSize, page, sorted]
  );

  const handleSort = (colIndex: number) => {
    if (sortCol !== colIndex) {
      setSortCol(colIndex);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortCol(null);
      setSortDir("asc");
    }
    setPage(1);
  };

  const applyFilter = (colIndex: number, selected: Set<string>) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (selected.size === 0) delete next[colIndex];
      else next[colIndex] = selected;
      return next;
    });
    setPage(1);
  };

  const clearFilter = (colIndex: number) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[colIndex];
      return next;
    });
    setPage(1);
  };

  const applySearch = (colIndex: number, value: string) => {
    setActiveSearches((prev) => {
      const next = { ...prev };
      const trimmed = value.trim();
      if (!trimmed) delete next[colIndex];
      else next[colIndex] = trimmed;
      return next;
    });
    setPage(1);
  };

  const clearSearch = (colIndex: number) => {
    setActiveSearches((prev) => {
      const next = { ...prev };
      delete next[colIndex];
      return next;
    });
    setPage(1);
  };

  return (
    <div className="w-full min-w-0">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="border-b border-border bg-muted/45">
                {columns.map((col, index) => {
                  const hasSearch = !!(col.searchKey || col.getSearchValue);
                  const hasFilter = !!(col.filterKey || col.getFilterValue);
                  const hasSort = !!(col.sortKey || col.getSortValue);
                  const isSortActive = sortCol === index;
                  const sortTitle = !isSortActive
                    ? "Sắp xếp tăng dần"
                    : sortDir === "asc"
                      ? "Sắp xếp giảm dần"
                      : "Bỏ sắp xếp";
                  const activeFilterCount = activeFilters[index]?.size ?? 0;
                  const isSearchActive = !!activeSearches[index];

                  return (
                    <TableHead
                      key={`${col.header}-${index}`}
                      className={cn(
                        "h-11 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.className
                      )}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <button
                          type="button"
                          disabled={!hasSort}
                          onClick={() => hasSort && handleSort(index)}
                          className={cn(
                            "min-w-0 truncate text-left font-semibold uppercase tracking-wider",
                            hasSort && "transition-colors hover:text-foreground",
                            !hasSort && "cursor-default"
                          )}
                        >
                          {col.header}
                        </button>

                        <div className="flex shrink-0 items-center gap-1">
                          {hasSearch && (
                            <button
                              type="button"
                              title="Tìm kiếm"
                              onClick={(event) => {
                                event.stopPropagation();
                                const rect = event.currentTarget.getBoundingClientRect();
                                setOpenControl((current) =>
                                  current?.colIndex === index && current.type === "search"
                                    ? null
                                    : { colIndex: index, type: "search", rect }
                                );
                              }}
                              className={cn(
                                "relative rounded p-1 transition-colors hover:bg-muted hover:text-foreground",
                                isSearchActive ? "text-primary" : "text-muted-foreground/70"
                              )}
                            >
                              <Search className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {hasFilter && (
                            <button
                              type="button"
                              title="Lọc"
                              onClick={(event) => {
                                event.stopPropagation();
                                const rect = event.currentTarget.getBoundingClientRect();
                                setOpenControl((current) =>
                                  current?.colIndex === index && current.type === "filter"
                                    ? null
                                    : { colIndex: index, type: "filter", rect }
                                );
                              }}
                              className={cn(
                                "relative rounded p-1 transition-colors hover:bg-muted hover:text-foreground",
                                activeFilterCount > 0 ? "text-primary" : "text-muted-foreground/70"
                              )}
                            >
                              <ListFilter className="h-3.5 w-3.5" />
                              {activeFilterCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold leading-none text-primary-foreground">
                                  {activeFilterCount}
                                </span>
                              )}
                            </button>
                          )}

                          {hasSort && (
                            <button
                              type="button"
                              title={sortTitle}
                              aria-label={sortTitle}
                              onClick={() => handleSort(index)}
                              className={cn(
                                "rounded p-1 transition-colors hover:bg-muted hover:text-foreground",
                                isSortActive ? "text-primary" : "text-muted-foreground/60"
                              )}
                            >
                              {isSortActive
                                ? sortDir === "asc"
                                  ? <ArrowUp className="h-3.5 w-3.5" />
                                  : <ArrowDown className="h-3.5 w-3.5" />
                                : <ChevronsUpDown className="h-3.5 w-3.5" />}
                            </button>
                          )}

                          {(isSearchActive || activeFilterCount > 0) && (
                            <button
                              type="button"
                              title="Xóa điều kiện"
                              onClick={(event) => {
                                event.stopPropagation();
                                clearSearch(index);
                                clearFilter(index);
                              }}
                              className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {openControl?.colIndex === index && openControl.type === "search" && (
                          <SearchDropdown
                            header={col.header}
                            activeValue={activeSearches[index] ?? ""}
                            anchor={openControl.rect}
                            onApply={(value) => applySearch(index, value)}
                            onClear={() => clearSearch(index)}
                            onClose={() => setOpenControl(null)}
                          />
                        )}

                        {openControl?.colIndex === index && openControl.type === "filter" && (
                          <FilterDropdown
                            header={col.header}
                            options={filterOptions[index]}
                            active={activeFilters[index] ?? new Set()}
                            anchor={openControl.rect}
                            onApply={(selected) => applyFilter(index, selected)}
                            onClear={() => clearFilter(index)}
                            onClose={() => setOpenControl(null)}
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
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-b border-border/30 hover:bg-transparent">
                    {columns.map((col, colIndex) => (
                      <TableCell key={`${col.header}-${colIndex}`} className="px-5 py-4">
                        <Skeleton className="h-4 w-full rounded-md bg-muted/60" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pageData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="h-72 p-0">
                    <EmptyState title={emptyTitle} description={emptyDescription} className="rounded-none border-none bg-transparent" />
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group border-b border-border/30 transition-colors duration-150 last:border-0",
                      onRowClick && "cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                    )}
                  >
                    {columns.map((col, index) => (
                      <TableCell
                        key={`${item.id}-${col.header}-${index}`}
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

        {!isLoading && sorted.length > 0 && (
          <div className="border-t border-border/40 bg-muted/20">
            <PaginationControls
              page={Math.min(page, totalPages)}
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
