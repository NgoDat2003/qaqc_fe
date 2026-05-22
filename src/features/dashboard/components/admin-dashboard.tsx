import { AlertTriangle, ClipboardCheck, FileCheck2, Store, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRoleLabel } from '@/lib/roles';
import type { RoleKey } from '@/shared/types';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, TONE_CLASSES } from '../constants';
import type { BarItem, DashboardData, Kpi } from '../types';
import { chartBars, clampPercent, displayNumber, formatDateValue, getNumber, getString, numberOf, percent, tableRows } from '../utils';
import { DashboardMetricCard, DashboardPanel, EmptyBlock, ErrorDonut, MiniBarList, PanelActionLink } from './dashboard-shared';

function buildAdminDashboardKpis(summary: DashboardData["summary"]): Kpi[] {
  return [
    {
      label: "Tổng user",
      value: displayNumber(numberOf(summary, "totalUsers")),
      detail: "Tài khoản trên hệ thống",
      icon: Users,
      tone: "info",
    },
    {
      label: "Tổng cửa hàng",
      value: displayNumber(numberOf(summary, "totalStores")),
      detail: `${displayNumber(numberOf(summary, "totalBrands"))} thương hiệu`,
      icon: Store,
      tone: "success",
    },
    {
      label: "Checklist",
      value: displayNumber(numberOf(summary, "totalChecklists")),
      detail: "Biểu mẫu kiểm tra",
      icon: ClipboardCheck,
      tone: "info",
    },
    {
      label: "Audit Plan",
      value: displayNumber(numberOf(summary, "totalAuditPlans")),
      detail: `${displayNumber(numberOf(summary, "totalSubmittedAudits"))} bài đã submit`,
      icon: FileCheck2,
      tone: "warning",
    },
    {
      label: "Action Plan mở",
      value: displayNumber(numberOf(summary, "actionPlansOpen")),
      detail: `${displayNumber(numberOf(summary, "actionPlansOverdue"))} cần theo dõi`,
      icon: AlertTriangle,
      tone: numberOf(summary, "actionPlansOverdue") ? "danger" : "success",
    },
  ];
}

function roleLabel(value: string) {
  return getRoleLabel(value as RoleKey) || value;
}

function statusLabel(value: string) {
  return STATUS_LABELS[value] ?? value;
}

function roleBars(input: unknown[] | Record<string, number> | undefined) {
  return chartBars(input, "info").map((item) => ({
    ...item,
    label: roleLabel(item.label),
  }));
}

function statusBars(input: unknown[] | Record<string, number> | undefined) {
  return chartBars(input, "success").map((item) => ({
    ...item,
    label: statusLabel(item.label),
  }));
}

function getBoolean(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return value === true || value === "true" || value === 1;
}

