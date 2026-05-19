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

// Role-based landing path after login or dashboard redirect
export function getLandingPathByRole(role: RoleKey | null): string {
  switch (role) {
    case "company_admin":    return "/master-data/organization";
    case "qa_manager":       return "/qam/audit-plans";
    case "qc_auditor":       return "/qc/my-assignments";
    case "am":               return "/master-data/organization";
    case "store_manager":    return "/master-data/organization";
    case "executive_viewer": return "/master-data/organization";
    default:                 return "/master-data/organization";
  }
}
