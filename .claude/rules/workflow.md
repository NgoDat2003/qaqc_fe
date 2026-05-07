# Workflow Rules

## Tư duy trước khi code (HARD RULE — không được skip)

**KHÔNG ĐƯỢC tự ý bắt đầu code.** Trước MỌI task implement, phải hỏi đủ 3 câu sau và chờ user trả lời:

1. Done trông như thế nào? (success criteria cụ thể)
2. Cần gì có trước? (dependency)
3. Data shape là gì? (types/interface)

**Exception duy nhất:** User nói tường minh "cứ làm đi" hoặc "skip plan" thì mới được bỏ qua.
Không có exception nào khác — kể cả task trông "đơn giản".

## Plan Mode

**Plan Mode là cách enforce đáng tin nhất** vì nó chặn kỹ thuật, không phụ thuộc vào việc Claude có tuân thủ rule hay không.

Bật Plan Mode (Shift+Tab 2 lần) trước mọi task phức tạp:
- Đọc code liên quan trước
- Trình bày plan: files sẽ sửa, approach, edge cases
- Chờ approve rồi mới implement

> Với task coding quan trọng: **luôn bật Plan Mode** thay vì chỉ tin vào rule.

## Vòng lặp chuẩn

```
Plan → Implement → Typecheck → Test → Commit
```

Không skip bước nào. Không commit khi typecheck hoặc test đang fail.

## Git

- Claude chỉ được `git add` + `git commit` — KHÔNG tự push
- Commit sau mỗi logical unit, không phải cuối ngày
- Format: conventional commits (feat/fix/chore/refactor/test)
- **KHÔNG tự commit sau khi implement xong** — báo user xem thay đổi trong VS Code Source Control trước, chờ user xác nhận rồi mới commit
- Sau commit → báo user review → user tự merge + push

### Branch workflow (bắt buộc với mọi task)

**KHÔNG BAO GIỜ commit thẳng vào `main`.** Mọi task đều qua feature branch:

```
1. git checkout -b <type>/<ten-task>
2. Implement + commit trên branch đó
3. Báo user: "Đã xong, review tại branch <tên branch>"
4. User tự review (git diff main..<branch> hoặc GitHub PR)
5. User quyết định merge + push — không phải Claude
6. git branch -d <branch>  (dọn dẹp sau merge)
```

**Branch naming:** `feat/`, `fix/`, `chore/`, `refactor/`, `test/`

### Khi nào dùng `isolation: "worktree"`

| Tình huống | Dùng gì |
|-----------|---------|
| Task nhỏ, 1-3 files | Feature branch thường |
| Task lớn, nhiều files, cần isolate | `isolation: "worktree"` |
| Main cần chạy dev server trong lúc agent code | `isolation: "worktree"` |

**Sau khi worktree agent xong:**
```
1. Agent trả về branch name
2. git checkout <branch> → đọc diff
3. Nếu ok: git checkout main && git merge <branch>
4. git push && git branch -d <branch>
```

## Multi-step task

Nêu plan trước khi làm:
- Step 1: [mô tả] / verify: [cách kiểm tra]
- Step 2: [mô tả] / verify: [cách kiểm tra]

## Khi không chắc

Hỏi thẳng thay vì đoán. Nêu assumption trước khi code.
Nếu có nhiều cách giải → trình bày trade-off, không tự chọn im lặng.
