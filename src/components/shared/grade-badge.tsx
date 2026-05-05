import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ScoreGrade } from "./score-badge";

const GRADE_STYLES: Record<ScoreGrade, string> = {
  excellent: "bg-score-excellent text-white border-transparent",
  good: "bg-score-good text-white border-transparent",
  pass: "bg-score-pass text-white border-transparent",
  fail: "bg-score-fail text-white border-transparent",
  alarm: "bg-score-alarm text-white border-transparent",
};

const GRADE_LABELS: Record<ScoreGrade, string> = {
  excellent: "Xuất sắc",
  good: "Tốt",
  pass: "Đạt",
  fail: "Không đạt",
  alarm: "Báo động",
};

interface GradeBadgeProps {
  grade: ScoreGrade;
  className?: string;
}

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  return (
    <Badge className={cn("font-medium", GRADE_STYLES[grade], className)}>
      {GRADE_LABELS[grade]}
    </Badge>
  );
}
