# Color Palette — QA/QC Platform

> Dựa trên screenshot login page: dark professional + amber gold accent.
> Tất cả màu dùng trong globals.css và Tailwind classes.

---

## Brand Colors

| Role | Tên | Hex | CSS Variable | Dùng cho |
|------|-----|-----|-------------|---------|
| Primary | Amber Gold | `#F59E0B` | `--primary` | Button chính, link, active state |
| Primary Dark | Deep Amber | `#D97706` | `--primary-hover` | Hover state |
| Primary Light | Amber 50 | `#FFFBEB` | `--primary-light` | Background highlight |

---

## Neutral / Surface

| Role | Tên | Hex | CSS Variable | Dùng cho |
|------|-----|-----|-------------|---------|
| Background | Slate 50 | `#F8FAFC` | `--background` | Nền trang dashboard |
| Card | White | `#FFFFFF` | `--card` | Card, panel |
| Border | Slate 200 | `#E2E8F0` | `--border` | Đường kẻ |
| Muted | Slate 100 | `#F1F5F9` | `--muted` | Background phụ |
| Muted Text | Slate 400 | `#94A3B8` | `--muted-foreground` | Label, placeholder |
| Body Text | Slate 900 | `#0F172A` | `--foreground` | Text chính |

---

## Semantic Colors

| Role | Hex | CSS Variable | Dùng cho |
|------|-----|-------------|---------|
| Success | `#059669` | `--success` | Đạt, hoàn thành, close AP |
| Success BG | `#ECFDF5` | `--success-bg` | Badge background success |
| Warning | `#D97706` | `--warning` | Cảnh báo, pending |
| Warning BG | `#FFFBEB` | `--warning-bg` | Badge background warning |
| Danger | `#DC2626` | `--danger` | Lỗi, validation error, fail |
| Danger BG | `#FEF2F2` | `--danger-bg` | Badge background danger |
| Info | `#2563EB` | `--info` | Thông tin, in progress |
| Info BG | `#EFF6FF` | `--info-bg` | Badge background info |

---

## Score Grade Colors (quan trọng nhất cho QA/QC)

| Grade | Điều kiện | Hex | CSS Variable | Màu chữ |
|-------|-----------|-----|-------------|---------|
| Xuất sắc | ≥ 95% | `#16A34A` | `--score-excellent` | White |
| Tốt | 85–94% | `#2563EB` | `--score-good` | White |
| Đạt | 70–84% | `#D97706` | `--score-pass` | White |
| Không đạt | > 0% | `#EA580C` | `--score-fail` | White |
| Báo động | RISK/0% | `#DC2626` | `--score-alarm` | White |

---

## Sidebar (Dark Theme)

| Role | Hex | CSS Variable |
|------|-----|-------------|
| Sidebar BG | `#0F172A` (Slate 900) | `--sidebar` |
| Sidebar Text | `#94A3B8` (Slate 400) | `--sidebar-foreground` |
| Active Item BG | `#1E293B` (Slate 800) | `--sidebar-accent` |
| Active Text | `#F1F5F9` (Slate 100) | `--sidebar-accent-foreground` |
| Active Icon | `#F59E0B` (Amber) | `--sidebar-primary` |

---

## Login Page (Dark Split Layout — như screenshot)

| Element | Hex |
|---------|-----|
| Left panel BG | `#0A0A0F` |
| Right panel BG | `#111117` |
| Primary button | `#F59E0B` → text `#000000` |
| Input BG | `#1A1A24` |
| Input border | `#2A2A3A` |
| Heading | `#FFFFFF` |
| Subtext | `#94A3B8` |

---

## Quick Reference — Tailwind Classes

```tsx
// Primary button
className="bg-primary text-primary-foreground hover:bg-primary/90"

// Success badge
className="bg-success-bg text-success border-success/20"

// Danger text
className="text-danger"

// Muted label
className="text-muted-foreground text-sm"

// Score grades
className="bg-score-excellent text-white"  // Xuất sắc
className="bg-score-good text-white"       // Tốt
className="bg-score-pass text-white"       // Đạt
className="bg-score-fail text-white"       // Không đạt
className="bg-score-alarm text-white"      // Báo động

// Dark sidebar
className="bg-sidebar text-sidebar-foreground"
```

---

## Không dùng

- ❌ Màu inline style — dùng CSS variable qua Tailwind
- ❌ Hardcode hex trong component
- ❌ Thêm màu mới ngoài palette này mà không update file này
