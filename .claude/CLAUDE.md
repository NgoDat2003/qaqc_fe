# Maycha QA/QC — Frontend

## Ngôn Ngữ
- **Giao tiếp:** Tiếng Việt — mọi phản hồi, báo cáo, journal, comment đều dùng tiếng Việt
- **Code:** Tiếng Anh — tên biến, hàm, comment kỹ thuật trong code
- **Tài liệu (docs/, plans/):** Tiếng Việt

## Framework Rules
@.claude/rules/primary-workflow.md
@.claude/rules/development-rules.md
@.claude/rules/orchestration-protocol.md
@.claude/rules/documentation-management.md

## Project Standards
@docs/code-standards.md
@docs/system-architecture.md

## Project Docs
@docs/BUILD_PLAN.md

---

## Dev Commands
- Dev: `npm run dev` (port 3001)
- Typecheck: `npm run typecheck`
- Test: `npm run test`
- Check all: `npm run check`

## Backend
- Port: 3000 | Cookie: `qo_token` | Env: `NEXT_PUBLIC_BE_URL=http://localhost:3000`
