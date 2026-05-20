---
title: "Fix tab RISK trong QC Audit Execution"
description: "BE trả về riskCriteria riêng ngoài checklist.sections, FE chưa có field này trong AuditSession type và chưa truyền vào buildVirtualSections"
status: pending
priority: P1
effort: 30m
branch: codex/ui-foundation-qc-assignments-pilot
tags: [qc, audit-execution, risk, bug]
created: 2026-05-20
blockedBy: []
blocks: []
---

# Fix tab RISK trong QC Audit Execution

## Root Cause

BE `mapAuditSession()` (audit.ts:244) trả về:
```json
{
  "assignment": {...},
  "checklist": { "sections": [...] },
  "riskCriteria": [ { id, code, name, content, flag:"risk", ... } ],
  "audit": {...}
}
```

`riskCriteria` là array các criteria flag=risk **nằm ngoài `checklist.sections`** — vì RISK criteria không thuộc nhóm nào.

FE `AuditSession` interface **không có `riskCriteria` field** → bị bỏ qua khi parse response.

`buildVirtualSections(session.checklist.sections)` chỉ quét sections → `riskItems = []` → tab RISK không xuất hiện.

## Files thay đổi

### 1. `src/shared/types/index.ts`

Thêm `riskCriteria` vào `AuditSession`:
```typescript
export interface AuditSession {
  assignment: { ... };
  checklist: ChecklistDetail;
  riskCriteria: Array<{          // ← thêm
    id: string;
    code: string;
    name: string;
    content: string;
    flag: "risk";
    deductionPerError: number;
    maxDeduction: number;
    isActive: boolean;
    group: null;
  }>;
  audit: { ... } | null;
}
```

### 2. `src/app/(dashboard)/qc/audits/[assignmentId]/_lib/build-virtual-sections.ts`

Thêm param `riskCriteria` và inject vào virtual RISK tab:
```typescript
export function buildVirtualSections(
  sections: ChecklistSection[],
  riskCriteria: RiskCriteriaItem[] = []   // ← thêm
): VirtualSection[] {
  // ... regular + ccp như cũ ...

  // RISK tab: từ riskCriteria param thay vì scan sections
  const riskItems = riskCriteria.map((c) => ({
    id: `risk-item-${c.id}`,
    sectionId: "virtual:risk",
    criteriaId: c.id,
    criteria: c,
    order: 0,
  } as ChecklistSectionItem));

  if (riskItems.length > 0) {
    virtuals.push({ kind: "risk", id: "virtual:risk", label: `RISK (${riskItems.length})`, tone: "warning", items: riskItems });
  }
}
```

### 3. `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx`

Truyền `session.riskCriteria` vào `buildVirtualSections`:
```typescript
const vSections = useMemo(
  () => session ? buildVirtualSections(session.checklist.sections, session.riskCriteria) : [],
  [session]
);
```

## Implementation steps

1. `shared/types/index.ts` — thêm `riskCriteria` field vào `AuditSession`
2. `build-virtual-sections.ts` — thêm param + dùng `riskCriteria` thay vì scan sections
3. `page.tsx` — truyền `session.riskCriteria`
4. `npm run typecheck`

## Không làm

- Không sửa BE
- Không đổi `CriteriaItemCard` — nó nhận `ChecklistSectionItem` với `criteria` object, sẽ hoạt động đúng
- Không sửa tab CCP — CCP vẫn nằm trong sections, đúng rồi

## Verification

1. typecheck pass
2. Mở trang QC audit có RISK criteria → tab "RISK (N)" xuất hiện
3. Click tab RISK → hiển thị đúng criteria card
