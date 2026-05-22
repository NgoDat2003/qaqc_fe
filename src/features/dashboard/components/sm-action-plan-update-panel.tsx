import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateValue, getNumber, getString } from "../utils";
import { DashboardPanel, EmptyBlock } from "./dashboard-shared";
import { apItemTitle, getStatusLabel } from "./sm-dashboard-helpers";

function statusClass(status: string) {
  if (status === "rejected")
    return "border-danger/20 bg-danger-bg text-danger";
  if (status === "submitted") return "border-info/20 bg-info-bg text-info";
  if (status === "closed")
    return "border-success/20 bg-success-bg text-success";
  return "border-warning/20 bg-warning-bg text-warning";
}

function overdueText(days: number) {
  if (days <= 0) return "-";
  return `${days} ngày`;
}

export function SmActionPlanUpdatePanel({
  rows,
}: {
  rows: Record<string, unknown>[];
}) {
  return (
    <DashboardPanel
      title="Action Plan cần cập nhật"
      description="Các hạng mục cần SM hoàn thiện khắc phục"
      className="h-full"
    >
      {!rows.length ? (
        <EmptyBlock text="Chưa có Action Plan cần cập nhật trong bộ lọc hiện tại." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr] gap-3 border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground md:grid">
            <span>AP / Việc</span>
            <span>Hạn xử lý</span>
            <span>Trạng thái</span>
            <span>Quá hạn</span>
          </div>
          <div className="divide-y divide-border">
            {rows.slice(0, 5).map((row, index) => {
              const actionPlanId = getString(row, ["actionPlanId"], "");
              const status = getString(row, ["actionPlanStatus", "status"], "");
              const overdueDays = getNumber(row, ["overdueDays"]);
              return (
                <Link
                  key={`${actionPlanId}-${getString(row, ["itemId"], String(index))}`}
                  href={
                    actionPlanId ? `/action-plans/${actionPlanId}` : "/action-plans"
                  }
                  className="grid gap-2 px-3 py-3 text-sm transition-colors hover:bg-muted/25 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr] md:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {apItemTitle(row)}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {getString(row, ["issueCause"], "")}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {formatDateValue(getString(row, ["deadline"], ""))}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("w-fit border", statusClass(status))}
                  >
                    {getStatusLabel(status)}
                  </Badge>
                  <span
                    className={cn(
                      "font-semibold",
                      overdueDays > 0 ? "text-danger" : "text-muted-foreground",
                    )}
                  >
                    {overdueText(overdueDays)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <Link
        href="/action-plans"
        className="mt-4 inline-flex text-xs font-medium text-primary hover:underline"
      >
        Xem tất cả Action Plan
      </Link>
    </DashboardPanel>
  );
}
