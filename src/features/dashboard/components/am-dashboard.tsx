import type { DashboardData } from "../types";
import { AmActionPlanPanel } from "./am-action-plan-panel";
import { AmErrorPanel } from "./am-error-panel";
import { AmKpiRow } from "./am-kpi-row";
import { AmScoreTrendPanel } from "./am-score-trend-panel";
import { AmStoreRankingPanel } from "./am-store-ranking-panel";
import { AmTopCriteriaPanel } from "./am-top-criteria-panel";

export function AmDashboardView({
  summary,
  charts,
  tables,
}: {
  summary: DashboardData["summary"];
  charts: DashboardData["charts"];
  tables: DashboardData["tables"];
}) {
  return (
    <div className="space-y-4">
      <AmKpiRow summary={summary} />

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr_1fr]">
        <AmStoreRankingPanel tables={tables} />
        <AmErrorPanel charts={charts} />
        <AmScoreTrendPanel charts={charts} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <AmActionPlanPanel tables={tables} />
        <AmTopCriteriaPanel tables={tables} />
      </section>
    </div>
  );
}
