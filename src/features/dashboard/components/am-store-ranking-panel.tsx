"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../types";
import { getNumber, getPathValue, getString } from "../utils";
import {
  amRows,
  formatAmScore,
  formatDate,
  storeLabel,
  storeMeta,
} from "./am-dashboard-helpers";
import { DashboardPanel, EmptyBlock, PanelActionLink } from "./dashboard-shared";

type RankingMode = "top" | "bottom";

function RankingRows({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length)
    return <EmptyBlock text="Không có cửa hàng trong bộ lọc hiện tại." />;

  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {rows.slice(0, 5).map((row, index) => {
        const score = getNumber(row, ["averageScore"]);
        const latestScore = getNumber(row, ["latestScore"]);
        const hasLatestScore = typeof getPathValue(row, "latestScore") === "number";
        return (
          <div
            key={`${getString(row, ["store.id"], "store")}-${index}`}
            className="grid gap-3 px-3 py-3 text-sm md:grid-cols-[32px_1fr_auto] md:items-center"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {storeLabel(row)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {storeMeta(row)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 md:min-w-[150px] md:justify-end">
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    score >= 85
                      ? "text-success"
                      : score >= 70
                        ? "text-warning"
                        : "text-danger",
                  )}
                >
                  {formatAmScore(score)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(getString(row, ["latestAuditDate"], ""))}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {hasLatestScore ? formatAmScore(latestScore) : "-"}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AmStoreRankingPanel({
  tables,
}: {
  tables: DashboardData["tables"];
}) {
  const [mode, setMode] = React.useState<RankingMode>("top");
  const rows = amRows(mode === "top" ? tables.topStores : tables.bottomStores);

  return (
    <DashboardPanel
      title="Xếp hạng cửa hàng"
      description="Điểm cao nhất và điểm thấp nhất trong phạm vi AM"
      className="h-full"
    >
      <div className="mb-4 inline-flex rounded-md border border-border bg-muted/30 p-1">
        <Button
          type="button"
          size="sm"
          variant={mode === "top" ? "default" : "ghost"}
          className="h-8"
          onClick={() => setMode("top")}
        >
          Điểm cao nhất
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "bottom" ? "default" : "ghost"}
          className="h-8"
          onClick={() => setMode("bottom")}
        >
          Điểm thấp nhất
        </Button>
      </div>
      <RankingRows rows={rows} />
      <PanelActionLink href="/audits">Xem tất cả bài audit</PanelActionLink>
    </DashboardPanel>
  );
}
