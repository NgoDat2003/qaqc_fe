import type { DashboardData } from "../types";
import { chartBars } from "../utils";
import { DashboardPanel, ErrorDonut, PanelActionLink } from "./dashboard-shared";

export function AmErrorPanel({ charts }: { charts: DashboardData["charts"] }) {
  const errors = chartBars(charts.errorsByGroup, "danger");

  return (
    <DashboardPanel
      title="Lỗi theo nhóm"
      description="Tổng hợp lỗi C/H/P/E và Risk"
      className="h-full"
    >
      <ErrorDonut items={errors} />
      <PanelActionLink href="/qam/criteria">
        Xem tất cả tiêu chí lỗi
      </PanelActionLink>
    </DashboardPanel>
  );
}
