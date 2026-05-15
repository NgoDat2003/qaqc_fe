# Phase 3 — BrandDrawer Polish

**Effort:** 15 min
**File:** `src/features/master-data/components/brand-drawer.tsx`

---

## DB Brand fields (đủ rồi, không thêm)

```
code (unique), name (unique), isActive
```

## Fixes nhỏ

| Vấn đề | Fix |
|--------|-----|
| SheetTitle dùng `uppercase` trông cứng | Bỏ `uppercase` ở title |
| SheetDescription `font-bold text-gray-400` khó đọc | → `text-sm text-muted-foreground` |
| Code field không có hint format | Thêm description text + `font-mono` |
| Placeholder name chung chung | → "Ví dụ: Maycha, The Coffee House" |

## Code changes

```tsx
// SheetTitle — bỏ uppercase
<SheetTitle className="text-xl font-bold tracking-tight flex items-center gap-2">

// SheetDescription
<SheetDescription className="text-sm text-muted-foreground">
  Quản lý các thương hiệu trong hệ thống.
</SheetDescription>

// Name field placeholder
<Input placeholder="Ví dụ: Maycha, The Coffee House" ... />

// Code field — thêm font-mono + hint
<Input
  placeholder="Ví dụ: MC, CLOUD"
  className="h-11 rounded-xl border-gray-200 focus:border-primary font-mono shadow-sm"
  {...field}
/>
<p className="text-[11px] text-muted-foreground mt-1">Viết hoa, không dấu, ngắn gọn.</p>
```

## Checklist

- [ ] Bỏ `uppercase` ở SheetTitle
- [ ] Sửa SheetDescription class
- [ ] `font-mono` + hint text cho code field
- [ ] Placeholder name thực tế hơn
- [ ] Test: create brand + edit brand hoạt động đúng
