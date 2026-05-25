import type { DashboardData } from "../types";
import { asRecord, getNumber, getString, tableRows } from "../utils";

export function amSummaryNumber(
  summary: DashboardData["summary"],
  key: string,
) {
  const value = summary[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatAmCount(value: number | null) {
  return (value ?? 0).toLocaleString("vi-VN");
}

export function formatAmScore(value: number | null) {
  return value === null ? "--" : value.toFixed(1);
}

export function scoreTone(score: number | null) {
  if (score === null) return "muted";
  if (score >= 85) return "success";
  if (score >= 70) return "warning";
  return "danger";
}

export function amRows(source: unknown[] | undefined) {
  return tableRows(source);
}

export function trendPoints(charts: DashboardData["charts"]) {
  const input = charts.scoreTrend;
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const row = asRecord(item);
      const score = getNumber(row, ["averageScore", "score", "value"]);
      return {
        label: getString(row, ["label", "month", "date"], ""),
        score,
        auditCount: getNumber(row, ["auditCount"]),
      };
    })
    .filter((point) => point.label && Number.isFinite(point.score))
    .slice(-5);
}

export function formatDate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

export function storeLabel(row: Record<string, unknown>) {
  return getString(row, ["store.name", "name"], "Chưa xác định");
}

export function storeMeta(row: Record<string, unknown>) {
  const code = getString(row, ["store.code", "code"], "");
  const province = getString(row, ["store.province", "province"], "");
  return [code, province].filter(Boolean).join(" - ");
}
