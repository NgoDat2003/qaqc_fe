# gstack UX Test Scripts

Các file trong folder này là checklist cho Claude chạy qua gstack.
Không phải executable code — Claude đọc và thực hiện từng bước.

## Khi nào chạy
- Sau khi một slice hoàn thành và server đang chạy
- Khi cần verify "trông có đúng không" trước khi commit
- Khi Playwright pass nhưng muốn check UX quality thêm

## Cách chạy
Nói với Claude: "Chạy gstack UX check cho slice X theo file e2e/gstack/slice-X-ux.md"
Claude sẽ tự navigate, screenshot, và báo cáo findings.

## Files
- `auth-ux.md` — Login page + dashboard UX
- `execute-audit-ux.md` — Execute audit mobile UX (quan trọng nhất)
- `action-plan-ux.md` — Action plan flow UX
