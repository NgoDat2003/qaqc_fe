# Báo Cáo Phân Tích: ClaudeKit v2.16 Setup — Maycha QA/QC Frontend

> **Ngày**: 2026-05-12 | **Version**: ClaudeKit v2.16.0 (project-level adaptation)
> **Scope**: `.claude/` tại `d:\work\maycha\qaqc-build\qaqc-fe`

---

## Phần I: Cấu Trúc Thư Mục — Mô Tả Từng File

### `.claude/` — Root

| File | Mô tả |
|------|--------|
| `CLAUDE.md` | **Entry point chính** — Claude Code load file này đầu tiên. Chứa @-references tới rules, docs, project context. Giữ ngắn gọn, KHÔNG nhúng content inline. |
| `.ck.json` | **Config ClaudeKit** — codingLevel (-1=auto), statusline mode, plan naming format, paths cho plans/docs, trust passphrase. |
| `.ckignore` | Patterns bị block bởi `scout-block` hook (node_modules, dist, .git, v.v.) |
| `.gitignore` | Git ignore cho thư mục .claude (loại trừ logs, env files) |
| `.env.example` | Template biến môi trường (Discord/Slack webhook URLs cho notifications) |
| `.mcp.json.example` | Template cấu hình MCP servers (chưa cần dùng) |
| `metadata.json` | Version manifest — track files đã install, checksums, version v2.16.0 |
| `settings.json` | **Hook wiring** — kết nối hook events với hook scripts |
| `statusline.cjs` | Render thanh trạng thái terminal (context %, git branch, usage quota) |
| `statusline.ps1` | Wrapper PowerShell cho Windows |
| `statusline.sh` | Wrapper shell cho Unix |

---

### `.claude/agents/` — 14 Sub-Agents

| Agent | Vai trò | Khi nào dùng |
|-------|---------|--------------|
| `planner.md` | Tech Lead — lock architecture trước khi code | Mọi feature >2 file |
| `fullstack-developer.md` | Senior engineer thực thi plan | Sau khi có plan (`/ck:cook`) |
| `researcher.md` | Analyst — khám phá codebase, tìm patterns | Trước khi implement feature mới |
| `debugger.md` | SRE — root cause analysis | Khi có bug, CI/CD fail |
| `tester.md` | QA Lead — diff-aware testing | Sau mỗi implement |
| `code-reviewer.md` | Staff engineer — adversarial review | Trước commit |
| `code-simplifier.md` | Simplification pass sau implement | Sau fullstack-developer xong |
| `brainstormer.md` | CTO advisor — challenge assumptions | Feature mới chưa rõ yêu cầu |
| `docs-manager.md` | Technical writer | Sau feature lớn cần cập nhật docs |
| `project-manager.md` | Engineering manager tracking delivery | Theo dõi progress |
| `git-manager.md` | Git workflow specialist | Commit, branch, merge |
| `journal-writer.md` | Ghi nhật ký quyết định & failures | Sau session quan trọng |
| `mcp-manager.md` | Quản lý MCP server integrations | Khi cần thêm tools |
| `ui-ux-designer.md` | Design specialist | UI review, wireframes |

---

### `.claude/rules/` — 5 Quy Tắc Framework

| Rule | Mô tả |
|------|--------|
| `primary-workflow.md` | **Quy trình 6 bước**: Plan → Test → Review → Integrate → Debug → Visual. Đây là "constitution" của cách làm việc. |
| `development-rules.md` | File naming (kebab-case), file size <200 LOC, YAGNI/KISS/DRY, skill catalog, pre-commit rules |
| `orchestration-protocol.md` | Cách spawn subagents: delegation context, sequential chaining, parallel execution, subagent status (DONE/BLOCKED/NEEDS_CONTEXT) |
| `team-coordination-rules.md` | File ownership, Git safety, communication protocol khi chạy Agent Team mode |
| `documentation-management.md` | Roadmap, changelog, system-architecture cập nhật khi nào, plan file structure |

---

### `.claude/hooks/` — 13 Hook Scripts

#### Hook chính (wired trong settings.json):

