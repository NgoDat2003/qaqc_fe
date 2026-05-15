# Phase 5 — Users Page Review & Fix

**Effort:** 30 min
**File:** `src/app/(dashboard)/master-data/users/page.tsx`

---

## Hiện trạng cần đánh giá

Đọc file `users/page.tsx` trước, xác định:
1. UserDrawer có pre-fill đúng khi edit không?
2. Role assignment UI rõ ràng không?
3. Toggle active/inactive có hoạt động không?
4. Pagination đã đúng chưa?

**Chỉ fix những gì thực sự broken.** Không refactor nếu đang hoạt động tốt.

---

## Những gì đã biết là OK

- `useUsers` hook có pagination ✅
- `useToggleUserActive` đã có (`masterApi.toggleUserActive`) ✅
- `UserDrawer` component đã có ✅

---

## Những gì cần kiểm tra

### UserDrawer — role assignment

BE `POST /api/users` nhận:
```ts
roleAssignments: [{ roleKey: string, storeId?: string }]
```

Cần verify UserDrawer gửi đúng format này. Xem `use-users.ts` → `useCreateUser` mutation.

### Edit user flow

BE `PATCH /api/users/[id]` nhận gì? Đọc file BE để verify FE gửi đúng fields.

### Hiển thị roles trong table

User có thể có nhiều roles. Table cần hiển thị rõ — không chỉ 1 role.

---

## Checklist

- [ ] Đọc `users/page.tsx` — xác định issues thực sự
- [ ] Đọc `user-drawer.tsx` — verify role assignment form
- [ ] Kiểm tra create user flow hoạt động end-to-end
- [ ] Kiểm tra edit user flow hoạt động end-to-end
- [ ] Kiểm tra toggle active/inactive
- [ ] Fix bất kỳ bugs tìm thấy
- [ ] `npm run typecheck` clean
- [ ] Test thủ công: tạo user + gán role, sửa user, toggle active

---

## Notes

- Users page đang có pagination và search — verify chúng hoạt động
- Không thêm tính năng mới — chỉ fix những gì broken
- Nếu UserDrawer ổn, bỏ qua, không sửa
