---
title: "QC role UI overhaul — routing, sidebar, execute page, criteria card, evidence"
description: "Sửa redirect/sidebar cho QC; làm lại UI trang execute audit với store info, tab CCP/RISK, indicator lưu nháp, camera capture"
status: pending
priority: P1
effort: 2h15m
branch: feat/qc-audit-execution
tags: [qc, audit-execution, ui, sidebar, routing]
created: 2026-05-19
---

# QC Role UI Overhaul

## Mục tiêu
Hoàn thiện trải nghiệm QC sau khi đã có flow execute audit cơ bản:
1. QC login đúng route (`/qc/my-assignments`), không sang `/master-data`.
2. Sidebar QC hiển thị đầy đủ menu thực tế cần dùng.
3. Execute page có hierarchy rõ ràng, hiển thị đủ context cửa hàng + progress.
4. Tách CCP / RISK ra tab riêng, criteria thường vẫn theo section.
5. Auto-save nháp có status indicator để QC tin tưởng.
6. Card criteria gọn, có label rõ "Nguyên nhân", badge "Lần N".
7. Evidence upload hỗ trợ chụp camera trực tiếp + chọn từ thư viện.

## Nguyên tắc
- YAGNI/KISS: chỉ thêm UI thực sự dùng — không build chart, dashboard QC chưa cần.
- DRY: tái sử dụng `PageHeader`, `StatusBadge`, `ScoreBadge`, `MetricCard`.
- File ≤ 200 dòng. Named exports. CSS variables (`--primary`, `--warning`, `--destructive`, `--success`).
- Không tạo file `*.enhanced.tsx` — sửa trực tiếp file hiện tại.
- Backend API hiện tại đã sẵn sàng (`/audits/draft`, `/audits/submit`, `/audits/assignments/:id`, `/audits/assignments/:id/history`). Không sửa BE.

## Phase list

| # | Tên | Effort | Phụ thuộc |
|---|-----|--------|-----------|
| 01 | Fix QC routing & sidebar | 20m | — |
| 02 | Execute page layout overhaul | 45m | 01 |
| 03 | Criteria tabs CCP/RISK + repeat badge + note label | 40m | 02 |
| 04 | Evidence uploader — camera + gallery | 15m | 03 |
| 05 | Draft save status indicator | 15m | 02 |

**Total effort:** ~2h15m

## Phase files
- [phase-01-fix-qc-routing-and-sidebar.md](./phase-01-fix-qc-routing-and-sidebar.md)
- [phase-02-execute-page-layout-overhaul.md](./phase-02-execute-page-layout-overhaul.md)
- [phase-03-criteria-tabs-ccp-risk.md](./phase-03-criteria-tabs-ccp-risk.md)
- [phase-04-evidence-uploader-camera.md](./phase-04-evidence-uploader-camera.md)
- [phase-05-draft-save-indicator.md](./phase-05-draft-save-indicator.md)

## Tổng số files động chạm (dự kiến)
- `src/app/(dashboard)/dashboard/page.tsx` — redirect theo role
- `src/features/auth/components/login-form.tsx` — redirect theo role
- `src/shared/components/app-sidebar.tsx` — menu QC + header link
- `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx` — layout chính
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/section-tab-bar.tsx` — thêm CCP/RISK tab
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/criteria-item-card.tsx` — note label, repeat badge
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/evidence-uploader.tsx` — camera/gallery split
- New: `src/app/(dashboard)/qc/audits/[assignmentId]/_components/audit-header.tsx`
- New: `src/app/(dashboard)/qc/audits/[assignmentId]/_components/draft-status.tsx`
- New: `src/app/(dashboard)/qc/audits/[assignmentId]/_lib/build-virtual-sections.ts`
- New: `src/app/(dashboard)/qc/audits/[assignmentId]/_lib/derive-progress.ts`

## Validation cuối plan
- `npm run typecheck` pass
- `npm run lint` pass
- Manual test 6 role login → đúng landing page
- Test execute audit happy-path trên Chrome desktop + mobile DevTools

## Unresolved questions
- (1) Route "Kết quả kiểm tra" và "Action Plan (read-only)" cho QC: yêu cầu nêu cần có trong sidebar, nhưng page chưa tồn tại. Đề xuất Phase 01 chỉ add nav item link tới page placeholder hoặc bỏ menu này nếu chưa có yêu cầu page. → cần confirm: build placeholder hay defer?
- (2) "Dashboard QC-specific" — nội dung cụ thể (tổng audit tháng, % đạt…) chưa có spec. Đề xuất defer ngoài plan này, giữ "Lịch kiểm tra" làm landing.
- (3) Trên iOS Safari, `capture="environment"` chỉ open camera nếu user-gesture trên `<input>`. Cách triển khai 2 nút (camera vs gallery) sẽ chuẩn cross-platform — confirm OK.
