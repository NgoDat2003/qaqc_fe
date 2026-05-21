import { AlertTriangle, BarChart3, CheckCircle2, ClipboardCheck, Clock3, Flag, ListChecks, Store, Users } from 'lucide-react';
import type { DashboardData, Kpi } from '../types';
import { deltaOf, displayNumber, displayScore, numberOf } from '../utils';

export function buildAdminKpis(summary: DashboardData["summary"]): Kpi[] {
  return [
    {
      label: "Users",
      value: displayNumber(numberOf(summary, "totalUsers")),
      detail: "Tổng tài khoản",
      icon: Users,
      tone: "info",
    },
    {
      label: "Stores",
      value: displayNumber(numberOf(summary, "totalStores")),
      detail: "Master data cửa hàng",
      icon: Store,
      tone: "success",
    },
    {
      label: "Brands",
      value: displayNumber(numberOf(summary, "totalBrands")),
      detail: "Thương hiệu",
      icon: Flag,
      tone: "default",
    },
    {
      label: "Audit submitted",
      value: displayNumber(numberOf(summary, "totalSubmittedAudits")),
      detail: "Bài đã nộp",
      icon: ClipboardCheck,
      tone: "info",
    },
    {
      label: "Action Plan",
      value: displayNumber(numberOf(summary, "totalActionPlans")),
      detail: `${numberOf(summary, "actionPlansOpen")} mở / ${numberOf(summary, "actionPlansOverdue")} quá hạn`,
      icon: ListChecks,
      tone: numberOf(summary, "actionPlansOverdue") ? "danger" : "warning",
    },
  ];
}

export function buildOperationalKpis(summary: DashboardData["summary"]): Kpi[] {
  return [
    {
      label: "Điểm trung bình",
      value: displayScore(numberOf(summary, "averageScore")),
      detail: `${numberOf(summary, "auditCount")} bài audit`,
      delta: deltaOf(summary, "averageScore"),
      icon: BarChart3,
      tone: numberOf(summary, "averageScore") >= 85 ? "success" : "warning",
    },
    {
      label: "Store đã chấm",
      value: displayNumber(numberOf(summary, "auditedStoreCount")),
      detail: "Trong bộ lọc",
      icon: Store,
      tone: "info",
    },
    {
      label: "Risk / CCP",
      value: displayNumber(
        numberOf(summary, "riskAuditCount") +
          numberOf(summary, "criticalAuditCount"),
      ),
      detail: `${numberOf(summary, "totalViolationCount")} lỗi / ${numberOf(summary, "repeatViolationCount")} lặp`,
      delta: deltaOf(summary, "riskAuditCount"),
      icon: AlertTriangle,
      tone:
        numberOf(summary, "riskAuditCount") ||
        numberOf(summary, "criticalAuditCount")
          ? "danger"
          : "success",
    },
    {
      label: "AP đang mở",
      value: displayNumber(numberOf(summary, "actionPlanOpen")),
      detail: `${numberOf(summary, "actionPlanOverdue")} quá hạn`,
      delta: deltaOf(summary, "actionPlanOpen"),
      icon: Clock3,
      tone: numberOf(summary, "actionPlanOverdue") ? "danger" : "warning",
    },
    {
      label: "AP đã đóng",
      value: displayNumber(numberOf(summary, "actionPlanClosed")),
      detail: "Hoàn tất xử lý",
      icon: CheckCircle2,
      tone: "success",
    },
  ];
}
