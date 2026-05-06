# Workflow Rules

## Tư duy trước khi code (bắt buộc)

Trả lời 3 câu này TRƯỚC khi implement bất cứ thứ gì:
1. Done trông như thế nào? (success criteria cụ thể)
2. Cần gì có trước? (dependency)
3. Data shape là gì? (types/interface)

## Plan Mode

Bật Plan Mode (Shift+Tab 2 lần) trước mọi task phức tạp:
- Đọc code liên quan trước
- Trình bày plan: files sẽ sửa, approach, edge cases
- Chờ approve rồi mới implement

## Vòng lặp chuẩn

```
Plan → Implement → Typecheck → Test → Commit
```

Không skip bước nào. Không commit khi typecheck hoặc test đang fail.

## Git

- Claude chỉ được `git add` + `git commit` — KHÔNG tự push
- Commit sau mỗi logical unit, không phải cuối ngày
- Format: conventional commits (feat/fix/chore/refactor/test)
- Sau commit → báo user review → user tự push

## Multi-step task

Nêu plan trước khi làm:
- Step 1: [mô tả] / verify: [cách kiểm tra]
- Step 2: [mô tả] / verify: [cách kiểm tra]

## Khi không chắc

Hỏi thẳng thay vì đoán. Nêu assumption trước khi code.
Nếu có nhiều cách giải → trình bày trade-off, không tự chọn im lặng.
