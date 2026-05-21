import { CalendarDays, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { buildQS } from '@/lib/build-qs';
import { ROLE_FILTERS } from '../constants';
import type { DashboardScope, DashboardStatus, TimeRange } from '../types';
import { getDateParams } from '../utils';

export function FilterBar({
  scope,
  timeRange,
  status,
  onTimeRangeChange,
  onStatusChange,
}: {
  scope: DashboardScope | null;
  timeRange: TimeRange;
  status: DashboardStatus;
  onTimeRangeChange: (value: TimeRange) => void;
  onStatusChange: (value: DashboardStatus) => void;
}) {
  const exportScope = scope === "admin" || scope === "qam" ? scope : null;
  const exportHref = exportScope
    ? `/api/dashboard/export${buildQS({ scope: exportScope, ...getDateParams(timeRange) })}`
    : undefined;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(event) =>
                onTimeRangeChange(event.target.value as TimeRange)
              }
              className="bg-transparent text-sm outline-none"
            >
              <option value="month">Tháng hiện tại</option>
              <option value="30d">30 ngày gần nhất</option>
              <option value="all">Tất cả dữ liệu</option>
            </select>
          </label>
          <label className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as DashboardStatus)
              }
              className="bg-transparent text-sm outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Đang mở</option>
              <option value="closed">Đã đóng</option>
              <option value="risk">Có Risk</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </label>
          {(scope ? ROLE_FILTERS[scope] : []).map((label) => (
            <button
              key={label}
              type="button"
              className="h-9 rounded-md border border-dashed border-border bg-muted/30 px-3 text-sm text-muted-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        {exportHref ? (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 lg:w-auto"
            nativeButton={false}
            render={<a href={exportHref} download />}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 lg:w-auto"
            disabled
          >
            <>
              <Download className="h-4 w-4" />
              Export chờ API
            </>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
