# BUILD PLAN — QA/QC Frontend
> Vertical Slice. Mỗi micro = code + test đầy đủ boundary. Không để nợ test.
> TDD: viết test trước → build code → test pass → commit.

---

## Micro 0 — Testing Infrastructure ✅ DONE
- [x] Vitest + RTL + MSW + Playwright
- [x] vitest.config.ts + playwright.config.ts
- [x] setup.ts + msw-server.ts + test-utils.tsx
- [x] e2e/helpers/ + e2e/gstack/
- [x] npm scripts: test, test:watch, test:e2e, test:e2e:headed, test:e2e:ui

---

## Slice 1 — Auth Shell
> Login → Dashboard → Logout

### Micro 1.1: Auth API + Hooks
**Code:**
- [ ] `src/features/auth/api/auth.api.ts` — login(), me(), logout()
- [ ] `src/features/auth/hooks/use-login.ts`
- [ ] `src/features/auth/hooks/use-me.ts`
- [ ] `src/features/auth/index.ts`

**Unit Tests** `use-login.test.ts` ✅ đã viết:
- [x] Login thành công → trả user + roles
- [x] Sai password → error message đúng
- [x] Email không tồn tại → 401
- [x] Server 500 → handle không crash
- [x] Network timeout → handle
- [x] isPending = true khi đang call

**Unit Tests** `use-me.test.ts`:
- [ ] Trả về user hiện tại khi có session
- [ ] Trả về null khi chưa login (401)
- [ ] Redirect /login khi 401

### Micro 1.2: Login Page
**Code:**
- [ ] `src/features/auth/components/login-form.tsx`
- [ ] `src/app/(auth)/login/page.tsx`

**Component Tests** `login-form.test.tsx` ✅ đã viết:
- [x] Render đủ email, password, submit button
- [x] Submit rỗng → error tại field (2 fields)
- [x] Email sai format → error
- [x] Password < 6 ký tự → error
- [x] Loading → button disabled
- [x] Success → redirect /dashboard
- [x] Sai password → error trong form, không redirect
- [x] Server 500 → không crash
- [x] Enter key submit
- [x] Tab navigation đúng thứ tự

### Micro 1.3: Dashboard Shell
**Code:**
- [ ] `src/components/app-sidebar.tsx`
- [ ] `src/components/app-header.tsx`
- [ ] `src/app/(dashboard)/layout.tsx`

**Component Tests** `app-sidebar.test.tsx`:
- [ ] CA thấy: Master Data menu
- [ ] QAM thấy: Criteria, Checklists, Audit Plans, Results, Action Plans, Reports
- [ ] QC thấy: My Audits (chỉ vậy thôi)
- [ ] SM thấy: Results, Action Plans
- [ ] AM thấy: Results, Action Plans, Dashboard
- [ ] EV thấy: Dashboard, Reports
- [ ] Không thấy menu không thuộc role của mình

**E2E** `slice-1-auth.spec.ts` ✅ đã viết:
- [x] Login QAM → dashboard → sidebar đúng menu → logout → /login
- [x] Sai password → error, không redirect
- [x] Email không tồn tại
- [x] Submit rỗng → validation tại field
- [x] Email sai format
- [x] Password < 6 ký tự
- [x] Double-submit protection
- [x] Truy cập /dashboard khi chưa login → /login
- [x] Cookie expiry → /login
- [x] XSS trong email field → không execute
- [ ] QC truy cập /master-data → forbidden
- [ ] EV truy cập /operations/audit-plans → forbidden

---

## Slice 2 — CA Setup
> CA tạo brand, store, user, gán roles

### Micro 2.1: Master Data API + Hooks
**Code:**
- [ ] `src/features/master-data/api/master.api.ts`
- [ ] `use-brands.ts` + `use-stores.ts` + `use-users.ts`

**Unit Tests** `use-brands.test.ts`, `use-stores.test.ts`, `use-users.test.ts`:
- [ ] GET list → trả đúng array
- [ ] GET list khi empty → trả []
- [ ] GET list khi 500 → error
- [ ] POST create → invalidate cache, list tự refresh
- [ ] POST create với data thiếu field → validation error
- [ ] PATCH update → item trong list tự update
- [ ] Toggle active/inactive → state đổi

