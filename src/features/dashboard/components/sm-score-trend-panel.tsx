import type { DashboardData } from "../types";
import { asRecord, getPathValue, getString } from "../utils";
import { DashboardPanel, EmptyBlock } from "./dashboard-shared";

function pointsFromTrend(input: unknown[] | Record<string, number> | undefined) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const row = asRecord(item);
      const rawScore =
        getPathValue(row, "averageScore") ??
        getPathValue(row, "score") ??
        getPathValue(row, "value");
      const score =
        typeof rawScore === "number" && Number.isFinite(rawScore)
          ? rawScore
          : Number.NaN;
      return {
        label: getString(row, ["label", "month", "date"], ""),
        score,
      };
    })
    .filter((point) => point.label && Number.isFinite(point.score))
    .slice(-6);
}

export function SmScoreTrendPanel({
  charts,
}: {
  charts: DashboardData["charts"];
}) {
  const points = pointsFromTrend(charts.scoreTrend);
  const width = 320;
  const height = 150;
  const padding = 22;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const polyline = points
    .map((point, index) => {
      const x =
        padding + (points.length === 1 ? plotWidth : (plotWidth / (points.length - 1)) * index);
      const y = padding + plotHeight - (Math.min(point.score, 100) / 100) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <DashboardPanel
      title="Xu hướng điểm cửa hàng"
      description="Điểm cửa hàng theo kỳ"
      className="h-full"
    >
      {points.length < 2 ? (
        <EmptyBlock text="Chưa đủ dữ liệu xu hướng điểm." />
      ) : (
        <div className="space-y-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Xu hướng điểm cửa hàng"
            className="h-44 w-full overflow-visible"
          >
            <line
              x1={padding}
              x2={width - padding}
              y1={height - padding}
              y2={height - padding}
              stroke="currentColor"
              className="text-border"
            />
            <line
              x1={padding}
              x2={padding}
              y1={padding}
              y2={height - padding}
              stroke="currentColor"
              className="text-border"
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyline}
              className="text-primary"
            />
            {points.map((point, index) => {
              const x =
                padding +
                (points.length === 1
                  ? plotWidth
                  : (plotWidth / (points.length - 1)) * index);
              const y =
                padding + plotHeight - (Math.min(point.score, 100) / 100) * plotHeight;
              return (
                <g key={`${point.label}-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className="fill-primary stroke-card"
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px] font-medium"
                  >
                    {point.score.toFixed(1)}
                  </text>
                  <text
                    x={x}
                    y={height - 2}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </DashboardPanel>
  );
}
