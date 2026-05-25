import type { DashboardData } from "../types";
import { trendPoints } from "./am-dashboard-helpers";
import { DashboardPanel, EmptyBlock } from "./dashboard-shared";

export function AmScoreTrendPanel({
  charts,
}: {
  charts: DashboardData["charts"];
}) {
  const points = trendPoints(charts);
  const width = 320;
  const height = 150;
  const padding = 22;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const polyline = points
    .map((point, index) => {
      const x =
        padding +
        (points.length === 1 ? plotWidth : (plotWidth / (points.length - 1)) * index);
      const y = padding + plotHeight - (Math.min(point.score, 100) / 100) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <DashboardPanel
      title="Xu hướng điểm trung bình"
      description="5 tháng audit mới nhất trong scope AM"
      className="h-full"
    >
      {points.length < 2 ? (
        <EmptyBlock text="Chưa đủ dữ liệu xu hướng điểm." />
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Xu hướng điểm trung bình AM"
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
      )}
    </DashboardPanel>
  );
}
