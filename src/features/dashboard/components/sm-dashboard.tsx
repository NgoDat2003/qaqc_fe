import type { DashboardData } from "../types";
import { smRows } from "./sm-dashboard-helpers";
import { SmActionPlanUpdatePanel } from "./sm-action-plan-update-panel";
import { SmAuditHistoryPanel } from "./sm-audit-history-panel";
import { SmEvidencePanel } from "./sm-evidence-panel";
import { SmKpiRow } from "./sm-kpi-row";
import { SmScoreTrendPanel } from "./sm-score-trend-panel";
import { SmSeverityPanel } from "./sm-severity-panel";

export function SmDashboardView({
  summary,
  charts,
  tables,
}: {
  summary: DashboardData["summary"];
  charts: DashboardData["charts"];
  tables: DashboardData["tables"];
}) {
  const auditHistory = smRows(tables, "auditHistory");
  const actionItems = smRows(tables, "actionPlanItemsToUpdate");
  const latestImages = smRows(tables, "latestRemediationImages");

  return (
    <div className="space-y-4">
      <SmKpiRow summary={summary} />

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr_1fr]">
        <SmAuditHistoryPanel rows={auditHistory} />
        <SmSeverityPanel charts={charts} />
        <SmScoreTrendPanel charts={charts} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SmActionPlanUpdatePanel rows={actionItems} />
        <SmEvidencePanel summary={summary} rows={latestImages} />
      </section>
    </div>
  );
}
