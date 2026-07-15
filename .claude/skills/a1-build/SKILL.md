---
name: a1-build
description: >
  Build, fix, or extend the A1 Creative website and systems (buttons, links,
  forms, sections, legal pages, Airtable pipeline, email, Twilio/A2P SMS) as a
  streamlined, sub-agent-orchestrated pipeline. Use whenever Cecil asks to
  "fix the site / a button / a form", "add a form or page", "wire up the
  assessment / quote / booking / deposit", "get Airtable / email / Twilio /
  A2P working", or "build the next A1 client system". Enforces the locked
  baseline and guardrails so the same mistakes (wrong homepage, wrong branch,
  claiming visible from source) never recur.
---

# A1 Build — the A1 Creative builder pipeline

You are Cecil's builder. This skill runs the whole job as a disciplined pipeline
and fans work out to sub-agents. **Read `references/baseline.md` and
`references/guardrails.md` before doing anything** — they are the locked facts and
rules. If any Phase-0 check fails, STOP and report; do not improvise a baseline.

Track the run with the task tools (TaskCreate/TaskUpdate). Keep `SPEC.md` (repo
root) as the live checklist — update its checkboxes as you finish items.

## Phase 0 — Ground (never skip)
1. Read `references/baseline.md` + `references/guardrails.md`.
2. `git fetch origin a1-creative-production main`. Confirm:
   - the working branch is (or will be) cut from **`a1-creative-production` HEAD**;
   - `git merge-base --is-ancestor origin/main <branch>` is **false** (main = the
     TRHUE/Vite app — never build on it);
   - the homepage hero is **"Build The Business System Behind Your Brand"** with the
     A1 logo (not "Stop Losing Jobs From Missed Calls").
3. If a branch is needed, create ONE: `claude/<short-task-slug>` from
   `origin/a1-creative-production`. Do not spawn extra branches/PRs per fix.

## Phase 1 — Audit (read-only; fan out with Explore agents if broad)
Inventory the real artifact, not memory: every `<a href>`, `<button>`, `<form>`,
and integration URL in `index.html`; which legal pages exist; which integrations
are wired (grep + read). Write findings into `SPEC.md` (§1–§4). If the request is
small (one button/form), audit just that surface.

## Phase 2 — Plan
Map the request to `SPEC.md` units of work. Split each as **🟦 Claude** (code I can
do now) vs **🟧 Cecil** (credentials / A2P registration / DNS / env vars / final
approval). Never block Claude-ownable work waiting on Cecil-ownable steps.

## Phase 3 — Build (fan out sub-agents — parallelize by FILE)
Spawn one sub-agent per independent unit so they run concurrently. **Parallelize by
file**: agents editing *different* files run in parallel; multiple edits to the same
file (e.g. `index.html`) are serialized in one agent or use `isolation: worktree`.
Typical units:
- **frontend** — add/upgrade a section or button in `index.html`, styled to the
  page's own tokens (Outfit; `--blue-electric #2563EB`, `--gold #F59E0B`, navy). No
  redesign; additive only; reuse existing classes (`.section .container .btn …`).
- **backend** — `netlify/functions/*` (same-origin `/api/submit-lead`; reuse the
  existing Airtable + notify libs; no new endpoints/tables/fields unless required).
- **legal** — build `/privacy` + `/terms` (A2P language) + redirects for the
  `-policy`/`-and-conditions` variants (see `references/` playbook notes in SPEC §3).
- **twilio** — port `api/twilio/*` (voice / missed-call text-back / voicemail /
  inbound STOP-HELP) to `netlify/functions`; consent + audit fields; STOP/HELP.
Give each agent the baseline + guardrails and a tight, verifiable deliverable.

## Phase 4 — Verify (BROWSER OUTPUT IS THE SOURCE OF TRUTH)
Do **not** claim anything works from source or unit tests alone. A verification
sub-agent must:
- serve the built `index.html` + run the real Netlify handler headless (Playwright,
  `executablePath:/opt/pw-browsers/chromium`);
- for every changed button/form: click it, assert the target/behavior, and
  **measure computed style** (`opacity`, `display`, `visibility`, bounding box) —
  remember the `.reveal` opacity:0 trap: presence ≠ visibility;
- screenshot each surface and read the screenshot back;
- run the automated handler suite (stub `fetch`; new/existing lead, dedupe, missing
  field, phone-without-consent still submits, consent evidence, link, score/package,
  Task, email-failure-degrades, regression);
- optionally write ONE clearly-labeled `TEST —` Airtable record via MCP to prove the
  live pipeline, then note it for cleanup.

## Phase 5 — Preview (one, real, never guessed)
Commit; push the single branch; open/refresh ONE **draft** PR into
`a1-creative-production`. Get the **real** Netlify preview URL from the deploy record
(`mcp__Netlify__…get-deploy` → `deploy_ssl_url`) or the PR's `deploy-preview` status
`target_url`. Never manufacture the URL. Ignore the parallel Vercel preview.

## Phase 6 — Handoff
Update `SPEC.md` checkboxes. Return a tight report: what changed, the preview URL, a
per-item visual QA checklist for Cecil, TEST record IDs, and the exact remaining
🟧 Cecil actions (env vars, A2P registration, webhook URLs, approval). **Never merge,
deploy to production, or change DNS without explicit CEO approval.**

## Sub-agent prompt template
> You are an A1 build sub-agent. Baseline + guardrails: <paste the two reference
> files>. Your ONLY job: <one unit>. Touch only <these files>. Preserve the approved
> design; additive only. Return: files changed, what you verified, and anything that
> needs Cecil. Do not push, open PRs, deploy, or edit files outside your unit.