### Micro 2.2: Brand Management (Agent A)
**Code:**
- [ ] `src/features/master-data/components/brand-drawer.tsx`
- [ ] `src/app/(dashboard)/master-data/brands/page.tsx`

**Component Tests** `brand-drawer.test.tsx`:
- [ ] Render form tạo mới khi không có brand prop
- [ ] Render form sửa với data đã điền khi có brand prop
- [ ] Submit thiếu tên → validation error tại field
- [ ] Submit thiếu code → validation error
- [ ] Code trùng → API error hiện trong form
- [ ] Submit thành công → drawer đóng + list refresh
- [ ] API fail → drawer giữ nguyên + error message
- [ ] Cancel → không call API
- [ ] Loading state khi submit

**Component Tests** `brand-page.test.tsx`:
- [ ] Hiển thị list brands
- [ ] Skeleton loading khi đang fetch
- [ ] Empty state khi không có brand
- [ ] Search filter hoạt động
- [ ] Click "Tạo brand" → mở drawer
- [ ] Click brand row → mở drawer sửa

### Micro 2.3: Store Management (Agent B)
**Code:**
- [ ] `src/features/master-data/components/store-drawer.tsx`
- [ ] `src/app/(dashboard)/master-data/stores/page.tsx`

**Component Tests** `store-drawer.test.tsx`:
- [ ] Form tạo mới: đủ fields (name, code, brand, region, address)
- [ ] Brand dropdown load từ API
- [ ] Submit thiếu brand → error
- [ ] Submit thiếu name/code → error
- [ ] Store code trùng → API error trong form
- [ ] Gán AM: dropdown load users có role AM
- [ ] Gán SM: dropdown load users có role SM
- [ ] Submit thành công → đóng + refresh

**Component Tests** `store-page.test.tsx`:
- [ ] Table có columns: code, name, brand, region, AM, SM, status
- [ ] Filter theo brand hoạt động
- [ ] Filter theo status (active/inactive) hoạt động
- [ ] Search theo tên/code
- [ ] Toggle active/inactive → row cập nhật

### Micro 2.4: User Management (Agent C)
**Code:**
- [ ] `src/features/master-data/components/user-drawer.tsx`
- [ ] `src/app/(dashboard)/master-data/users/page.tsx`

**Component Tests** `user-drawer.test.tsx`:
- [ ] Tạo user: email, fullName, password, roles
- [ ] Email trùng → error trong form
- [ ] Password < 6 ký tự → error
- [ ] Gán roles: checkbox cho từng role
- [ ] Role cần store scope (SM/AM) → hiện dropdown chọn store
- [ ] Update user: không edit password (optional)
- [ ] Deactivate user → xác nhận trước
- [ ] Admin tự deactivate mình → blocked

**E2E** `slice-2-ca-setup.spec.ts`:
- [ ] Login CA → tạo brand → brand xuất hiện trong list
- [ ] Tạo store → gán brand + AM + SM
- [ ] Tạo user QC → gán role
- [ ] Tạo user với email trùng → error
- [ ] Deactivate user → không login được nữa
- [ ] CA không thấy menu Operations

---

## Slice 3 — QAM Setup: Criteria & Checklist
> QAM tạo thư viện tiêu chí → build checklist → publish

### Micro 3.1: Criteria API + Hooks
**Code:**
- [ ] `src/features/criteria/api/criteria.api.ts`
- [ ] `use-criteria-groups.ts` + `use-criteria.ts`

**Unit Tests:**
- [ ] getCriteriaGroups → 4 groups C/H/E/P
- [ ] getCriteria với filter group
- [ ] createCriteria → invalidate cache
- [ ] updateCriteria với flag CCP/RISK/none
- [ ] Weight tổng 4 groups phải = 100% validation

### Micro 3.2: Criteria Groups Page
**Code:**
- [ ] `src/app/(dashboard)/operations/criteria/groups/page.tsx`

