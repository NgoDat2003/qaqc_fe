# Phase 4 — Organization Page

**Effort:** 20 min
**File:** `src/app/(dashboard)/master-data/organization/page.tsx`

---

## Việc cần làm

### 1. Xóa "Xóa" action → thay bằng toggle active

```tsx
// Trước
{ label: "Xóa", icon: Trash2, onClick: () => {}, variant: "destructive" }

// Sau — store
{
  label: s.isActive ? "Ngừng hoạt động" : "Kích hoạt",
  icon: s.isActive ? XCircle : CheckCircle2,
  onClick: () => handleToggleStoreActive(s),
  variant: s.isActive ? "destructive" : "default",
}
```

Handler:
```ts
const handleToggleStoreActive = useCallback(async (store: Store) => {
  try {
    await updateStore.mutateAsync({ id: store.id, isActive: !store.isActive });
    toast.success(store.isActive ? "Đã ngừng hoạt động" : "Đã kích hoạt lại");
  } catch {
    toast.error("Có lỗi xảy ra, vui lòng thử lại");
  }
}, [updateStore]);
```

Icon imports: xóa `Trash2`, thêm `XCircle, CheckCircle2`.

### 2. Xóa `brands={brandRows}` prop khỏi `<StoreDrawer>`

Sau Phase 2, StoreDrawer tự load brands — không cần truyền nữa.

### 3. Update `storeInitialData`

```ts
// Đổi brand: → brandId:
const storeInitialData = editingItem && "brandId" in editingItem ? {
  code:      editingItem.code,
  name:      editingItem.name,
  brandId:   editingItem.brandId ?? "",      // ← đổi từ brand
  modelType: editingItem.modelType,
  region:    editingItem.region ?? "",
  province:  editingItem.province ?? "",
  district:  editingItem.district ?? "",
  ward:      editingItem.ward ?? "",
  address:   editingItem.address ?? "",
  managerId: editingItem.managerId ?? "",
  isActive:  editingItem.isActive,
} : undefined;
```

### 4. Update `handleStoreSubmit`

```ts
const payload: Partial<Store> = {
  code:      data.code,
  name:      data.name,
  brandId:   data.brandId,          // ← đổi từ data.brand
  modelType: data.modelType,
  region:    data.region || null,
  province:  data.province || null,
  district:  data.district || null,
  ward:      data.ward || null,
  address:   data.address || null,
  managerId: data.managerId || null,
  isActive:  data.isActive,
};
```

### 5. Kiểm tra file size

Nếu file > 200 lines → tách `storeColumns` + `brandColumns` ra file riêng:
- `src/app/(dashboard)/master-data/organization/store-columns.tsx`
- `src/app/(dashboard)/master-data/organization/brand-columns.tsx`

---

## Checklist

- [ ] Thêm `handleToggleStoreActive` callback
- [ ] Cập nhật store RowActions (XCircle/CheckCircle2 thay Trash2)
- [ ] Xóa `brands={brandRows}` prop khỏi StoreDrawer
- [ ] Cập nhật `storeInitialData` dùng `brandId`
- [ ] Cập nhật `handleStoreSubmit` dùng `data.brandId`
- [ ] Kiểm tra file size, tách nếu cần
- [ ] `npm run typecheck` clean
- [ ] Test thủ công: toggle active/inactive store hoạt động đúng
