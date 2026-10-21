# Skim-first website and bounded review workflow

Base: PR #32 at 19d4e1c69ccc020674db9869c425a6ac89a72ba3. This change is stacked on that branch, not on production.

## Implemented
- Persist Cecil's business-first, skim-first and bounded build/review/fix instructions in AGENTS.md.
- State the Earth partnership first: Cecil leads sales, marketing and strategy; Jymii leads sourcing and production. No legal ownership percentages or accepted financial terms are invented.
- Shorten the hero explanation and section headings while retaining the logo, Get Plugged In, package prices, routes and existing forms. Preserve the unfinished project disclosure.
- Add a local-only static preview and a repeatable Playwright review command, with phone/landscape/desktop screenshots, overflow, first-screen CTA, headings, image, local destination and package-handoff checks.
- The review tool produces pass/fail/blocker evidence. It does not invoke an AI repair model. AGENTS.md directs the supervising assistant to inspect evidence, repair and rerun up to three times; no autonomous background execution is claimed.

## Validation
- npm test passed: existing HTML/consent, backend consent, opt-out and voice recovery tests with mocked provider behavior. This is not certification of real calls, lead delivery or production integrations.
- node --check scripts/website-review.mjs passed; git diff --check passed.
- The review command ran and correctly returned blocked when the browser executable was absent. Browser installation failed because the downloaded archive was invalid. No rendered screenshots or passing visual review are claimed.
- No form submissions, real calls, posts, spending, production merge or deployment occurred.

## Remaining release work
Install a working Chromium runtime, run npm run preview:local and npm run review:website, inspect all generated images and fix any actual failures. Confirm existing integration and production-release gates from PR #32 before treating the website as live-ready.

The six-month Earth strategy and proposed sales pilot are private planning work and are not published in this source repository.