**Component Tests:**
- [ ] 4 cards C/H/E/P hiển thị
- [ ] Weight input cho mỗi group
- [ ] Tổng weight < 100% → warning
- [ ] Tổng weight > 100% → error, không lưu
- [ ] Tổng weight = 100% → save OK

### Micro 3.3: Criteria Library Page
**Code:**
- [ ] `src/features/criteria/components/criteria-drawer.tsx`
- [ ] `src/app/(dashboard)/operations/criteria/page.tsx`

**Component Tests** `criteria-drawer.test.tsx`:
- [ ] Form: code, content, deductionPerError, maxDeduction, flag
- [ ] maxDeduction phải ≥ deductionPerError
- [ ] Flag CCP → hiện warning về business impact
- [ ] Flag RISK → hiện warning nghiêm trọng hơn
- [ ] Submit thiếu content → error
- [ ] Code trùng → error trong form

### Micro 3.4: Checklist Builder
**Code:**
- [ ] `src/features/checklist/api/checklist.api.ts`
- [ ] `use-checklists.ts` + `use-checklist-detail.ts`
- [ ] `src/features/checklist/components/section-editor.tsx`
- [ ] `src/app/(dashboard)/operations/checklists/page.tsx`
- [ ] `src/app/(dashboard)/operations/checklists/[id]/page.tsx`

**Component Tests** `section-editor.test.tsx`:
- [ ] Add section → chọn criteria group
- [ ] Section hiển thị items của nó
- [ ] Add item vào section → criteria library dialog
- [ ] Remove item → xác nhận
- [ ] Reorder sections (kéo thả hoặc up/down button)
- [ ] Published checklist → không edit được
- [ ] Publish button → confirm dialog → status = published
- [ ] Publish checklist rỗng (0 sections) → blocked

**E2E** `slice-3-criteria.spec.ts`:
- [ ] Login QAM → tạo criteria C → vào checklist builder
- [ ] Tạo checklist → add section C → add criteria → publish
- [ ] Published checklist không edit được
- [ ] Duplicate checklist → version mới

---

## Slice 4 — QAM Planning: Audit Plan
> QAM tạo kế hoạch → gán QC → đặt ngày

### Micro 4.1: Audit Plan API + Hooks
**Code:**
- [ ] `src/features/audit/api/audit.api.ts` (phần planning)
- [ ] `use-audit-plans.ts`

**Unit Tests:**
- [ ] getAuditPlans → list
- [ ] createAuditPlan với assignments
- [ ] Không chọn checklist → validation error
- [ ] Không có assignment nào → validation error
- [ ] Assignment thiếu auditor → error
- [ ] Assignment thiếu date → error
- [ ] scheduledDate trong quá khứ → error

### Micro 4.2: Audit Plans Page + Create Wizard
**Code:**
- [ ] `src/components/operations/create-plan-sheet.tsx`
- [ ] `src/app/(dashboard)/operations/audit-plans/page.tsx`

**Component Tests** `create-plan-sheet.test.tsx`:
- [ ] Step 1: name rỗng → không qua step 2
- [ ] Step 1: không chọn checklist → không qua step 2
- [ ] Step 1: chỉ hiện checklist đã published
- [ ] Step 2: chọn store → hiện auditor dropdown + date picker
- [ ] Step 2: auditor dropdown chỉ hiện QC auditors
- [ ] Step 2: date phải >= ngày mai
- [ ] Step 2: không chọn auditor cho store → không qua step 3
- [ ] Step 3: review đúng thông tin đã chọn
- [ ] Submit → loading → success toast → sheet đóng

**E2E** `slice-4-planning.spec.ts`:
- [ ] Login QAM → tạo plan → gán QC vào 2 stores
- [ ] Plan xuất hiện trong list với status "Open"
- [ ] Click vào plan → xem assignments
- [ ] QAM xem được plan, QC không thấy menu này

---

## Slice 5 — QC Execute Audit ⭐ QUAN TRỌNG NHẤT
> QC xem assignment → điền bài → submit → xem điểm

### Micro 5.1: Execution API + Hooks
**Code:**
- [ ] `src/features/audit/api/audit.api.ts` (phần execution)
- [ ] `use-my-audits.ts`
- [ ] `use-audit-execute.ts` (local draft state)

