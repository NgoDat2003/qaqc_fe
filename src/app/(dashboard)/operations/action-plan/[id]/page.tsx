"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft, Clock, CheckCircle2, Loader2,
  AlertTriangle,
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
  useReviewActionPlan,
  useCloseActionPlan,
} from "@/features/action-plan";
import type { ActionPlanStatus, Violation } from "@/shared/types";

type ViolationWithGroup = Violation & {
  criteria?: NonNullable<Violation["criteria"]> & {
    group?: { id: string; name: string; code: string };
  };
};

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_META: Record<ActionPlanStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", cls: "bg-info-bg text-info border-info/20" },
  rejected:  { label: "Rejected",  cls: "bg-danger/10 text-danger border-danger/20" },
  closed:    { label: "Closed",    cls: "bg-success-bg text-success border-success/20" },
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
// SM View — create / update action plan
// ---------------------------------------------------------------------------
function SMView({ id }: { id: string }) {
  const { data: plan, isLoading } = useActionPlan(id);
  const [remediation, setRemediation] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);

  const update = useUpdateActionPlan();
  const submit = useSubmitActionPlan();

  if (isLoading) return <SMSkeleton />;
  if (!plan) return null;

  const isEditable = plan.status === "draft" || plan.status === "rejected";
  const currentRemediation = remediation ?? plan.remediation ?? "";
  const currentDeadline = deadline ?? (plan.deadline ? plan.deadline.slice(0, 10) : "");

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        id,
        actionDescription: currentRemediation,
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
      await update.mutateAsync({ id, actionDescription: currentRemediation, deadline: currentDeadline || undefined });
      await submit.mutateAsync(id);
      toast.success("Action Plan submitted to QA Manager");
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
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

      {plan.status === "rejected" && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          QA Manager đã từ chối. Vui lòng cập nhật và gửi lại.
        </div>
      )}

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
          onChange={(e) => setRemediation(e.target.value ?? "")}
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
          onChange={(e) => setDeadline(e.target.value ?? "")}
          disabled={!isEditable}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground w-48 disabled:opacity-50"
        />
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

  const review = useReviewActionPlan();
  const close = useCloseActionPlan();

  if (isLoading) return <SMSkeleton />;
  if (!plan) return null;

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
          Store Manager&apos;s Corrective Action
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

      {/* QAM actions — submitted state: reject or close */}
      {plan.status === "submitted" && (
        <div className="flex gap-3 pt-2 border-t border-border">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await review.mutateAsync({ id, action: "reject" });
                toast.success("Action Plan rejected — store will revise");
              } catch {
                toast.error("Failed to reject. Please try again.");
              }
            }}
            disabled={review.isPending || close.isPending}
            className="h-10 border-danger/40 text-danger hover:bg-danger/5 hover:border-danger"
          >
            {review.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reject
          </Button>
          <Button
            onClick={async () => {
              try {
                await close.mutateAsync(id);
                toast.success("Action Plan closed successfully");
              } catch {
                toast.error("Failed to close. Please try again.");
              }
            }}
            disabled={close.isPending || review.isPending}
            className="h-10 bg-success hover:bg-success/90 text-white"
          >
            {close.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Closing...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Close Action Plan</>
            )}
          </Button>
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