| Hook | Trigger | Chức năng |
|------|---------|-----------|
| `session-init.cjs` | SessionStart | Load .ck.json, detect project type/framework, inject env vars (CK_PLAN_PATH, CK_REPORTS_PATH...), in session context |
| `subagent-init.cjs` | SubagentStart | Inject context cho mỗi subagent: plan path, reports path, naming pattern |
| `team-context-inject.cjs` | SubagentStart | Inject team config khi chạy Agent Team mode |
| `dev-rules-reminder.cjs` | UserPromptSubmit | **Inject rules vào mỗi prompt** — đây là cơ chế bạn thấy "## Rules" trong session context |
| `cook-after-plan-reminder.cjs` | SubagentStop (Plan) | Sau khi planner agent xong → nhắc chạy `/clear` rồi `/ck:cook --auto` |
| `descriptive-name.cjs` | PreToolUse (Write) | Enforce kebab-case khi tạo file mới |
| `scout-block.cjs` | PreToolUse | Block truy cập node_modules, dist, .git (đọc .ckignore) |
| `privacy-block.cjs` | PreToolUse | Block đọc .env, API keys — popup yêu cầu user approve |
| `post-edit-simplify-reminder.cjs` | PostToolUse (Edit/Write) | Nhắc simplify code sau mỗi lần sửa |
| `usage-context-awareness.cjs` | PostToolUse, UserPromptSubmit | Track usage quota, cache refresh (legacy wrapper) |
| `task-completed-handler.cjs` | PostToolUse (Task/Todo) | Log khi agent hoàn thành task, đếm progress |
| `skill-dedup.cjs` | PreToolUse | Ngăn duplicate skill activation trong cùng session |
| `teammate-idle-handler.cjs` | — | Gợi ý task chưa assign khi teammate idle (Agent Team mode) |

#### `hooks/lib/` — Shared Utilities:

| Lib | Mô tả |
|-----|--------|
| `ck-config-utils.cjs` | Load/parse .ck.json, resolve plan paths, session state read/write |
| `colors.cjs` | Terminal color output |
| `hook-logger.cjs` | Structured logging cho hooks → `.logs/hook-log.jsonl` |
| `project-detector.cjs` | Detect project type (Next.js, React, Node...), package manager, framework |
| `context-builder.cjs` | Build context string inject vào session |
| `privacy-checker.cjs` | Detect sensitive file patterns |
| `scout-checker.cjs` | Pattern matching cho scout-block |
| `transcript-parser.cjs` | Parse session transcript |
| `git-info-cache.cjs` | Cache git info (branch, root) |
| `config-counter.cjs` | Count config injections |

#### `hooks/notifications/` — Thông Báo Khi Session Kết Thúc:
- `notify.cjs` — dispatcher chính
- `providers/discord.cjs`, `slack.cjs`, `telegram.cjs` — gửi thông báo
- Cần config webhook URL trong `.env` để hoạt động

---

### `.claude/skills/` — 78 Skill Modules

Mỗi skill là một thư mục có `SKILL.md` chứa prompt instructions. Claude đọc khi được invoke.

#### Skills theo nhóm:

**🔄 Core Workflow (quan trọng nhất với dự án này):**
| Skill | Invoke | Tác dụng |
|-------|--------|----------|
| `ck-plan` | `/ck:plan <feature>` | Lên kế hoạch, tạo plan files trong `plans/` |
| `cook` | `/ck:cook --auto` | Thực thi plan — orchestrate fullstack-developer + tester + reviewer |
| `ship` | `/ck:ship` | typecheck → lint → test → commit |
| `ck-debug` | `/ck:debug` | Root cause analysis với debugger agent |
| `fix` | `/ck:fix` | Quick fix bug |
| `code-review` | `/ck:code-review` | Adversarial review với code-reviewer agent |

**🔍 Pre-Implementation Analysis:**
| Skill | Invoke | Tác dụng |
|-------|--------|----------|
| `ck-predict` | `/ck:predict` | 5 expert personas debate feature trước khi implement |
| `ck-scenario` | `/ck:scenario` | 12 chiều edge case analysis |
| `brainstorm` | `/ck:brainstorm` | Brainstorm yêu cầu chưa rõ |

