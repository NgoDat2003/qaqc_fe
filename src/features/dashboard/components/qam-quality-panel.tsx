import type { DashboardData } from '../types';
import { asRecord, clampPercent, getNumber, getString, numberOf } from '../utils';
import { DashboardPanel, MiniStat, PanelActionLink } from './dashboard-shared';

export function QamQualityPanel({
  summary,
  bottomStores,
}: {
  summary: DashboardData["summary"];
  bottomStores: Record<string, unknown>[];
}) {
  return (
    <DashboardPanel
      title="Chất lượng cửa hàng"
      description="Cảnh báo Risk/CCP và top cửa hàng điểm thấp"
    >
      <div className="mb-4 grid grid-cols-3 gap-3">
        <MiniStat
          label="Risk"
          value={numberOf(summary, "riskViolationCount")}
          tone="danger"
        />
        <MiniStat
          label="CCP"
          value={numberOf(summary, "ccpViolationCount")}
          tone="warning"
        />
        <MiniStat
          label="F-CCP"
          value={numberOf(summary, "autoCcpViolationCount")}
          tone="info"
        />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Top 5 cửa hàng điểm thấp nhất
        </p>
        {bottomStores.slice(0, 5).map((row, index) => {
          const store = asRecord(row.store);
          const score = getNumber(row, ["averageScore"]);
          return (
            <div
              key={`${getString(store, ["id"], "store")}-${index}`}
              className="grid grid-cols-[24px_1fr_72px] items-center gap-3"
            >
              <span className="text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {getString(store, ["name"])}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getString(store, ["code"], "")}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-danger-bg">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${clampPercent(score)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-danger">
                  {score.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <PanelActionLink href="/audits">Xem tất cả cửa hàng</PanelActionLink>
    </DashboardPanel>
  );
}
