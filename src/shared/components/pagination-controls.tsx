"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

function getPageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const middle: number[] = [];
  for (let i = left; i <= right; i++) middle.push(i);

  const result: (number | "ellipsis")[] = [1];
  if (left > 2) result.push("ellipsis");
  result.push(...middle);
  if (right < total - 1) result.push("ellipsis");
  result.push(total);
  return result;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-between px-2 py-2 text-sm text-muted-foreground">
      <span>
        Tổng <strong className="text-foreground">{total}</strong> bản ghi
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => { if (page > 1) onPageChange(page - 1); }}
          disabled={page <= 1}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="h-7 w-7 flex items-center justify-center"
            >
              <MoreHorizontal className="h-3 w-3" />
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => onPageChange(p)}
              aria-label={`Trang ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => { if (page < totalPages) onPageChange(page + 1); }}
          disabled={page >= totalPages}
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
