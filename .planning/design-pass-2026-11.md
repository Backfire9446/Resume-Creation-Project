# Design pass — Resume Chat frontend (2026-11-22)

## Context snapshot
- App: `app/frontend` (React 19 + Vite 6 + Tailwind 3.4, TypeScript strict). Live at resume.urkuconsulting.com (docker `app-frontend`).
- Branch: `design-pass`. Orchestrator (Opus) owns verification via a mocked-API Playwright harness (desktop 1280 + mobile 390). Implementer (Sonnet) does the edits below.
- **Bug to fix:** components use `prose prose-sm` but `@tailwindcss/typography` is NOT installed, so Markdown (lists, headings) renders as flat lines in chat messages and the preview modal. Fix with our own `.md` stylesheet (no new deps).
- **Scope = presentation + copy only.** Do NOT change API calls, state logic, routes, props interfaces, or data flow. Keep every existing button/feature reachable.

## Design direction: "the editor's desk"
The interviewer is an editor marking up the candidate's resume. One memorable move: **bold text in interviewer messages renders as a highlighter stroke**. Everything else is quiet and disciplined.

### Tokens (tailwind.config.js `theme.extend`)
Replace the `brand` palette with:
| name | hex | use |
|---|---|---|
| `paper` | `#F4F6F9` | app background |
| `sheet` | `#FFFFFF` | panels, modals, inputs |
| `ink` | `#1E2A47` | primary text, primary buttons |
| `slate` | `#5B6880` | secondary text |
| `rule` | `#DAE0E8` | borders, dividers |
| `hl` | `#FFE36E` | highlighter (bold in interviewer text, current step) |
| `done` | `#2E7A58` | completed / success |
| `danger` | `#B0432E` | delete, errors |

Fonts (index.html Google Fonts link, replace Inter):
- `Source Serif 4` (opsz, 400/600) → `font-serif`: interviewer messages, page titles, modal titles, wordmark.
- `Instrument Sans` (400/500/600) → `font-sans`: all UI, candidate answers, tables, buttons.
Set `fontFamily.sans` / `fontFamily.serif` in tailwind config; body bg `bg-paper text-ink font-sans`.

Radius: `rounded-lg` (8px) for buttons/inputs, `rounded-xl` (12px) for modals/panels only. Shadows: modals only (`shadow-[0_12px_40px_-12px_rgba(30,42,71,0.35)]`); panels use a `border-rule` border, not a shadow.

### Rules
- Sentence case everywhere. No ALL-CAPS labels (remove `uppercase` from table header and group headings). No `+` prefixes or `→` in button text.
- Copy: "deliverables" → "documents" in UI text; "JD" → "job posting". Buttons say what happens: "Sign in", "Upload resume", "Use this profile", "Save and start interview", "Add job posting", "Edit job posting", "View job posting", "Your documents", "Start a new interview", "Preview", "Download", "Generate documents", "Tailor to a job" (was Target), "Delete".
- Focus: every interactive element gets `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`.
- Motion: only the highlighter sweep (below) + existing spinners. Wrap the sweep in `@media (prefers-reduced-motion: no-preference)`.
- Line length: chat column `max-w-[68ch]` centered; body text 16px (15px on admin table).

## Tasks

### T1 — Foundation: tokens, fonts, Markdown styles
Files: `tailwind.config.js`, `index.html`, `src/index.css`.
- Tokens + fonts as above. Body classes in index.html → `bg-paper text-ink font-sans antialiased`. Remove the Inter rule from index.css.
- Add `.md` stylesheet in index.css (plain CSS under `@layer components`): paragraphs spaced 0.75em; `ul` disc / `ol` decimal with 1.25em padding and 0.35em item gap; `h1` serif 1.6rem 600, `h2` serif 1.15rem 600 with top margin 1.4em and a 1px `rule` bottom border, `h3` 1rem 600; `a` underline ink; `code` small slate bg `#EEF1F5`; first child no top margin, last child no bottom margin.
- `.md-voice strong` (interviewer only): `font-weight:600; background-image: linear-gradient(transparent 55%, theme(colors.hl) 55%, theme(colors.hl) 92%, transparent 92%); background-repeat:no-repeat; background-size:100% 100%; padding: 0 .1em; box-decoration-break: clone; -webkit-box-decoration-break: clone;`
- `.md-voice.is-new strong` with reduced-motion-safe keyframes `hl-sweep` animating `background-size` from `0% 100%` to `100% 100%` over 600ms ease-out, 250ms delay.
- Acceptance: `npm run build` passes.

