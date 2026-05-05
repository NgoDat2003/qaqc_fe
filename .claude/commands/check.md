Kiểm tra toàn bộ chất lượng code của FE project.

Chạy lần lượt:
1. `npm run typecheck` — TypeScript errors
2. `npm run lint` — ESLint warnings/errors

Sau đó báo cáo:
- Số lỗi TypeScript (nếu có, list file:line)
- Số lỗi lint (nếu có, list file:line)
- Tổng kết: PASS hoặc FAIL + việc cần fix

Không tự sửa code — chỉ báo cáo.