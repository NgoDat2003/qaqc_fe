"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmitConfirmDialog } from "./submit-confirm-dialog";
import type { AuditSession } from "@/shared/types";
import type { ViolationsState } from "../_lib/violations-reducer";

interface SubmitBarProps {
  assignmentId: string;
  violations: ViolationsState;
  session: AuditSession;
  onStaleError: () => void;
  onSubmitSuccess: () => void;
}

export function SubmitBar({
  assignmentId,
  violations,
  session,
  onStaleError,
  onSubmitSuccess,
}: SubmitBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const violationCount = Object.values(violations).filter((v) => v.numErrors > 0).length;
  const totalCriteria = session.checklist.sections.reduce(
    (sum, s) => sum + (s.items?.length ?? 0),
    0
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t px-4 py-3 flex items-center justify-between gap-4 md:left-64">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{violationCount}</span> lỗi /{" "}
          {totalCriteria} tiêu chí
        </p>
        <Button onClick={() => setConfirmOpen(true)}>Nộp bài</Button>
      </div>

      <SubmitConfirmDialog
        open={confirmOpen}
        assignmentId={assignmentId}
        violations={violations}
        session={session}
        onClose={() => setConfirmOpen(false)}
        onStaleError={() => {
          setConfirmOpen(false);
          onStaleError();
        }}
        onSubmitSuccess={onSubmitSuccess}
      />
    </>
  );
}
