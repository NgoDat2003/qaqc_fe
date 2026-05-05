import type { ScoreGrade } from "@/components/shared/score-badge";

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", options ?? {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("vi-VN", {
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
