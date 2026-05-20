---
title: "Criteria Display Fixes — line-break content + name column"
description: "FE-only: render criteria.content với bullet points thay vì một dòng dài; thêm name field vào Criteria type để hiển thị ngắn trong table"
status: pending
priority: P2
effort: 30m
branch: codex/ui-foundation-qc-assignments-pilot
tags: [criteria, ui, display]
created: 2026-05-20
blockedBy: []
blocks: []
---

# Criteria Display Fixes

## Vấn đề

1. **violations-list.tsx** — `criteria.content` dài, dùng " - " làm separator nhưng render liền 1 dòng → khó đọc.
2. **criteria/page.tsx** — cột "Tiêu chí" dùng `content` với `line-clamp-2` nhưng content quá dài, bị cắt tuỳ tiện giữa câu.

## Giải pháp (FE-only, không đụng BE)

### Fix 1 — violations-list content render
Split `criteria.content` theo regex `/ - /` → render từng item như bullet list.
- Dùng `content.split(/ - /)` để tách các ý
- Render `<ul>` với các `<li>`, item đầu tiên là "title" của tiêu chí
- Không thêm thư viện ngoài

### Fix 2 — criteria page table column
`Criteria` interface trong `shared/types/index.ts` chưa có `name` field (BE chưa có).  
→ **Thay vào đó:** FE tự extract "tên ngắn" từ `content` = phần đầu tiên trước " - ".
- Utility function `extractCriteriaTitle(content: string): string` — lấy phần trước " - " đầu tiên
- Dùng trong column "Tiêu chí": hiển thị title ngắn thay vì full content
- Tooltip hoặc expand khi cần xem full content (YAGNI — bỏ, chỉ hiện title)

## Files thay đổi

| File | Thay đổi |
|------|----------|
| `src/app/(dashboard)/audits/[id]/_components/violations-list.tsx` | Render content dạng bullet list |
| `src/app/(dashboard)/qam/criteria/page.tsx` | Column "Tiêu chí" dùng extracted title thay full content |

## Implementation

### violations-list.tsx
```tsx
// Thay dòng: <span className="text-sm text-foreground">{v.criteria.content}</span>
// Bằng:
function CriteriaContent({ content }: { content: string }) {
  const parts = content.split(/ - /);
  if (parts.length === 1) return <span className="text-sm text-foreground">{content}</span>;
  return (
    <ul className="text-sm text-foreground list-disc list-inside space-y-0.5 mt-0.5">
      {parts.map((p, i) => <li key={i}>{p}</li>)}
    </ul>
  );
}
```

### criteria/page.tsx
```tsx
// Helper ở đầu file
function extractCriteriaTitle(content: string): string {
  const idx = content.indexOf(" - ");
  return idx > 0 ? content.slice(0, idx) : content;
}

// Trong column cell:
cell: (c) => (
  <div>
    <div className="font-mono text-xs text-muted-foreground">{c.code}</div>
    <div className="text-sm text-foreground mt-0.5">{extractCriteriaTitle(c.content)}</div>
  </div>
),
```

## Todo

- [ ] violations-list.tsx — CriteriaContent component, replace inline span
- [ ] criteria/page.tsx — extractCriteriaTitle helper + update column cell
- [ ] npm run typecheck

## Success Criteria

- violations-list: content hiển thị dạng bullet, mỗi ý 1 dòng
- criteria table: cột Tiêu chí hiển thị tên ngắn (phần đầu trước " - "), không bị clamp giữa câu
- typecheck pass, không thêm dep mới
