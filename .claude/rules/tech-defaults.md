# Tech Defaults & Conventions

## TypeScript

- No `any` — dùng type cụ thể hoặc `unknown` + type guard
- Strict mode bật — không tắt
- Named exports, không default export cho components
- PascalCase: components / camelCase: utils, hooks, variables

## React / Next.js

- Client component: thêm `"use client"` khi dùng useState/onClick/useEffect
- Server component: default (không cần declare)
- Không dùng `fetch` trực tiếp — chỉ qua `src/lib/api-client.ts`
- Upload file: chỉ qua `src/shared/api/upload.api.ts`

## State

- Server state: TanStack Query v5
- Client state: Zustand
- Form: React Hook Form + Zod

## Không được đụng vào

- `src/shared/types/index.ts` — chỉ thêm, KHÔNG xóa/đổi tên field đã có
- `src/lib/api-client.ts` — không thay đổi core logic
- `.env.local` — không đọc, không commit

## Code quality

- Simplicity First: code tối thiểu giải được bài toán
- Surgical Changes: chỉ chạm những gì cần chạm
- Không thêm feature không được yêu cầu
- Không abstract code chỉ dùng 1 lần