**Unit Tests** `use-audit-execute.test.ts`:
- [ ] Khởi tạo: tất cả criteria = 0 errors
- [ ] setErrors(criteriaId, 3) → numErrors = 3
- [ ] setErrors lần 4 cùng criteria → auto flag CCP
- [ ] setErrors lần 5 → reset về 1 (không phải CCP nữa)
- [ ] setFlag RISK → isRiskTriggered = true
- [ ] addEvidence(criteriaId, url) → evidence list append
- [ ] removeEvidence(criteriaId, url) → xóa khỏi list
- [ ] getProgress() → % criteria đã điền
- [ ] hasErrors() → true nếu có ít nhất 1 criteria có lỗi
- [ ] validate() → false nếu có lỗi nhưng thiếu evidence

**Unit Tests** `use-my-audits.test.ts`:
- [ ] Chỉ trả về assignments của QC hiện tại
- [ ] Filter: pending, in_progress, completed
- [ ] Empty khi không có assignment

### Micro 5.2: My Audits List
**Code:**
- [ ] `src/app/(dashboard)/operations/my-audits/page.tsx`

**Component Tests:**
- [ ] Hiển thị cards assignments
- [ ] Status badge đúng màu: pending(gray), in_progress(yellow), completed(green)
- [ ] Completed assignments: không có nút "Bắt đầu"
- [ ] Empty state: icon + message + không có blank white

### Micro 5.3: Execute Page (Mobile-first)
**Code:**
- [ ] `src/features/audit/components/execution/criteria-input-card.tsx`
- [ ] `src/features/audit/components/execution/evidence-uploader.tsx`
- [ ] `src/features/audit/components/execution/submit-confirm-dialog.tsx`
- [ ] `src/app/(dashboard)/operations/audits/[id]/execute/page.tsx`

**Component Tests** `criteria-input-card.test.tsx`:
- [ ] Render: tên criteria, deduction/error, Dmax
- [ ] Click + → numErrors tăng 1
- [ ] Click - → numErrors giảm 1 (không về âm)
- [ ] numErrors = 0 → - button disabled
- [ ] repeatCount lên 4 → CCP badge hiện tự động
- [ ] CCP badge có màu đỏ nổi bật
- [ ] RISK flag → hiện RISK badge warning
- [ ] Có lỗi → bắt buộc có note hoặc evidence (validation)

**Component Tests** `evidence-uploader.test.tsx`:
- [ ] Click upload → file input mở
- [ ] Upload ảnh → thumbnail preview
- [ ] Remove ảnh → xóa khỏi list
- [ ] Max 5 ảnh → upload button ẩn
- [ ] Upload file không phải image → rejected

**Component Tests** `submit-confirm-dialog.test.tsx`:
- [ ] Hiện tổng số lỗi trước khi confirm
- [ ] CCP: hiện cảnh báo nhóm về 0
- [ ] RISK: hiện cảnh báo toàn bài về 0
- [ ] Confirm → gọi submitAudit
- [ ] Cancel → dialog đóng, không submit

**E2E** `slice-5-execute.spec.ts` ✅ skeleton đã viết:
- [ ] Login QC → My Audits → thực hiện audit → submit → xem điểm
- [ ] Lỗi lặp lần 4 → CCP tự hiện
- [ ] RISK → toàn bài = 0
- [ ] Submit thiếu evidence → blocked
- [ ] Mobile: touch target 44px, section scroll ngang

---

## Slice 6 — Post-Audit: Results + Action Plan
> Audit result → SM tạo AP → QAM close

### Micro 6.1: Audit Results
**Code:**
- [ ] `use-audits.ts` + `use-audit-detail.ts`
- [ ] `src/features/audit/components/result/score-summary.tsx`
- [ ] `src/features/audit/components/result/violation-list.tsx`
- [ ] `src/app/(dashboard)/operations/audits/[id]/page.tsx`

