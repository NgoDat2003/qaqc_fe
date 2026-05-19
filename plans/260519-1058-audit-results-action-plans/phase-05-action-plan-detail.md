# Phase 5 — Action Plan Detail

**Effort:** 60m | **Depends on:** Phase 1

## Route: `src/app/(dashboard)/qc/action-plans/[id]/page.tsx`

## Layout

```
<APHeader />          ← store, audit info, status, reviewNote nếu rejected
<APItemsList />       ← mỗi violation → 1 item card
<APSubmitBar />       ← SM submit / QAM reject+close (chỉ hiện khi đúng role+status)
```

## Components

### `_components/ap-header.tsx`
- Store name/code + audit date + checklist
- `StatusBadge` lớn cho AP status
- Nếu `rejected`: hiển thị `reviewNote` dạng warning banner
- Back button → `/qc/action-plans`

### `_components/ap-item-card.tsx`

Mỗi item có 2 phần:

**Phần 1 — Lỗi gốc (read-only):**
- Criteria code + content + flag badge
- numErrors + repeatCount + `isCriticalTriggered` chip
- QC note + QC images (thumbnails)

**Phần 2 — Khắc phục (SM edit nếu draft/rejected):**
```tsx
// Fields
<input> rootCause (required)      // "Nguyên nhân"
<input> remediation (required)    // "Hướng khắc phục"  
<input type="date"> fixedAt       // "Ngày đã sửa"
<input> assigneeName              // "Người thực hiện"
<EvidenceUploader />              // remediationImages — bắt buộc nếu critical/risk/auto_CCP
```

**Validation UI:**
- Required fields → border đỏ nếu trống khi user đã tương tác
- Critical/risk items thiếu ảnh → warning badge "Cần ảnh minh chứng"

**Auto-save pattern:**
```tsx
// Debounce 1500ms sau mỗi field change → PATCH /api/action-plans/:id
const { mutate: updateAP } = useUpdateActionPlan();
```

### `_components/ap-submit-bar.tsx`

```tsx
// SM role, status draft|rejected
{isSM && (status === "draft" || status === "rejected") && (
  <Button onClick={handleSubmit} disabled={!allItemsValid}>
    Nộp Action Plan
  </Button>
)}

// QAM role, status submitted
{isQAM && status === "submitted" && (
  <>
    <Button variant="outline" onClick={() => setRejectOpen(true)}>Từ chối</Button>
    <Button onClick={handleClose}>Đóng AP</Button>
  </>
)}
```

### Validation trước khi SM submit

```ts
function validateAllItems(items: ActionPlanItem[]): boolean {
  return items.every(item => {
    const hasRequired = item.rootCause && item.remediation && item.fixedAt && item.assigneeName;
    const needsImage = item.violation.isCriticalTriggered
      || item.violation.isRiskTriggered
      || item.violation.criteria.flag !== "none";
    return hasRequired && (!needsImage || item.remediationImages.length > 0);
  });
}
```

### Reject Dialog (QAM)

```tsx
<Dialog>
  <textarea placeholder="Lý do từ chối (bắt buộc)" value={reviewNote} />
  <Button disabled={!reviewNote.trim()} onClick={handleReject}>Xác nhận từ chối</Button>
</Dialog>
```

## Error handling

| Message | Toast |
|---------|-------|
| `All action plan items must have rootCause...` | Highlight items thiếu field |
| `Critical/risk action plan items require evidence images` | Scroll đến item cần ảnh |
| `Only draft or rejected action plan can be submitted` | Disable submit button |

## Verification

- `npm run typecheck`
- Test SM flow: fill all fields → submit → status → submitted
- Test QAM flow: reject (có reviewNote) → close
- Test validation: submit khi còn item thiếu → lỗi toast + highlight
