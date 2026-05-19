# Phase 3 — Execute Page Core

**Effort:** 70m | **Depends on:** Phase 1

## Overview

Trang chính thực hiện audit. Gồm: load session, state management violations qua `useReducer`,
section tab bar, criteria item cards, auto-save draft debounced.

## State Design

```ts
// Violation state FE giữ trong memory (không sync với BE real-time)
type DraftViolation = {
  numErrors: number;
  note: string | null;
  imageIds: string[]; // id từ upload response
};

type ViolationsState = Record<string, DraftViolation>; // key = criteriaId

type ViolationAction =
  | { type: "SET_ERRORS"; criteriaId: string; numErrors: number }
  | { type: "SET_NOTE"; criteriaId: string; note: string | null }
  | { type: "ADD_IMAGE"; criteriaId: string; imageId: string }
  | { type: "REMOVE_IMAGE"; criteriaId: string; imageId: string }
  | { type: "RESTORE"; violations: ViolationsState };

function violationsReducer(state: ViolationsState, action: ViolationAction): ViolationsState {
  switch (action.type) {
    case "SET_ERRORS":
      return {
        ...state,
        [action.criteriaId]: {
          numErrors: Math.max(0, action.numErrors),
          note: state[action.criteriaId]?.note ?? null,
          imageIds: state[action.criteriaId]?.imageIds ?? [],
        },
      };
    case "SET_NOTE":
      return { ...state, [action.criteriaId]: { ...state[action.criteriaId], note: action.note } };
    case "ADD_IMAGE":
      return {
        ...state,
        [action.criteriaId]: {
          ...state[action.criteriaId],
          imageIds: [...(state[action.criteriaId]?.imageIds ?? []), action.imageId],
        },
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        [action.criteriaId]: {
          ...state[action.criteriaId],
          imageIds: state[action.criteriaId]?.imageIds.filter((id) => id !== action.imageId) ?? [],
        },
      };
    case "RESTORE":
      return action.violations;
    default:
      return state;
  }
}
```

## Files tạo mới

### `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx`

```tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useReducer, useRef, useCallback } from "react";
import { useAuditSession, useAuditHistory, useSaveDraft } from "@/features/audit";
import { PageHeader } from "@/shared/components";
import { SectionTabBar } from "./_components/section-tab-bar";
import { CriteriaItemCard } from "./_components/criteria-item-card";
import { SubmitBar } from "./_components/submit-bar";
import { violationsReducer } from "./_lib/violations-reducer"; // extract reducer to separate file
import type { ViolationsState } from "./_lib/violations-reducer";

const DRAFT_DEBOUNCE_MS = 1500;

export default function AuditExecutePage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { data: session, isLoading, refetch } = useAuditSession(assignmentId);
  const { data: history } = useAuditHistory(assignmentId, {
    // Gọi ngầm sau khi session đã có
    enabled: !!session,
  });

  const [violations, dispatch] = useReducer(violationsReducer, {});
  const { mutate: saveDraft } = useSaveDraft();
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isReadOnly =
    !session?.assignment.plan.isAuditWindowOpen ||
    session?.assignment.status === "completed";

  // Restore draft từ session khi load
  useEffect(() => {
    if (!session?.audit?.violations) return;
    const restored: ViolationsState = {};
    for (const v of session.audit.violations) {
      restored[v.criteriaId] = {
        numErrors: v.numErrors,
        note: v.note,
        imageIds: v.images.map((img) => img.id),
      };
    }
    dispatch({ type: "RESTORE", violations: restored });
  }, [session?.audit?.violations]);

  // Auto-save debounced
  const triggerDraftSave = useCallback(() => {
    if (isReadOnly || !session) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      const violationList = Object.entries(violations)
        .filter(([, v]) => v.numErrors > 0)
        .map(([criteriaId, v]) => ({
          criteriaId,
          numErrors: v.numErrors,
          note: v.note ?? undefined,
          imageIds: v.imageIds,
        }));
      saveDraft({ assignmentId, violations: violationList });
    }, DRAFT_DEBOUNCE_MS);
  }, [violations, assignmentId, isReadOnly, session, saveDraft]);

  useEffect(() => {
    triggerDraftSave();
    return () => clearTimeout(draftTimerRef.current);
  }, [violations, triggerDraftSave]);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Default active section = first section
  useEffect(() => {
    if (session?.checklist.sections[0] && !activeSection) {
      setActiveSection(session.checklist.sections[0].id);
    }
  }, [session, activeSection]);

  if (isLoading) return <div className="p-6 text-muted-foreground">Đang tải...</div>;
  if (!session) return <div className="p-6 text-destructive">Không tìm thấy bài kiểm tra.</div>;

  const currentSection = session.checklist.sections.find((s) => s.id === activeSection);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b">
        <PageHeader
          title={session.assignment.store.name}
          description={`${session.assignment.plan.name} · ${session.checklist.name} v${session.checklist.version}`}
          backHref="/qc/my-assignments"
        />
        {isReadOnly && (
          <div className="mt-2 text-sm text-warning font-medium">
            {session.assignment.status === "completed"
              ? "Bài đã nộp — chỉ xem"
              : "Ngoài cửa sổ audit — chỉ xem"}
          </div>
        )}
      </div>

      <SectionTabBar
        sections={session.checklist.sections}
        activeId={activeSection ?? ""}
        onChange={setActiveSection}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-3">
        {currentSection?.items?.map((item) => (
          <CriteriaItemCard
            key={item.criteriaId}
            item={item}
            violation={violations[item.criteriaId]}
            repeatState={history?.historiesByCriteriaId[item.criteriaId]}
            readOnly={isReadOnly}
            onDispatch={dispatch}
          />
        ))}
      </div>

      {!isReadOnly && (
        <SubmitBar
          assignmentId={assignmentId}
          violations={violations}
          session={session}
          onStaleError={() => refetch()}
        />
      )}
    </div>
  );
}
```