**Component Tests** `score-summary.test.tsx`:
- [ ] Hiển thị finalScore nổi bật
- [ ] Grade badge đúng màu (excellent=xanh, fail=đỏ, alarm=đỏ đậm)
- [ ] 4 group bars C/H/E/P với % score
- [ ] CCP group → group bar = 0, hiện CCP indicator
- [ ] RISK → finalScore = 0, hiện RISK warning lớn

**Component Tests** `violation-list.test.tsx`:
- [ ] Mỗi violation: criteria name, numErrors, note, ảnh
- [ ] Click ảnh → lightbox mở
- [ ] Empty (không có lỗi) → "Không có lỗi nào"
- [ ] CCP violation → highlighted khác với lỗi thường

### Micro 6.2: Action Plan
**Code:**
- [ ] `src/features/action-plan/components/ap-form.tsx`
- [ ] `src/features/action-plan/components/ap-review-panel.tsx`
- [ ] `src/app/(dashboard)/operations/action-plan/[id]/page.tsx`

**Component Tests** `ap-form.test.tsx` (SM view):
- [ ] Hiển thị danh sách lỗi từ audit (readonly)
- [ ] Nhập remediation text (bắt buộc)
- [ ] Set deadline (bắt buộc, phải trong tương lai)
- [ ] Upload ảnh khắc phục (optional)
- [ ] Submit thiếu remediation → error
- [ ] Submit thiếu deadline → error
- [ ] Deadline trong quá khứ → error
- [ ] Submit thành công → status = submitted

**Component Tests** `ap-review-panel.test.tsx` (QAM view):
- [ ] Xem remediation + ảnh SM upload
- [ ] Close AP button hiện với QAM
- [ ] Close AP → confirm dialog
- [ ] Confirm close → status = closed
- [ ] SM không thấy Close button
- [ ] Closed AP → không edit được

**E2E** `slice-6-results.spec.ts`:
- [ ] Login SM → xem kết quả → tạo AP → submit
- [ ] Login QAM → review AP → close
- [ ] Closed AP không thể mở lại

---

## Slice 7 — Dashboard & Reports
> KPI, charts, export

### Micro 7.1: Dashboard API + Hooks
**Unit Tests:**
- [ ] getDashboardStats → KPI numbers
- [ ] Filter by brand → chỉ trả data của brand đó
- [ ] Filter by date range → đúng khoảng
- [ ] EV không thấy store-level detail

### Micro 7.2: Dashboard Page
**Component Tests:**
- [ ] KPI cards: total audits, avg score, % đạt, AP đang mở
- [ ] Score = 0 khi chưa có audit nào
- [ ] Chart render đúng data
- [ ] Filter brand → chart update

### Micro 7.3: Reports Page
**Component Tests:**
- [ ] Table có: store, date, QC, score, grade, AP status
- [ ] Sort theo score
- [ ] Filter: grade, date range, store
- [ ] Export Excel button → chỉ QAM thấy
- [ ] EV không thấy export button

**E2E** `slice-7-dashboard.spec.ts`:
- [ ] Login QAM → dashboard → filter brand → charts update
- [ ] Login EV → dashboard → không có export button
- [ ] Login AM → chỉ thấy data khu vực của mình

---

## Workflow chuẩn mỗi Micro

```
1. Viết test file TRƯỚC (TDD)
2. Run test → FAIL (expected — chưa có code)
3. Build code
4. Run test → PASS
5. npm run typecheck → clean
6. git add + commit
7. Sau slice: npm run test:e2e:headed (xem browser tự chạy)
```

## Parallel subagent pattern (dùng từ Slice 2)

```
Sau khi Micro X.1 (hooks) xong:
Spawn 3 subagents song song:
  Agent A: [component A] + test
  Agent B: [component B] + test
  Agent C: [component C] + test
→ Chờ cả 3 báo PASS → review → commit
```

## Testing tools

| Tool | Layer | Khi nào |
|------|-------|---------|
| Vitest + MSW | Hook/logic | Mỗi micro hook |
| RTL + userEvent | Component UI | Mỗi micro component |
| Playwright headed | Full E2E | Sau mỗi slice |
| gstack | UX ad-hoc | Khi muốn Claude "nhìn" UI |
