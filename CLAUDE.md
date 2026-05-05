# Maycha QA/QC — Frontend

## Stack
- Framework: Next.js 16 (App Router), React 19, TypeScript strict
- UI: shadcn/ui + Radix, Tailwind v4, Lucide icons
- State: Zustand (auth, ui), TanStack Query v5 (server state)
- Form: React Hook Form + Zod
- Toast: Sonner
- Port: 3001

## Commands
- Dev: `npm run dev` (port 3001)
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Check all: `npm run check`

## Backend
- BE chạy ở port 3000 (`qaqc-be`)
- Auth: JWT httpOnly cookie tên `qo_token`
- Env: `NEXT_PUBLIC_BE_URL=http://localhost:3000`

## Architecture
- Routes: App Router, `src/app/(auth)/` và `src/app/(dashboard)/`
- Features: `src/features/<tên>/` — mỗi feature có `api/`, `hooks/`, `components/`
- Shared types: `src/shared/types/index.ts` — source of truth
- API calls: chỉ qua `src/lib/api-client.ts`, không dùng fetch trực tiếp
- Upload: chỉ qua `src/shared/api/upload.api.ts`, không dùng apiClient.post

## Conventions bắt buộc
- No `any` — dùng type cụ thể hoặc `unknown`
- Named exports, PascalCase component, camelCase utils
- Client component: thêm `"use client"` khi cần useState/onClick/useEffect
- Server component: default (không cần declare)
- Commit: conventional commits (feat/fix/chore/refactor)

## Git workflow
- Claude chỉ được `git add` + `git commit` — KHÔNG tự push
- Sau khi commit → báo cho user review → user tự push

## Autonomous agent rules (quan trọng khi chạy overnight)
- Subagent CHỈ được tạo/sửa file trong scope được giao — KHÔNG chạm file ngoài
- Không sửa `src/shared/types/index.ts` — types đã đủ, chỉ đọc
- Không sửa `src/lib/api-client.ts` — đã hoàn chỉnh
- Không sửa `src/stores/` — đã hoàn chỉnh
- Nếu TypeScript error không fix được sau 2 lần → ghi vào docs/OVERNIGHT_REPORT.md và skip
- Mỗi task: viết test TRƯỚC → build code → npm run test → PASS mới commit
- Không commit khi có test fail

## Không được đụng vào
- `src/shared/types/index.ts` — chỉ thêm, không xóa/đổi tên field có sẵn
- `src/lib/api-client.ts` — không thay đổi core logic
- `.env.local` — không commit

## Key files
- Types: `src/shared/types/index.ts`
- API client: `src/lib/api-client.ts`
- Auth store: `src/stores/auth.store.ts`
- Scoring logic: `src/lib/scoring.ts`
- Route protection: `src/middleware.ts`

## Business context
QA/QC platform cho MayCha (130+ cửa hàng trà sữa).
6 roles: company_admin, qa_manager, qc_auditor, am, store_manager, executive_viewer.
Luồng: QAM tạo checklist → lập kế hoạch → QC audit tại quán → submit → SM tạo action plan → QAM close.
Scoring: C(30%) + H(15%) + P(15%) + E(40%). CCP → nhóm = 0. RISK → toàn bài = 0.

## API Contract
@../docs/api-contract.md

## Build plan
@docs/BUILD_PLAN.md