**📝 Documentation & Tracking:**
| Skill | Invoke | Tác dụng |
|-------|--------|----------|
| `journal` | `/ck:journal` | Ghi nhật ký session, decisions |
| `retro` | `/ck:retro` | Sprint retrospective từ git log |
| `docs` | `/ck:docs` | Update docs sau implement |
| `plan` | (subskill) | Plan file management |

**🛠️ Development Tools:**
| Skill | Nhóm |
|-------|-------|
| `research`, `scout` | Khám phá codebase |
| `test`, `sequential-thinking` | Testing + analysis |
| `preview` | Visual diagrams (Mermaid/HTML) |
| `git` | Git operations |
| `frontend-development`, `react-best-practices`, `tanstack` | Frontend patterns |
| `debug`, `problem-solving` | Debugging |
| `ck-security` | Security scan |

**🤖 AI/Infrastructure (ít dùng cho dự án này):**
`ai-artist`, `ai-multimodal`, `threejs`, `shopify`, `payment-integration`, `remotion`... (79 skills tổng cộng)

---

### `.claude/output-styles/` — 6 Coding Levels

| File | Level | Mô tả output |
|------|-------|--------------|
| `coding-level-0-eli5.md` | 0 — ELI5 | Giải thích như trẻ 5 tuổi, nhiều ví dụ |
| `coding-level-1-junior.md` | 1 — Junior | Chi tiết, step-by-step, giải thích mọi thứ |
| `coding-level-2-mid.md` | 2 — Mid | Cân bằng giữa explain và code |
| `coding-level-3-senior.md` | 3 — Senior | Ngắn gọn, tập trung vào architecture |
| `coding-level-4-lead.md` | 4 — Lead | Trade-off analysis, strategic thinking |
| `coding-level-5-god.md` | 5 — God | Chỉ code, zero explanation |

Config trong `.ck.json`: `"codingLevel": -1` = tự detect theo cách user hỏi.

---

### `.claude/scripts/` — Utility Scripts

| Script | Mô tả |
|--------|--------|
| `generate_catalogs.py --skills` | **Quan trọng** — scan .claude/skills/ và tạo catalog YAML. Chạy để Claude biết skills nào available |
| `scan_skills.py` | Parse SKILL.md metadata, phân loại skills theo category |
| `scan_commands.py` | Parse command-archive/ |
| `ck-help.py` | Wrapper cho ck-help skill — liệt kê skills available |
| `validate-docs.cjs` | Validate docs/ theo rules |
| `worktree.cjs` | Git worktree management cho Agent Team |
| `set-active-plan.cjs` | Set active plan để hooks inject đúng context |
| `resolve_env.py` | Resolve biến môi trường từ .env |
| `win_compat.py` | Windows path compatibility fixes |

---

### `.claude/command-archive/` — Commands Cũ (Archived)

Commands từ ClaudeKit versions trước — không active, chỉ để tham khảo:
`ask`, `ck-help`, `coding-level`, `journal`, `kanban`, `preview`, `watzup`, `worktree`, `plan/archive|red-team|validate`, `review/codebase`, `test`, `docs/init|summarize|update`

---

## Phần II: Các Flow Thường Dùng

### Flow 1: Feature Mới (Standard)
```
/ck:plan <feature> → /clear → /ck:cook --auto → /ck:ship
```

### Flow 2: Feature Phức Tạp (Full Analysis)
```
/ck:predict <feature> → /ck:scenario → /ck:plan → /clear → /ck:cook → /ck:code-review → /ck:ship
```

### Flow 3: Bug Fix
```
/ck:debug <issue> → /ck:fix → /ck:ship
```

### Flow 4: Code Review Standalone
```
/ck:code-review → (address feedback) → /ck:ship
```

### Flow 5: Session Wrap-up
```
/ck:journal → (optional) /ck:retro
```

---

## Phần III: Quy Trình Chi Tiết Từng Flow

### Flow 1: Feature Mới — Step by Step

