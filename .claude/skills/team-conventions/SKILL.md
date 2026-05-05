---
name: team-conventions
description: Quy ước code và pattern riêng của project  QA/QC platform Frontend. Dùng khi viết component, hook, hoặc API mới.
---

## Cấu trúc Feature

Mỗi feature đi theo thứ tự bắt buộc:
```
API (api/*.ts) → Hook (hooks/*.ts) → Component → Page
```
Không tạo page trước khi hook xong. Không tạo hook trước khi type có trong `shared/types/index.ts`.

## API Pattern

```typescript
// Đúng — dùng apiClient
import { apiClient } from "@/lib/api-client"
export const brandApi = {
  getAll: () => apiClient.get<Brand[]>("/brands"),
  create: (data: CreateBrandDto) => apiClient.post<Brand>("/brands", data),
}

// Sai — không dùng fetch trực tiếp trong feature
const res = await fetch("/api/brands") // ❌
```

Upload file: chỉ dùng `uploadApi.uploadEvidence()`, không bao giờ dùng `apiClient.post()` với FormData.

## Hook Pattern

```typescript
// Query hook
export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAll(),
  })
}

// Mutation hook — luôn invalidate query sau khi thành công
export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: brandApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Tạo brand thành công")
    },
    onError: (err) => toast.error(err.message),
  })
}
```

## Component Pattern

```typescript
// Luôn named export, không default export cho component
export function BrandDrawer({ open, onClose }: Props) { ... } // ✅
export default function BrandDrawer() { ... } // ❌

// Props interface ngay trên component
interface Props {
  open: boolean
  onClose: () => void
  brand?: Brand // optional = có thể là create hoặc edit
}
```

## Role Guard

```typescript
// Bao component cần phân quyền
<RoleGuard allowedRoles={["qa_manager"]}>
  <PublishButton />
</RoleGuard>

// Hoặc dùng hook trong logic
const canClose = useHasRole(["qa_manager"])
```

## Scoring Rules (không sửa logic này)

- CCP → điểm nhóm tiêu chí liên quan = 0 (không phải toàn bài)
- RISK → toàn bài = 0
- Lỗi lặp: lần 4 cùng tiêu chí → auto CCP, lần 5 reset về 1
- Điểm tổng ẩn khi QC đang điền, chỉ hiện sau submit

## Không được làm

- Không sửa `src/shared/types/index.ts` field đã có (chỉ thêm)
- Không commit `.env.local`
- Không edit file trên `main` branch — tạo feature branch trước
- Không dùng `any` — dùng type cụ thể hoặc `unknown`