"use client";

import { useState, useEffect, useReducer, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuditSession, useAuditHistory, useSaveDraft } from "@/features/audit";
import { PageHeader } from "@/shared/components";
import { formatDate } from "@/lib/format";
import { SectionTabBar } from "./_components/section-tab-bar";
import { CriteriaItemCard } from "./_components/criteria-item-card";
import { EvidenceUploader } from "./_components/evidence-uploader";
import { SubmitBar } from "./_components/submit-bar";
import { violationsReducer } from "./_lib/violations-reducer";
import type { ViolationsState } from "./_lib/violations-reducer";
import type { UploadedImage } from "@/shared/types";

const DRAFT_DEBOUNCE_MS = 1500;

export default function AuditExecutePage() {
  const { assignmentId } = useParams() as { assignmentId: string };
  const router = useRouter();
  const { data: session, isLoading, refetch } = useAuditSession(assignmentId);
  const { data: history } = useAuditHistory(assignmentId, { enabled: !!session });

  const [violations, dispatch] = useReducer(violationsReducer, {});
  // Active section: null until session loads, then defaults to first section
  const [activeSectionOverride, setActiveSection] = useState<string | null>(null);
  const { mutate: saveDraft } = useSaveDraft();
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isRestored = useRef(false);
  const justRestored = useRef(false); // suppresses auto-save on the restore cycle

  // Derived: false during loading, true only when session confirms read-only
  const isReadOnly =
    !!session &&
    (!session.assignment.plan.isAuditWindowOpen ||
      session.assignment.status === "completed");

  // Derived active section — no useEffect needed
  const activeSection =
    activeSectionOverride ?? session?.checklist.sections[0]?.id ?? null;

  // Restore draft from session once (dispatch only — no setState in effect)
  useEffect(() => {
    if (!session?.audit?.violations || isRestored.current) return;
    isRestored.current = true;
    justRestored.current = true;
    const restoredViolations: ViolationsState = {};
    for (const v of session.audit.violations) {
      restoredViolations[v.criteriaId] = {
        numErrors: v.numErrors,
        note: v.note,
        imageIds: v.images.map((img) => img.id),
        imagePreviews: v.images.map(({ id, url }) => ({ id, url })),
      };
    }
    dispatch({ type: "RESTORE", violations: restoredViolations });
  }, [session?.audit?.violations]);

  // Debounced auto-save — skips the cycle immediately after restore
  const triggerDraftSave = useCallback(
    (currentViolations: ViolationsState) => {
      if (isReadOnly || !session) return;
      if (justRestored.current) {
        justRestored.current = false;
        return;
      }
      clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => {
        const violationList = Object.entries(currentViolations)
          .filter(([, v]) => v.numErrors > 0)
          .map(([criteriaId, v]) => ({
            criteriaId,
            numErrors: v.numErrors,
            note: v.note ?? undefined,
            imageIds: v.imageIds,
          }));
        saveDraft({ assignmentId, violations: violationList });
      }, DRAFT_DEBOUNCE_MS);
    },
    [isReadOnly, session, saveDraft, assignmentId]
  );

  useEffect(() => {
    triggerDraftSave(violations);
    return () => clearTimeout(draftTimer.current);
  }, [violations, triggerDraftSave]);

  function handleImageUploaded(criteriaId: string, img: UploadedImage) {
    dispatch({ type: "ADD_IMAGE", criteriaId, imageId: img.id, url: img.url });
  }

  function handleImageRemoved(criteriaId: string, imageId: string) {
    dispatch({ type: "REMOVE_IMAGE", criteriaId, imageId });
  }

  function handleStaleError() {
    isRestored.current = false;
    refetch();
  }

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Đang tải bài kiểm tra...</div>;
  }
  if (!session) {
    return <div className="p-6 text-destructive">Không tìm thấy bài kiểm tra.</div>;
  }

  const currentSection = session.checklist.sections.find((s) => s.id === activeSection);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="px-4 py-4 border-b space-y-1">
        <PageHeader
          title={session.assignment.store.name}
          subtitle={`${session.assignment.plan.name} · ${session.checklist.name} v${session.checklist.version} · ${formatDate(session.assignment.plan.startDate)}–${formatDate(session.assignment.plan.endDate)}`}
          backHref="/qc/my-assignments"
        />
        {isReadOnly && (
          <p className="text-sm font-medium text-warning pl-8">
            {session.assignment.status === "completed"
              ? "Bài đã nộp — chỉ xem"
              : "Ngoài cửa sổ audit — chỉ xem"}
        </p>
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
            key={item.id}
            item={item}
            violation={violations[item.criteriaId]}
            repeatState={history?.historiesByCriteriaId[item.criteriaId]}
            readOnly={isReadOnly}
            onDispatch={dispatch}
            evidenceSlot={
              <EvidenceUploader
                criteriaId={item.criteriaId}
                images={violations[item.criteriaId]?.imagePreviews ?? []}
                readOnly={isReadOnly}
                onUploaded={handleImageUploaded}
                onRemoved={handleImageRemoved}
              />
            }
          />
        ))}
      </div>

      {!isReadOnly && (
        <SubmitBar
          assignmentId={assignmentId}
          violations={violations}
          session={session}
          onStaleError={handleStaleError}
          onSubmitSuccess={() => router.push("/qc/my-assignments")}
        />
      )}
    </div>
  );
}
