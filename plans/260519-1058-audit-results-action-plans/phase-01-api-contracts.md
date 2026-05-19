# Phase 1 — API Contracts

**Effort:** 30m | **Priority:** P0 (prerequisite)

## Types cần thêm vào `src/shared/types/index.ts`

```ts
// Audit Results
export interface AuditResultListItem {
  id: string;
  finalScore: number;
  grade: ScoreGrade;
  isRiskTriggered: boolean;
  submittedAt: string;
  editedAt: string | null;
  store: Pick<Store, "id" | "code" | "name">;
  auditor: { id: string; fullName: string | null; email: string | null };
  checklist: { id: string; name: string; version: string; status: string };
  actionPlan: { id: string; status: ActionPlanStatus } | null;
  pendingCorrectionRequest: unknown | null; // non-null = pending
}

export interface AuditResultDetailViolation {
  id: string;
  criteria: {
    id: string; code: string; content: string;
    flag: "none" | "critical" | "risk";
    group: { id: string; code: string; name: string } | null;
  };
  numErrors: number;
  repeatCount: number;
  isCriticalTriggered: boolean;
  isRiskTriggered: boolean;
  note: string | null;
  images: UploadedImage[];
}

export interface AuditResultGroupScore {
  groupId: string; groupCode: string;
  weight: number; maxScore: number; reachedScore: number;
  percentage: number; triggeredCritical: boolean;
}

export interface AuditResultDetail {
  id: string;
  finalScore: number;
  grade: ScoreGrade;
  isRiskTriggered: boolean;
  submittedAt: string;
  editedAt: string | null;
  editNote: string | null;
  store: Pick<Store, "id" | "code" | "name">;
  auditor: { id: string; fullName: string | null; email: string | null };
  checklist: { id: string; name: string; version: string; status: string };
  groupScores: AuditResultGroupScore[];
  violations: AuditResultDetailViolation[];
  actionPlan: { id: string; status: ActionPlanStatus } | null;
  correctionRequests: CorrectionRequestDto[];
}

export interface CorrectionRequestDto {
  id: string; auditId: string; storeId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  requestedBy: { id: string; fullName: string; email: string } | null;
  reviewedBy: { id: string; fullName: string; email: string } | null;
}

export interface AuditCorrectionResponse {
  id: string; finalScore: number; grade: ScoreGrade;
  isRiskTriggered: boolean; editedAt: string; editNote: string;
  repeatInfo: SubmitAuditRepeatInfo[];
}

// Action Plans
export interface ActionPlanItemViolation {
  id: string;
  criteria: { id: string; code: string; content: string; flag: "none"|"critical"|"risk"; group: {id:string;code:string;name:string}|null };
  numErrors: number; repeatCount: number;
  isCriticalTriggered: boolean; isRiskTriggered: boolean;
  note: string | null; images: UploadedImage[];
}

export interface ActionPlanItem {
  id: string;
  rootCause: string | null;
  remediation: string | null;
  fixedAt: string | null;
  assigneeName: string | null;
  status: string;
  violation: ActionPlanItemViolation;
  remediationImages: UploadedImage[];
}

export interface ActionPlanDetail {
  id: string;
  status: ActionPlanStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  store: Pick<Store, "id" | "code" | "name">;
  audit: {
    id: string; finalScore: number; grade: string; submittedAt: string;
    auditor: { id: string; fullName: string | null; email: string | null };
    checklist: { id: string; name: string; version: string; status: string };
  };
  items: ActionPlanItem[];
}

// Notifications
export interface NotificationDto {
  id: string; title: string; message: string;
  type: "info" | "warning" | "alarm";
  isRead: boolean; link: string | null; createdAt: string;
}
```

## API methods thêm vào `src/features/audit/api/audit.api.ts`

