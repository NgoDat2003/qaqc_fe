import type { DashboardData } from '../types';
import { chartBars, getNumber, getString, numberOf, tableRanking, tableRows } from '../utils';
import { DashboardPanel, ErrorDonut, PanelActionLink, RankingList } from './dashboard-shared';

export function MiniTrend({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return <div className="h-14 rounded-md bg-muted/40" />;
  const rawValues = rows.map((row) =>
    getNumber(row, [
      "repeatErrorCount",
      "repeatViolationCount",
      "violationCount",
      "errorCount",
      "count",
      "value",
      "total",
    ]),
  );
  const values =
    rawValues.length === 1 ? [rawValues[0], rawValues[0]] : rawValues;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 52 - ((value - min) / span) * 42;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,58 ${points} 100,58`;
  return (
    <svg
      viewBox="0 0 100 60"
      className="h-14 w-full overflow-visible"
      role="img"
      aria-label="Xu hướng lỗi lặp lại"
    >
      <defs>
        <linearGradient id="repeatTrendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        points={areaPoints}
        fill="url(#repeatTrendFill)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((value, index) => {
        const [x, y] = points.split(" ")[index].split(",");
        return (
          <circle
            key={`${value}-${index}`}
            cx={x}
            cy={y}
            r="2.2"
            fill="var(--primary)"
          />
        );
      })}
    </svg>
  );
}

export function QamErrorPanelV2({
  summary,
  charts,
  tables,
}: {
  summary: DashboardData["summary"];
  charts: DashboardData["charts"];
  tables: DashboardData["tables"];
}) {
  const errors = chartBars(charts.errorsByGroup, "danger");
  const repeatRows = tableRows(tables.topRepeatCriteria);
  const repeatTrendRows = tableRows(charts.repeatTrend as unknown[]);
  const repeatTrendSource =
    repeatTrendRows.length > 1 ? repeatTrendRows : repeatRows;
  return (
    <DashboardPanel
      title="Phân tích lỗi"
      description="Lỗi theo nhóm, tiêu chí lỗi nhiều và lỗi lặp lại"
    >
      <div className="grid min-w-0 gap-4">
        <div className="min-w-0 rounded-lg border border-border/70 p-3">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Lỗi theo nhóm
          </p>
          <ErrorDonut items={errors} />
        </div>
        <div className="grid min-w-0 gap-4 md:grid-cols-[1fr_180px]">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Top 5 tiêu chí lỗi nhiều
            </p>
            <RankingList items={tableRanking(tables.topCriteria).slice(0, 5)} />
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-muted/15 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Lỗi lặp lại
            </p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {numberOf(summary, "repeatRate").toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {numberOf(summary, "repeatViolationCount").toLocaleString(
                "vi-VN",
              )}{" "}
              lỗi lặp
            </p>
            <div className="mt-3">
              <MiniTrend rows={repeatTrendSource} />
            </div>
            {repeatRows[0] && (
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                Lặp nhiều: {getString(repeatRows[0], ["name", "code"])}
              </p>
            )}
          </div>
        </div>
      </div>
      <PanelActionLink href="/qam/criteria">
        Xem tất cả tiêu chí lỗi
      </PanelActionLink>
    </DashboardPanel>
  );
}