### T2 — Chat page
Files: `src/pages/CandidateChat.tsx`, `src/components/ChatMessage.tsx`, `src/components/PhaseIndicator.tsx`, `src/components/ChatInput.tsx`.
- **Header** (sheet bg, bottom `border-rule`, no shadow): left = wordmark "Resume Chat" in `font-serif text-xl`, with `user.name` small slate under it (drop "Welcome,"). Right = job-posting button (outline: `border border-rule hover:border-ink`), "Your documents" (solid ink) when complete, "Sign out" text button. On mobile (<640px) keep all reachable; hide the name line, shrink buttons to `text-sm px-2.5`.
- **PhaseIndicator**: it IS a sequence, so a stepper is right. Desktop: steps in a row joined by a 1px line; done steps = slate text with a small `done` check; current step = ink text weight 600 with the highlighter stroke behind the word (same gradient as `.md-voice strong`); upcoming = slate/60. Mobile (<640px): replace with one line "Step {n} of 7: {name}" + a 3px progress bar (ink fill on rule track). Same PHASES array.
- **ChatMessage**: render inside a centered column (`mx-auto max-w-[68ch]`, the scroll container keeps full width). Assistant: NO bubble — `font-serif text-[17px] leading-relaxed text-ink`, wrapped in `div.md.md-voice` (+ `is-new` when a new prop `isNew` is true). Candidate: sans 15px, `bg-sheet border border-rule border-l-[3px] border-l-ink rounded-lg px-4 py-3`, indented `ml-8 sm:ml-16`, wrapped in `div.md`. Timestamps: 12px slate below each message. Vertical gap between messages 1.75rem. Add optional `isNew?: boolean` prop (default false).
- In CandidateChat, pass `isNew` only for the assistant message appended by the most recent send (track its id in a `useState<string|null>`, set in `handleSend`/`kickOffInterview` from `res.data.id`). Purely presentational.
- **Typing indicator**: replace bouncing dots with serif italic slate text "Your interviewer is writing…" in the same column, with a slow opacity pulse (`animate-pulse`).
- **ChatInput**: sheet bar with top `border-rule`; inner centered `max-w-[68ch]`; textarea `rounded-lg border-rule bg-sheet text-[15px]`, placeholder "Type your answer". Send button: ink square with the existing icon, `aria-label="Send answer"`. Below textarea a 12px slate hint "Enter to send, Shift+Enter for a new line" (hidden on mobile).
- **Complete empty state**: serif heading "Your interview is complete", slate line "Your resume and supporting documents are ready.", buttons "Your documents" (ink solid) and "Start a new interview" (outline).
- JD view panel: restyle as modal (see T3 modal shell); title "Job posting".

### T3 — Onboarding + utility modals
Files: `ResumeUploadModal.tsx`, `ProfilePickerModal.tsx`, `JobDescriptionModal.tsx`, `PreviewModal.tsx`, `CreateCandidateModal.tsx`, `GenerateProfileModal.tsx`, `TargetingModal.tsx`.
- Shared shell: overlay `bg-ink/40 backdrop-blur-[2px]`; panel `bg-sheet rounded-xl` + modal shadow; title `font-serif text-xl`; body text slate 15px; footer right-aligned buttons, secondary = text button slate hover ink, primary = ink solid `rounded-lg px-4 py-2`.
- Onboarding modals (upload → profile → job posting) are a real sequence: show a small slate line at the top "Step 1 of 3" / "Step 2 of 3" / "Step 3 of 3" — ONLY when the JobDescriptionModal is in new-session mode (use `saveLabel` containing "start" or add an optional `stepLabel?: string` prop passed from CandidateChat; prefer the prop).
- Upload drop zone: dashed `border-rule` 1.5px, hover `border-ink`, shows chosen filename in ink 600. Error text `text-danger`.
- Profile picker: options as rows separated by `border-rule` (not individual cards); selected row = `bg-paper` + 3px ink left border; name in serif.
- PreviewModal: render content as a document: inner "page" `bg-sheet max-w-[72ch] mx-auto px-10 py-10 border border-rule rounded-md` on a `bg-paper` scroll area; Markdown in `div.md` with serif body (`font-serif`). For `text/html`, keep `dangerouslySetInnerHTML` but drop the `prose` classes. Header shows a friendly title (filename with underscores → spaces, extension removed) and a "Close" text button; add Escape-to-close via keydown listener.
- Replace every `prose prose-sm` usage with `md`.