function AdminMiniTable({
  rows,
  columns,
  emptyText,
}: {
  rows: Record<string, unknown>[];
  columns: Array<{
    label: string;
    className?: string;
    render: (row: Record<string, unknown>, index: number) => React.ReactNode;
  }>;
  emptyText: string;
}) {
  if (!rows.length) return <EmptyBlock text={emptyText} />;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="grid gap-3 border-b border-border bg-muted/25 px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <span key={column.label} className={column.className}>
            {column.label}
          </span>
        ))}
      </div>
      <div className="divide-y divide-border">
        {rows.map((row, index) => (
          <div
            key={`${getString(row, ["id"], "row")}-${index}`}
            className="grid gap-3 px-3 py-3 text-sm"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((column) => (
              <div key={column.label} className={cn("min-w-0", column.className)}>
                {column.render(row, index)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function UserRbacPanel({
  usersByRole,
  usersByStatus,
}: {
  usersByRole: unknown[] | Record<string, number> | undefined;
  usersByStatus: unknown[] | Record<string, number> | undefined;
}) {
  const items = roleBars(usersByRole);
  const statusItems = statusBars(usersByStatus);
  return (
    <DashboardPanel title="User / RBAC theo vai trò">
      <div className="space-y-4">
        <ErrorDonut items={items} />
        {statusItems.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {statusItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-semibold">
                  {item.value.toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        )}
        <PanelActionLink href="/master-data/users">
          Xem tất cả người dùng
        </PanelActionLink>
      </div>
    </DashboardPanel>
  );
}

function StoreByBrandPanel({ rows }: { rows: BarItem[] }) {
  return (
    <DashboardPanel title="Store theo Brand">
      <div className="space-y-4">
        <MiniBarList items={rows} />
        <PanelActionLink href="/master-data/organization">
          Xem tất cả brand
        </PanelActionLink>
      </div>
    </DashboardPanel>
  );
}

function ChecklistStatusPanel({ rows }: { rows: BarItem[] }) {
  return (
    <DashboardPanel title="Checklist theo trạng thái">
      <div className="space-y-4">
        <ErrorDonut items={rows.map((item) => ({ ...item, label: statusLabel(item.label) }))} />
        <PanelActionLink href="/qam/checklists">
          Xem tất cả checklist
        </PanelActionLink>
      </div>
    </DashboardPanel>
  );
}

function MissingStoresPanel({
  summary,
  rows,
}: {
  summary: DashboardData["summary"];
  rows: Record<string, unknown>[];
}) {
  return (
    <DashboardPanel
      title="Stores thiếu AM/SM"
      description="Các cửa hàng cần bổ sung phân công vận hành"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Thiếu AM", numberOf(summary, "storesMissingAM")],
          ["Thiếu SM", numberOf(summary, "storesMissingSM")],
          ["Thiếu cả hai", numberOf(summary, "storesMissingBoth")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-danger/20 bg-danger/5 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-danger">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <AdminMiniTable
          rows={rows.slice(0, 5)}
          emptyText="Không có cửa hàng thiếu AM/SM trong dữ liệu hiện tại."
          columns={[
            {
              label: "Cửa hàng",
              render: (row) => (
                <div>
                  <p className="truncate font-medium">
                    {getString(row, ["store.name", "name"])}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {getString(row, ["store.code", "code"], "")}
                  </p>
                </div>
              ),
            },
            {
              label: "Thiếu",
              className: "text-right",
              render: (row) => (
                <div className="flex justify-end gap-1">
                  {getBoolean(row, "missingAM") ? (
                    <Badge className={cn("border-0", TONE_CLASSES.danger)}>
                      AM
                    </Badge>
                  ) : null}
                  {getBoolean(row, "missingSM") ? (
                    <Badge className={cn("border-0", TONE_CLASSES.warning)}>
                      SM
                    </Badge>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </div>
      <PanelActionLink href="/master-data/organization">
        Xem cửa hàng thiếu thông tin
      </PanelActionLink>
    </DashboardPanel>
  );
}

function OverdueActionPlansPanel({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <DashboardPanel title="Action Plan quá hạn">
      <AdminMiniTable
        rows={rows.slice(0, 6)}
        emptyText="Không có Action Plan quá hạn trong bộ lọc hiện tại."
        columns={[
          {
            label: "Cửa hàng",
            render: (row) => (
              <div>
                <p className="truncate font-medium">
                  {getString(row, ["store.name"])}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {getString(row, ["store.code"], "")}
                </p>
              </div>
            ),
          },
          {
            label: "Hạn xử lý",
            render: (row) => (
              <span className="text-muted-foreground">
                {formatDateValue(getString(row, ["dueDate"], ""))}
              </span>
            ),
          },
          {
            label: "Quá hạn",
            className: "text-right",
            render: (row) => (
              <span className="font-semibold text-danger">
                {getNumber(row, ["overdueDays"]).toLocaleString("vi-VN")} ngày
              </span>
            ),
          },
        ]}
      />
      <PanelActionLink href="/action-plans">
        Xem tất cả AP quá hạn
      </PanelActionLink>
    </DashboardPanel>
  );
}

function AmSmProvincePanel({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) {
    return (
      <DashboardPanel title="Phân bổ AM/SM theo khu vực">
        <EmptyBlock text="Chờ dữ liệu phân bổ AM/SM từ BE." />
      </DashboardPanel>
    );
  }
  return (
    <DashboardPanel title="Phân bổ AM/SM theo khu vực">
      <div className="space-y-4">
        {rows.slice(0, 6).map((row, index) => {
          const total = Math.max(getNumber(row, ["storeCount"]), 1);
          const am = getNumber(row, ["amAssignedStoreCount"]);
          const sm = getNumber(row, ["smAssignedStoreCount"]);
          return (
            <div key={`${getString(row, ["province"])}-${index}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">
                  {getString(row, ["province"])}
                </span>
                <span className="text-xs text-muted-foreground">
                  {total.toLocaleString("vi-VN")} CH
                </span>
              </div>
              <div className="grid grid-cols-[48px_1fr_42px] items-center gap-2 text-xs">
                <span className="text-muted-foreground">AM</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${clampPercent(percent(am, total))}%` }}
                  />
                </div>
                <span className="text-right">{am}</span>
                <span className="text-muted-foreground">SM</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-info"
                    style={{ width: `${clampPercent(percent(sm, total))}%` }}
                  />
                </div>
                <span className="text-right">{sm}</span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}

export function AdminDashboardView({
  summary,
  charts,
  tables,
}: {
  summary: DashboardData["summary"];
  charts: DashboardData["charts"];
  tables: DashboardData["tables"];
}) {
  const kpis = buildAdminDashboardKpis(summary);
  const storeByBrand = chartBars(charts.storesByBrand, "primary");
  const checklistStatus = chartBars(charts.checklistsByStatus, "success");
  const missingStores = tableRows(tables.storesMissingData);
  const overdueActionPlans = tableRows(tables.overdueActionPlans);
  const amSmByProvince = Array.isArray(charts.amSmByProvince)
    ? tableRows(charts.amSmByProvince)
    : [];

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <DashboardMetricCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <UserRbacPanel
          usersByRole={charts.usersByRole}
          usersByStatus={charts.usersByStatus}
        />
        <StoreByBrandPanel rows={storeByBrand} />
        <ChecklistStatusPanel rows={checklistStatus} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <MissingStoresPanel summary={summary} rows={missingStores} />
        <OverdueActionPlansPanel rows={overdueActionPlans} />
        <AmSmProvincePanel rows={amSmByProvince} />
      </div>
    </div>
  );
}
