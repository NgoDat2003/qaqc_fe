import { STATUS_LABELS } from './constants';
import type { AdminDashboardFilters, BarItem, DashboardData, DashboardDeltas, DashboardScope, QamDashboardFilters, RankItem, TimeRange } from './types';
import type { RoleKey } from '@/shared/types';

export function scopeFromRole(role: RoleKey | null): DashboardScope | null {
  switch (role) {
    case "company_admin":
      return "admin";
    case "qa_manager":
    case "executive_viewer":
      return "qam";
    case "qc_auditor":
      return "qc";
    case "am":
      return "am";
    case "store_manager":
      return "sm";
    default:
      return null;
  }
}

export function todayIso(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateParams(range: TimeRange) {
  if (range === "all") return {};
  const now = new Date();
  if (range === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: todayIso(from), to: todayIso(to) };
  }
  const from = new Date(now);
  from.setDate(now.getDate() - 30);
  return { from: todayIso(from), to: todayIso(now) };
}

export function getCurrentMonthRange() {
  const params = getDateParams("month");
  return {
    from: typeof params.from === "string" ? params.from : todayIso(),
    to: typeof params.to === "string" ? params.to : todayIso(),
  };
}

export function getQamQueryParams(filters: QamDashboardFilters) {
  const params: Record<string, string | boolean | undefined> = {
    from: filters.from,
    to: filters.to,
    planId: filters.planId,
    checklistId: filters.checklistId,
    brandId: filters.brandId,
    storeId: filters.storeId,
    qcId: filters.qcId,
    amId: filters.amId,
  };

  if (filters.statusMode.startsWith("assignment:")) {
    params.assignmentStatus = filters.statusMode.replace("assignment:", "");
  } else if (filters.statusMode.startsWith("ap:")) {
    params.actionPlanStatus = filters.statusMode.replace("ap:", "");
  } else if (filters.statusMode.startsWith("grade:")) {
    params.grade = filters.statusMode.replace("grade:", "");
  } else if (filters.statusMode === "risk") {
    params.riskOnly = true;
  } else if (filters.statusMode === "overdue") {
    params.overdueOnly = true;
  }

  return params;
}

export function getAdminQueryParams(filters: AdminDashboardFilters) {
  const params: Record<string, string | boolean | undefined> = {
    from: filters.from,
    to: filters.to,
    brandId: filters.brandId,
    storeId: filters.storeId,
    role: filters.role,
    amId: filters.amSmId,
  };

  if (filters.statusMode.startsWith("user:")) {
    params.status = filters.statusMode.replace("user:", "");
  } else if (filters.statusMode.startsWith("ap:")) {
    params.actionPlanStatus = filters.statusMode.replace("ap:", "");
  } else if (filters.statusMode === "overdue") {
    params.overdueOnly = true;
  }

  return params;
}

