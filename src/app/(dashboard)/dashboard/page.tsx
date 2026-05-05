"use client";

import { useAuthStore } from "@/stores/auth.store";
import { QAMDashboard } from "@/features/dashboard/qam-dashboard";
import { QCDashboard } from "@/features/dashboard/qc-dashboard";
import { AMDashboard } from "@/features/dashboard/am-dashboard";
import { SMDashboard } from "@/features/dashboard/sm-dashboard";
import { EVDashboard } from "@/features/dashboard/ev-dashboard";
import { CADashboard } from "@/features/dashboard/ca-dashboard";
import type { RoleKey } from "@/shared/types";

const DASHBOARD_MAP: Record<RoleKey, React.ComponentType> = {
  "company_admin": CADashboard,
  "qa_manager": QAMDashboard,
  "qc_auditor": QCDashboard,
  "am": AMDashboard,
  "store_manager": SMDashboard,
  "executive_viewer": EVDashboard,
};

export default function DashboardPage() {
  const { activeRole } = useAuthStore();
  const Component = DASHBOARD_MAP[activeRole as RoleKey] ?? QAMDashboard;
  return <Component />;
}