### `src/app/(dashboard)/qc/audits/[assignmentId]/_lib/violations-reducer.ts`

Extract reducer + types vào file riêng để giữ page.tsx dưới 200 lines.

```ts
export type DraftViolation = {
  numErrors: number;
  note: string | null;
  imageIds: string[];
};

export type ViolationsState = Record<string, DraftViolation>;

export type ViolationAction =
  | { type: "SET_ERRORS"; criteriaId: string; numErrors: number }
  | { type: "SET_NOTE"; criteriaId: string; note: string | null }
  | { type: "ADD_IMAGE"; criteriaId: string; imageId: string }
  | { type: "REMOVE_IMAGE"; criteriaId: string; imageId: string }
  | { type: "RESTORE"; violations: ViolationsState };

export function violationsReducer(state: ViolationsState, action: ViolationAction): ViolationsState {
  // ... (full reducer logic as above)
}
```

### `src/app/(dashboard)/qc/audits/[assignmentId]/_components/section-tab-bar.tsx`

```tsx
import type { ChecklistSection } from "@/shared/types";

interface Props {
  sections: ChecklistSection[];
  activeId: string;
  onChange: (id: string) => void;
}

export function SectionTabBar({ sections, activeId, onChange }: Props) {
  return (
    <div className="flex overflow-x-auto border-b bg-background sticky top-0 z-10">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            s.id === activeId
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {s.group?.code ?? s.name}
        </button>
      ))}
    </div>
  );
}
```

### `src/app/(dashboard)/qc/audits/[assignmentId]/_components/criteria-item-card.tsx`

```tsx
import type { ChecklistSectionItem, CriteriaRepeatState } from "@/shared/types";
import type { DraftViolation, ViolationAction } from "../_lib/violations-reducer";

interface Props {
  item: ChecklistSectionItem;
  violation?: DraftViolation;
  repeatState?: CriteriaRepeatState;
  readOnly: boolean;
  onDispatch: (action: ViolationAction) => void;
}

export function CriteriaItemCard({ item, violation, repeatState, readOnly, onDispatch }: Props) {
  const criteria = item.criteria!;
  const numErrors = violation?.numErrors ?? 0;

  const flagColor = criteria.flag === "risk"
    ? "border-warning"
    : criteria.flag === "critical"
    ? "border-destructive"
    : "border-border";

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", flagColor)}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5">{criteria.code}</span>
        <p className="text-sm flex-1">{criteria.content}</p>
        {criteria.flag !== "none" && (
          <span className={cn(
            "text-xs font-bold uppercase px-1.5 py-0.5 rounded",
            criteria.flag === "risk" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
          )}>
            {criteria.flag === "risk" ? "RISK" : "CCP"}
          </span>
        )}
      </div>

      {/* Error counter */}
      <div className="flex items-center gap-3">
        <button
          disabled={readOnly || numErrors === 0}
          onClick={() => onDispatch({ type: "SET_ERRORS", criteriaId: criteria.id, numErrors: numErrors - 1 })}
          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40"
        >−</button>
        <span className="w-8 text-center font-bold text-lg">{numErrors}</span>
        <button
          disabled={readOnly}
          onClick={() => onDispatch({ type: "SET_ERRORS", criteriaId: criteria.id, numErrors: numErrors + 1 })}
          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40"
        >+</button>
        <span className="text-xs text-muted-foreground ml-2">
          {/* Repeat label từ history bundle */}
          {repeatState && numErrors > 0 && (
            <span className={repeatState.isCriticalTriggered ? "text-destructive font-semibold" : ""}>
              Lần {repeatState.repeatCount + 1}
              {repeatState.isCriticalTriggered && " · CCP tự động"}
            </span>
          )}
        </span>
      </div>

      {/* Note — chỉ hiện khi có lỗi */}
      {numErrors > 0 && (
        <textarea
          disabled={readOnly}
          placeholder="Ghi chú (tùy chọn)"
          value={violation?.note ?? ""}
          onChange={(e) => onDispatch({ type: "SET_NOTE", criteriaId: criteria.id, note: e.target.value || null })}
          className="w-full text-sm border rounded px-3 py-2 resize-none h-16 disabled:opacity-50"
        />
      )}

      {/* Evidence placeholder — Phase 4 sẽ thêm EvidenceUploader ở đây */}
    </div>
  );
}
```

## Lưu ý

- Dùng `useState` cho `activeSection` trong page (quên thêm import `useState` ở pseudocode trên)
- `_lib/violations-reducer.ts` không phải component — không cần `"use client"`
- `item.criteria` có thể `undefined` nếu join không có — guard bằng `item.criteria!` hoặc skip render

## Verification

```bash
npm run typecheck
```

Smoke test: Vào `/qc/audits/[id]` → thấy tabs sections → bấm +/- số lỗi → sau 1.5s PATCH draft gọi (kiểm tra Network tab).
