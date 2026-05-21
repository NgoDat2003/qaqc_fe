import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardFilterOptions, QamDashboardFilters, QamStatusFilter } from '../types';
import { buildQS } from '@/lib/build-qs';
import { getQamQueryParams, getString, hasRole, optionLabel } from '../utils';

export function QamSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Tất cả",
  className,
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "min-w-0 space-y-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span>{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QamFilterBar({
  filters,
  options,
  onChange,
  onReset,
}: {
  filters: QamDashboardFilters;
  options: DashboardFilterOptions;
  onChange: (patch: Partial<QamDashboardFilters>) => void;
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
  const checklists = (options.checklists ?? [])
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: `${getString(row, ["name"])} v${getString(row, ["version"], "")}`,
    }))
    .filter((option) => option.value);
  const auditPlans = (options.auditPlans ?? [])
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: getString(row, ["name"]),
    }))
    .filter((option) => option.value);
  const qcUsers = (options.users ?? [])
    .filter((row) => hasRole(row, "qc_auditor"))
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: getString(row, ["fullName", "email"]),
    }))
    .filter((option) => option.value);
  const amUsers = (options.users ?? [])
    .filter((row) => hasRole(row, "am"))
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: getString(row, ["fullName", "email"]),
    }))
    .filter((option) => option.value);

  const exportHref = `/api/dashboard/export${buildQS({ scope: "qam", ...getQamQueryParams(filters) })}`;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="space-y-3 p-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 xl:items-end">
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
            label="Audit plan"
            value={filters.planId}
            onChange={(value) => onChange({ planId: value })}
            options={auditPlans}
          />
          <QamSelect
            label="Checklist"
            value={filters.checklistId}
            onChange={(value) => onChange({ checklistId: value })}
            options={checklists}
          />
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
            className="xl:col-span-2"
          />
          <QamSelect
            label="QC"
            value={filters.qcId}
            onChange={(value) => onChange({ qcId: value })}
            options={qcUsers}
          />
          <QamSelect
            label="AM"
            value={filters.amId}
            onChange={(value) => onChange({ amId: value })}
            options={amUsers}
          />
          <label className="space-y-1 text-xs font-medium text-foreground">
            <span>Trạng thái</span>
            <select
              value={filters.statusMode}
              onChange={(event) =>
                onChange({ statusMode: event.target.value as QamStatusFilter })
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="all">Tất cả</option>
              <option value="assignment:pending">Chưa chấm</option>
              <option value="assignment:in_progress">Đang chấm</option>
              <option value="assignment:completed">Hoàn thành</option>
              <option value="ap:draft">AP nháp</option>
              <option value="ap:submitted">AP đã submit</option>
              <option value="ap:rejected">AP bị từ chối</option>
              <option value="ap:closed">AP đã đóng</option>
              <option value="grade:excellent">Grade excellent</option>
              <option value="grade:good">Grade good</option>
              <option value="grade:pass">Grade pass</option>
              <option value="grade:fail">Grade fail</option>
              <option value="grade:alarm">Grade alarm</option>
              <option value="risk">Có Risk</option>
              <option value="overdue">AP quá hạn</option>
            </select>
          </label>
          <div className="flex gap-2 lg:col-span-2 xl:col-span-2 xl:flex-col">
            <Button
              type="button"
              variant="outline"
              className="h-9 flex-1 gap-2"
              onClick={onReset}
            >
              <RefreshCw className="h-4 w-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              className="h-9 flex-1 gap-2"
              nativeButton={false}
              render={<a href={exportHref} download />}
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