### T4 — Admin dashboard
Files: `src/pages/AdminDashboard.tsx`, `src/components/CandidateList.tsx`.
- Header like T2 (wordmark "Resume Chat" + slate "Admin"); buttons "Generate profile" (outline) and "New candidate" (ink solid), "Sign out".
- Replace the 3 stat cards with one serif sentence under a page title: "**3** candidates: 1 interviewing, 1 ready for documents, 1 complete." (numbers in `font-sans font-semibold tabular-nums`). Compute from the same filters (active / interview_complete / deliverables_generated).
- Table in a `bg-sheet border border-rule rounded-xl`: header row sentence case, 13px slate 500, no uppercase. Status = 8px dot + plain words: active → "Interviewing" (ink dot), interview_complete → "Ready for documents" (hl dot with ink/20 ring), deliverables_generated → "Documents ready" (done dot); keep "N resume sets" line. Phase column: plain text.
- Row actions: "Generate documents" (ink solid small) when interview_complete; "Tailor to a job" (outline small) when deliverables_generated; "Delete" as a `text-danger` text button. Add `aria-label` with candidate name on Delete.
- Mobile (<640px): table becomes stacked rows (name 600 + username slate, status line, phase, actions wrap) — implement with a `sm:hidden` list + `hidden sm:table` table, same data.
- Banner: `bg-sheet border-l-[3px] border-l-done border border-rule rounded-lg`.

### T5 — Documents page + login + loading
Files: `src/pages/DeliverablesPage.tsx`, `src/components/DeliverableCard.tsx`, `src/pages/LoginPage.tsx`, `src/App.tsx`, `src/components/ProtectedRoute.tsx` (spinner only).
- Documents page: title "Your documents" (admin: "All documents") serif 2xl; subtitle "Preview or download your resume and supporting documents." "Back" → "Back to interview" (admin: "Back to admin"). Max width 3xl.
- Groups: heading serif 1.15rem ink, sentence case (no uppercase/tracking); replace the `→` in group keys with a colon+space: `${baseKey}: tailored for ${targetLabel(d)}` (keep the grouping logic otherwise).
- DeliverableCard → a row inside a single `bg-sheet border border-rule rounded-xl` list per group (rows divided by `border-rule`; move the container into DeliverablesPage). Left: format tag text in slate 13px ("Word", "Markdown", "Web page", based on type suffix: `_docx`/`resume`/`interview_prep` → Word, `_md` → Markdown, `_html`/`skills_matrix` → Web page; score_card → Markdown) instead of the W/M/H letter tile; main label from TYPE_LABELS with the "(Word)"/"(Markdown)" suffix removed; date slate. Actions: "Preview" (outline) and "Download" (ink solid).
- Empty state: serif "No documents yet" + slate "They appear here once your interview is complete." + button "Back to interview" for candidates.
- Login: `bg-paper` (drop the gradient). Centered sheet `max-w-sm bg-sheet border border-rule rounded-xl p-8`. Wordmark serif 2xl "Resume Chat", slate line "Sign in to continue your resume interview." Labels sentence case, inputs `autoComplete="username"` / `"current-password"`, button "Sign in" / "Signing in…". Error in `text-danger`: "That username and password don't match. Check them and try again."
- Spinners: `border-ink border-t-transparent` instead of brand-dark.
- Remove all remaining `brand-*` class usages (grep must return nothing).

## Verification gates (orchestrator-owned)
- **G1 (after T1–T5):** `npm run build` clean; `grep -rn "brand-\|prose" src` returns nothing; Playwright harness screenshots for login/admin/chat/onboarding/complete/documents/preview at 1280 and 390, zero page errors; markdown lists render as lists; reduced motion respected; keyboard focus visible.
- **G2:** PR opened, `@codex review` requested, findings triaged.
- **G3 (deploy, after Bruno approves):** `docker compose up -d --build frontend`, live Playwright pass.

## GH true-up checklist (every gate)
- [ ] `git status --short` empty
- [ ] each task = one conventional commit, explicit paths staged (no `-a`)
- [ ] pushed: `git log origin/design-pass..HEAD` empty (push via `git -c credential.helper='!gh auth git-credential' push -u origin design-pass`)