```
1. /ck:plan <feature>
   ├── Skill: ck-plan/SKILL.md
   ├── Agents: planner (chính) + researcher (song song)
   ├── Output: plans/{date}-{issue}-{slug}/
   │           ├── plan.md (overview)
   │           ├── phase-01-*.md
   │           ├── phase-02-*.md
   │           └── reports/researcher-*.md
   └── Hook: cook-after-plan-reminder nhắc /clear + /ck:cook

2. /clear
   ├── Xóa context window (tiết kiệm tokens)
   ├── Hook: session-init đọc lại session state
   └── Plan context được inject tự động vào session mới

3. /ck:cook --auto
   ├── Skill: cook/SKILL.md
   ├── Đọc plan.md → identify phases → thực thi tuần tự
   ├── Agent: fullstack-developer (implement)
   ├── Agent: tester (viết + chạy tests)
   ├── Agent: code-simplifier (simplify)
   ├── Agent: code-reviewer (review)
   ├── Agent: docs-manager (update docs nếu cần)
   └── Hook: task-completed-handler log mỗi task xong

4. /ck:ship
   ├── Skill: ship/SKILL.md
   ├── Chạy: npm run typecheck
   ├── Chạy: npm run lint
   ├── Chạy: npm run test
   ├── Agent: git-manager (conventional commit)
   └── Output: commit message chuẩn
```

### Flow 2: Feature Phức Tạp — Extended

```
1. /ck:predict <feature>
   ├── Skill: ck-predict/SKILL.md
   ├── 5 expert personas đồng thời analyze:
   │   ├── QA Engineer — test cases, edge cases
   │   ├── Security Engineer — vulnerabilities
   │   ├── Performance Engineer — bottlenecks
   │   ├── UX Designer — user experience
   │   └── Architect — system design
   ├── Debate và consensus
   └── Output: verdict + recommendations

2. /ck:scenario
   ├── Skill: ck-scenario/SKILL.md
   ├── 12 chiều phân tích: happy path, edge cases, error states,
   │   concurrent users, data integrity, auth boundaries...
   └── Output: scenario matrix

3. /ck:plan → /clear → /ck:cook → ...
   (như Flow 1, nhưng plan đã có context từ predict + scenario)
```

### Flow 3: Bug Fix — Step by Step

```
1. /ck:debug <issue description>
   ├── Skill: ck-debug/SKILL.md  
   ├── Agent: debugger
   │   ├── Đọc error logs, stack trace
   │   ├── Hypothesis generation
   │   ├── Root cause analysis (5 Whys)
   │   └── Reproduction steps
   └── Output: debug report trong plans/reports/

2. /ck:fix
   ├── Skill: fix/SKILL.md
   ├── Agent: fullstack-developer (implement fix)
   ├── Agent: tester (verify fix không break gì)
   └── Surgical change — chỉ đụng vào gì cần fix

3. /ck:ship (như trên)
```

### Flow 4: Code Review

```
/ck:code-review
├── Skill: code-review/SKILL.md
├── Agent: code-reviewer (adversarial mode)
├── Checklist:
│   ├── Type safety (no any, cast safety)
│   ├── Null safety (optional chaining)
│   ├── React/Next.js correctness
│   ├── API layer (apiClient usage)
│   ├── Auth (route protection, role checks)
│   ├── Edge cases (empty, null, network errors)
│   └── Security (XSS, PII, env vars)
└── Output: review report với severity levels
```

---

## Phần IV: Điểm Quan Trọng & Đánh Giá

### Điểm Mạnh

| Aspect | Đánh giá |
|--------|----------|
| **Hooks system** | ⭐⭐⭐⭐⭐ — Tự động inject context, enforce rules mà không cần nhắc thủ công. `dev-rules-reminder` là "guardrail" tốt nhất. |
| **Multi-agent orchestration** | ⭐⭐⭐⭐⭐ — `planner` + `researcher` song song → output chất lượng cao, không bỏ sót edge cases. |
| **Session state persistence** | ⭐⭐⭐⭐ — `session-init` đọc lại state sau compact — không mất context giữa chừng. |
| **Privacy/Security guards** | ⭐⭐⭐⭐⭐ — `privacy-block` ngăn AI vô tình đọc .env. `scout-block` ngăn vào node_modules. |
| **Skill catalog system** | ⭐⭐⭐⭐ — `generate_catalogs.py` cho Claude biết chính xác những gì available, không đoán mò. |
| **Coding levels** | ⭐⭐⭐ — Hữu ích nhưng cần config đúng trong .ck.json để hoạt động. |

