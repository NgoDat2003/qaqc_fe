# BUILD PLAN — QA/QC Frontend
> Vertical Slice approach. Mỗi slice = 1 user flow hoàn chỉnh.
> Mỗi micro-task = code + test ngay. Không để nợ test.

---

## Micro 0 — Testing Infrastructure (làm TRƯỚC tất cả)
- [ ] Cài Vitest + @testing-library/react + @testing-library/user-event
- [ ] Cài MSW (Mock Service Worker) — mock API trong test
- [ ] Cài Playwright — E2E testing
- [ ] Config `vitest.config.ts`
- [ ] Config `playwright.config.ts`
- [ ] Viết 1 test dummy để verify setup chạy được
- [ ] Thêm scripts: `npm run test`, `npm run test:e2e`

---

## Slice 1 — Auth Shell
> Login → Dashboard → Logout

### Micro 1.1: Auth API + Hooks
- [ ] `src/features/auth/api/auth.api.ts` — login(), me(), logout()
- [ ] `src/features/auth/hooks/use-login.ts`
- [ ] `src/features/auth/hooks/use-me.ts`
- [ ] **Test:** mock API, verify hook trả đúng user + roles

### Micro 1.2: Login Page
- [ ] `src/app/(auth)/login/page.tsx` — form email + password
- [ ] **Test RTL:** fill form → submit → gọi useLogin
- [ ] **Test RTL:** sai password → hiện error message

### Micro 1.3: Dashboard Shell
- [ ] `src/app/(dashboard)/layout.tsx` — sidebar + header
- [ ] Sidebar render đúng menu theo role
- [ ] **Test RTL:** QAM thấy menu khác QC

### Playwright E2E (sau khi 3 micro xong):
- [ ] Login → vào dashboard → logout → redirect login

---

## Slice 2 — CA Setup (prerequisite cho mọi thứ)
> Admin tạo users, brands, stores, gán roles

### Micro 2.1: Master Data API + Hooks (parallel được)
- [ ] `src/features/master-data/api/master.api.ts`
- [ ] `use-brands.ts` + `use-stores.ts` + `use-users.ts`
- [ ] **Test:** mock API, verify hooks

### Micro 2.2 + 2.3 + 2.4 (parallel — 3 subagents):
- [ ] **Agent A:** Brand page + BrandDrawer + tests
- [ ] **Agent B:** Store page + StoreDrawer + tests
- [ ] **Agent C:** User page + UserDrawer + role assignment + tests

### Playwright E2E:
- [ ] Login CA → tạo brand → tạo store → tạo user QC → gán role

---

## Slice 3 — QAM Setup: Criteria & Checklist
> QAM tạo thư viện tiêu chí → build checklist → publish

### Micro 3.1: Criteria API + Hooks
- [ ] `use-criteria-groups.ts` + `use-criteria.ts`
- [ ] **Test:** hooks

### Micro 3.2 + 3.3 (parallel):
- [ ] **Agent A:** Criteria groups page + weight editor + tests
- [ ] **Agent B:** Criteria library page + CriteriaDrawer + tests

### Micro 3.4: Checklist Builder
- [ ] `use-checklists.ts` + `use-checklist-detail.ts`
- [ ] Checklist list page
- [ ] Checklist builder (sections + items + reorder)
- [ ] Publish button + confirm
- [ ] **Test RTL:** add section → add item → publish flow

### Playwright E2E:
- [ ] Login QAM → tạo criteria → tạo checklist → publish

---

## Slice 4 — QAM Planning: Audit Plan
> QAM tạo kế hoạch → chọn checklist → gán QC → đặt ngày

### Micro 4.1: Audit Plan API + Hooks
- [ ] `use-audit-plans.ts`
- [ ] **Test:** hooks

### Micro 4.2: Audit Plans Page + Create Wizard
- [ ] AuditPlans list page
- [ ] 3-step create sheet: Plan info → Store assignment → Review
- [ ] **Test RTL:** step 1 → 2 → 3 → submit

### Playwright E2E:
- [ ] Login QAM → tạo audit plan → gán QC vào store

---

## Slice 5 — QC Execute Audit ⭐ (quan trọng nhất)
> QC xem assignment → điền bài → upload ảnh → submit → xem điểm

### Micro 5.1: Execution API + Hooks
- [ ] `use-my-audits.ts` + `use-audit-execute.ts`
- [ ] **Test:** draft state management, violation accumulation

### Micro 5.2: My Audits List
- [ ] `/operations/my-audits/page.tsx`
- [ ] **Test RTL:** hiển thị assignments, click vào execute

### Micro 5.3: Execute Page (mobile-first)
- [ ] Section tab bar [C][H][E][P]
- [ ] CriteriaItemCard: số lỗi +/-, lỗi lặp, flag CCP/RISK
- [ ] EvidenceUploader: camera, preview, remove
- [ ] Sticky submit bar
- [ ] Submit confirm dialog
- [ ] **Test RTL:** điền số lỗi → auto CCP ở lần 4 → submit

### Playwright E2E:
- [ ] Login QC → vào My Audits → thực hiện audit → submit → xem điểm

---

## Slice 6 — Post-Audit: Results + Action Plan
> Xem kết quả → SM tạo AP → QAM review → close

### Micro 6.1 + 6.2 (parallel):
- [ ] **Agent A:** Audit result detail (score breakdown, violations, ảnh)
- [ ] **Agent B:** Action Plan CRUD (SM create, QAM close)

### Playwright E2E:
- [ ] Login SM → xem kết quả → tạo AP → Login QAM → close AP

---

## Slice 7 — Dashboard & Reports
> KPI cards, charts, export

### Micro 7.1: Dashboard API + Hooks
- [ ] `use-dashboard-stats.ts`

### Micro 7.2 + 7.3 (parallel):
- [ ] **Agent A:** Dashboard page (KPI cards, charts)
- [ ] **Agent B:** Reports page + export Excel

### Playwright E2E:
- [ ] Login EV → xem dashboard → filter by brand

---

## Workflow cho mỗi Slice

```
1. Plan Mode bật → đọc slice, plan micro-tasks
2. Tắt Plan Mode → implement micro 1 (prerequisite)
3. Parallel: spawn subagents cho micro độc lập
4. Sau mỗi micro: npm run test → phải PASS
5. Sau slice: npm run test:e2e → PASS
6. git commit + push
7. CHANGELOG.md + DECISION_LOG.md update
8. /check để verify typecheck + lint
```

## Tech Stack Testing
- **Unit/Hook:** Vitest + MSW
- **Component:** @testing-library/react + userEvent
- **E2E:** Playwright
- **Ad-hoc UI:** gstack (/qa-only)
