# Phase 7 — Sidebar + Routing

**Effort:** 10m | **Depends on:** Phase 1

## Files sửa

### `src/shared/components/app-sidebar.tsx`

Thêm nav groups cho SM và QAM:

```ts
const SM_NAV: NavGroup[] = [
  {
    label: "Cửa hàng của tôi",
    items: [
      { title: "Kết quả kiểm tra", url: "/qc/results",       icon: BarChart2 },
      { title: "Action Plan",      url: "/qc/action-plans",  icon: ListChecks },
    ],
  },
];

// Cập nhật QAM_NAV — thêm section "Kết quả & Xử lý":
// { title: "Kết quả kiểm tra", url: "/qc/results", icon: BarChart2 },
// { title: "Action Plan",      url: "/qc/action-plans", icon: ListChecks },

// AM_NAV (mới):
const AM_NAV: NavGroup[] = [
  {
    label: "Khu vực",
    items: [
      { title: "Kết quả kiểm tra", url: "/qc/results",      icon: BarChart2 },
      { title: "Action Plan",      url: "/qc/action-plans", icon: ListChecks },
    ],
  },
];

// EXECUTIVE_NAV (mới):
const EXECUTIVE_NAV: NavGroup[] = [
  {
    label: "Báo cáo",
    items: [
      { title: "Kết quả kiểm tra", url: "/qc/results",      icon: BarChart2 },
      { title: "Action Plan",      url: "/qc/action-plans", icon: ListChecks },
    ],
  },
];

// NAV_BY_ROLE:
const NAV_BY_ROLE = {
  ...
  store_manager:    SM_NAV,
  am:               AM_NAV,
  executive_viewer: EXECUTIVE_NAV,
};
```

Import thêm icons: `BarChart2`, `ListChecks` (đã có từ trước).

### `src/lib/roles.ts` — `getLandingPathByRole`

```ts
case "store_manager":    return "/qc/results";   // SM thấy kết quả bài mình ngay
case "am":               return "/qc/results";
case "executive_viewer": return "/qc/results";
```

## Import icons cần thêm

`BarChart2` đã import trong `app-sidebar.tsx` (đã dùng cho kết quả QC). `ListChecks` cũng đã import. Kiểm tra trước khi thêm.

## Verification

- `npm run typecheck`
- Login SM → landing `/qc/results` → sidebar hiện "Kết quả kiểm tra" + "Action Plan"
- Login AM/EV → cùng routing
- Login QAM → menu mới trong QAM section
