import { Badge } from "@/components/ui/badge";
import type { DashboardData } from "../types";
import { getNumber, getString } from "../utils";
import { amRows, formatAmCount } from "./am-dashboard-helpers";
import { DashboardPanel, EmptyBlock, PanelActionLink } from "./dashboard-shared";

export function AmTopCriteriaPanel({
  tables,
}: {
  tables: DashboardData["tables"];
}) {
  const rows = amRows(tables.topCriteria);

  return (
    <DashboardPanel
      title="Top tiêu chí lỗi nhiều nhất"
      description="Các tiêu chí phát sinh nhiều lỗi trong scope AM"
      className="h-full"
    >
      {!rows.length ? (
        <EmptyBlock text="Chưa có dữ liệu tiêu chí lỗi trong bộ lọc hiện tại." />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {rows.slice(0, 6).map((row, index) => (
            <div
              key={`${getString(row, ["criteriaId", "code"], "criteria")}-${index}`}
              className="grid gap-3 px-3 py-3 text-sm md:grid-cols-[32px_1fr_auto] md:items-center"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {getString(row, ["name", "code"])}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {getString(row, ["code"], "")}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <Badge variant="outline" className="shrink-0">
                  {getString(row, ["groupCode"], "-")}
                </Badge>
                <span className="shrink-0 font-semibold text-foreground">
                  {formatAmCount(getNumber(row, ["errorCount", "count"]))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <PanelActionLink href="/qam/criteria">
        Xem tất cả tiêu chí
      </PanelActionLink>
    </DashboardPanel>
  );
}
