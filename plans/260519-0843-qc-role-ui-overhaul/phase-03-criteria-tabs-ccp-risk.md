# Phase 03 — Criteria tabs CCP/RISK + repeat badge + note label

## Context links
- Root plan: [plan.md](./plan.md)
- Section tab bar: `src/app/(dashboard)/qc/audits/[assignmentId]/_components/section-tab-bar.tsx`
- Criteria card: `src/app/(dashboard)/qc/audits/[assignmentId]/_components/criteria-item-card.tsx`
- Types: `Criteria.flag` (`"none" | "critical" | "risk"`), `ChecklistSection`, `ChecklistSectionItem`

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~40m
- **Mô tả:** Hiện tại CCP/RISK chỉ được badge trên card và border màu, vẫn nằm chung trong section CHEP. User muốn 2 tab ảo bổ sung — gom toàn bộ criteria `critical` vào tab "CCP", `risk` vào tab "RISK"; criteria `none` vẫn nằm trong section gốc. Đồng thời tinh chỉnh card: label "Nguyên nhân" cho note, badge "Lần N" nổi rõ.

## Key insights
- KHÔNG mutate BE — sections vẫn theo group code (C/H/E/P). Tab ảo build phía client từ tất cả items có flag.
- 1 criteria chỉ có 1 flag, không trùng tab.
- Khi user evaluate ở tab "CCP", kết quả vẫn đẩy vào `violations[criteriaId]` chung — không phụ thuộc tab nào.
- `SectionTabBar` đang dùng `section.group?.code ?? section.name` — cần đổi sang label rõ hơn (có icon/màu cho CCP/RISK).
- `CriteriaRepeatState.repeatCount` (từ history) đã tồn tại — chỉ thiếu visual emphasis.

## Requirements

### Functional
- Tab bar mới có thứ tự: `[Section1] [Section2] ... [CCP (n)] [RISK (n)]`.
  - Số `(n)` = số criteria có flag tương ứng trong checklist hiện tại.
  - Nếu n = 0 → ẩn tab đó (không hiện "CCP (0)").
- Tab CCP/RISK có style đặc biệt:
  - CCP: text/border `--destructive`.
  - RISK: text/border `--warning`.
- Khi switch sang tab CCP/RISK → list chỉ hiển thị các criteria có flag đó (giữ thứ tự gốc theo section/order).
- Criteria card:
  - Note textarea có `<label>` rõ ràng phía trên: "Nguyên nhân lỗi".
  - Placeholder đổi sang "Mô tả nguyên nhân, hiện trường…".
  - Badge "Lần N" hiển thị nổi (chip) thay vì plain text — màu warning khi N ≥ 2, destructive khi `isCriticalTriggered`.

### Non-functional
- Helper build virtual sections: `_lib/build-virtual-sections.ts` ≤ 60 dòng pure.
- `section-tab-bar.tsx` ≤ 80 dòng (hiện 32).
- `criteria-item-card.tsx` ≤ 200 dòng.

## Architecture
```
build-virtual-sections.ts
  └─ build VirtualSection[]
       ├─ regular: ChecklistSection (giữ nguyên)
       └─ virtual: { kind: "ccp" | "risk", items: ChecklistSectionItem[] }

page.tsx
  ├─ const vSections = buildVirtualSections(session.checklist.sections)
  ├─ activeSection = state | vSections[0].id
  └─ <SectionTabBar virtualSections={vSections} … />
       └─ render tab w/ flag-aware styling
```

## Related code files

### Modify
- `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/section-tab-bar.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/criteria-item-card.tsx`

### Create
- `src/app/(dashboard)/qc/audits/[assignmentId]/_lib/build-virtual-sections.ts`

### Delete
- (None)

## Implementation steps

1. **`build-virtual-sections.ts`** — dựng list section ảo:
   ```ts
   import type { ChecklistSection, ChecklistSectionItem } from "@/shared/types";

   export type VirtualSection =
     | { kind: "regular"; id: string; label: string; tone: "default"; items: ChecklistSectionItem[] }
     | { kind: "ccp"; id: "virtual:ccp"; label: string; tone: "critical"; items: ChecklistSectionItem[] }
     | { kind: "risk"; id: "virtual:risk"; label: string; tone: "warning"; items: ChecklistSectionItem[] };

   export function buildVirtualSections(sections: ChecklistSection[]): VirtualSection[] {
     const regulars: VirtualSection[] = sections.map((s) => ({
       kind: "regular" as const,
       id: s.id,
       label: s.group?.code ?? s.name,
       tone: "default" as const,
       items: (s.items ?? []).filter((i) => i.criteria && i.criteria.flag === "none"),
     }));

     const allItems = sections.flatMap((s) => s.items ?? []);
     const ccpItems = allItems.filter((i) => i.criteria?.flag === "critical");
     const riskItems = allItems.filter((i) => i.criteria?.flag === "risk");

     const virtuals: VirtualSection[] = [];
     if (ccpItems.length > 0) {
       virtuals.push({ kind: "ccp", id: "virtual:ccp", label: `CCP (${ccpItems.length})`, tone: "critical", items: ccpItems });
     }
     if (riskItems.length > 0) {
       virtuals.push({ kind: "risk", id: "virtual:risk", label: `RISK (${riskItems.length})`, tone: "warning", items: riskItems });
     }

     return [...regulars, ...virtuals];
   }
   ```

   **Quyết định quan trọng:** regular tabs lọc bỏ items có flag (`critical`/`risk`) → tránh hiển thị trùng. CCP/RISK gom hết items có flag tương ứng → 1 criteria chỉ xuất hiện 1 chỗ. Confirm logic này với user khi review.

