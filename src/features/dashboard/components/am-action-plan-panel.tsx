import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../types";
import { getNumber, getString } from "../utils";
import {
  amRows,
  formatAmCount,
  formatDate,
  storeLabel,
  storeMeta,
} from "./am-dashboard-helpers";
import { DashboardPanel, EmptyBlock, PanelActionLink } from "./dashboard-shared";

export function AmActionPlanPanel({
  tables,
}: {
  tables: DashboardData["tables"];
}) {
  const rows = amRows(tables.actionPlansByStore);

  return (
    <DashboardPanel
      title="Action Plan theo store"
      description="Tổng hợp AP đang mở, quá hạn và đã đóng"
      className="h-full"
    >
      {!rows.length ? (
        <EmptyBlock text="Không có Action Plan trong bộ lọc hiện tại." />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {rows.slice(0, 6).map((row, index) => {
            const overdue = getNumber(row, ["overdueCount"]);
            const maxOverdueDays = getNumber(row, ["maxOverdueDays"]);
            return (
              <div
                key={`${getString(row, ["store.id"], "store")}-${index}`}
                className="grid gap-3 px-3 py-3 text-sm md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {storeLabel(row)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {storeMeta(row)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center md:min-w-[240px]">
                  <MiniApStat label="Mở" value={getNumber(row, ["openCount"])} />
                  <MiniApStat
                    label="Quá hạn"
                    value={overdue}
                    danger={overdue > 0}
                  />
                  <MiniApStat
                    label="Đã đóng"
                    value={getNumber(row, ["closedCount"])}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Hạn mới nhất: {formatDate(getString(row, ["latestDueDate"], ""))}
                    </span>
                    {maxOverdueDays > 0 && (
                      <Badge className="border-0 bg-danger-bg text-danger">
                        Quá hạn {maxOverdueDays} ngày
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <PanelActionLink href="/action-plans">
        Xem tất cả Action Plan
      </PanelActionLink>
    </DashboardPanel>
  );
}

function MiniApStat({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md bg-muted/35 px-2 py-1">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm font-semibold",
          danger ? "text-danger" : "text-foreground",
        )}
      >
        {formatAmCount(value)}
      </p>
    </div>
  );
}