### Điểm Cần Lưu Ý

| Vấn đề | Giải thích | Khuyến nghị |
|--------|------------|-------------|
| **`usage-context-awareness.cjs` là legacy** | Chạy ở cả UserPromptSubmit và PostToolUse — đây là wrapper cũ. | Có thể loại bỏ sau khi xác nhận `usage-quota-cache-refresh` đã thay thế hoàn toàn. |
| **`plan-format-kanban.cjs` chưa có** | Hook này không có trong folder nhưng v2.16 có — tự động format plan thành kanban. | Nếu muốn: copy từ v2.16 source và wire vào PostToolUse Edit/Write. |
| **`session-state.cjs` chưa có** | Hook này không có — mất khả năng khôi phục trạng thái sau compact. | Copy từ v2.16 nếu làm task dài nhiều session. |
| **Notifications chưa config** | `notify.cjs` có nhưng chưa có webhook URL trong .env | Config `.env` với Discord/Slack webhook nếu muốn nhận thông báo khi session kết thúc. |
| **`ck` CLI chưa cài** | Không thể dùng `ck init` để update tự động | Phải update thủ công hoặc cài `npm install -g @claudekit/cli` (nếu public). |
| **Gemini integration bỏ** | `"gemini"` section bị xóa khỏi .ck.json | Nếu sau này muốn dùng Gemini cho research skills, thêm lại section này. |
| **78 skills nhưng chỉ ~15 dùng thường** | Phần lớn skills (threejs, shopify, ai-artist...) không liên quan dự án này. | Chấp nhận được — skills lazy-load khi dùng, không tốn tài nguyên khi idle. |

### So Sánh Với Thị Trường

| Tiêu chí | ClaudeKit v2.16 | Cursor Rules | GitHub Copilot Custom | Cody (Sourcegraph) |
|---|---|---|---|---|
| **Multi-agent orchestration** | ✅ Đầy đủ (14 agents) | ❌ | ❌ | ❌ |
| **Hook automation** | ✅ 13 hooks | ❌ | ❌ | ❌ |
| **Session state persistence** | ✅ | ❌ | ❌ | ❌ |
| **Skill catalog** | ✅ 78 skills | Không có | Không có | Không có |
| **Privacy guards** | ✅ | ❌ | ❌ | ❌ |
| **Plan-first workflow** | ✅ Enforced | Tùy ý | Tùy ý | Tùy ý |
| **Team mode** | ✅ | ❌ | ❌ | ❌ |
| **Learning curve** | Cao | Thấp | Thấp | Thấp |
| **Setup cost** | Cao | Thấp | Thấp | Thấp |

**Kết luận đánh giá:** ClaudeKit v2.16 là framework **enterprise-grade** — phức tạp nhưng cho kết quả chất lượng cao vì enforce quy trình Plan-first, có guardrails tự động, và orchestrate nhiều agent chuyên biệt. Phù hợp với dự án có độ phức tạp cao như Maycha QA/QC (nhiều roles, business logic phức tạp, deadline cứng).

### Checklist Trước Mỗi Task

```
✅ Session mới → session-init đã inject context chưa? (xem ## Session trong prompt)
✅ Feature mới → /ck:plan trước, KHÔNG code ngay
✅ Sau plan → /clear để xóa context cũ trước khi cook
✅ Trước commit → /ck:ship (typecheck + test bắt buộc)
✅ Bug → /ck:debug trước khi fix (đừng đoán root cause)
✅ Feature lớn → /ck:predict + /ck:scenario trước khi plan
```

---

*Report generated: 2026-05-12 | ClaudeKit v2.16.0-project-adapted | Maycha QA/QC Frontend*
