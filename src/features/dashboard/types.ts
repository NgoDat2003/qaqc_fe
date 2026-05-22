export type DashboardScope = "admin" | "qam" | "qc" | "am" | "sm";
export type TimeRange = "month" | "30d" | "all";
export type DashboardStatus = "all" | "open" | "closed" | "risk" | "overdue";
export type DashboardDeltas = {
  averageScore?: number;
  auditCount?: number;
  riskAuditCount?: number;
  criticalAuditCount?: number;
  actionPlanOpen?: number;
};

export type DashboardData = {
  summary: Record<string, number | DashboardDeltas | undefined>;
  charts: Record<string, unknown[] | Record<string, number>>;
  tables: Record<string, unknown[]>;
  filters: Record<string, unknown>;
  generatedAt: string;
};

export type DashboardFilterOptions = {
  generatedAt?: string;
  brands?: Record<string, unknown>[];
  stores?: Record<string, unknown>[];
  users?: Record<string, unknown>[];
  checklists?: Record<string, unknown>[];
  auditPlans?: Record<string, unknown>[];
};

export type QamStatusFilter =
  | "all"
  | "assignment:pending"
  | "assignment:in_progress"
  | "assignment:completed"
  | "ap:draft"
  | "ap:submitted"
  | "ap:rejected"
  | "ap:closed"
  | "grade:excellent"
  | "grade:good"
  | "grade:pass"
  | "grade:fail"
  | "grade:alarm"
  | "risk"
  | "overdue";

export type QamDashboardFilters = {
  from: string;
  to: string;
  planId?: string;
  checklistId?: string;
  brandId?: string;
  storeId?: string;
  qcId?: string;
  amId?: string;
  statusMode: QamStatusFilter;
};

export type AdminStatusFilter =
  | "all"
  | "user:active"
  | "user:inactive"
  | "ap:draft"
  | "ap:submitted"
  | "ap:rejected"
  | "ap:closed"
  | "overdue";

export type AdminDashboardFilters = {
  from: string;
  to: string;
  brandId?: string;
  storeId?: string;
  role?: string;
  amSmId?: string;
  statusMode: AdminStatusFilter;
};

export type Kpi = {
  label: string;
  value: string | number;
  detail?: string;
  delta?: number;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  icon: React.ElementType;
};

export type BarItem = {
  label: string;
  value: number;
  total?: number;
  meta?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "muted";
};

export type RankItem = {
  label: string;
  value: string;
  meta?: string;
  tone?: "success" | "warning" | "danger" | "info" | "muted";
};
