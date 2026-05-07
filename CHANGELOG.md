# CHANGELOG — QA/QC Frontend Agent Log

## Current status
Phase 0 + Phase 1 hoàn thành. Sẵn sàng bắt đầu Phase 2 (Auth UI).

## Completed
- 2026-05-05: Phase 0 — middleware, stores, api-client, types, layout shell
- 2026-05-05: Phase 0 — lib/format.ts, lib/roles.ts, lib/scoring.ts
- 2026-05-05: Phase 1 — shadcn/ui primitives (20 components)
- 2026-05-05: Phase 1 — grade-badge, confirm-dialog, file-uploader, score-badge
- 2026-05-05: Phase 1 — app-sidebar (role-aware), (auth)/layout, (dashboard)/layout
- 2026-05-05: Fix upload.api.ts — không dùng JSON.stringify(FormData)
- 2026-05-05: Fix BE api-response.ts — thêm response.created() cho 201 status
- 2026-05-05: Fix BE middleware CORS — dùng process.env.CORS_ORIGIN

## Failed approaches
- apiClient.post() để upload file → JSON.stringify(FormData) = empty object
  → Fix: fetch trực tiếp, không set Content-Type header

## Known issues
- Cookie qo_token hết hạn nhưng localStorage vẫn isAuthenticated: true
  → Cần revalidate khi app init bằng GET /api/auth/me
- Checklists page đang dùng mock data, chưa nối API

## Next
- Phase 2: Login page (FR-AUTH)
- Phase 3: Master Data pages


## [0.3.0] - 2026-03-29

### Added
- Multi-URL support for `/clone-website` — clone multiple sites in a single command with parallel processing and isolated output
- CI quality gates via GitHub Actions — automated lint, typecheck, and build on every push and PR
- `npm run typecheck` and `npm run check` scripts for local quality validation
- `.gitattributes` for cross-platform line ending normalization
- `.nvmrc` to pin Node.js 20 for contributor consistency

### Changed
- Streamlined PR template — removed redundant checklist items and screenshots section
- Improved project description and README — clearer use cases, limitations, and modern wording
- Refined documentation and agent rules across all platforms for clarity and consistency
- Fixed CRLF handling in `sync-skills.mjs` for reliable Windows operation

### Removed
- Outdated use case from README documentation

## [0.2.0] - 2026-03-28

### Added
- Multi-platform AI agent support: Claude Code, Codex CLI, OpenCode, GitHub Copilot, Cursor, Windsurf, Gemini CLI, Cline/Roo Code, Continue, Amazon Q, Augment Code, Aider
- Platform-specific instruction files and `/clone-website` skill for each supported agent
- `scripts/sync-agent-rules.sh` to regenerate platform instruction files from AGENTS.md
- `scripts/sync-skills.mjs` to regenerate `/clone-website` skill across all platforms
- GEMINI.md for Gemini CLI configuration
- Supported Platforms table in README
- "Updating for Other Platforms" documentation section in README

### Changed
- README now describes the project as multi-agent (Claude Code recommended, not required)
- AGENTS.md updated with sync script reminders

## [0.1.1] - 2026-03-28

### Added
- Bug report and feature request issue templates
- Pull request template with checklist
- CHANGELOG.md following Keep a Changelog format
- Package.json metadata (description, repository, homepage, keywords, engines)

### Fixed
- LICENSE copyright holder now attributed to JCodesMore

## [0.1.0] - 2026-03-28

### Added
- Initial template scaffold for website reverse-engineering with Claude Code
- `/clone-website` skill for full-site cloning pipeline
- `/build-from-spec` and `/customize` skills
- Parallel builder agents with git worktree isolation
- Chrome MCP integration for design token extraction
- Comprehensive inspection guide and project structure documentation
- Next.js 16 + shadcn/ui + Tailwind CSS v4 base scaffold
- MIT license
- README with badges, demo section, quick start, and star history

[Unreleased]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/JCodesMore/ai-website-cloner-template/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/JCodesMore/ai-website-cloner-template/releases/tag/v0.1.0
