import type { DashboardData } from "../types";
import { asRecord, getNumber, getString, tableRows } from "../utils";

export const SM_STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  submitted: "Đã submit",
  rejected: "Bị từ chối",
  closed: "Đã đóng",
  open: "Mở",
  done: "Đã xong",
};

export const GRADE_LABELS: Record<string, string> = {
  excellent: "Đạt",
  good: "Đạt",
  pass: "Đạt",
  fail: "Cần cải thiện",
  alarm: "Không đạt",
};

export function summaryNumber(
  summary: DashboardData["summary"],
  key: string,
) {
  const value = summary[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatScore(value: number | null) {
  return value === null ? "--" : value.toFixed(1);
}

export function formatCount(value: number | null) {
  return (value ?? 0).toLocaleString("vi-VN");
}

export function scoreTone(score: number | null) {
  if (score === null) return "muted";
  if (score >= 85) return "success";
  if (score >= 70) return "warning";
  return "danger";
}

export function getStatusLabel(status: string) {
  return SM_STATUS_LABELS[status] ?? (status || "-");
}

export function getGradeLabel(grade: string) {
  return GRADE_LABELS[grade] ?? (grade || "-");
}

export function severityBreakdown(charts: DashboardData["charts"]) {
  const row = asRecord(charts.violationSeverityBreakdown);
  return {
    risk: getNumber(row, ["risk"]),
    ccp: getNumber(row, ["ccp"]),
    autoCcp: getNumber(row, ["autoCcp"]),
    normal: getNumber(row, ["normal"]),
  };
}

export function smRows(tables: DashboardData["tables"], key: string) {
  return tableRows(tables[key]);
}

export function apItemTitle(row: Record<string, unknown>) {
  const code = getString(row, ["criteria.code"], "");
  const name = getString(row, ["criteria.name"], "");
  const cause = getString(row, ["issueCause"], "Action Plan cần cập nhật");
  return [code, name].filter(Boolean).join(" ") || cause;
}
