"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useUpdateActionPlan } from "@/features/audit";
import { uploadApi } from "@/shared/api/upload.api";
import { toast } from "sonner";
import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
import type { ActionPlanItem, ActionPlanDetail, UploadedImage } from "@/shared/types";

interface ApItemCardProps {
  item: ActionPlanItem;
  ap: ActionPlanDetail;
}

const FLAG_CLASSES: Record<string, string> = {
  none:     "bg-muted text-muted-foreground border-border",
  critical: "bg-warning-bg text-warning border-warning/20",
  risk:     "bg-danger-bg text-danger border-danger/20",
};
const FLAG_LABELS: Record<string, string> = { none: "Thường", critical: "CCP", risk: "RISK" };

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function ApItemCard({ item, ap }: ApItemCardProps) {
  const editable = ap.status === "draft" || ap.status === "rejected";
  const v = item.violation;
  const needsImages =
    v.criteria.flag !== "none" || v.isCriticalTriggered || v.isRiskTriggered;

  const [remediation, setRemediation]   = useState(item.remediation ?? "");
  const [fixedAt, setFixedAt]           = useState(
    item.fixedAt ? item.fixedAt.slice(0, 10) : ""
  );
  const [assigneeName, setAssigneeName] = useState(item.assigneeName ?? "");
  const [remImages, setRemImages]       = useState<UploadedImage[]>(item.remediationImages);
  const [uploading, setUploading]       = useState(false);

  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const timer      = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = useUpdateActionPlan();

  function scheduleUpdate(fields: {
    remediation?: string;
    fixedAt?: string; assigneeName?: string; imageIds?: string[];
  }) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update.mutate({
        id: ap.id,
        items: [{
          itemId: item.id,
          remediation: fields.remediation ?? remediation,
          fixedAt: fields.fixedAt !== undefined
            ? (fields.fixedAt ? new Date(fields.fixedAt).toISOString() : null)
            : (fixedAt ? new Date(fixedAt).toISOString() : null),
          assigneeName: fields.assigneeName ?? assigneeName,
          imageIds: fields.imageIds ?? remImages.map((i) => i.id),
        }],
      });
    }, 1500);
  }

  // cleanup timer on unmount
  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { toast.error("Chỉ chấp nhận JPEG, PNG, WEBP"); return; }
    if (file.size > MAX_BYTES)         { toast.error("Ảnh không được vượt quá 5MB"); return; }
    setUploading(true);
    try {
      const uploaded = await uploadApi.uploadImage(file);
      const next = [...remImages, uploaded];
      setRemImages(next);
      scheduleUpdate({ imageIds: next.map((i) => i.id) });
    } catch { toast.error("Upload thất bại"); }
    finally {
      setUploading(false);
      if (cameraRef.current)  cameraRef.current.value  = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  function removeImage(id: string) {
    const next = remImages.filter((i) => i.id !== id);
    setRemImages(next);
    scheduleUpdate({ imageIds: next.map((i) => i.id) });
  }
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
      {/* Violation info — read-only */}
      <div className="space-y-1.5 pb-3 border-b border-border/40">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground shrink-0">{v.criteria.code}</span>
          <span className={cn(
            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase shrink-0",
            FLAG_CLASSES[v.criteria.flag]
          )}>
            {FLAG_LABELS[v.criteria.flag]}
          </span>
          <span className="text-sm font-semibold text-foreground">{v.criteria.name}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Số lỗi: <strong className="text-foreground">{v.numErrors}</strong></span>
          <span className={cn(
            "font-medium",
            v.repeatCount === 0 ? "text-info" : "text-warning"
          )}>
            {v.repeatCount === 0 ? "Lỗi mới" : `Lặp lần ${v.repeatCount}`}
          </span>
          {v.isCriticalTriggered && <span className="text-warning font-medium">CCP kích hoạt</span>}
          {v.isRiskTriggered     && <span className="text-danger font-medium">RISK kích hoạt</span>}
        </div>
        {v.images.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {v.images.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded overflow-hidden border block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="QC" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        )}
      </div>
      {/* SM edit fields */}
      <div className="space-y-3">
        {/* QC note — read-only, shown as context for SM */}
        {v.note && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Ghi chú QC lúc chấm</p>
            <p className="text-xs text-foreground bg-muted/40 rounded-md px-2.5 py-1.5">{v.note}</p>
          </div>
        )}
        {/* remediation */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Hướng khắc phục *</label>
          <textarea rows={2} disabled={!editable}
            value={remediation}
            onChange={(e) => { setRemediation(e.target.value); scheduleUpdate({ remediation: e.target.value }); }}
            placeholder="Mô tả cách khắc phục..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>
        {/* fixedAt + assigneeName */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Ngày đã sửa *</label>
            <input type="date" disabled={!editable}
              value={fixedAt}
              onChange={(e) => { setFixedAt(e.target.value); scheduleUpdate({ fixedAt: e.target.value }); }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Người thực hiện *</label>
            <input type="text" disabled={!editable}
              value={assigneeName}
              onChange={(e) => { setAssigneeName(e.target.value); scheduleUpdate({ assigneeName: e.target.value }); }}
              placeholder="Tên người sửa..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
          </div>
        </div>
        {/* remediation images */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Ảnh khắc phục{needsImages ? " *" : ""}
          </label>
          {remImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {remImages.map((img) => (
                <div key={img.id} className="relative w-16 h-16 rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="Khắc phục" className="w-full h-full object-cover" />
                  {editable && (
                    <button type="button" onClick={() => removeImage(img.id)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editable && (
            <>
              <input ref={cameraRef} type="file" accept={ACCEPTED.join(",")} capture="environment" className="hidden" onChange={handleFile} />
              <input ref={galleryRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={handleFile} />
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => cameraRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-muted transition-colors disabled:opacity-50">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  Chụp ảnh
                </button>
                <button type="button" onClick={() => galleryRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-muted transition-colors disabled:opacity-50">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Chọn ảnh
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
