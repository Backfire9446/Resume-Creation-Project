# Contact details reach the final documents (2026-11-23)

## Context snapshot
- Repo `~/resume-chat`, branch `fix/contact-details` (from master). Backend FastAPI, `app/backend/app/`. Claude calls go through `claude_client.py` (`create_message`, `stream_message`, `response_text`).
- Problem: the interview never asks for contact details, and document generation (`deliverables.py`) only receives `discovery_md` (built from `session.discovery_data`). `session.resume_text` (the uploaded resume) and the chat transcript never reach it. So phone/email/city/LinkedIn reach the resume header only by chance.
- Interview data is saved through the META block: `<!--META:{"discovery_update": {key: value}}-->` → merged into `session.discovery_data` (see `prompts.py` `_META_INSTRUCTIONS`, `claude_service.py`).
- `prompts.py` phase 2 computes `answered = len(session.discovery_data)` to tell the model which question it is on — any non-question key (like `candidate_name`) skews that count.
- Do NOT edit `system/*.md` (an open PR #4 touches them; and they also serve the Claude Code workflow). Put web-app behaviour in `prompts.py`.

## Tasks

### T1 — Interview confirms contact details (prompts.py, discovery_writer.py)
1. In `prompts.py`, define `CONTACT_KEYS = ("candidate_name", "contact")` (module level). In phase 2, compute `answered` excluding these keys.
2. In the phase 2 section, add an instruction block, shown only while `"contact"` is not yet in `discovery_data`:
   - Before the first discovery question, confirm the candidate's contact details as its own message: full name as it should appear, city and state, phone, email, and LinkedIn or portfolio link.
   - If an uploaded resume exists, pre-fill what it has and ask them to confirm or correct (e.g. "Here's what I have from your resume: … Is this still current? Anything to add, like a LinkedIn link?"). If no resume, ask for them.
   - Save with `<!--META:{"discovery_update": {"candidate_name": "<name>", "contact": {"location": "...", "phone": "...", "email": "...", "linkedin": "...", "other": "..."}}}-->`, leaving out fields the candidate doesn't want listed. Never invent a value.
   - It does not count as one of the numbered discovery questions.
3. Add `"contact": "Contact Details"` to `_KEY_LABELS` in `discovery_writer.py` (dicts already render as sub-bullets).
Acceptance: `python3 -m py_compile` passes on edited files.

### T2 — Documents receive contact details and the original resume (deliverables.py)
1. Add a helper `_candidate_context(session, discovery_md) -> str` that returns `discovery_md` plus, when present:
   - a `## Contact Details (use exactly as given)` section rendered from `discovery_data["contact"]` and `candidate_name`;
   - a `## Candidate's Original Resume (reference only)` section with `session.resume_text`, introduced by one line: use it for facts, dates, employers and contact details the interview didn't cover; where it conflicts with the interview answers, the interview wins.
2. Use `_candidate_context(...)` instead of bare `discovery_md` in: the resume, interview prep, and skills matrix calls in `generate_all_deliverables`; and the cover-letter call (and the `discovery_md` fallback of the targeted resume) in `generate_targeted_deliverables`.
3. Add to the resume system prompt (both base and targeted) and the cover-letter system prompt this rule: "Header: use the candidate's name and contact details exactly as given. If a detail is missing, leave it out. Never invent contact details or use placeholders like [Phone] or email@example.com."
4. Don't change filenames, deliverable types, effort levels, or the order of generation.
Acceptance: `python3 -m py_compile` passes; `git diff --stat` touches only `prompts.py`, `discovery_writer.py`, `deliverables.py`.

## Verification gates (orchestrator-owned)
- G1: read the diff in full; compile.
- G2: after deploy, in the container: call the resume generation path with a fake session (discovery data without contact + resume_text containing contact) and check the header uses the resume's contact, with no placeholders. Live Playwright: a fresh test candidate reaches the contact-confirmation message pre-filled from the uploaded resume.
- G3: PR + `@codex review` clean before deploy; deploy only with Bruno's approval.

## GH true-up checklist
- [ ] one commit per task, explicit paths
- [ ] `git status --short` empty; pushed; `git log origin/fix/contact-details..HEAD` empty
