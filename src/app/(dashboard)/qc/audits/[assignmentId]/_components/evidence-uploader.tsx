"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadApi } from "@/shared/api/upload.api";
import type { UploadedImage } from "@/shared/types";

interface ImagePreview {
  id: string;
  url: string;
}

interface EvidenceUploaderProps {
  criteriaId: string;
  images: ImagePreview[];
  readOnly: boolean;
  onUploaded: (criteriaId: string, img: UploadedImage) => void;
  onRemoved: (criteriaId: string, imageId: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function EvidenceUploader({
  criteriaId,
  images,
  readOnly,
  onUploaded,
  onRemoved,
}: EvidenceUploaderProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadApi.uploadImage(file);
      onUploaded(criteriaId, uploaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.includes("does not match") ? "File không phải ảnh hợp lệ" : "Upload thất bại — thử lại");
    } finally {
      setUploading(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative w-16 h-16 rounded-md overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Bằng chứng" className="w-full h-full object-cover" />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemoved(criteriaId, img.id)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <>
          {/* Hidden inputs: one with capture for camera, one without for gallery */}
          <input
            ref={cameraRef}
            data-testid={`audit-evidence-camera-input-${criteriaId}`}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={galleryRef}
            data-testid={`audit-evidence-gallery-input-${criteriaId}`}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-muted transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Chụp ảnh
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-muted transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              Chọn ảnh
            </button>
            {uploading && <span className="text-xs text-muted-foreground">Đang tải lên…</span>}
          </div>
        </>
      )}
    </div>
  );
}
