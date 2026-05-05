# Decision Log — QA/QC Frontend

## D1: Approach — Vertical Slice thay vì Layer-by-Layer
- **Chọn:** Approach B (Vertical Slice)
- **Thay thế:** A (11 phases layer), C (TDD-first)
- **Lý do:** Dạy full data flow ngay từ đầu, orchestrate agent đúng hơn, feedback loop nhanh hơn

## D2: Slice Order — Theo dependency chain nghiệp vụ
- **Chọn:** CA Setup → QAM Setup → QAM Planning → QC Execute → Results → AP → Dashboard
- **Lý do:** Không có CA data thì QAM không setup được, không có QAM setup thì QC không chạy được

## D3: Testing — 3-layer pyramid
- **Chọn:** Vitest (unit/hook) + RTL (component) + Playwright (E2E) + gstack (ad-hoc)
- **Thay thế:** Chỉ dùng 1 tool, hoặc test ở cuối
- **Lý do:** Mỗi tool đúng vị trí, không overkill, không thiếu

## D4: Micro-task pattern
- **Chọn:** API+Hook → Component → Page, mỗi cái có test ngay sau
- **Lý do:** Unit nhỏ nhất có thể parallelized, test debt = 0

## D5: Testing setup TRƯỚC Slice 1
- **Chọn:** Micro 0 = setup Vitest + RTL + Playwright
- **Lý do:** Không setup test infra trước thì micro pattern không chạy được

## D6: Mục tiêu học
- **Xác nhận:** Technical skills + Process (agent orchestration) + Architecture — cả 3 như nhau
- **Không phải:** Ship cho production, deadline-driven
