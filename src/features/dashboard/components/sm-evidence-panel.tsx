import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { DashboardData } from "../types";
import { getNumber, getString } from "../utils";
import { DashboardPanel, EmptyBlock } from "./dashboard-shared";
import { formatCount, summaryNumber } from "./sm-dashboard-helpers";

export function SmEvidencePanel({
  summary,
  rows,
}: {
  summary: DashboardData["summary"];
  rows: Record<string, unknown>[];
}) {
  const evidenceCount = summaryNumber(summary, "evidenceCount") ?? 0;
  const requiredEvidenceCount = summaryNumber(summary, "requiredEvidenceCount") ?? 0;
  const evidenceRate = summaryNumber(summary, "remediationEvidenceRate") ?? 0;

  return (
    <DashboardPanel
      title="Minh chứng khắc phục"
      description="Ảnh gần nhất từ các hạng mục Action Plan"
      className="h-full"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Tiến độ minh chứng
            </span>
            <span className="font-semibold text-foreground">
              {formatCount(evidenceCount)} / {formatCount(requiredEvidenceCount)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(0, Math.min(100, evidenceRate))}%` }}
            />
          </div>
          <p className="mt-2 text-right text-sm font-semibold text-primary">
            {formatCount(evidenceRate)}%
          </p>
        </div>

        {!rows.length ? (
          <EmptyBlock text="Chưa có ảnh minh chứng khắc phục trong bộ lọc hiện tại." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rows.slice(0, 4).map((row, index) => {
              const url = getString(row, ["url"], "");
              const actionPlanId = getString(row, ["actionPlanId"], "");
              const label = getString(row, ["criteriaName", "fileName"], "Minh chứng");
              const href = actionPlanId ? `/action-plans/${actionPlanId}` : url || "#";
              return (
                <Link
                  key={`${getString(row, ["id"], "evidence")}-${index}`}
                  href={href}
                  className="group overflow-hidden rounded-lg border border-border bg-muted/20"
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={label}
                      className="h-24 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="px-2 py-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {label}
                    </p>
                    {getNumber(row, ["imageCount"]) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {getNumber(row, ["imageCount"])} ảnh
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Link
        href="/action-plans"
        className="mt-4 inline-flex text-xs font-medium text-primary hover:underline"
      >
        Xem tất cả minh chứng
      </Link>
    </DashboardPanel>
  );
}
