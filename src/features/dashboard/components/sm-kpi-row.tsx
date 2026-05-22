import {
  AlertTriangle,
  Camera,
  ClipboardList,
  FileCheck2,
  Gauge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../types";
import {
  formatCount,
  formatScore,
  scoreTone,
  summaryNumber,
} from "./sm-dashboard-helpers";

const KPI_ICON_CLASSES = {
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  info: "bg-info text-white",
  muted: "bg-muted text-muted-foreground",
};

function SmKpiCard({
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

export function SmKpiRow({ summary }: { summary: DashboardData["summary"] }) {
  const latestScore = summaryNumber(summary, "latestScore");
  const averageScore = summaryNumber(summary, "averageScore");
  const openAp = summaryNumber(summary, "actionPlanOpen");
  const overdueAp = summaryNumber(summary, "actionPlanOverdue");
  const evidenceRate = summaryNumber(summary, "remediationEvidenceRate");
  const evidenceCount = summaryNumber(summary, "evidenceCount");
  const requiredEvidenceCount = summaryNumber(summary, "requiredEvidenceCount");
  const auditCount = summaryNumber(summary, "auditCount");

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SmKpiCard
        label="Điểm gần nhất"
        value={formatScore(latestScore)}
        suffix="/100"
        detail="Bài audit mới nhất"
        tone={scoreTone(latestScore)}
        icon={Gauge}
      />
      <SmKpiCard
        label="Điểm trung bình kỳ"
        value={formatScore(averageScore)}
        suffix="/100"
        detail={`${formatCount(auditCount)} bài audit trong kỳ`}
        tone={scoreTone(averageScore)}
        icon={FileCheck2}
      />
      <SmKpiCard
        label="AP đang mở"
        value={formatCount(openAp)}
        detail="Cần cập nhật"
        tone="warning"
        icon={ClipboardList}
      />
      <SmKpiCard
        label="AP quá hạn"
        value={formatCount(overdueAp)}
        detail={overdueAp ? "Cần xử lý ngay" : "Không có AP quá hạn"}
        tone={overdueAp ? "danger" : "success"}
        icon={AlertTriangle}
      />
      <SmKpiCard
        label="Minh chứng khắc phục"
        value={`${formatCount(evidenceRate)}%`}
        detail={`${formatCount(evidenceCount)} / ${formatCount(requiredEvidenceCount)} AP`}
        tone="info"
        icon={Camera}
      />
    </section>
  );
}
