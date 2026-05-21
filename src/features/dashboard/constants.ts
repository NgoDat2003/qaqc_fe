import type { DashboardData, DashboardFilterOptions, DashboardScope } from './types';

export const BLANK_DASHBOARD: DashboardData = {
  summary: {},
  charts: {},
  tables: {},
  filters: {},
  generatedAt: "",
};

export const BLANK_FILTER_OPTIONS: DashboardFilterOptions = {};

export const TONE_CLASSES = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  muted: "bg-muted text-muted-foreground",
} as const;

export const BAR_TONES = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  muted: "bg-muted-foreground",
} as const;

export const ROLE_FILTERS: Record<DashboardScope, string[]> = {
  admin: ["Brand", "Role", "Store", "AM/SM"],
  qam: ["Audit plan", "Checklist", "Brand", "Store", "QC", "AM"],
  qc: ["Kỳ audit", "Store được giao"],
  am: ["Store", "Brand", "Trạng thái AP"],
  sm: ["Checklist", "Trạng thái AP"],
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  submitted: "Đã submit",
  rejected: "Bị từ chối",
  closed: "Đã đóng",
  completed: "Hoàn thành",
  pending: "Chưa chấm",
  in_progress: "Đang chấm",
  open: "Đang mở",
};
