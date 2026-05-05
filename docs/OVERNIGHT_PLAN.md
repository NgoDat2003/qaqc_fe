# Overnight Autonomous Session Plan

## Pre-flight checklist (làm trước khi đi ngủ)
- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run test` → all pass  
- [ ] `git status` → clean
- [ ] BE đang chạy: `curl localhost:3000/api/auth/me` → 401
- [ ] FE đang chạy: `curl localhost:3001` → 302/200
- [ ] Máy tính không sleep: Power settings → Never

## File Ownership — KHÔNG ĐƯỢC OVERLAP

### Agent A — Brand
```
src/features/master-data/components/brand-drawer.tsx   ← chỉ A
src/app/(dashboard)/master-data/brands/page.tsx         ← chỉ A
src/features/master-data/components/brand-drawer.test.tsx ← chỉ A
```

### Agent B — Store  
```
src/features/master-data/components/store-drawer.tsx    ← chỉ B
src/app/(dashboard)/master-data/stores/page.tsx          ← chỉ B
```

### Agent C — User
```
src/features/master-data/components/user-drawer.tsx     ← chỉ C
src/app/(dashboard)/master-data/users/page.tsx           ← chỉ C
```

### Shared (KHÔNG AGENT NÀO ĐƯỢC SỬA)
```
src/shared/types/index.ts          ← READ ONLY
src/lib/api-client.ts              ← READ ONLY  
src/stores/                        ← READ ONLY
src/features/master-data/api/      ← Orchestrator làm trước
src/features/master-data/hooks/    ← Orchestrator làm trước
```

## Stop conditions
Agent phải dừng và ghi vào OVERNIGHT_REPORT.md nếu:
- BE trả về 500 liên tục (> 3 lần)
- TypeScript error không fix được sau 2 attempts
- Test fail sau 3 lần retry
