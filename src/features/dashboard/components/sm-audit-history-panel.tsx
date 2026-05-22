import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateValue, getNumber, getString } from "../utils";
import { DashboardPanel, EmptyBlock } from "./dashboard-shared";
import { getGradeLabel } from "./sm-dashboard-helpers";

function gradeClass(grade: string) {
  if (["excellent", "good", "pass"].includes(grade))
    return "border-success/20 bg-success-bg text-success";
  if (grade === "alarm" || grade === "fail")
    return "border-danger/20 bg-danger-bg text-danger";
  return "border-border bg-muted text-muted-foreground";
}

export function SmAuditHistoryPanel({
  rows,
}: {
  rows: Record<string, unknown>[];
}) {
  return (
    <DashboardPanel
      title="Lịch sử audit cửa hàng"
      description="Các lần kiểm tra gần nhất của cửa hàng"
      className="h-full"
    >
      {!rows.length ? (
        <EmptyBlock text="Chưa có bài audit nào trong bộ lọc hiện tại." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[1fr_1.4fr_0.7fr_0.7fr] gap-3 border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground md:grid">
            <span>Ngày audit</span>
            <span>Checklist</span>
            <span>Điểm</span>
            <span>Kết quả</span>
          </div>
          <div className="divide-y divide-border">
            {rows.slice(0, 5).map((row, index) => {
              const auditId = getString(row, ["auditId"], "");
              const grade = getString(row, ["grade"], "");
              const score = getNumber(row, ["finalScore"]);
              return (
                <Link
                  key={`${auditId}-${index}`}
                  href={auditId ? `/audits/${auditId}` : "/audits"}
                  className="grid gap-2 px-3 py-3 text-sm transition-colors hover:bg-muted/25 md:grid-cols-[1fr_1.4fr_0.7fr_0.7fr] md:items-center"
                >
                  <span className="text-muted-foreground">
                    {formatDateValue(getString(row, ["submittedAt"], ""))}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {getString(row, ["checklist.name"], "Checklist")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v{getString(row, ["checklist.version"], "-")}
                    </span>
                  </span>
                  <span className="font-semibold text-primary">
                    {score.toFixed(1)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("w-fit border", gradeClass(grade))}
                  >
                    {getGradeLabel(grade)}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <Link
        href="/audits"
        className="mt-4 inline-flex text-xs font-medium text-primary hover:underline"
      >
        Xem tất cả lịch sử
      </Link>
    </DashboardPanel>
  );
}
