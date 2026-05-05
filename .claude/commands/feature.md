Tạo feature mới cho QA/QC Frontend theo đúng chuẩn project.

Khi nhận tên feature (ví dụ: "audit-execution"), hãy:

1. Đọc `docs/BUILD_PLAN.md` để xem task tương ứng trong phase nào
2. Đọc `src/shared/types/index.ts` để hiểu types liên quan
3. Tạo đúng thứ tự: API → Hooks → Components → Page
4. Mỗi file phải có TypeScript strict (no `any`)
5. Sau khi tạo xong chạy `npm run typecheck` để verify

Không tạo file nào nếu type chưa có trong `shared/types/index.ts`.
Báo cáo khi xong: tên file đã tạo, lỗi nào cần fix thêm.
