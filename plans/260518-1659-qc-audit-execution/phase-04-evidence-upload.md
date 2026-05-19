# Phase 4 — Evidence Upload

**Effort:** 30m | **Depends on:** Phase 1, Phase 3  
**Status:** ✅ COMPLETED

## Overview

Component `EvidenceUploader` gắn vào mỗi `CriteriaItemCard`. Cho phép QC chọn ảnh,
preview, xóa. Upload qua `uploadApi.uploadImage`, lưu `imageId` vào violations state.

## Business rules

- Chấp nhận: JPEG, PNG, WEBP
- Tối đa 5MB / file
- Ảnh gắn theo từng lỗi (criteriaId), không phải toàn bài
- Sau upload thành công: `ADD_IMAGE` action vào reducer
- Xóa ảnh: `REMOVE_IMAGE` action (chỉ xóa khỏi state FE — BE không có endpoint xóa ảnh đơn lẻ)
- Lỗi BE `Image content does not match the declared file type` → toast cụ thể

## File tạo mới

### `src/app/(dashboard)/qc/audits/[assignmentId]/_components/evidence-uploader.tsx`

```tsx
"use client";

import { useRef, useState } from "react";
import { uploadApi } from "@/shared/api/upload.api";
import type { ViolationAction } from "../_lib/violations-reducer";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadedPreview {
  id: string;
  url: string;
}

interface Props {
  criteriaId: string;
  currentImages: UploadedPreview[]; // từ violation.imageIds → cần map url từ session
  readOnly: boolean;
  onDispatch: (action: ViolationAction) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function EvidenceUploader({ criteriaId, currentImages, readOnly, onDispatch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadApi.uploadImage(file);
      onDispatch({ type: "ADD_IMAGE", criteriaId, imageId: uploaded.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload thất bại";
      if (msg.includes("does not match")) {
        toast.error("File không phải ảnh hợp lệ");
      } else {
        toast.error("Không thể upload ảnh — thử lại");
      }
    } finally {
      setUploading(false);
      // Reset input để có thể chọn lại cùng file
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {/* Ảnh đã upload */}
      {currentImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentImages.map((img) => (
            <div key={img.id} className="relative w-16 h-16 rounded overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Bằng chứng" className="w-full h-full object-cover" />
              {!readOnly && (
                <button
                  onClick={() => onDispatch({ type: "REMOVE_IMAGE", criteriaId, imageId: img.id })}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            {uploading ? "Đang upload..." : "Thêm ảnh"}
          </button>
        </>
      )}
    </div>
  );
}
```

## Tích hợp vào `criteria-item-card.tsx`

Thêm vào cuối card (sau note textarea), thay "Evidence placeholder":

```tsx
// Cần build imagePreview từ session data + uploaded mới
// Session trả về violations[].images[] có {id, url}
// State FE chỉ lưu imageIds — cần merge với session images để có url

// Cách đơn giản: truyền xuống từ page session.audit.violations làm "known images"
// và manage preview locally khi có upload mới

{numErrors > 0 && (
  <EvidenceUploader
    criteriaId={criteria.id}
    currentImages={imagePreviewsForCriteria} // xem note dưới
    readOnly={readOnly}
    onDispatch={onDispatch}
  />
)}
```

## Xử lý image preview URLs

Vấn đề: Reducer chỉ lưu `imageIds`, không lưu `url`. Cần `url` để preview.

**Giải pháp:** Dùng local `useState<Record<string, UploadedPreview[]>>` trong page để lưu preview URLs song song với imageIds trong reducer. Khi upload thành công, cập nhật cả reducer (ADD_IMAGE) lẫn preview state.

Truyền `imagesMap` xuống `CriteriaItemCard` → `EvidenceUploader`:

```tsx
// Trong page.tsx thêm:
const [imagePreviews, setImagePreviews] = useState<Record<string, Array<{id: string; url: string}>>>({});

// Restore từ session:
useEffect(() => {
  if (!session?.audit?.violations) return;
  const previews: typeof imagePreviews = {};
  for (const v of session.audit.violations) {
    previews[v.criteriaId] = v.images.map(({ id, url }) => ({ id, url }));
  }
  setImagePreviews(previews);
}, [session?.audit?.violations]);

// Khi upload thành công (callback từ EvidenceUploader):
function handleImageUploaded(criteriaId: string, img: { id: string; url: string }) {
  dispatch({ type: "ADD_IMAGE", criteriaId, imageId: img.id });
  setImagePreviews((prev) => ({
    ...prev,
    [criteriaId]: [...(prev[criteriaId] ?? []), img],
  }));
}

// Khi xóa ảnh:
function handleImageRemoved(criteriaId: string, imageId: string) {
  dispatch({ type: "REMOVE_IMAGE", criteriaId, imageId });
  setImagePreviews((prev) => ({
    ...prev,
    [criteriaId]: prev[criteriaId]?.filter((img) => img.id !== imageId) ?? [],
  }));
}
```

Cập nhật `EvidenceUploader` props để nhận `onUpload` và `onRemove` callbacks thay vì `onDispatch` trực tiếp — giữ component đơn giản hơn.

## Verification

```bash
npm run typecheck
```

Smoke test: +1 lỗi → thêm ảnh (JPEG) → thấy preview thumbnail → xóa ảnh → preview biến mất → check Network tab: POST `/api/upload/images` 200.

Test lỗi: Upload file `.html` giả → toast "File không phải ảnh hợp lệ".
