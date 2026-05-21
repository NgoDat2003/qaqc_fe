import { cn } from '@/lib/utils';
import { TONE_CLASSES } from '../constants';
import type { DashboardData } from '../types';
import { asRecord, formatDateValue, getNumber, getString, numberOf } from '../utils';
import { DashboardPanel, PanelActionLink } from './dashboard-shared';

export function QamActionPlanPanel({
  summary,
  charts,
  rows,
}: {
  summary: DashboardData["summary"];
  charts: DashboardData["charts"];
  rows: Record<string, unknown>[];
}) {
  const statusMap = asRecord(charts.actionPlanStatus);
  const statusCards = [
    {
      label: "Đang mở",
      value: numberOf(summary, "actionPlanOpen"),
      tone: "success" as const,
    },
    {
      label: "Đã submit",
      value: getNumber(statusMap, ["submitted"]),
      tone: "info" as const,
    },
    {
      label: "Quá hạn",
      value: numberOf(summary, "actionPlanOverdue"),
      tone: "danger" as const,
    },
    {
      label: "Đã đóng",
      value: numberOf(summary, "actionPlanClosed"),
      tone: "default" as const,
    },
  ];
  return (
    <DashboardPanel
      title="Action Plan"
      description="AP cần theo dõi ngay và trạng thái xử lý"
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {statusCards.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-lg border border-border p-3",
              item.tone === "danger"
                ? "bg-danger-bg/35"
                : item.tone === "success"
                  ? "bg-success-bg/35"
                  : item.tone === "info"
                    ? "bg-info-bg/35"
                    : "bg-muted/20",
            )}
          >
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {item.label}
            </p>
            <p
              className={cn(
                "mt-1 text-2xl font-semibold",
                TONE_CLASSES[item.tone].split(" ")[1],
              )}
            >
              {item.value.toLocaleString("vi-VN")}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="hidden grid-cols-[1fr_96px_120px_96px] gap-3 border-b border-border bg-muted/25 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground md:grid">
          <span>Cửa hàng</span>
          <span>Bài audit</span>
          <span>Người phụ trách</span>
          <span className="text-right">Quá hạn</span>
        </div>
        <div className="divide-y divide-border">
          {rows.slice(0, 5).map((row, index) => {
            const store = asRecord(row.store);
            const audit = asRecord(row.audit);
            const overdueDays = getNumber(row, ["overdueDays"]);
            return (
              <div
                key={`${getString(row, ["id"], "ap")}-${index}`}
                className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[1fr_96px_120px_96px] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {getString(store, ["name"])}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getString(store, ["code"], "")}
                  </p>
                </div>
                <span className="text-muted-foreground">
                  {formatDateValue(audit.submittedAt)}
                </span>
                <span className="truncate text-muted-foreground">
                  {getString(row, ["assigneeName"], "Chưa giao")}
                </span>
                <span
                  className={cn(
                    "font-medium md:text-right",
                    overdueDays > 0 ? "text-danger" : "text-muted-foreground",
                  )}
                >
                  {overdueDays > 0 ? `${overdueDays} ngày` : "-"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <PanelActionLink href="/action-plans">
        Xem tất cả Action Plan
      </PanelActionLink>
    </DashboardPanel>
  );
}
