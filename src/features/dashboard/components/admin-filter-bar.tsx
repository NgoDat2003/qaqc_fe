import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { buildQS } from '@/lib/build-qs';
import { getRoleLabel } from '@/lib/roles';
import type { RoleKey } from '@/shared/types';
import type { AdminDashboardFilters, AdminStatusFilter, DashboardFilterOptions } from '../types';
import { getAdminQueryParams, getString, hasRole, optionLabel } from '../utils';
import { QamSelect } from './qam-filter-bar';

const ROLE_OPTIONS: RoleKey[] = [
  "company_admin",
  "qa_manager",
  "qc_auditor",
  "am",
  "store_manager",
  "executive_viewer",
];

export function AdminFilterBar({
  filters,
  options,
  onChange,
  onReset,
}: {
  filters: AdminDashboardFilters;
  options: DashboardFilterOptions;
  onChange: (patch: Partial<AdminDashboardFilters>) => void;
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
  const amSmUsers = (options.users ?? [])
    .filter((row) => hasRole(row, "am") || hasRole(row, "store_manager"))
    .map((row) => ({
      value: getString(row, ["id"], ""),
      label: getString(row, ["fullName", "email"]),
    }))
    .filter((option) => option.value);
  const roleOptions = ROLE_OPTIONS.map((role) => ({
    value: role,
    label: getRoleLabel(role),
  }));
  const exportHref = `/api/dashboard/export${buildQS({ scope: "admin", ...getAdminQueryParams(filters) })}`;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="space-y-3 p-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 xl:items-end">
          <label className="space-y-1 text-xs font-medium text-foreground xl:col-span-2">
            <span>Thời gian từ</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => onChange({ from: event.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-foreground xl:col-span-2">
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
            className="xl:col-span-2"
          />
          <QamSelect
            label="Role"
            value={filters.role}
            onChange={(value) => onChange({ role: value })}
            options={roleOptions}
            className="xl:col-span-2"
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
            label="AM/SM"
            value={filters.amSmId}
            onChange={(value) => onChange({ amSmId: value })}
            options={amSmUsers}
            className="xl:col-span-2"
          />
          <label className="space-y-1 text-xs font-medium text-foreground xl:col-span-2">
            <span>Trạng thái</span>
            <select
              value={filters.statusMode}
              onChange={(event) =>
                onChange({
                  statusMode: event.target.value as AdminStatusFilter,
                })
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="all">Tất cả</option>
              <option value="user:active">User active</option>
              <option value="user:inactive">User inactive</option>
              <option value="ap:draft">AP nháp</option>
              <option value="ap:submitted">AP đã submit</option>
              <option value="ap:rejected">AP bị từ chối</option>
              <option value="ap:closed">AP đã đóng</option>
              <option value="overdue">AP quá hạn</option>
            </select>
          </label>
          <div className="flex gap-2 xl:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 flex-1 gap-2"
              onClick={onReset}
            >
              <RefreshCw className="h-4 w-4" />
              Đặt lại
            </Button>
            <a
              href={exportHref}
              download
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
