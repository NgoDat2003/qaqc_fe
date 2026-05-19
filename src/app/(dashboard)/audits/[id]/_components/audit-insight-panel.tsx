"use client";

import { cn } from "@/lib/utils";
import { formatGrade } from "@/lib/format";
import type { AuditResultDetail, AuditScoreBreakdown, ScoreGrade } from "@/shared/types";

interface AuditInsightPanelProps {
  audit: AuditResultDetail;
}

// --- Donut SVG ---
interface DonutChartProps {
  score: number;
  grade: ScoreGrade;
}

function DonutChart({ score, grade }: DonutChartProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const isPass = grade === "excellent" || grade === "good" || grade === "pass";
  const strokeColor = isPass ? "var(--success)" : "var(--destructive)";
  const textColor = isPass ? "text-success" : "text-destructive";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="10"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold leading-none", textColor)}>
            {score.toFixed(0)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">điểm</span>
        </div>
      </div>
      <span className={cn("text-xs font-semibold", textColor)}>{formatGrade(grade)}</span>
      <span className="text-[10px] text-muted-foreground text-center">Điểm tổng đạt được</span>
    </div>
  );
}

// --- Group Bars ---
interface GroupBarsProps {
  sb: AuditScoreBreakdown;
}

function GroupBars({ sb }: GroupBarsProps) {
  return (
    <div className="flex flex-col gap-2.5 flex-1 min-w-0">
      {sb.groups.map((g) => (
        <div key={g.groupId} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={cn("font-medium", g.triggeredCritical ? "text-destructive" : "text-foreground")}>
              {g.groupCode}
            </span>
            <span className={cn("font-mono text-[11px]", g.triggeredCritical ? "text-destructive" : "text-muted-foreground")}>
              {g.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                g.triggeredCritical ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${Math.min(g.percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
      {sb.risk.triggered && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-destructive">RISK</span>
            <span className="font-mono text-[11px] text-destructive">0%</span>
          </div>
          <div className="h-1.5 rounded-full bg-destructive/20 overflow-hidden">
            <div className="h-full rounded-full bg-destructive" style={{ width: "0%" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Stat Cards ---
interface StatCardsProps {
  audit: AuditResultDetail;
  sb: AuditScoreBreakdown;
}

function StatCards({ audit, sb }: StatCardsProps) {
  const totalViolations = audit.violations.length;
  const totalImages = audit.violations.reduce((sum, v) => sum + v.images.length, 0);
  const violationsWithImages = audit.violations.filter((v) => v.images.length > 0).length;
  const repeatCount = audit.violations.filter((v) => v.repeatCount > 0).length;
  const coveragePct = totalViolations > 0
    ? Math.round((violationsWithImages / totalViolations) * 100)
    : 100;

  const stats = [
    { label: "Risk / CCP", value: `${sb.risk.count} / ${sb.totals.ccpCount}` },
    { label: "Lỗi lặp", value: String(repeatCount) },
    { label: "Coverage ảnh", value: `${coveragePct}%` },
    { label: "Ảnh dùng cho lỗi", value: String(totalImages) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
          <div className="text-sm font-bold text-foreground">{s.value}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// --- Verdict Badge ---
interface VerdictProps {
  grade: ScoreGrade;
  isRisk: boolean;
}

function VerdictBadge({ grade, isRisk }: VerdictProps) {
  const isPass = grade === "excellent" || grade === "good" || grade === "pass";
  const isAlarm = grade === "alarm";

  const label = isRisk ? "RISK" : grade.toUpperCase();
  // Evaluate in priority order — isRisk → alarm → fail → pass
  const badgeClass = isRisk
    ? "bg-destructive/10 text-destructive border-destructive/30"
    : isAlarm
      ? "bg-warning/10 text-warning border-warning/30"
      : !isPass
        ? "bg-destructive/10 text-destructive border-destructive/30"
        : "bg-success/10 text-success border-success/30";

  const desc = isRisk
    ? "Có lỗi RISK — toàn bài về 0 điểm"
    : grade === "excellent" ? "Xuất sắc — Vượt chuẩn tất cả tiêu chí"
      : grade === "good" ? "Tốt — Đạt chuẩn hầu hết tiêu chí"
        : grade === "pass" ? "Đạt — Đáp ứng yêu cầu tối thiểu"
          : grade === "alarm" ? "Báo động — Dưới mức tối thiểu, cần hành động khẩn"
            : "Không đạt — Cần cải thiện ngay";

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className={cn(
        "inline-flex items-center rounded-lg border px-4 py-1.5 text-sm font-bold tracking-wide uppercase",
        badgeClass
      )}>
        {label}
      </span>
      <p className="text-xs text-muted-foreground max-w-[120px] leading-snug">{desc}</p>
    </div>
  );
}

// --- Main Panel ---
export function AuditInsightPanel({ audit }: AuditInsightPanelProps) {
  const sb = audit.scoreBreakdown!;
  const totalImages = audit.violations.reduce((sum, v) => sum + v.images.length, 0);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-6 flex-wrap sm:flex-nowrap">
        {/* Left: donut + meta */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <DonutChart score={audit.finalScore} grade={audit.grade} />
          <span className="text-[10px] text-muted-foreground mt-1">
            {audit.violations.length} lỗi · {totalImages} ảnh minh chứng
          </span>
        </div>

        {/* Middle: group bars */}
        <div className="flex-1 min-w-[140px] pt-1">
          <GroupBars sb={sb} />
        </div>

        {/* Right: stat cards */}
        <div className="shrink-0 w-[180px]">
          <StatCards audit={audit} sb={sb} />
        </div>

        {/* Far right: verdict */}
        <div className="shrink-0 flex items-center pt-2">
          <VerdictBadge grade={audit.grade} isRisk={audit.isRiskTriggered} />
        </div>
      </div>
    </div>
  );
}
