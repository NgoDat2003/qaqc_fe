import type { BarItem, DashboardData } from '../types';
import { cn } from '@/lib/utils';
import { BAR_TONES } from '../constants';
import { asRecord, clampPercent, displayNumber, getNumber, getString, numberOf, percent } from '../utils';
import { DashboardPanel, EmptyBlock, PanelActionLink } from './dashboard-shared';

export function ProgressLine({
  label,
  value,
  total,
  tone = "primary",
}: {
  label: string;
  value: number;
  total: number;
  tone?: BarItem["tone"];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value.toLocaleString("vi-VN")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", BAR_TONES[tone])}
          style={{ width: `${clampPercent(percent(value, total))}%` }}
        />
      </div>
    </div>
  );
}

export function QamProgressPanel({
  summary,
  rows,
}: {
  summary: DashboardData["summary"];
  rows: Record<string, unknown>[];
}) {
  const total = numberOf(summary, "assignmentTotal");
  const completed = numberOf(summary, "assignmentCompleted");
  const inProgress = numberOf(summary, "assignmentInProgress");
  const pending = numberOf(summary, "assignmentPending");
  return (
    <DashboardPanel
      title="Tiến độ audit plan"
      description={`${completed}/${total} store đã chấm`}
    >
      <div className="grid gap-4 lg:grid-cols-[150px_1fr]">
        <div className="space-y-4 border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Tổng số cửa hàng trong kế hoạch
            </p>
            <p className="mt-2 text-4xl font-semibold text-foreground">
              {displayNumber(total)}
            </p>
          </div>
          <ProgressLine
            label="Đã chấm"
            value={completed}
            total={total}
            tone="success"
          />
          <ProgressLine
            label="Đang chấm"
            value={inProgress}
            total={total}
            tone="info"
          />
          <ProgressLine
            label="Chưa chấm"
            value={pending}
            total={total}
            tone="muted"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
            <span>Tiến độ theo QC</span>
            <span>Tỷ lệ hoàn thành</span>
          </div>
          {rows.length ? (
            rows.slice(0, 5).map((row, index) => {
              const completionRate = getNumber(row, ["completionRate"]);
              const auditor = asRecord(row.auditor);
              return (
                <div
                  key={`${getString(auditor, ["id"], "qc")}-${index}`}
                  className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_100px_44px] sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-bg text-xs font-semibold text-info">
                      {getString(auditor, ["fullName"], "QC")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getString(auditor, ["fullName", "email"])}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getNumber(row, ["completed"])}/
                        {getNumber(row, ["total"])} CH
                      </p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${clampPercent(completionRate)}%` }}
                    />
                  </div>
                  <span className="text-right text-sm font-semibold text-foreground">
                    {completionRate.toFixed(1)}%
                  </span>
                </div>
              );
            })
          ) : (
            <EmptyBlock text="Chờ dữ liệu tiến độ QC từ BE" />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <PanelActionLink href="/qam/audit-plans">
          Xem chi tiết audit plan
        </PanelActionLink>
        <PanelActionLink href="/master-data/users">
          Xem tất cả QC
        </PanelActionLink>
      </div>
    </DashboardPanel>
  );
}
