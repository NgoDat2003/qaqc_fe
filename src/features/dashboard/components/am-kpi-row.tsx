import {
  AlertTriangle,
  ClipboardList,
  Gauge,
  ShieldAlert,
  Store,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../types";
import {
  amSummaryNumber,
  formatAmCount,
  formatAmScore,
  scoreTone,
} from "./am-dashboard-helpers";

const KPI_ICON_CLASSES = {
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  info: "bg-info text-white",
  muted: "bg-muted text-muted-foreground",
};

function AmKpiCard({
  label,
  value,
  suffix,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  tone: keyof typeof KPI_ICON_CLASSES;
  icon: React.ElementType;
}) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
      <CardContent className="flex min-h-[104px] items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            KPI_ICON_CLASSES[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold leading-none text-foreground">
            {value}
            {suffix && (
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AmKpiRow({ summary }: { summary: DashboardData["summary"] }) {
  const averageScore = amSummaryNumber(summary, "averageScore");
  const auditedStores = amSummaryNumber(summary, "auditedStoreCount");
  const managedStores = amSummaryNumber(summary, "managedStoreCount");
  const risk = amSummaryNumber(summary, "riskViolationCount");
  const ccp = amSummaryNumber(summary, "ccpViolationCount");
  const autoCcp = amSummaryNumber(summary, "autoCcpViolationCount");
  const openAp = amSummaryNumber(summary, "actionPlanOpen");
  const overdueAp = amSummaryNumber(summary, "actionPlanOverdue");

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <AmKpiCard
        label="Điểm trung bình khu vực"
        value={formatAmScore(averageScore)}
        suffix="/100"
        detail="Theo audit trong bộ lọc"
        tone={scoreTone(averageScore)}
        icon={Gauge}
      />
      <AmKpiCard
        label="Cửa hàng đã chấm"
        value={formatAmCount(auditedStores)}
        suffix={`/ ${formatAmCount(managedStores)}`}
        detail="Trong phạm vi AM phụ trách"
        tone="info"
        icon={Store}
      />
      <AmKpiCard
        label="Risk / CCP / F-CCP"
        value={`${formatAmCount(risk)} / ${formatAmCount(ccp)} / ${formatAmCount(autoCcp)}`}
        detail="Số lỗi nghiêm trọng"
        tone={risk || ccp || autoCcp ? "danger" : "success"}
        icon={ShieldAlert}
      />
      <AmKpiCard
        label="AP đang mở"
        value={formatAmCount(openAp)}
        detail="Cần theo dõi"
        tone="warning"
        icon={ClipboardList}
      />
      <AmKpiCard
        label="AP quá hạn"
        value={formatAmCount(overdueAp)}
        detail={overdueAp ? "Cần xử lý ngay" : "Không có AP quá hạn"}
        tone={overdueAp ? "danger" : "success"}
        icon={AlertTriangle}
      />
    </section>
  );
}
