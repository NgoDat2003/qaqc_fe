# Phase 1 — API Contracts

**Effort:** 30m | **Priority:** P0 (prerequisite cho tất cả phases sau)

## Overview

Bổ sung types, sửa upload endpoint, thêm 4 API methods, tạo hooks file mới.

## Files sửa đổi

### 1. `src/shared/types/index.ts`

Thêm sau block `// --- Audit Execution ---`:

```ts
// AuditSession — response từ GET /api/audits/assignments/:assignmentId
export interface AuditSessionViolation {
  id: string;
  criteriaId: string;
  numErrors: number;
  repeatCount: number;
  isCriticalTriggered: boolean;
  isRiskTriggered: boolean;
  note: string | null;
  images: Array<{ id: string; url: string; fileName: string | null; mimeType: string | null }>;
}

export interface AuditSession {
  assignment: {
    id: string;
    status: "pending" | "in_progress" | "completed";
    store: Pick<Store, "id" | "code" | "name">;
    plan: {
      id: string;
      name: string;
      status: "open" | "closed";
      startDate: string;
      endDate: string;
      isAuditWindowOpen: boolean;
    };
  };
  checklist: ChecklistDetail;
  audit: {
    id: string;
    submittedAt: string | null;
    violations: AuditSessionViolation[];
  } | null;
}

// AuditHistoryBundle — response từ GET /api/audits/assignments/:assignmentId/history
export type RepeatLabel = "first" | "second" | "third" | "auto_ccp" | "reset";

export interface CriteriaHistoryEntry {
  auditId: string;
  submittedAt: string;
  numErrors: number;
  repeatCount: number;
  note: string | null;
  images: Array<{ id: string; url: string }>;
}

export interface CriteriaRepeatState {
  criteriaId: string;
  repeatCount: number;
  repeatLabel: RepeatLabel;
  isCriticalTriggered: boolean;
  history: CriteriaHistoryEntry[];
}

export interface AuditHistoryBundle {
  assignmentId: string;
  store: Pick<Store, "id" | "code" | "name">;
  historiesByCriteriaId: Record<string, CriteriaRepeatState>;
}

// AuditWriteBody — body cho PATCH /api/audits/draft và POST /api/audits/submit
export interface AuditViolationWrite {
  criteriaId: string;
  numErrors: number;
  note?: string | null;
  imageIds?: string[];
}

export interface AuditWriteBody {
  assignmentId: string;
  violations: AuditViolationWrite[];
}

// UploadedImage — response từ POST /api/upload/images
export interface UploadedImage {
  id: string;
  url: string;
  fileName: string | null;
  mimeType: string | null;
}
```

Thêm `SubmitAuditResponse` nếu chưa có:
```ts
export interface SubmitAuditRepeatInfo {
  criteriaId: string;
  numErrors: number;
  repeatCount: number;
  repeatLabel: RepeatLabel;
  isCriticalTriggered: boolean;
}

export interface SubmitAuditResponse {
  id: string;
  finalScore: number;
  grade: ScoreGrade;
  isRiskTriggered: boolean;
  repeatInfo: SubmitAuditRepeatInfo[];
}
```

---

### 2. `src/shared/api/upload.api.ts`

Sửa endpoint từ `/upload/evidence` → `/upload/images` và mở rộng return type:

```ts
import type { ApiResponse, UploadedImage } from "@/shared/types";

const BE_URL = (process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3000") + "/api";

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BE_URL}/upload/images`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const msg = (json?.error?.message as string) || "Upload thất bại";
      throw new Error(msg);
    }

    const json = (await res.json()) as ApiResponse<UploadedImage>;
    return json.data;
  },
};
```

> **Lưu ý:** Đổi tên method `uploadEvidence` → `uploadImage` và tìm mọi chỗ dùng `uploadEvidence` để update.

---

### 3. `src/features/audit/api/audit.api.ts`

Thêm 4 methods vào cuối object `auditApi`:

```ts
import type {
  AuditSession,
  AuditHistoryBundle,
  AuditWriteBody,
  SubmitAuditResponse,
  // ... existing imports
} from "@/shared/types";

// Thêm vào auditApi object:
getAuditSession: (assignmentId: string) =>
  apiClient.get<AuditSession>(`/audits/assignments/${assignmentId}`),

getAuditHistory: (assignmentId: string) =>
  apiClient.get<AuditHistoryBundle>(`/audits/assignments/${assignmentId}/history`),

saveDraft: (body: AuditWriteBody) =>
  apiClient.patch<void>("/audits/draft", body),

submitAudit: (body: AuditWriteBody) =>
  apiClient.post<SubmitAuditResponse>("/audits/submit", body),
```

---

### 4. `src/features/audit/hooks/use-audit-execution.ts` *(file mới)*

```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";

export function useAuditSession(assignmentId: string) {
  return useQuery({
    queryKey: ["audit-session", assignmentId],
    queryFn: () => auditApi.getAuditSession(assignmentId),
    staleTime: 0, // luôn fresh — tránh stale sau 409 refetch
    enabled: !!assignmentId,
  });
}

export function useAuditHistory(assignmentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["audit-history", assignmentId],
    queryFn: () => auditApi.getAuditHistory(assignmentId),
    staleTime: 60_000,
    enabled: !!assignmentId && (options?.enabled ?? true),
  });
}

export function useSaveDraft() {
  return useMutation({
    mutationFn: auditApi.saveDraft,
    // Không invalidate — FE giữ state local, draft là fire-and-forget
  });
}

export function useSubmitAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: auditApi.submitAudit,
    onSuccess: (_data, vars) => {
      // Invalidate session để reflect trạng thái completed + read-only
      qc.invalidateQueries({ queryKey: ["audit-session", vars.assignmentId] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
  });
}
```

## Verification

```bash
npm run typecheck
```

Phải pass 0 errors trước khi sang phase tiếp theo.
