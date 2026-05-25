import { Download, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildQS } from "@/lib/build-qs";
import { cn } from "@/lib/utils";
import type {
  AmDashboardFilters,
  AmStatusFilter,
  DashboardFilterOptions,
} from "../types";
import { getAmQueryParams, getString, optionLabel } from "../utils";
import { QamSelect } from "./qam-filter-bar";

const FALLBACK_ASSIGNMENT_STATUSES = [
  { value: "pending", label: "Chưa chấm" },
  { value: "in_progress", label: "Đang chấm" },
  { value: "completed", label: "Hoàn thành" },
];

const FALLBACK_AP_STATUSES = [
  { value: "draft", label: "Nháp" },
  { value: "submitted", label: "Đã submit" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "closed", label: "Đã đóng" },
];

const FALLBACK_GRADES = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "pass", label: "Pass" },
  { value: "fail", label: "Fail" },
  { value: "alarm", label: "Alarm" },
];

function optionRows(
  rows: Record<string, unknown>[] | undefined,
  fallback: Array<{ value: string; label: string }>,
  labelMap: Record<string, string>,
) {
  const mapped = (rows ?? [])
    .map((row) => ({
      value: getString(row, ["value"], ""),
      label: getString(row, ["label", "value"], ""),
    }))
    .map((option) => ({
      ...option,
      label: labelMap[option.value] ?? option.label,
    }))
    .filter((option) => option.value);
  return mapped.length ? mapped : fallback;
}

export function AmFilterBar({
  filters,
  options,
  onChange,
  onReset,
}: {
  filters: AmDashboardFilters;
  options: DashboardFilterOptions;
  onChange: (patch: Partial<AmDashboardFilters>) => void;
  onReset: () => void;
}) {
  const brands = (options.brands ?? [])
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: optionLabel(row, ["name"]),
    }))
    .filter((option) => option.value);
  const stores = (options.stores ?? [])
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: optionLabel(row, ["name"]),
    }))
    .filter((option) => option.value);
  const assignmentStatuses = optionRows(
    options.assignmentStatuses,
    FALLBACK_ASSIGNMENT_STATUSES,
    Object.fromEntries(FALLBACK_ASSIGNMENT_STATUSES.map((item) => [item.value, item.label])),
  );
  const actionPlanStatuses = optionRows(
    options.actionPlanStatuses,
    FALLBACK_AP_STATUSES,
    Object.fromEntries(FALLBACK_AP_STATUSES.map((item) => [item.value, item.label])),
  );
  const grades = optionRows(
    options.grades,
    FALLBACK_GRADES,
    Object.fromEntries(FALLBACK_GRADES.map((item) => [item.value, item.label])),
  );
  const exportHref = `/api/dashboard/export${buildQS({
    scope: "am",
    ...getAmQueryParams(filters),
  })}`;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="p-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1.15fr_auto_auto] lg:items-end">
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Thời gian từ</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => onChange({ from: event.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Đến ngày</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => onChange({ to: event.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <QamSelect
            label="Brand"
            value={filters.brandId}
            onChange={(value) =>
              onChange({ brandId: value, storeId: undefined })
            }
            options={brands}
          />
          <QamSelect
            label="Store"
            value={filters.storeId}
            onChange={(value) => onChange({ storeId: value })}
            options={stores}
            placeholder="Chọn cửa hàng"
          />
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Trạng thái audit / AP</span>
            <select
              value={filters.statusMode}
              onChange={(event) =>
                onChange({ statusMode: event.target.value as AmStatusFilter })
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="all">Tất cả</option>
              <optgroup label="Audit">
                {assignmentStatuses.map((option) => (
                  <option key={option.value} value={`assignment:${option.value}`}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Action Plan">
                {actionPlanStatuses.map((option) => (
                  <option key={option.value} value={`ap:${option.value}`}>
                    {option.label}
                  </option>
                ))}
                <option value="overdue">AP quá hạn</option>
              </optgroup>
              <optgroup label="Kết quả">
                {grades.map((option) => (
                  <option key={option.value} value={`grade:${option.value}`}>
                    {option.label}
                  </option>
                ))}
                <option value="risk">Có Risk</option>
              </optgroup>
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
