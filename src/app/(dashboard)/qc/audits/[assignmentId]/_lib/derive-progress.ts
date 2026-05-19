import type { AuditSession } from "@/shared/types";
import type { ViolationsState } from "./violations-reducer";

export interface ProgressInfo {
  total: number;
  touched: number;    // criteria với numErrors > 0
  percentage: number;
}

export function deriveProgress(session: AuditSession, violations: ViolationsState): ProgressInfo {
  const total = session.checklist.sections.reduce(
    (sum, s) => sum + (s.items?.length ?? 0),
    0
  );
  const touched = Object.values(violations).filter((v) => v.numErrors > 0).length;
  const percentage = total === 0 ? 0 : Math.round((touched / total) * 100);
  return { total, touched, percentage };
}
