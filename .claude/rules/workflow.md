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
- Format: conventional commits (feat/fix/chore/refactor/test)

### COMMIT RULE (bắt buộc — mọi nhánh, mọi task)

**KHÔNG BAO GIỜ tự commit.** Dù là main, feature branch, hay worktree của main agent:

```
1. Implement xong → để changes ở unstaged
2. Báo user: "Đã xong, xem trong Source Control tab"
3. Chờ user nói "ok commit" hoặc "commit đi"
4. Mới được chạy git add + git commit
```

> Why: User nhìn thấy full diff trong Source Control trước khi commit.
> Commit rồi thì diff biến mất khỏi panel — khó review hơn.

### Branch workflow (bắt buộc với mọi task)

**KHÔNG BAO GIỜ commit thẳng vào `main`.** Mọi task đều qua feature branch:

```
1. git checkout -b <type>/<ten-task>
2. Implement → để unstaged → báo user review
3. User xác nhận → git add + git commit
4. Báo user: "Đã commit, review tại branch <tên branch>"
5. User tự merge + push — không phải Claude
6. git branch -d <branch>  (dọn dẹp sau merge)
```

**Branch naming:** `feat/`, `fix/`, `chore/`, `refactor/`, `test/`

### Khi nào dùng `isolation: "worktree"`

| Tình huống | Dùng gì |
|-----------|---------|
| Task nhỏ, 1-3 files | Feature branch thường |
| Task lớn, nhiều files, cần isolate hoàn toàn | `isolation: "worktree"` |

**Quy tắc khi dùng worktree song song (QUAN TRỌNG):**

1. Main agent **KHÔNG được sửa file trực tiếp** khi đã spawn worktree agents — chỉ coordinate
2. Mỗi worktree agent làm việc **cô lập** trên branch riêng của nó
3. Worktree agents **phải commit** lên branch của chúng (không commit = worktree bị xóa)
4. Sau khi agents xong, user review từng branch riêng:
   ```
   git diff main..worktree-agent-xxx   ← xem thay đổi
   git checkout main
   git merge worktree-agent-xxx        ← nếu ok
   git branch -d worktree-agent-xxx
   ```

**Không được làm:** Vừa spawn worktree agents, vừa tự sửa file trực tiếp → gây lẫn lộn changes không truy nguồn được.

## Multi-step task

Nêu plan trước khi làm:
- Step 1: [mô tả] / verify: [cách kiểm tra]
- Step 2: [mô tả] / verify: [cách kiểm tra]

## Khi không chắc

Hỏi thẳng thay vì đoán. Nêu assumption trước khi code.
Nếu có nhiều cách giải → trình bày trade-off, không tự chọn im lặng.
