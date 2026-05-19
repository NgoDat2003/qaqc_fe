# Phase 3 — Audit Result Detail

**Effort:** 60m | **Depends on:** Phase 1

## Route: `src/app/(dashboard)/qc/results/[id]/page.tsx`

## Layout

```
<AuditResultHeader />         ← store/auditor/checklist info + score + grade + dates
<GroupScoreBreakdown />       ← horizontal bar per group
<ViolationsList />            ← lỗi + ảnh QC
<CorrectionRequestPanel />    ← lịch sử + SM form + QAM approve/reject
<AuditCorrectionForm />       ← QAM edit form (chỉ hiện khi approved & no AP)
```

## Components

### `_components/audit-result-header.tsx`
- Store name/code + auditor + checklist + submitted/edited dates
- Score lớn với `ScoreBadge`
- RISK warning nếu `isRiskTriggered`
- Back button → `/qc/results`

### `_components/group-score-breakdown.tsx`
- Mỗi group: label + progress bar + % + "CCP" badge nếu `triggeredCritical`
- Max deduction highlight nếu 0%

### `_components/violations-list.tsx`
- Mỗi violation: criteria code + content + flag badge + numErrors + repeatCount + note
- Ảnh QC grid (thumbnails)

### `_components/correction-request-panel.tsx`

**Logic hiển thị:**
```ts
const canSMRequest = role === "store_manager"
  && !audit.actionPlan
  && !audit.pendingCorrectionRequest
  && audit.violations.length > 0;

const hasPending = audit.pendingCorrectionRequest != null;
const hasApproved = audit.correctionRequests.some(r => r.status === "approved");
const canQAMCorrect = role === "qa_manager" && hasApproved && !audit.actionPlan;
const canCreateAP = !audit.actionPlan && !hasPending && audit.violations.length > 0;
```

**UI states:**
- `canSMRequest` → Form textarea "Lý do yêu cầu QA xem lại" + submit button
- `hasPending` → Badge "Đang chờ QA review" + QAM: Approve/Reject dialog
- `correctionRequests.length > 0` → History list (date, status, reason, reviewNote)
- `canQAMCorrect` → Show `AuditCorrectionForm`
- `canCreateAP` → Button "Tạo Action Plan" → POST → navigate to AP detail

### `_components/audit-correction-form.tsx`

QAM edit violations sau khi correction request approved:
- Textarea `editNote` (required)
- Per-violation: +/- numErrors + note + EvidenceUploader (reuse từ execute page)
- Submit → `PATCH /api/audits/:id/correction` → refetch detail

## Mutations

```ts
const { mutate: createRequest } = useCreateCorrectionRequest();
const { mutate: approveRequest } = useApproveCorrectionRequest();
const { mutate: rejectRequest } = useRejectCorrectionRequest();
const { mutate: applyCorrection } = useApplyAuditCorrection();
const { mutate: createAP, isPending } = useCreateActionPlan();
```

## Error handling

| Message | Toast |
|---------|-------|
| `Audit already has an action plan` | "Bài đã có Action Plan, không thể sửa" |
| `Audit already has a pending correction request` | "Đã có yêu cầu đang chờ duyệt" |
| `Permission denied` | "Bạn không có quyền thao tác bài này" |

## Verification

- `npm run typecheck`
- Test flow: SM request → QAM approve → QAM edit → QAM create AP → navigate to AP
