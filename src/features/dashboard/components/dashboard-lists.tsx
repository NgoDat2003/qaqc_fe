import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, TONE_CLASSES } from '../constants';
import type { RankItem } from '../types';
import { getNumber, getString } from '../utils';
import { EmptyBlock } from './dashboard-layout';

export function RankingList({
  items,
  emptyText = "Chờ dữ liệu BE",
}: {
  items: RankItem[];
  emptyText?: string;
}) {
  if (!items.length) return <EmptyBlock text={emptyText} />;
  return (
    <div className="divide-y divide-border">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {item.label}
              </p>
              {item.meta && (
                <p className="truncate text-xs text-muted-foreground">
                  {item.meta}
                </p>
              )}
            </div>
          </div>
          <Badge
            className={cn(
              "shrink-0 border-0",
              TONE_CLASSES[item.tone ?? "default"],
            )}
          >
            {item.value}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function ActionPlanFollowUpTable({
  rows,
}: {
  rows: Record<string, unknown>[];
}) {
  if (!rows.length)
    return (
      <EmptyBlock text="Không có AP cần theo dõi trong bộ lọc hiện tại." />
    );
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {rows.slice(0, 6).map((row, index) => {
        const status = getString(row, ["status"], "draft");
        const overdueDays = getNumber(row, ["overdueDays"]);
        const score = getNumber(row, ["audit.finalScore"]);
        return (
          <div
            key={`${getString(row, ["id"], "ap")}-${index}`}
            className="space-y-2 px-3 py-3 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {getString(row, ["store.name"])}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {getString(row, ["store.code"], "")}
                  {score ? ` - ${Math.round(score)} điểm` : ""}
                </p>
              </div>
              <Badge
                className={cn(
                  "shrink-0 border-0",
                  status === "submitted"
                    ? TONE_CLASSES.info
                    : status === "rejected"
                      ? TONE_CLASSES.danger
                      : TONE_CLASSES.warning,
                )}
              >
                {STATUS_LABELS[status] ?? status}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate text-muted-foreground">
                {getString(row, ["assigneeName"], "Chưa giao")}
              </span>
              <span
                className={cn(
                  "shrink-0 font-medium",
                  overdueDays > 0 ? "text-danger" : "text-muted-foreground",
                )}
              >
                {overdueDays > 0 ? `Quá hạn ${overdueDays} ngày` : "Đúng hạn"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
