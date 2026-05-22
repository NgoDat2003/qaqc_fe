import { Download, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildQS } from "@/lib/build-qs";
import { cn } from "@/lib/utils";
import type {
  DashboardFilterOptions,
  SmDashboardFilters,
  SmStatusFilter,
} from "../types";
import { getSmQueryParams, getString } from "../utils";
import { QamSelect } from "./qam-filter-bar";

const FALLBACK_AP_STATUSES = [
  { value: "draft", label: "Nháp" },
  { value: "submitted", label: "Đã submit" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "closed", label: "Đã đóng" },
];

export function SmFilterBar({
  filters,
  options,
  onChange,
  onReset,
}: {
  filters: SmDashboardFilters;
  options: DashboardFilterOptions;
  onChange: (patch: Partial<SmDashboardFilters>) => void;
  onReset: () => void;
}) {
  const checklists = (options.checklists ?? [])
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: `${getString(row, ["name"])} v${getString(row, ["version"], "")}`,
    }))
    .filter((option) => option.value);
  const statuses = (options.actionPlanStatuses?.length
    ? options.actionPlanStatuses.map((row) => ({
        value: getString(row, ["value"], ""),
        label: getString(row, ["label", "value"], ""),
      }))
    : FALLBACK_AP_STATUSES
  ).filter((option) => option.value);
  const exportHref = `/api/dashboard/export${buildQS({
    scope: "sm",
    ...getSmQueryParams(filters),
  })}`;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="p-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] xl:items-end">
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Thời gian từ</span>
            <input
              type="date"
              value={filters.from ?? ""}
              onChange={(event) => onChange({ from: event.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Đến ngày</span>
            <input
              type="date"
              value={filters.to ?? ""}
              onChange={(event) => onChange({ to: event.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <QamSelect
            label="Checklist"
            value={filters.checklistId}
            onChange={(value) => onChange({ checklistId: value })}
            options={checklists}
          />
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Trạng thái Action Plan</span>
            <select
              value={filters.statusMode}
              onChange={(event) =>
                onChange({ statusMode: event.target.value as SmStatusFilter })
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="all">Tất cả</option>
              {statuses.map((option) => (
                <option key={option.value} value={`ap:${option.value}`}>
                  {option.label}
                </option>
              ))}
              <option value="overdue">AP quá hạn</option>
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2"
            onClick={onReset}
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <a
            href={exportHref}
            className={cn(buttonVariants({ size: "lg" }), "h-9 gap-2")}
          >
            <Download className="h-4 w-4" />
            Xuất dữ liệu
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
