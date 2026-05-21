import { AlertTriangle, BarChart3, ClipboardCheck, ListChecks, Store } from 'lucide-react';
import type { DashboardData, Kpi } from '../types';
import { deltaOf, displayNumber, displayScore, numberOf, percent, tableRows } from '../utils';
import { QamActionPlanPanel, QamComparisonPanel, QamErrorPanelV2, QamKpiCard, QamProgressPanel, QamQualityPanel } from './qam-panels';

export { QamFilterBar } from './qam-filter-bar';

export function buildQamKpis(summary: DashboardData["summary"]): Kpi[] {
  const assignmentTotal = numberOf(summary, "assignmentTotal");
  const auditedStores = numberOf(summary, "auditedStoreCount");
  return [
    {
      label: "Điểm trung bình",
      value: displayScore(numberOf(summary, "averageScore")),
      detail: `/100 · ${numberOf(summary, "auditCount")} bài audit`,
      delta: deltaOf(summary, "averageScore"),
      icon: BarChart3,
      tone: numberOf(summary, "averageScore") >= 85 ? "success" : "warning",
    },
    {
      label: "Cửa hàng đã chấm",
      value: displayNumber(auditedStores),
      detail: `/ ${displayNumber(assignmentTotal)} · ${percent(auditedStores, assignmentTotal)}% kế hoạch`,
      icon: Store,
      tone: "info",
    },
    {
      label: "Bài audit đã submit",
      value: displayNumber(numberOf(summary, "auditCount")),
      detail: "Đã nộp trong kỳ",
      delta: deltaOf(summary, "auditCount"),
      icon: ClipboardCheck,
      tone: "success",
    },
    {
      label: "AP đang mở",
      value: displayNumber(numberOf(summary, "actionPlanOpen")),
      detail: "Cần theo dõi",
      delta: deltaOf(summary, "actionPlanOpen"),
      icon: ListChecks,
      tone: "warning",
    },
    {
      label: "AP quá hạn",
      value: displayNumber(numberOf(summary, "actionPlanOverdue")),
      detail: "Cần xử lý ngay",
      icon: AlertTriangle,
      tone: numberOf(summary, "actionPlanOverdue") ? "danger" : "success",
    },
  ];
}

export function QamDashboardView({
  summary,
  charts,
  tables,
}: {
  summary: DashboardData["summary"];
  charts: DashboardData["charts"];
  tables: DashboardData["tables"];
}) {
  const kpis = buildQamKpis(summary);
  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <QamKpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr_1fr]">
        <QamProgressPanel
          summary={summary}
          rows={tableRows(tables.progressByQC)}
        />
        <QamQualityPanel
          summary={summary}
          bottomStores={tableRows(tables.bottomStores)}
        />
        <QamErrorPanelV2 summary={summary} charts={charts} tables={tables} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <QamActionPlanPanel
          summary={summary}
          charts={charts}
          rows={tableRows(tables.actionPlanFollowUps)}
        />
        <QamComparisonPanel charts={charts} />
      </div>
    </div>
  );
}
