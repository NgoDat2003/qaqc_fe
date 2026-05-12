# Code Standards — Maycha QA/QC Frontend

> Project-specific conventions. Supplement to v2.16 `development-rules.md`.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16, React 19, TypeScript strict |
| UI | shadcn/ui + Radix, Tailwind v4, Lucide icons |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Port | 3001 (FE) / 3000 (BE) |
| Auth | JWT httpOnly cookie `qo_token` |

---

## TypeScript

- **No `any`** — dùng type cụ thể hoặc `unknown` + type guard
- Strict mode bật — không tắt
- **Named exports** — không dùng default export cho components
- PascalCase: components | camelCase: utils, hooks, variables

---

## React / Next.js

- `"use client"` chỉ khi dùng `useState` / `onClick` / `useEffect`
- Server component là default — không cần declare
- **Không dùng `fetch` trực tiếp** — chỉ qua `src/lib/api-client.ts`
- **Upload file** — chỉ qua `src/shared/api/upload.api.ts` (`uploadApi.uploadEvidence`)

---

## State Management

| Loại | Tool |
|---|---|
| Server state (API data) | TanStack Query v5 |
| Client state (UI) | Zustand |
| Form state | React Hook Form + Zod |

---

## Files KHÔNG được sửa

| File | Lý do |
|---|---|
| `src/shared/types/index.ts` | Chỉ THÊM — không xóa/đổi tên field đã có |
| `src/lib/api-client.ts` | Không thay đổi core logic |
| `.env.local` | Không đọc, không commit |

---

## Design & UI

### Component library
- UI: **shadcn/ui + Radix** — dùng component sẵn có trước khi tự viết
- Icons: **Lucide icons** — không dùng thư viện icon khác
- Styling: **Tailwind v4** — không dùng inline style hay CSS module

### Màu sắc theo vai trò
| Dùng cho | CSS variable |
|---|---|
| Brand/primary | `--primary` (gold) |
| Pass/success | `--success` (green) |
| Fail/CCP/error | `--destructive` (red) |
| Warning/RISK | `--warning` (amber) |

> Không hardcode màu (`#FFC107`) — chỉ dùng CSS variable của theme.

### Responsive
- **Dashboard**: desktop-first
- **Audit Execute** (màn hình QC dùng điện thoại tại quán): **mobile-first**, sticky bottom bar
- Sidebar: collapsible icon mode khi màn nhỏ

### Accessibility
- Button phải có label rõ ràng
- Form field phải có label + error message
- Loading state phải có spinner hoặc skeleton

---

## Git Workflow

- **KHÔNG commit thẳng vào `main`** — mọi task qua feature branch
- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/`, `test/`
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`
- Không commit: `.env`, `.env.local`, `prisma/dev.db`

---

## Code Quality

- **Simplicity First** — code tối thiểu giải được bài toán
- **Surgical Changes** — chỉ chạm những gì cần chạm
- Không thêm feature không được yêu cầu
- Không abstract code chỉ dùng 1 lần
- Không thêm error handling cho scenarios không thể xảy ra
