import type { ScoreGrade } from "@/shared/types";

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", options ?? {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}

const GRADE_LABELS: Record<ScoreGrade, string> = {
  excellent: "Xuất sắc",
  good: "Tốt",
  pass: "Đạt",
  fail: "Không đạt",
  alarm: "Báo động",
};

export function formatGrade(grade: ScoreGrade): string {
  return GRADE_LABELS[grade] ?? grade;
}
