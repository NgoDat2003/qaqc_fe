import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  showText?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  showText = true,
  className,
}: ScoreBadgeProps) {
  const getScoreStyle = (s: number) => {
    if (s >= 95) return "bg-score-excellent/10 text-score-excellent border-score-excellent/20";
    if (s >= 85) return "bg-score-good/10 text-score-good border-score-good/20";
    if (s >= 70) return "bg-score-pass/10 text-score-pass border-score-pass/20";
    if (s > 0) return "bg-score-fail/10 text-score-fail border-score-fail/20";
    return "bg-score-alarm/10 text-score-alarm border-score-alarm/20";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 95) return "Excellent";
    if (s >= 85) return "Good";
    if (s >= 70) return "Pass";
    if (s > 0) return "Fail";
    return "Critical";
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide uppercase",
        getScoreStyle(score),
        className
      )}
    >
      <span>{score.toFixed(1)}%</span>
      {showText && (
        <>
          <span className="w-px h-2.5 bg-current/20" />
          <span>{getScoreLabel(score)}</span>
        </>
      )}
    </div>
  );
}