export function numberOf(summary: DashboardData["summary"], key: string) {
  const value = summary[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function deltaOf(
  summary: DashboardData["summary"],
  key: keyof DashboardDeltas,
) {
  const deltas = summary.deltas;
  if (!deltas || typeof deltas !== "object" || Array.isArray(deltas))
    return undefined;
  const value = (deltas as DashboardDeltas)[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function displayNumber(value: number, fallback: string | number = "-") {
  return value > 0 ? value.toLocaleString("vi-VN") : fallback;
}

export function displayScore(value: number) {
  return value > 0 ? value.toFixed(1) : "-";
}

export function formatDelta(value?: number) {
  if (value === undefined || value === 0) return "";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(Math.abs(value) < 10 ? 1 : 0)} so với kỳ trước`;
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function getPathValue(row: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object" || Array.isArray(current))
      return undefined;
    return (current as Record<string, unknown>)[part];
  }, row);
}

export function getString(
  row: Record<string, unknown>,
  keys: string[],
  fallback = "Chưa xác định",
) {
  for (const key of keys) {
    const value = getPathValue(row, key);
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

export function getNumber(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = getPathValue(row, key);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    )
      return Number(value);
  }
  return 0;
}

export function hasRole(row: Record<string, unknown>, role: string) {
  const roles = row.roles;
  return Array.isArray(roles) && roles.includes(role);
}

export function optionLabel(
  row: Record<string, unknown>,
  keys: string[],
  fallback = "Chưa xác định",
) {
  const label = getString(row, keys, fallback);
  const code = getString(row, ["code"], "");
  return code && !label.includes(code) ? `${code} - ${label}` : label;
}

export function formatDateValue(value: unknown) {
  if (typeof value !== "string" || !value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function chartBars(
  input: unknown[] | Record<string, number> | undefined,
  tone: BarItem["tone"] = "primary",
): BarItem[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    const total = input.reduce<number>((sum, item) => {
      const row = asRecord(item);
      return (
        sum +
        getNumber(row, [
          "averageScore",
          "errorCount",
          "violationCount",
          "storeCount",
          "value",
          "count",
          "total",
          "_count",
          "average",
          "score",
        ])
      );
    }, 0);
    return input.slice(0, 6).map((item) => {
      const row = asRecord(item);
      const value = getNumber(row, [
        "averageScore",
        "errorCount",
        "violationCount",
        "storeCount",
        "value",
        "count",
        "total",
        "_count",
        "average",
        "score",
      ]);
      const auditCount = getNumber(row, ["auditCount"]);
      const storeCount = getNumber(row, ["storeCount"]);
      const percentage = getNumber(row, ["percentage"]);
      const isAverage = getNumber(row, ["averageScore"]) > 0;
      const numericMeta = percentage
        ? `${value.toLocaleString("vi-VN")} (${percentage.toFixed(1)}%)`
        : `${value.toLocaleString("vi-VN")}`;
      return {
        label: getString(row, [
          "label",
          "key",
          "name",
          "status",
          "role",
          "roleKey",
          "brand",
          "brandName",
          "province",
          "groupCode",
          "groupName",
          "month",
          "store.name",
          "plan.name",
          "auditor.fullName",
        ]),
        value,
        total: isAverage ? 100 : total || 100,
        meta: getString(
          row,
          ["meta", "description"],
          isAverage
            ? `${value.toFixed(1)} điểm${auditCount ? ` / ${auditCount} bài` : ""}${storeCount ? ` / ${storeCount} CH` : ""}`
            : numericMeta,
        ),
        tone,
      };
    });
  }
  const entries = Object.entries(input);
  const total = entries.reduce(
    (sum, [, value]) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
  return entries.map(([label, value]) => ({
    label,
    value: Number.isFinite(value) ? value : 0,
    total: total || 100,
    meta: `${(Number.isFinite(value) ? value : 0).toLocaleString("vi-VN")}`,
    tone,
  }));
}

export function tableRows(input: unknown[] | undefined): Record<string, unknown>[] {
  return (input ?? [])
    .map(asRecord)
    .filter((row) => Object.keys(row).length > 0);
}

export function tableRanking(
  input: unknown[] | undefined,
  valueSuffix = "",
): RankItem[] {
  return tableRows(input)
    .slice(0, 6)
    .map((row) => {
      const value = getNumber(row, [
        "value",
        "score",
        "averageScore",
        "errorCount",
        "violationCount",
        "count",
        "completed",
        "total",
        "progress",
        "percent",
      ]);
      const completed = getNumber(row, ["completed"]);
      const total = getNumber(row, ["total"]);
      const status = getString(row, ["status"], "");
      const displayValue =
        (status ? (STATUS_LABELS[status] ?? status) : "") ||
        (completed && total
          ? `${completed.toLocaleString("vi-VN")}/${total.toLocaleString("vi-VN")}`
          : valueSuffix
            ? `${value.toLocaleString("vi-VN")}${valueSuffix}`
            : value.toLocaleString("vi-VN"));
      return {
        label: getString(row, [
          "storeName",
          "store.name",
          "plan.name",
          "name",
          "label",
          "criteriaName",
          "criteria",
          "planName",
          "auditPlanName",
          "qcName",
          "auditorName",
          "auditor.fullName",
        ]),
        value: displayValue,
        meta: getString(
          row,
          [
            "meta",
            "code",
            "store.code",
            "store.province",
            "checklistName",
            "brandName",
            "store.brand.name",
            "province",
            "email",
            "auditor.email",
          ],
          "",
        ),
        tone:
          value >= 85
            ? "success"
            : value >= 70
              ? "warning"
              : value > 0
                ? "danger"
                : "muted",
      };
    });
}
