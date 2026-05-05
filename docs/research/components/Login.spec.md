# Login Page Specification

## Overview
- **Target file**: `src/app/login/page.tsx` and `src/components/auth/login-form.tsx`
- **Screenshot**: `docs/design-references/login_page.png`
- **Interaction model**: Static with form submission.

## Layout Structure
- **Root**: Full-screen flex container with a subtle linear gradient background (light gray/blue).
- **Container**: Max-width ~1200px, centered.
- **Left Column (Branding)**:
  - Large Logo (Square, Gold theme).
  - Title: "Thịnh Thế Vinh Hoa"
  - Subtitle: "Nền tảng QA/QC cho hệ thống F&B đa thương hiệu"
  - Feature items (3 cards): Icon + Title + Description.
- **Right Column (Form)**:
  - White card with 16px border-radius.
  - Padding: 32px.
  - Title: "Đăng nhập hệ thống"
  - Subtitle: "Đăng nhập bằng email và mật khẩu..."

## Design Tokens
- **Brand Gold**: `#c4a46c` (Buttons, Active states).
- **Input Border**: `#d9d9d9` (Focus color: `#c4a46c`).
- **Typography**: Inter (14px body, 24px headings).

## Interactions
- **Focus**: Inputs should highlight in Brand Gold.
- **Hover**: Submit button changes to a slightly darker shade.
- **Validation**: Error messages should appear in red (`#f5222d`).

## Assets
- Logo: `public/logo.png`
- Icons: `Mail`, `Lock`, `Eye`, `LayoutDashboard`, `Database`, `Users` (Lucide Icons).
