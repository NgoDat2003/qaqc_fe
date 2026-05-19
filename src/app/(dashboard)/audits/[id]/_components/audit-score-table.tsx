"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { formatGrade } from "@/lib/format";
import type { AuditScoreBreakdown, ScoreGrade } from "@/shared/types";

interface AuditScoreTableProps {
  breakdown: AuditScoreBreakdown;
  finalScore: number;
  grade: ScoreGrade;
}

const GRADE_COLOR: Record<ScoreGrade, string> = {
  excellent: "text-success font-bold",
  good: "text-success font-bold",
  pass: "text-success font-bold",
  fail: "text-destructive font-bold",
  alarm: "text-destructive font-bold",
};

function dash(val: number): string {
  return val === 0 ? "—" : String(val);
}

function dashFloat(val: number): string {
  return val === 0 ? "—" : val.toFixed(1);
}

export function AuditScoreTable({ breakdown: sb, finalScore, grade }: AuditScoreTableProps) {
  const isPassGrade = grade === "excellent" || grade === "good" || grade === "pass";

  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Bảng điểm tổng hợp</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bảng tổng hợp điểm theo nhóm. Risk được hiển thị bằng tag và phần lý do riêng bên dưới.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Tiêu chí", "Số câu", "Điểm chuẩn", "Điểm bị trừ", "CCP", "Điểm đạt", "Tỷ trọng"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sb.groups.map((g, idx) => (
              <Fragment key={g.groupId}>
                {/* Group row */}
                <tr
                  key={`g-${g.groupId}`}
                  className={cn(
                    "border-b border-border/40",
                    idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  <td className="px-3 py-2 font-medium text-foreground">{g.groupCode}</td>
                  <td className="px-3 py-2 text-muted-foreground">{g.criteriaCount}</td>
                  <td className="px-3 py-2 text-muted-foreground">{g.maxScore}</td>
                  <td className={cn("px-3 py-2", g.deductedScore > 0 ? "text-destructive" : "text-muted-foreground")}>
                    {dashFloat(g.deductedScore)}
                  </td>
                  <td className={cn("px-3 py-2", g.ccpCount > 0 ? "text-warning font-medium" : "text-muted-foreground")}>
                    {dash(g.ccpCount)}
                  </td>
                  <td className={cn("px-3 py-2 font-medium", g.triggeredCritical ? "text-destructive" : "text-foreground")}>
                    {g.reachedScore.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{g.weight}%</td>
                </tr>

                {/* CCP sub-row */}
                <tr
                  key={`ccp-${g.groupId}`}
                  className={cn(
                    "border-b border-border/30",
                    idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  <td className="px-3 py-1.5 pl-6">
                    <span className="text-[10px] text-primary font-semibold">CCP({g.groupCode})</span>
                  </td>
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">{dash(g.ccpCount)}</td>
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">—</td>
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">—</td>
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">—</td>
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">—</td>
                  <td className="px-3 py-1.5 text-[11px] text-muted-foreground">—</td>
                </tr>
              </Fragment>
            ))}

            {/* RISK row — only if triggered */}
            {sb.risk.triggered && (
              <tr className="border-b border-destructive/30 bg-destructive/5">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive uppercase">
                    RISK
                  </span>
                </td>
                <td className="px-3 py-2 text-destructive text-[11px]">{sb.risk.count}</td>
                <td colSpan={4} className="px-3 py-2 text-destructive text-[11px] italic">
                  Toàn bài về 0 điểm
                </td>
                <td className="px-3 py-2 text-muted-foreground text-[11px]">—</td>
              </tr>
            )}

            {/* TỔNG row */}
            <tr className="border-t-2 border-border bg-muted/30">
              <td className="px-3 py-2 font-semibold text-foreground">TỔNG</td>
              <td className="px-3 py-2 font-semibold">{sb.totals.criteriaCount}</td>
              <td className="px-3 py-2 font-semibold">{sb.totals.maxScore}</td>
              <td className={cn("px-3 py-2 font-semibold", sb.totals.deductedScore > 0 ? "text-destructive" : "text-muted-foreground")}>
                {dashFloat(sb.totals.deductedScore)}
              </td>
              <td className={cn("px-3 py-2 font-semibold", sb.totals.ccpCount > 0 ? "text-warning" : "text-muted-foreground")}>
                {dash(sb.totals.ccpCount)}
              </td>
              <td className="px-3 py-2 font-semibold">{finalScore.toFixed(1)}</td>
              <td className="px-3 py-2 text-muted-foreground">—</td>
            </tr>

            {/* Result row */}
            <tr className="bg-muted/10">
              <td className="px-3 py-2 font-semibold text-foreground">Kết quả</td>
              <td className="px-3 py-2 text-muted-foreground">—</td>
              <td className="px-3 py-2 text-muted-foreground">—</td>
              <td className="px-3 py-2 text-muted-foreground">—</td>
              <td className="px-3 py-2 text-muted-foreground">—</td>
              <td className={cn("px-3 py-2 text-sm", GRADE_COLOR[grade])}>
                {finalScore.toFixed(1)} — {formatGrade(grade)}
              </td>
              <td className={cn("px-3 py-2 text-xs font-semibold", isPassGrade ? "text-success" : "text-destructive")}>
                {isPassGrade ? "ĐẠT" : "KHÔNG ĐẠT"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Warnings */}
      {sb.warnings.length > 0 && (
        <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 space-y-1">
          {sb.warnings.map((w, i) => (
            <p key={i} className="text-xs text-warning">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
