import type { DashboardData } from '../types';
import { chartBars, getNumber, getString, tableRows } from '../utils';
import { DashboardPanel, MiniBarList, PanelActionLink } from './dashboard-shared';

export function QamComparisonPanel({ charts }: { charts: DashboardData["charts"] }) {
  const amRows = chartBars(charts.averageByAM, "primary").slice(0, 5);
  const brandRows = tableRows(charts.averageByBrand as unknown[]);
  return (
    <DashboardPanel
      title="So sánh theo AM / Brand"
      description="Điểm trung bình theo phạm vi báo cáo"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Điểm trung bình theo AM
          </p>
          <MiniBarList items={amRows} />
        </div>
        <div className="border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Theo Brand
          </p>
          <div className="space-y-3">
            {brandRows.slice(0, 5).map((row, index) => (
              <div
                key={`${getString(row, ["key"], "brand")}-${index}`}
                className="grid grid-cols-[1fr_54px_52px] gap-3 text-sm"
              >
                <span className="truncate font-medium text-foreground">
                  {getString(row, ["key"])}
                </span>
                <span className="text-right text-muted-foreground">
                  {getNumber(row, ["averageScore"]).toFixed(1)}
                </span>
                <span className="text-right text-muted-foreground">
                  {getNumber(row, ["storeCount"])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PanelActionLink href="/audits">Xem chi tiết so sánh</PanelActionLink>
    </DashboardPanel>
  );
}
