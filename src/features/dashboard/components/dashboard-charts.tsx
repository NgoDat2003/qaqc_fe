import { cn } from '@/lib/utils';
import { BAR_TONES } from '../constants';
import type { BarItem } from '../types';
import { percent } from '../utils';
import { EmptyBlock } from './dashboard-layout';

export function MiniBarList({
  items,
  emptyText = "Chờ dữ liệu BE",
}: {
  items: BarItem[];
  emptyText?: string;
}) {
  if (!items.length) return <EmptyBlock text={emptyText} />;
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const total =
          item.total ?? Math.max(...items.map((row) => row.value), 1);
        const width = Math.max(4, Math.min(100, percent(item.value, total)));
        return (
          <div
            key={`${item.label}-${item.meta ?? item.value}-${index}`}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-foreground">
                {item.label}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.meta ?? item.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  BAR_TONES[item.tone ?? "primary"],
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ErrorDonut({ items }: { items: BarItem[] }) {
  if (!items.length) return <EmptyBlock text="Chờ dữ liệu BE" />;
  const palette = [
    "#0891b2",
    "#2563eb",
    "#d97706",
    "#7c3aed",
    "#dc2626",
    "#059669",
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const stops = items.reduce<{ parts: string[]; cursor: number }>(
    (acc, item, index) => {
      const start = acc.cursor;
      const size = total ? (item.value / total) * 100 : 0;
      const end = start + size;
      return {
        parts: [
          ...acc.parts,
          `${palette[index % palette.length]} ${start}% ${end}%`,
        ],
        cursor: end,
      };
    },
    { parts: [], cursor: 0 },
  ).parts;

  return (
    <div className="grid min-w-0 gap-4 overflow-hidden md:grid-cols-[160px_1fr] md:items-center">
      <div
        className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
          <span className="text-xs uppercase text-muted-foreground">
            Tổng lỗi
          </span>
          <span className="text-2xl font-semibold text-foreground">
            {total.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              <span className="min-w-0 truncate font-medium text-foreground">
                {item.label}
              </span>
            </div>
            <span className="shrink-0 text-muted-foreground">
              {item.value.toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
