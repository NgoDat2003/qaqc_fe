"use client";

import { useState, useEffect, useReducer, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuditSession, useAuditHistory, useSaveDraft } from "@/features/audit";
import { SectionTabBar } from "./_components/section-tab-bar";
import { CriteriaItemCard } from "./_components/criteria-item-card";
import { EvidenceUploader } from "./_components/evidence-uploader";
import { SubmitBar } from "./_components/submit-bar";
import { AuditHeader } from "./_components/audit-header";
import { DraftStatus } from "./_components/draft-status";
import { violationsReducer } from "./_lib/violations-reducer";
import { buildVirtualSections } from "./_lib/build-virtual-sections";
import { deriveProgress } from "./_lib/derive-progress";
import type { ViolationsState } from "./_lib/violations-reducer";
import type { UploadedImage } from "@/shared/types";

const DRAFT_DEBOUNCE_MS = 1500;

export default function AuditExecutePage() {
  const { assignmentId } = useParams() as { assignmentId: string };
  const router = useRouter();
  const { data: session, isLoading, refetch } = useAuditSession(assignmentId);
  const { data: history } = useAuditHistory(assignmentId, { enabled: !!session });

  const [violations, dispatch] = useReducer(violationsReducer, {});
  const [activeSectionOverride, setActiveSection] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  // Destructure stable refs from mutation — object itself is new each render
  const { mutate: saveDraft, isPending: isSavePending, isError: isSaveError } = useSaveDraft();
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isRestored = useRef(false);
  const justRestored = useRef(false);

  const isReadOnly =
    !!session &&
    (!session.assignment.plan.isAuditWindowOpen || session.assignment.status === "completed");

  // Virtual sections: regular tabs + CCP/RISK virtual tabs
  const vSections = useMemo(
    () => (session ? buildVirtualSections(session.checklist.sections) : []),
    [session]
  );
  const activeSection = activeSectionOverride ?? vSections[0]?.id ?? null;

  // Reset restore guards when navigating to a different assignment
  useEffect(() => {
    isRestored.current = false;
    justRestored.current = false;
  }, [assignmentId]);

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

  // Debounced auto-save — uses stable `saveDraft` ref to avoid resetting timer on mutation state changes
  const triggerDraftSave = useCallback(
    (currentViolations: ViolationsState) => {
      if (isReadOnly || !session) return;
      if (justRestored.current) { justRestored.current = false; return; }
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
        saveDraft(
          { assignmentId, violations: violationList },
          { onSuccess: () => { setLastSavedAt(new Date()); } }
        );
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

  if (isLoading) return <div className="p-6 text-muted-foreground">Đang tải bài kiểm tra...</div>;
  if (!session) return <div className="p-6 text-destructive">Không tìm thấy bài kiểm tra.</div>;

  const currentVSection = vSections.find((s) => s.id === activeSection);
  const progress = deriveProgress(session, violations);
  const readOnlyReason = session.assignment.status === "completed"
    ? "Bài đã nộp — chỉ xem"
    : "Đã hết hạn audit — chỉ xem";

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <AuditHeader
        session={session}
        progress={progress}
        isReadOnly={isReadOnly}
        readOnlyReason={isReadOnly ? readOnlyReason : undefined}
        draftStatusSlot={
          !isReadOnly && (
            <DraftStatus
              isSaving={isSavePending}
              isError={isSaveError}
              lastSavedAt={lastSavedAt}
            />
          )
        }
      />

      <SectionTabBar sections={vSections} activeId={activeSection ?? ""} onChange={setActiveSection} />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-3">
        {currentVSection?.items?.map((item) => (
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
