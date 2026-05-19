# CHANGELOG — QA/QC Frontend Agent Log

## [0.3.4] - 2026-05-19

### Added
- **Audit Results** — list page (`/audits`) với 4 metric cards + DataTable (score badge, AP status, correction badge)
- **Audit Result Detail** (`/audits/:id`) — redesign hoàn toàn:
  - *Audit Insight Panel*: SVG donut chart điểm số, group bars, 4 stat cards (Risk/CCP/Lỗi lặp/Coverage), verdict badge
  - *Thông tin chung*: store/auditor/checklist/date
  - *Bảng điểm tổng hợp*: table với group rows + CCP(group) rows + RISK row + TỔNG + Result (dùng `scoreBreakdown` từ BE)
  - *Chi tiết các lỗi*: violations list với count badge
  - *Correction Request Panel*: SM yêu cầu sửa → QAM approve/reject → QAM edit correction
- **Action Plans** — list page (`/action-plans`) với filter tabs (Tất cả/Nháp/Đã nộp/Từ chối/Đã đóng) + metric cards
- **Action Plan Detail** (`/action-plans/:id`) — SM edit items (rootCause/remediation/fixedAt/assigneeName/images), auto-save debounce 1.5s, submit/reject/close flow, QAM review panel
- **Notification Bell** — kết nối API (`/api/notifications`, `/api/notifications/unread-count`), badge count, dropdown panel, mark read/all
- **New types**: `AuditResultListItem`, `AuditResultDetail`, `AuditScoreBreakdown`, `AuditDeductionLine`, `CorrectionRequestDto`, `ActionPlanDetail`, `ActionPlanItem`, `NotificationDto`

### Changed
- **URL routing**: `/qc/results` → `/audits` | `/qc/action-plans` → `/action-plans` (neutral cross-role paths)
- **Login routing**: SM/AM/Executive → `/audits` sau khi đăng nhập
- **Sidebar**: SM/AM/Executive/QAM nav items trỏ tới routes mới
- **QC nav**: thêm "Action Plan" (hiển thị graceful empty khi BE chưa cấp quyền)
- **`use-action-plans`**: 403 suppression scoped đúng cho `qc_auditor` only

### Fixed
- Breadcrumb key `"action-plan"` → `"action-plans"` (breadcrumb bị sai text)
- `VerdictBadge` `alarm` grade hiển thị đúng màu warning thay vì destructive
- `CorrectionEditForm` stale state sau khi QAM apply correction (remount via `key`)
- `<Fragment>` key prop trong `audit-score-table.tsx` (React warning)
- `qc_auditor` bị nhầm vào `isSM` trong AP submit bar

## [0.3.3] - 2026-05-19

### Added
- **QC Audit Execution Flow** — full auditor workflow: my-assignments → execute → submit → result
  - `GET /api/audits/assignments/:id` session loading với draft restore
  - `PATCH /api/audits/draft` — auto-save debounced 1500ms với stable mutation ref
  - `POST /api/audits/submit` — submit với score/grade/repeat result panel
  - 409 stale conflict handling → refetch session
- **Virtual CCP/RISK tabs** — criteria với flag `critical`/`risk` tách riêng tab, không hiển thị trùng section gốc
- **Audit Header** — store name + code + status badge + meta strip (plan dates, checklist) + progress bar
- **Draft Status indicator** — "Đang lưu…" / "Đã lưu lúc HH:mm" / "Lỗi lưu nháp" trong header
- **Evidence Upload** — 2 nút riêng: "Chụp ảnh" (camera) + "Chọn ảnh" (gallery), max 5MB, JPEG/PNG/WEBP
- **My Assignments page** — 4 metric cards (Tổng/Chờ/Đang/Hoàn thành) + cột "Cửa sổ audit" + action button
- **Scoring info per criterion** — hiển thị `deductionPerError` và `maxDeduction` trên mỗi card
- **Violation history panel** — expand lịch sử lặp lại theo tiêu chí (date, repeat count, error count, note)
- Stub pages: `qc/results`, `qc/action-plans` với metric cards + EmptyState
- `getLandingPathByRole()` — role-based post-login redirect
- MSW handlers cho 5 audit endpoints + fix `setup.ts` để MSW chạy đúng trong Vitest workers

### Changed
- Login flow: QC → `/qc/my-assignments`, QAM → `/qam/audit-plans`, CA → `/master-data/organization`
- Dashboard redirect: client-side theo role thay vì hard-code
- Sidebar QC nav: thêm "Kết quả kiểm tra" + "Action Plan"
- `upload.api.ts`: endpoint `/upload/evidence` → `/upload/images`, return type `UploadedImage`
- `violations-reducer.ts`: merge `imagePreviews` vào reducer (bỏ parallel `useState`)
- `section-tab-bar.tsx`: nhận `VirtualSection[]` với tone-aware styling
- `criteria-item-card.tsx`: label "Nguyên nhân lỗi", repeat badge chip có màu

