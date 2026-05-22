import { cn } from "@/lib/utils";
import type { DashboardData } from "../types";
import { DashboardPanel } from "./dashboard-shared";
import { severityBreakdown } from "./sm-dashboard-helpers";

const ROWS = [
  { key: "risk", label: "RISK", className: "text-danger" },
  { key: "ccp", label: "CCP", className: "text-warning" },
  { key: "autoCcp", label: "F-CCP", className: "text-danger" },
  { key: "normal", label: "Lỗi thường", className: "text-foreground" },
] as const;

export function SmSeverityPanel({
  charts,
}: {
  charts: DashboardData["charts"];
}) {
  const values = severityBreakdown(charts);
  return (
    <DashboardPanel
      title="Lỗi nghiêm trọng / Risk / CCP"
      description="Mức độ lỗi trong phạm vi cửa hàng"
      className="h-full"
    >
      <div className="divide-y divide-border rounded-lg border border-border">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {row.label}
            </span>
            <span className={cn("text-lg font-semibold", row.className)}>
              {values[row.key].toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
