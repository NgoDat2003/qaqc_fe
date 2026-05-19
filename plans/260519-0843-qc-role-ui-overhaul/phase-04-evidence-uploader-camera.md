# Phase 04 — Evidence uploader: camera + gallery

## Context links
- Root plan: [plan.md](./plan.md)
- File: `src/app/(dashboard)/qc/audits/[assignmentId]/_components/evidence-uploader.tsx`
- Upload API: `src/shared/api/upload.api.ts` (`uploadApi.uploadImage`)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~15m
- **Mô tả:** Hiện chỉ có 1 nút "Thêm ảnh bằng chứng" → mở file picker thư viện. Trên mobile QC cần option chụp trực tiếp bằng camera. Bổ sung 2 nút riêng: "Chụp ảnh" (camera capture) và "Chọn ảnh" (gallery).

## Key insights
- HTML `<input capture="environment">` mở camera sau (rear) trên iOS/Android. KHÔNG dùng `accept="image/*"` đơn thuần — nhiều device sẽ vẫn show picker chọn.
- Spec hiện tại check `ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]`. Camera capture thường trả `image/jpeg` → OK.
- 1 logic `handleFileChange` chung cho cả 2 input — chỉ khác property `capture`.
- 2 nút riêng = UX rõ ràng cross-platform; iOS Safari mỗi nút phải có user-gesture trực tiếp.

## Requirements

### Functional
- 2 nút side-by-side: "Chụp ảnh" (icon `Camera`) + "Chọn ảnh" (icon `ImagePlus`).
- Cả 2 nút dùng cùng handler upload.
- Trên desktop, "Chụp ảnh" vẫn fallback về file picker (browser tự decide).
- Vẫn validate type + size như cũ.

### Non-functional
- File ≤ 200 dòng.
- Không tạo deps mới.

## Architecture
```
EvidenceUploader
  ├── <input ref=cameraRef capture="environment" hidden />
  ├── <input ref=galleryRef hidden />
  ├── handleFileChange (shared)
  └── 2 buttons → trigger respective ref
```

## Related code files

### Modify
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/evidence-uploader.tsx`

### Create / Delete
- (None)

## Implementation steps

1. **Refactor `evidence-uploader.tsx`:**
   ```tsx
   import { useRef, useState } from "react";
   import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
   …

   const cameraRef = useRef<HTMLInputElement>(null);
   const galleryRef = useRef<HTMLInputElement>(null);

   // shared handler — unchanged validation/logic
   async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) { … }

   return (
     <div className="space-y-2">
       {images.length > 0 && (…)}
       {!readOnly && (
         <>
           <input ref={cameraRef} type="file" accept={ACCEPTED_TYPES.join(",")} capture="environment" className="hidden" onChange={handleFileChange} />
           <input ref={galleryRef} type="file" accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={handleFileChange} />
           <div className="flex items-center gap-2">
             <button type="button" onClick={() => cameraRef.current?.click()} disabled={uploading}
               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-muted transition-colors disabled:opacity-50">
               {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
               Chụp ảnh
             </button>
             <button type="button" onClick={() => galleryRef.current?.click()} disabled={uploading}
               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-muted transition-colors disabled:opacity-50">
               <ImagePlus className="w-4 h-4" />
               Chọn ảnh
             </button>
             {uploading && <span className="text-xs text-muted-foreground">Đang tải…</span>}
           </div>
         </>
       )}
     </div>
   );
   ```

2. Đảm bảo reset cả 2 input ref trong `finally`:
   ```ts
   if (cameraRef.current) cameraRef.current.value = "";
   if (galleryRef.current) galleryRef.current.value = "";
   ```

3. **Typecheck** + manual:
   - Desktop Chrome → cả 2 mở file picker (chấp nhận).
   - Mobile DevTools mode → vẫn dùng file picker (không thật).
   - Real device test (nếu có): "Chụp ảnh" mở camera, "Chọn ảnh" mở gallery.

## Todo list
- [ ] Refactor `evidence-uploader.tsx` — 2 input refs, 2 buttons
- [ ] Import icon `Camera`
- [ ] Reset cả 2 ref trong `finally`
- [ ] `npm run typecheck` pass
- [ ] Smoke test desktop

## Success criteria
- 2 nút "Chụp ảnh" và "Chọn ảnh" hiển thị side-by-side.
- Upload flow giữ nguyên — không regression.
- Validate type + size như cũ.

## Risk assessment
| Risk | Mitigation |
|------|------------|
| iOS Safari user-gesture mất nếu click qua wrapper element | 2 input ref riêng + click trực tiếp ref. KHÔNG dùng setTimeout/Promise giữa click và `.click()` |
| Browser cũ không support `capture` | `capture` được ignored — fallback về file picker |
| User confuse 2 nút | Label tiếng Việt rõ "Chụp ảnh" / "Chọn ảnh" + icon Camera vs ImagePlus |

## Security considerations
- N/A — flow upload không đổi, BE vẫn validate.

## Next steps
- Phase 05 (draft status indicator).
