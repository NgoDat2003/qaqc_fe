# Maycha QA/QC — Frontend

## Session start
@.claude/memory.md

## Rules
@.claude/rules/workflow.md
@.claude/rules/tech-defaults.md
@.claude/rules/design.md

---

## Stack
- Next.js 16, React 19, TypeScript strict
- shadcn/ui + Radix, Tailwind v4, Lucide icons
- Zustand + TanStack Query v5, React Hook Form + Zod
- Port: 3001

## Commands
- Dev: `npm run dev`
- Test: `npm run test`
- Typecheck: `npm run typecheck`
- Check all: `npm run check`

## Backend
- Port: 3000 | Cookie: `qo_token` | Env: `NEXT_PUBLIC_BE_URL=http://localhost:3000`

## Docs
@../docs/api-contract.md
@docs/BUILD_PLAN.md