```ts
// Audit Results
getAuditResults: () =>
  apiClient.get<AuditResultListItem[]>("/audits"),

getAuditResultDetail: (id: string) =>
  apiClient.get<AuditResultDetail>(`/audits/${id}`),

// Correction Requests
createCorrectionRequest: (auditId: string, reason: string) =>
  apiClient.post<CorrectionRequestDto>(`/audits/${auditId}/correction-requests`, { reason }),

approveCorrectionRequest: (requestId: string, reviewNote?: string) =>
  apiClient.post<void>(`/audit-correction-requests/${requestId}/approve`, { reviewNote }),

rejectCorrectionRequest: (requestId: string, reviewNote: string) =>
  apiClient.post<void>(`/audit-correction-requests/${requestId}/reject`, { reviewNote }),

applyAuditCorrection: (auditId: string, data: { editNote: string; violations: AuditViolationWrite[] }) =>
  apiClient.patch<AuditCorrectionResponse>(`/audits/${auditId}/correction`, data),

// Action Plans
createActionPlan: (auditId: string) =>
  apiClient.post<ActionPlanDetail>(`/audits/${auditId}/action-plan`, {}),

getActionPlans: (status?: ActionPlanStatus) =>
  apiClient.get<ActionPlanDetail[]>(`/action-plans${status ? `?status=${status}` : ""}`),

getActionPlan: (id: string) =>
  apiClient.get<ActionPlanDetail>(`/action-plans/${id}`),

updateActionPlan: (id: string, items: Array<{
  itemId: string; rootCause?: string|null; remediation?: string|null;
  fixedAt?: string|null; assigneeName?: string|null; imageIds?: string[];
}>) =>
  apiClient.patch<ActionPlanDetail>(`/action-plans/${id}`, { items }),

submitActionPlan: (id: string) =>
  apiClient.post<ActionPlanDetail>(`/action-plans/${id}/submit`, {}),

rejectActionPlan: (id: string, reviewNote: string) =>
  apiClient.post<ActionPlanDetail>(`/action-plans/${id}/reject`, { reviewNote }),

closeActionPlan: (id: string) =>
  apiClient.post<ActionPlanDetail>(`/action-plans/${id}/close`, {}),
```

## Notifications API — `src/features/notifications/api/notifications.api.ts` *(new)*

```ts
import { apiClient } from "@/lib/api-client";
import type { NotificationDto } from "@/shared/types";

export const notificationsApi = {
  getNotifications: (unreadOnly?: boolean, limit = 50) =>
    apiClient.get<NotificationDto[]>(`/notifications?limit=${limit}${unreadOnly ? "&unreadOnly=true" : ""}`),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count"),

  markRead: (id: string) =>
    apiClient.patch<void>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    apiClient.patch<void>("/notifications/read-all", {}),
};
```

## Hooks

### `src/features/audit/hooks/use-audit-results.ts`

```ts
export function useAuditResults() — useQuery ["audit-results"], staleTime: 30_000
export function useAuditResultDetail(id: string) — useQuery ["audit-results", id], staleTime: 0
export function useCreateCorrectionRequest() — mutation, invalidates ["audit-results", auditId]
export function useApproveCorrectionRequest() — mutation, invalidates ["audit-results", auditId]
export function useRejectCorrectionRequest() — mutation
export function useApplyAuditCorrection() — mutation, invalidates ["audit-results", auditId]
export function useCreateActionPlan() — mutation, invalidates ["audit-results", auditId] + ["action-plans"]
```

### `src/features/audit/hooks/use-action-plans.ts`

```ts
export function useActionPlans(status?: ActionPlanStatus) — useQuery ["action-plans", status ?? "all"]
export function useActionPlan(id: string) — useQuery ["action-plans", id], staleTime: 0
export function useUpdateActionPlan() — mutation, invalidates ["action-plans", id]
export function useSubmitActionPlan() — mutation
export function useRejectActionPlan() — mutation
export function useCloseActionPlan() — mutation
```

### `src/features/notifications/hooks/use-notifications.ts`

```ts
export function useNotifications(unreadOnly?: boolean)
export function useUnreadCount() — useQuery ["notifications-count"], staleTime: 30_000, refetchInterval: 60_000
export function useMarkRead()
export function useMarkAllRead()
```
