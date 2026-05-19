# Phase 4 — Action Plan List

**Effort:** 20m | **Depends on:** Phase 1

## File sửa: `src/app/(dashboard)/qc/action-plans/page.tsx`

## Metric cards (4)

- **Tổng AP** — `plans.length`
- **Nháp / Bị từ chối** — `draft + rejected`
- **Đang chờ duyệt** — `submitted`
- **Đã đóng** — `closed`

## Filter tabs

Row of 5 buttons: `Tất cả | Nháp | Đã nộp | Bị từ chối | Đã đóng`  
→ update `?status=...` query hoặc client-side filter trên data đã load.

## Columns

| Header | Cell |
|--------|------|
| Cửa hàng | `store.name` / `store.code` |
| Bài kiểm tra | `audit.checklist.name` + date |
| Điểm audit | `ScoreBadge score={audit.finalScore}` |
| Trạng thái | `StatusBadge status={ap.status}` |
| Người kiểm tra | `audit.auditor.fullName` |
| Ngày nộp bài | `formatDate(audit.submittedAt)` |

## Code pattern

```tsx
const [statusFilter, setStatusFilter] = useState<ActionPlanStatus | undefined>();
const { data: plans = [], isLoading } = useActionPlans(statusFilter);
```

BE trả full array theo scope role — không cần pagination.

## Verification

- `npm run typecheck`
