"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditChecklist, useSubmitAudit } from "@/features/audit";
import { CriteriaInputCard } from "@/features/audit/components/execution/criteria-input-card";
import { AuditResultView } from "@/features/audit/components/result/audit-result-view";
import { uploadApi } from "@/shared/api/upload.api";
import type { SubmitAuditResponse, ChecklistSection } from "@/shared/types";

interface ViolationState {
  numErrors: number;
  note: string;
  evidenceUrls: string[];
}

type ViolationMap = Record<string, ViolationState>;

function defaultViolation(): ViolationState {
  return { numErrors: 0, note: "", evidenceUrls: [] };
}

export default function AuditExecutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: assignmentId } = use(params);
  const router = useRouter();

  const { data: checklist, isLoading } = useAuditChecklist(assignmentId);
  const submitMutation = useSubmitAudit();

  const [violations, setViolations] = useState<ViolationMap>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAuditResponse | null>(null);

  const getViolation = (criteriaId: string): ViolationState =>
    violations[criteriaId] ?? defaultViolation();

  const updateViolation = useCallback(
    (criteriaId: string, patch: Partial<ViolationState>) => {
      setViolations((prev) => ({
        ...prev,
        [criteriaId]: { ...defaultViolation(), ...prev[criteriaId], ...patch },
      }));
    },
    []
  );

  const handleErrorChange = useCallback(
    (criteriaId: string, delta: number) => {
      setViolations((prev) => {
        const cur = prev[criteriaId] ?? defaultViolation();
        const next = Math.max(0, cur.numErrors + delta);
        return { ...prev, [criteriaId]: { ...cur, numErrors: next } };
      });
    },
    []
  );

  const handleFileSelect = useCallback(
    async (criteriaId: string, file: File) => {
      setUploadingId(criteriaId);
      try {
        const { url } = await uploadApi.uploadEvidence(file);
        setViolations((prev) => {
          const cur = prev[criteriaId] ?? defaultViolation();
          return {
            ...prev,
            [criteriaId]: { ...cur, evidenceUrls: [...cur.evidenceUrls, url] },
          };
        });
      } catch {
        toast.error("Tải ảnh thất bại");
      } finally {
        setUploadingId(null);
      }
    },
    []
  );

  const handleSubmit = async () => {
    if (!checklist) return;
    const violationList = Object.entries(violations)
      .filter(([, v]) => v.numErrors > 0)
      .map(([criteriaId, v]) => ({
        criteriaId,
        numErrors: v.numErrors,
        note: v.note || undefined,
        evidenceUrls: v.evidenceUrls.length ? v.evidenceUrls : undefined,
      }));

    try {
      const res = await submitMutation.mutateAsync({
        assignmentId,
        violations: violationList,
      });
      setResult(res);
    } catch {
      toast.error("Nộp audit thất bại. Vui lòng thử lại.");
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AuditResultView result={result} onBack={() => router.push("/operations/my-audits")} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const sections: ChecklistSection[] = checklist?.sections ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/operations/my-audits")}
          aria-label="Quay lại"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Thực Hiện Audit</h1>
          {checklist && (
            <p className="text-sm text-muted-foreground">{checklist.name} v{checklist.version}</p>
          )}
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-muted-foreground text-sm">Không có tiêu chí nào.</p>
      ) : (
        <Tabs defaultValue={sections[0]?.id}>
          <TabsList className="w-full mb-4 flex-wrap h-auto gap-1">
            {sections.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="text-xs">
                {s.group?.code ?? s.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">{section.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(section.items ?? []).map((item) => {
                  const cid = item.criteriaId;
                  return (
                    <CriteriaInputCard
                      key={item.id}
                      item={item}
                      state={getViolation(cid)}
                      uploading={uploadingId === cid}
                      onErrorChange={(delta) => handleErrorChange(cid, delta)}
                      onNoteChange={(note) => updateViolation(cid, { note })}
                      onFileSelect={(file) => handleFileSelect(cid, file)}
                    />
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || !!uploadingId}
          className="min-w-32"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang nộp…
            </>
          ) : (
            "Nộp Audit"
          )}
        </Button>
      </div>
    </div>
  );
}
