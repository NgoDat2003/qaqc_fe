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

interface MobileCardField<T> {
  label: string;
  value: (item: T) => React.ReactNode;
}

interface MobileCardConfig<T> {
  title: (item: T) => React.ReactNode;
  subtitle?: (item: T) => React.ReactNode;
  leading?: (item: T) => React.ReactNode;
  badges?: (item: T) => React.ReactNode[];
  metrics?: MobileCardField<T>[];
  details?: MobileCardField<T>[];
  actions?: (item: T) => React.ReactNode;
}

interface SortableTableProps<T extends { id: string | number }> {
  columns: SortableColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  defaultPageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  mobileCard?: MobileCardConfig<T>;
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

interface MobileControlPanelProps {
  control: ControlAnchor;
  columns: SortableColumnDef<unknown>[];
  filterOptions: FilterOption[][];
  activeFilters: Record<number, Set<string>>;
  activeSearches: Record<number, string>;
  onApplySearch: (colIndex: number, value: string) => void;
  onClearSearch: (colIndex: number) => void;
  onApplyFilter: (colIndex: number, selected: Set<string>) => void;
  onClearFilter: (colIndex: number) => void;
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

function MobileControlPanel({
  control,
  columns,
  filterOptions,
  activeFilters,
  activeSearches,
  onApplySearch,
  onClearSearch,
  onApplyFilter,
  onClearFilter,
  onClose,
}: MobileControlPanelProps) {
  const col = columns[control.colIndex];
  const [searchValue, setSearchValue] = useState(activeSearches[control.colIndex] ?? "");
  const [filterSearch, setFilterSearch] = useState("");
  const [pendingFilters, setPendingFilters] = useState<Set<string>>(
    new Set(activeFilters[control.colIndex] ?? [])
  );

  if (!col) return null;

  const options = filterOptions[control.colIndex] ?? [];
  const visibleOptions = filterSearch
    ? options.filter((option) => option.label.toLowerCase().includes(filterSearch.toLowerCase()))
    : options;

  const toggleFilter = (value: string) => {
    setPendingFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div className="fixed inset-x-3 top-16 z-50 max-h-[calc(100svh-5rem)] overflow-y-auto rounded-lg border border-border bg-popover p-3 shadow-2xl md:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{col.header}</div>
          <div className="text-xs text-muted-foreground">
            {control.type === "search" ? "Tìm kiếm trong cột này" : "Chọn bộ lọc"}
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {control.type === "search" ? (
        <>
          <Input
            autoFocus
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onApplySearch(control.colIndex, searchValue);
                onClose();
              }
            }}
            placeholder={`Tìm theo ${col.header.toLowerCase()}`}
            className="h-11"
          />
          <div className="sticky bottom-0 mt-3 grid grid-cols-2 gap-2 bg-popover pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClearSearch(control.colIndex);
                onClose();
              }}
            >
              Xóa
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApplySearch(control.colIndex, searchValue);
                onClose();
              }}
            >
              Áp dụng
            </Button>
          </div>
        </>
      ) : (
        <>
          {options.length > 6 && (
            <Input
              value={filterSearch}
              onChange={(event) => setFilterSearch(event.target.value)}
              placeholder="Tìm kiếm bộ lọc"
              className="mb-2 h-10"
            />
          )}
          <div className="max-h-[45svh] overflow-y-auto rounded-md border border-border">
            {visibleOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">Không tìm thấy</div>
            ) : (
              visibleOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2.5 border-b border-border/50 px-3 py-2.5 text-sm last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={pendingFilters.has(option.value)}
                    onChange={() => toggleFilter(option.value)}
                    className="accent-primary"
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </label>
              ))
            )}
          </div>
          <div className="sticky bottom-0 mt-3 grid grid-cols-2 gap-2 bg-popover pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClearFilter(control.colIndex);
                onClose();
              }}
            >
              Xóa
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApplyFilter(control.colIndex, pendingFilters);
                onClose();
              }}
            >
              Áp dụng
            </Button>
          </div>
        </>
      )}
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
  mobileCard,
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

  const renderMobileControls = () => (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {columns.map((col, index) => {
        const hasSearch = !!(col.searchKey || col.getSearchValue);
        const hasFilter = !!(col.filterKey || col.getFilterValue);
        const hasSort = !!(col.sortKey || col.getSortValue);
        const isSortActive = sortCol === index;
        const activeFilterCount = activeFilters[index]?.size ?? 0;
        const isSearchActive = !!activeSearches[index];
        const sortLabel = !isSortActive ? "Sắp xếp" : sortDir === "asc" ? "Tăng dần" : "Giảm dần";

        return (
          <div key={`${col.header}-${index}-mobile`} className="flex shrink-0 items-center gap-1">
            {hasSearch && (
              <button
                type="button"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setOpenControl({ colIndex: index, type: "search", rect });
                }}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold",
                  isSearchActive
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <Search className="h-3.5 w-3.5" />
                <span>{col.header}</span>
              </button>
            )}

            {hasFilter && (
              <button
                type="button"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setOpenControl({ colIndex: index, type: "filter", rect });
                }}
                className={cn(
                  "relative flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold",
                  activeFilterCount > 0
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>{col.header}</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {hasSort && (
              <button
                type="button"
                onClick={() => handleSort(index)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold",
                  isSortActive
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {isSortActive
                  ? sortDir === "asc"
                    ? <ArrowUp className="h-3.5 w-3.5" />
                    : <ArrowDown className="h-3.5 w-3.5" />
                  : <ChevronsUpDown className="h-3.5 w-3.5" />}
                <span>{col.header}</span>
                <span className="text-[10px] font-medium opacity-75">{sortLabel}</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderMobileCard = (item: T) => {
    if (!mobileCard) return null;
    const badges = mobileCard.badges?.(item).filter(Boolean) ?? [];
    const actions = mobileCard.actions?.(item);

    return (
      <article
        key={item.id}
        onClick={() => onRowClick?.(item)}
        className={cn(
          "rounded-lg border border-border bg-card p-3 shadow-sm",
          onRowClick && "cursor-pointer active:bg-muted/40"
        )}
      >
        <div className="flex items-start gap-3">
          {mobileCard.leading && <div className="shrink-0">{mobileCard.leading(item)}</div>}
          <div className="min-w-0 flex-1">
            <div className="min-w-0 text-sm font-semibold leading-5 text-foreground">
              {mobileCard.title(item)}
            </div>
            {mobileCard.subtitle && (
              <div className="mt-0.5 min-w-0 text-xs leading-5 text-muted-foreground">
                {mobileCard.subtitle(item)}
              </div>
            )}
          </div>
        </div>

        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((badge, index) => (
              <div key={index} className="min-w-0">
                {badge}
              </div>
            ))}
          </div>
        )}

        {mobileCard.metrics && mobileCard.metrics.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {mobileCard.metrics.map((metric) => (
              <div key={metric.label} className="rounded-md bg-muted/45 px-2.5 py-2">
                <div className="text-[11px] font-medium text-muted-foreground">{metric.label}</div>
                <div className="mt-1 min-w-0 text-sm font-semibold text-foreground">{metric.value(item)}</div>
              </div>
            ))}
          </div>
        )}

        {mobileCard.details && mobileCard.details.length > 0 && (
          <dl className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            {mobileCard.details.map((detail) => (
              <div key={detail.label} className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="mt-0.5 min-w-0 text-sm text-foreground">{detail.value(item)}</dd>
              </div>
            ))}
          </dl>
        )}

        {actions && (
          <div onClick={(event) => event.stopPropagation()} className="mt-3">
            {actions}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="w-full min-w-0">
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {renderMobileControls()}

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                  <Skeleton className="h-4 w-2/3 rounded-md bg-muted/60" />
                  <Skeleton className="mt-2 h-3 w-1/2 rounded-md bg-muted/60" />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Skeleton className="h-12 rounded-md bg-muted/60" />
                    <Skeleton className="h-12 rounded-md bg-muted/60" />
                  </div>
                </div>
              ))
            ) : pageData.length === 0 ? (
              <div className="rounded-lg border border-border bg-card">
                <EmptyState title={emptyTitle} description={emptyDescription} className="rounded-lg border-none bg-transparent" />
              </div>
            ) : (
              pageData.map((item) => renderMobileCard(item))
            )}
          </div>

          {openControl && (
            <MobileControlPanel
              key={`${openControl.type}-${openControl.colIndex}`}
              control={openControl}
              columns={columns as SortableColumnDef<unknown>[]}
              filterOptions={filterOptions}
              activeFilters={activeFilters}
              activeSearches={activeSearches}
              onApplySearch={applySearch}
              onClearSearch={clearSearch}
              onApplyFilter={applyFilter}
              onClearFilter={clearFilter}
              onClose={() => setOpenControl(null)}
            />
          )}
        </div>
      )}

      <div className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        mobileCard && "hidden md:block"
      )}>
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

      {mobileCard && !isLoading && sorted.length > 0 && (
        <div className="mt-3 rounded-lg border border-border bg-card shadow-sm md:hidden">
          <PaginationControls
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            total={sorted.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