### Fixed
- `saveDraftMutation` non-stable ref trong `useCallback` deps → debounce reset mỗi render
- `isRestored.current` không reset khi navigate giữa các assignments
- `am`/`store_manager`/`executive_viewer` redirect về `/qc/results` (sai) → `/master-data/organization`
- Empty regular tabs khi tất cả criteria trong section bị flagged → filter out

## [0.3.2] - 2026-05-15

### Added
- `PaginationControls` shared component — reusable page navigation with ellipsis support
- `buildQS` utility — query string builder for paginated/filtered API requests
- `search` param server-side cho `useStores` — search toàn dataset thay vì client-side filter
- E2E spec `pagination-flow.spec.ts` — validate pagination UI flow

### Changed
- `api-client.ts` — refactor thành axios instance với interceptors; tách `request` (single item) và `listRequest` (paginated)
- Tất cả feature hooks (`useStores`, `useUsers`, `useBrands`, `useChecklists`, `useCriteria`, `useAuditPlans`, `useActionPlans`) — thêm pagination params + `keepPreviousData`
- Organization page — server-side search + pagination; xóa client-side filter
- Types `index.ts` — thêm `ListParams`, `ListResponse`, `AuditPlanSummary`, `ChecklistSummary`
- Hợp nhất Locations page vào Organization page (removed `master-data/locations`)

### Fixed
- Search store chỉ filter trang hiện tại → fix thành server-side search toàn dataset

---

## Current status
Pagination + API contract alignment hoàn thành. Sẵn sàng tiếp tục các Slice còn thiếu.

## Completed
- 2026-05-05: Phase 0 — middleware, stores, api-client, types, layout shell
- 2026-05-05: Phase 0 — lib/format.ts, lib/roles.ts, lib/scoring.ts
- 2026-05-05: Phase 1 — shadcn/ui primitives (20 components)
- 2026-05-05: Phase 1 — grade-badge, confirm-dialog, file-uploader, score-badge
- 2026-05-05: Phase 1 — app-sidebar (role-aware), (auth)/layout, (dashboard)/layout
- 2026-05-05: Fix upload.api.ts — không dùng JSON.stringify(FormData)
- 2026-05-05: Fix BE api-response.ts — thêm response.created() cho 201 status
- 2026-05-05: Fix BE middleware CORS — dùng process.env.CORS_ORIGIN

## Failed approaches
- apiClient.post() để upload file → JSON.stringify(FormData) = empty object
  → Fix: fetch trực tiếp, không set Content-Type header

## Known issues
- Cookie qo_token hết hạn nhưng localStorage vẫn isAuthenticated: true
  → Cần revalidate khi app init bằng GET /api/auth/me
- Checklists page đang dùng mock data, chưa nối API

## Next
- Phase 2: Login page (FR-AUTH)
- Phase 3: Master Data pages


## [0.3.0] - 2026-03-29

### Added
- Multi-URL support for `/clone-website` — clone multiple sites in a single command with parallel processing and isolated output
- CI quality gates via GitHub Actions — automated lint, typecheck, and build on every push and PR
- `npm run typecheck` and `npm run check` scripts for local quality validation
- `.gitattributes` for cross-platform line ending normalization
- `.nvmrc` to pin Node.js 20 for contributor consistency

### Changed
- Streamlined PR template — removed redundant checklist items and screenshots section
- Improved project description and README — clearer use cases, limitations, and modern wording
- Refined documentation and agent rules across all platforms for clarity and consistency
- Fixed CRLF handling in `sync-skills.mjs` for reliable Windows operation

### Removed
- Outdated use case from README documentation

## [0.2.0] - 2026-03-28

### Added
- Multi-platform AI agent support: Claude Code, Codex CLI, OpenCode, GitHub Copilot, Cursor, Windsurf, Gemini CLI, Cline/Roo Code, Continue, Amazon Q, Augment Code, Aider
- Platform-specific instruction files and `/clone-website` skill for each supported agent
- `scripts/sync-agent-rules.sh` to regenerate platform instruction files from AGENTS.md
- `scripts/sync-skills.mjs` to regenerate `/clone-website` skill across all platforms
- GEMINI.md for Gemini CLI configuration
- Supported Platforms table in README
- "Updating for Other Platforms" documentation section in README

### Changed
- README now describes the project as multi-agent (Claude Code recommended, not required)
- AGENTS.md updated with sync script reminders

## [0.1.1] - 2026-03-28

### Added
- Bug report and feature request issue templates
- Pull request template with checklist
- CHANGELOG.md following Keep a Changelog format
- Package.json metadata (description, repository, homepage, keywords, engines)

### Fixed
- LICENSE copyright holder now attributed to JCodesMore

## [0.1.0] - 2026-03-28

### Added
- Initial template scaffold for website reverse-engineering with Claude Code
- `/clone-website` skill for full-site cloning pipeline
- `/build-from-spec` and `/customize` skills
- Parallel builder agents with git worktree isolation
- Chrome MCP integration for design token extraction
- Comprehensive inspection guide and project structure documentation
- Next.js 16 + shadcn/ui + Tailwind CSS v4 base scaffold
- MIT license
- README with badges, demo section, quick start, and star history