2. **`section-tab-bar.tsx`** — nhận `VirtualSection[]`:
   ```tsx
   import type { VirtualSection } from "../_lib/build-virtual-sections";

   interface SectionTabBarProps {
     sections: VirtualSection[];
     activeId: string;
     onChange: (id: string) => void;
   }

   const TONE_ACTIVE: Record<VirtualSection["tone"], string> = {
     default: "border-primary text-primary",
     critical: "border-destructive text-destructive",
     warning: "border-warning text-warning",
   };

   export function SectionTabBar({ sections, activeId, onChange }: SectionTabBarProps) {
     return (
       <div className="flex overflow-x-auto border-b bg-background sticky top-0 z-10 shrink-0">
         {sections.map((s) => {
           const active = s.id === activeId;
           return (
             <button
               key={s.id}
               onClick={() => onChange(s.id)}
               className={cn(
                 "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                 active
                   ? TONE_ACTIVE[s.tone]
                   : "border-transparent text-muted-foreground hover:text-foreground"
               )}
             >
               {s.label}
             </button>
           );
         })}
       </div>
     );
   }
   ```

3. **Wire `page.tsx`:**
   - Tính `const vSections = useMemo(() => buildVirtualSections(session.checklist.sections), [session])`.
   - `activeSection` default = `vSections[0]?.id ?? null`.
   - `const currentSection = vSections.find((s) => s.id === activeSection)`.
   - Render `currentSection?.items.map(item => <CriteriaItemCard … />)`.

4. **`criteria-item-card.tsx`** — refine:
   - **Note label**: Thêm `<label>` text "Nguyên nhân lỗi" trên textarea.
     ```tsx
     {numErrors > 0 && (
       <div className="space-y-1">
         <label className="text-xs font-medium text-muted-foreground">Nguyên nhân lỗi</label>
         <textarea
           …
           placeholder="Mô tả nguyên nhân, hiện trường, người chứng kiến…"
           …
         />
       </div>
     )}
     ```
   - **Repeat badge** — chuyển từ plain text → chip:
     ```tsx
     {repeatState && numErrors > 0 && (
       <span
         className={cn(
           "text-xs font-semibold px-2 py-0.5 rounded-full",
           repeatState.isCriticalTriggered
             ? "bg-destructive/10 text-destructive"
             : repeatState.repeatCount >= 1
               ? "bg-warning/10 text-warning"
               : "bg-muted text-muted-foreground"
         )}
       >
         Lần {repeatState.repeatCount + 1}
         {repeatState.isCriticalTriggered && " · CCP"}
       </span>
     )}
     ```

5. **Typecheck** + manual:
   - Click qua từng tab — đúng list criteria.
   - Đánh lỗi 1 criteria ở tab "C" → switch sang tab CCP (nếu criteria đó có flag critical thì thấy ở CCP, không thấy ở C — vì regular bỏ flag).
   - Note có label.
   - Badge "Lần N" đổi màu theo state.

## Todo list
- [ ] Tạo `build-virtual-sections.ts`
- [ ] Refactor `section-tab-bar.tsx` (nhận `VirtualSection[]`)
- [ ] Refactor `page.tsx` dùng `vSections`
- [ ] Update `criteria-item-card.tsx`: label "Nguyên nhân" + chip "Lần N"
- [ ] `npm run typecheck` pass
- [ ] Manual switch tab test

## Success criteria
- Tab CCP và RISK xuất hiện nếu có criteria flag tương ứng.
- Criteria flagged không xuất hiện trùng ở tab section gốc.
- Note có label rõ ràng.
- Badge "Lần N" có background màu theo state.

## Risk assessment
| Risk | Mitigation |
|------|------------|
| Loại bỏ criteria flag khỏi section gốc gây hiểu lầm "thiếu criteria" | Hiển thị helper text dưới tab list, hoặc giữ criteria flag trong section gốc nhưng disable + link "→ Xem ở tab CCP". Quyết định: bỏ — Confirm với user |
| Section gốc rỗng nếu tất cả criteria flagged | Vẫn show tab nhưng list trống + EmptyState |
| `activeSection` cũ bị stale khi data đổi | dùng `useMemo` + fallback `vSections[0]?.id` |

## Security considerations
- N/A — pure UI.

## Next steps
- Phase 04 (evidence upload).
- Phase 05 (draft status).
