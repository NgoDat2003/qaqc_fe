"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft, Clock, CheckCircle2, Loader2,
  Upload, X, ImageIcon, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/shared/components/role-guard";
import {
  useActionPlan,
  useUpdateActionPlan,
  useSubmitActionPlan,
  useConfirmActionPlan,
  useCloseActionPlan,
} from "@/features/action-plan";
import { uploadApi } from "@/shared/api/upload.api";
import type { ActionPlanStatus, Violation, Evidence } from "@/shared/types";

type ViolationWithGroup = Violation & {
  criteria?: NonNullable<Violation["criteria"]> & {
    group?: { id: string; name: string; code: string };
  };
};

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_META: Record<ActionPlanStatus, { label: string; cls: string }> = {
  draft:       { label: "Draft",       cls: "bg-muted text-muted-foreground" },
  submitted:   { label: "Submitted",   cls: "bg-info-bg text-info border-info/20" },
  in_progress: { label: "In Progress", cls: "bg-warning-bg text-warning border-warning/20" },
  closed:      { label: "Closed",      cls: "bg-success-bg text-success border-success/20" },
};

function APBadge({ status }: { status: ActionPlanStatus }) {
  const m = STATUS_META[status];
  return <Badge className={`text-xs font-medium ${m.cls}`}>{m.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Evidence thumbnail
// ---------------------------------------------------------------------------
function EvidenceThumb({ url }: { url: string }) {
  return (
    <div className="relative group">
      <img
        src={url}
        alt="evidence"
        className="h-20 w-20 object-cover rounded-lg border border-border"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Violation list item
// ---------------------------------------------------------------------------
function ViolationItem({ v }: { v: ViolationWithGroup }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card/50">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-1">
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">
            {v.criteria?.group?.code || "???"} - {v.criteria?.code}
          </Badge>
          <p className="text-sm font-medium leading-snug">{v.criteria?.content}</p>
        </div>
        {v.numErrors > 0 && (
          <Badge className="bg-danger/10 text-danger border-danger/20 text-xs">
            -{v.numErrors} point(s)
          </Badge>
        )}
      </div>
      
      {v.note && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg mb-2 italic">
          QC Note: {v.note}
        </p>
      )}

      {/* QC Evidences */}
      {(v.evidences ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {(v.evidences ?? []).map((ev) => (
            <EvidenceThumb key={ev.id} url={ev.url} />
          ))}
        </div>
      )}
    </div>
  );
}

function ViolationList({ violations }: { violations: ViolationWithGroup[] }) {
  if (!violations || violations.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-danger" />
        Detected Violations ({violations.length})
      </h3>
      <div className="grid gap-3">
        {violations.map((v) => (
          <ViolationItem key={v.id} v={v} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence uploader (inline, no modal)
// ---------------------------------------------------------------------------
function EvidenceUploader({
  onUploaded,
  label = "Upload photo",
}: {
  onUploaded: (id: string, url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadApi.uploadEvidence(file);
      onUploaded(result.id, result.url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors w-fit">
      {uploading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
      ) : (
        <><Upload className="h-4 w-4" /> {label}</>
      )}
      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} disabled={uploading} />
    </label>
  );
}

// ---------------------------------------------------------------------------
// SM View — create / update action plan
// ---------------------------------------------------------------------------
function SMView({ id }: { id: string }) {
  const { data: plan, isLoading } = useActionPlan(id);
  const [remediation, setRemediation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);

  const update = useUpdateActionPlan();
  const submit = useSubmitActionPlan();

  if (isLoading) return <SMSkeleton />;
  if (!plan) return null;

  const isEditable = plan.status === "draft" || plan.status === "submitted";
  const currentRemediation = remediation || plan.remediation || "";
  const currentDeadline = deadline || (plan.deadline ? plan.deadline.slice(0, 10) : "");

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        id,
        remediation: currentRemediation,
        deadline: currentDeadline || undefined,
      });
      toast.success("Changes saved");
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!currentRemediation.trim()) {
      toast.warning("Please describe your corrective action first.");
      return;
    }
    try {
      await update.mutateAsync({ id, remediation: currentRemediation, deadline: currentDeadline || undefined });
      await submit.mutateAsync(id);
      toast.success("Action Plan submitted to QA Manager");
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  };

  const handleEvidenceUploaded = (evId: string, url: string) => {
    setEvidenceIds((prev) => [...prev, evId]);
    setEvidenceUrls((prev) => [...prev, url]);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status row */}
      <div className="flex items-center gap-3">
        <APBadge status={plan.status} />
        {plan.deadline && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Due {new Date(plan.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Status row */}
      <div className="flex items-center gap-3">
        <APBadge status={plan.status} />
        {plan.deadline && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Due {new Date(plan.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Audit score reference */}
      {plan.audit && (
        <div className="bg-muted/40 rounded-xl p-4 text-sm mt-4">
          <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide font-medium">Audit Score</p>
          <p className="text-2xl font-semibold text-foreground">{plan.audit.finalScore}</p>
          <p className="text-xs text-muted-foreground capitalize">{plan.audit.grade}</p>
        </div>
      )}

      {/* Violation reference */}
      <ViolationList violations={plan.audit?.violations || []} />

      {/* Corrective action form */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Corrective Action Description <span className="text-danger">*</span>
        </label>
        <Textarea
          placeholder="Describe step-by-step what your team will do to fix the violations..."
          value={currentRemediation}
          onChange={(e) => setRemediation(e.target.value)}
          disabled={!isEditable}
          className="min-h-32 resize-none"
        />
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Target Completion Date</label>
        <input
          type="date"
          value={currentDeadline}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={!isEditable}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground w-48 disabled:opacity-50"
        />
      </div>

      {/* Evidence upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Corrective Evidence Photos
        </label>
        {/* Existing evidences */}
        {(plan.evidences ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(plan.evidences ?? []).map((ev) => (
              <EvidenceThumb key={ev.id} url={ev.url} />
            ))}
          </div>
        )}
        {/* New uploads */}
        {evidenceUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {evidenceUrls.map((url, i) => (
              <div key={i} className="relative">
                <EvidenceThumb url={url} />
                <button
                  className="absolute -top-1 -right-1 h-5 w-5 bg-danger text-white rounded-full flex items-center justify-center"
                  onClick={() => {
                    setEvidenceIds((p) => p.filter((_, j) => j !== i));
                    setEvidenceUrls((p) => p.filter((_, j) => j !== i));
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {isEditable && (
          <EvidenceUploader onUploaded={handleEvidenceUploaded} label="Upload fix photo" />
        )}
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="flex gap-3 pt-2 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={update.isPending}
            className="h-10"
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submit.isPending || update.isPending}
            className="h-10"
          >
            {submit.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
            ) : (
              "Submit Action Plan"
            )}
          </Button>
        </div>
      )}
      {plan.status === "in_progress" && (
        <p className="text-xs text-muted-foreground italic">
          QA Manager has confirmed receipt. Awaiting verification and close.
        </p>
      )}
      {plan.status === "closed" && (
        <div className="flex items-center gap-2 text-success text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Action Plan closed by QA Manager
          {plan.closedAt && ` on ${new Date(plan.closedAt).toLocaleDateString()}`}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QAM View — review and close
// ---------------------------------------------------------------------------
function QAMView({ id }: { id: string }) {
  const { data: plan, isLoading } = useActionPlan(id);
  const [closeEvidenceIds, setCloseEvidenceIds] = useState<string[]>([]);
  const [closeEvidenceUrls, setCloseEvidenceUrls] = useState<string[]>([]);
  const [closeNote, setCloseNote] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);

  const confirm = useConfirmActionPlan();
  const close = useCloseActionPlan();

  if (isLoading) return <SMSkeleton />;
  if (!plan) return null;

  const handleConfirm = async () => {
    try {
      await confirm.mutateAsync(id);
      toast.success("Action Plan confirmed — store is working on it");
    } catch {
      toast.error("Failed to confirm. Please try again.");
    }
  };

  const handleClose = async () => {
    if (closeEvidenceIds.length === 0) {
      toast.warning("Please upload at least one verification photo before closing.");
      return;
    }
    try {
      await close.mutateAsync({
        id,
        evidenceIds: closeEvidenceIds,
        note: closeNote || undefined,
      });
      toast.success("Action Plan closed successfully");
      setShowCloseForm(false);
    } catch {
      toast.error("Failed to close. Please try again.");
    }
  };

  const handleCloseEvidenceUploaded = (evId: string, url: string) => {
    setCloseEvidenceIds((p) => [...p, evId]);
    setCloseEvidenceUrls((p) => [...p, url]);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status row */}
      <div className="flex items-center gap-3">
        <APBadge status={plan.status} />
        {plan.deadline && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Due {new Date(plan.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Audit score reference */}
      {plan.audit && (
        <div className="bg-muted/40 rounded-xl p-4 text-sm mt-4">
          <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide font-medium">Audit Score</p>
          <p className="text-2xl font-semibold text-foreground">{plan.audit.finalScore}</p>
          <p className="text-xs text-muted-foreground capitalize">{plan.audit.grade}</p>
        </div>
      )}

      {/* Violation reference */}
      <ViolationList violations={plan.audit?.violations || []} />

      {/* SM remediation */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Store Manager's Corrective Action
        </p>
        {plan.remediation ? (
          <p className="text-sm text-foreground leading-relaxed">{plan.remediation}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description provided yet.</p>
        )}
      </div>

      {/* SM evidence photos */}
      {(plan.evidences ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Fix Evidence Photos
          </p>
          <div className="flex flex-wrap gap-2">
            {(plan.evidences ?? []).map((ev) => (
              <EvidenceThumb key={ev.id} url={ev.url} />
            ))}
          </div>
        </div>
      )}

      {/* QAM actions */}
      {plan.status === "submitted" && (
        <div className="pt-2 border-t border-border">
          <Button
            onClick={handleConfirm}
            disabled={confirm.isPending}
            className="h-10"
          >
            {confirm.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Confirming...</>
            ) : (
              "Confirm In Progress"
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Marks the store as actively working on corrections.
          </p>
        </div>
      )}

      {plan.status === "in_progress" && !showCloseForm && (
        <div className="pt-2 border-t border-border">
          <Button
            onClick={() => setShowCloseForm(true)}
            variant="outline"
            className="h-10 border-success text-success hover:bg-success/5"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Close Action Plan
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You must upload verification photos before closing.
          </p>
        </div>
      )}

      {/* Close form */}
      {plan.status === "in_progress" && showCloseForm && (
        <div className="border border-border rounded-xl p-5 space-y-4 bg-success-bg/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-sm font-semibold text-foreground">Verify & Close Action Plan</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Verification photos <span className="text-danger">*</span>
            </p>
            {closeEvidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {closeEvidenceUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <EvidenceThumb url={url} />
                    <button
                      className="absolute -top-1 -right-1 h-5 w-5 bg-danger text-white rounded-full flex items-center justify-center"
                      onClick={() => {
                        setCloseEvidenceIds((p) => p.filter((_, j) => j !== i));
                        setCloseEvidenceUrls((p) => p.filter((_, j) => j !== i));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <EvidenceUploader
              onUploaded={handleCloseEvidenceUploaded}
              label="Upload verification photo"
            />
            {closeEvidenceIds.length === 0 && (
              <p className="text-xs text-warning flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                At least one photo required to close
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Closing note (optional)</label>
            <Textarea
              placeholder="Any final remarks about this Action Plan..."
              value={closeNote}
              onChange={(e) => setCloseNote(e.target.value)}
              className="resize-none h-20 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCloseForm(false)}
              disabled={close.isPending}
              className="h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClose}
              disabled={close.isPending || closeEvidenceIds.length === 0}
              className="h-9 text-sm bg-success hover:bg-success/90 text-white"
            >
              {close.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Closing...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Close</>
              )}
            </Button>
          </div>
        </div>
      )}

      {plan.status === "closed" && (
        <div className="flex items-center gap-2 text-success bg-success-bg rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-medium">
            Closed{plan.closedAt ? ` on ${new Date(plan.closedAt).toLocaleDateString()}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function SMSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-10 w-48 rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ActionPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: plan, isLoading } = useActionPlan(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Action Plan Detail</h1>
          {!isLoading && plan?.store && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {plan.store.name} · {plan.store.code}
            </p>
          )}
        </div>
      </div>

      {/* Role-split content */}
      <RoleGuard roles={["store_manager"]}>
        <SMView id={id} />
      </RoleGuard>

      <RoleGuard roles={["qa_manager"]}>
        <QAMView id={id} />
      </RoleGuard>

      <RoleGuard
        roles={["company_admin", "am", "executive_viewer"]}
        fallback={null}
      >
        {/* Read-only view for other roles */}
        {plan && (
          <div className="space-y-4 max-w-2xl">
            <APBadge status={plan.status} />
            {plan.remediation && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Corrective Action</p>
                <p className="text-sm text-foreground">{plan.remediation}</p>
              </div>
            )}
          </div>
        )}
      </RoleGuard>
    </div>
  );
}
