import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type ScoreGrade = "excellent" | "good" | "pass" | "fail" | "alarm"

export function ScoreBadge({ score, grade, className }: { score: number, grade: ScoreGrade, className?: string }) {
  const gradeStyles = {
    excellent: "bg-score-excellent text-white hover:bg-score-excellent/90",
    good: "bg-score-good text-white hover:bg-score-good/90",
    pass: "bg-score-pass text-white hover:bg-score-pass/90",
    fail: "bg-score-fail text-white hover:bg-score-fail/90",
    alarm: "bg-score-alarm text-white hover:bg-score-alarm/90",
  }
  
  const gradeLabels = {
    excellent: "Xuất sắc",
    good: "Tốt",
    pass: "Đạt",
    fail: "Không đạt",
    alarm: "Báo động",
  }

  return (
    <Badge variant="outline" className={cn("font-medium border-transparent", gradeStyles[grade], className)}>
      {score}% - {gradeLabels[grade]}
    </Badge>
  )
}
