# Admin documents link, admin fixes, varied rule examples (2026-11-23)

## Context snapshot
- Repo `~/resume-chat`, branch `admin-docs-link` (from master f8011c2). Frontend React+Vite+Tailwind (`app/frontend`), design tokens per `.planning/design-pass-2026-11.md` (paper/sheet/ink/slate/rule/hl/done/danger, Source Serif 4 + Instrument Sans, sentence case, no `+`/`→` in labels).
- `/deliverables` already shows "All documents" for admins, but nothing on the admin page links to it.
- Real data seen on Bruno's phone: a completed candidate shows "Phase: Phase 7" (session_phase 7 is past the 7-name PHASE_NAMES array, indexes 0–6); a candidate with no session shows "-" for status and phase; on a 390px phone the candidate card runs off the right edge.
- `system/resume_rules.md`, `system/resume_rules_early_career.md`, `system/discovery.md` use NetSuite-only sample lines. These files feed the live interview prompt AND the Claude Code workflow.

## Tasks

### T1 — Admin page: documents link + fixes (frontend)
Files: `src/pages/AdminDashboard.tsx`, `src/components/CandidateList.tsx`.
1. Header: add an "All documents" button (outline style, same as "Generate profile") that navigates to `/deliverables`. Header buttons must wrap gracefully on narrow screens (`flex-wrap` + gap) — no horizontal overflow at 390px.
2. Each candidate with `session_status === "deliverables_generated"` gets a "Documents" action (outline small) that navigates to `/deliverables`, in both the table and the mobile list.
3. Phase label: index 7 or higher (or status `deliverables_generated`) shows "Done". Never render `Phase N`.
4. No session (`session_status` null): status shows a slate dot + "Not started"; phase shows "Not started" in the table and the mobile list omits the phase line.
5. Fix the 390px overflow: the page must have `document.documentElement.scrollWidth <= 390` at a 390px viewport. Find the actual cause (header row, list container, long text) rather than masking with `overflow-hidden` on body.
Acceptance: `npm run build` passes; no new dependencies; sentence case; existing actions unchanged.

### T2 — Varied sample lines in the rules (content)
Files: `system/resume_rules.md`, `system/resume_rules_early_career.md`, `system/discovery.md`. Do NOT touch `profiles/` or `system/workflow.md`.
- Replace NetSuite-only examples so the samples span several fields. Keep each example's teaching point identical (quantified, results-first, same structure and length); only the field changes. Suggested spread: one healthcare (e.g. registered nurse), one sales/marketing, one skilled trades or operations, one education or nonprofit, one software/IT, and at most ONE finance/ERP example per file.
- Where a file lists several examples in a row, use different fields within that list.
- Numbers must stay plausible for the field. No real company names; use generic ones ("a 300-bed hospital", "a regional HVAC contractor").
- Do not change rules, headings, structure, or any instruction text — only the example content inside them.
Acceptance: `grep -ci netsuite` on each of the three files is ≤ 1; `git diff --stat` touches only those three files for T2.

## Verification gates (orchestrator-owned)
- G1: build clean; mocked-API Playwright at 1280 and 390 with candidates covering no session / active / interview_complete / deliverables_generated phase 7; scrollWidth ≤ 390; "All documents" navigates to /deliverables; screenshots reviewed.
- G2: read the T2 diff end to end; every rule line unchanged.
- G3: PR + `@codex review`; deploy only with Bruno's approval (frontend rebuild + backend rebuild, since system/ is mounted read-only into the backend and cached by `_load_system_files`).

## GH true-up checklist
- [ ] one commit per task, explicit paths staged
- [ ] `git status --short` empty, branch pushed, `git log origin/admin-docs-link..HEAD` empty
