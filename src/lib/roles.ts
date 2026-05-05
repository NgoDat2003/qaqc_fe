import type { RoleKey } from "@/shared/types";
import { useAuthStore } from "@/stores/auth.store";

export const ROLE_LABELS: Record<RoleKey, string> = {
  company_admin: "Company Admin",
  qa_manager: "QA Manager",
  qc_auditor: "QC Auditor",
  am: "Area Manager",
  store_manager: "Store Manager",
  executive_viewer: "Executive Viewer",
};

export function getRoleLabel(roleKey: RoleKey): string {
  return ROLE_LABELS[roleKey] ?? roleKey;
}

export function hasRole(activeRole: RoleKey | null, roles: RoleKey[]): boolean {
  if (!activeRole) return false;
  return roles.includes(activeRole);
}

export function useHasRole(roles: RoleKey[]): boolean {
  const activeRole = useAuthStore((s) => s.activeRole);
  return hasRole(activeRole, roles);
}
