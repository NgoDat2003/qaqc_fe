# Design & UI Rules

## Component library

- UI: shadcn/ui + Radix — dùng component có sẵn trước khi tự viết
- Icons: Lucide icons — không dùng thư viện icon khác
- Styling: Tailwind v4 — không dùng inline style hay CSS module

## Design principles

- Mobile-first (đặc biệt với Audit Execute — QC dùng điện thoại tại quán)
- Premium, vibrant — dùng Brand Gold / Success Green thay vì màu generic
- Không dùng màu hardcode — dùng CSS variable của theme

## Màu theo vai trò

- Brand: primary (gold)
- Success/pass: success green
- Error/fail/CCP: danger red
- Warning/RISK: warning amber

## Accessibility

- Button phải có label rõ ràng
- Form field phải có label và error message
- Loading state phải có spinner hoặc skeleton

## Responsive

- Dashboard: desktop-first
- Audit Execute (QC): mobile-first, sticky bottom bar
- Sidebar: collapsible icon mode khi màn nhỏ
