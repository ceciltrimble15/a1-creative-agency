# Build once, review internally, bring Cecil the tested version

Owner: Cecil Trimble. Updated October 21, 2026.

## Brief template
| Field | Required content |
| --- | --- |
| Outcome | One observable customer/business result |
| Scope | Pages/workflows in this version; new ideas held for the next |
| References | Exact approved imagery, identity and authoritative facts |
| Pass checks | Three to five observable checks; evidence expected |
| Authority | Existing publishing, contact and spending authorization |
| Budget | Time/cost limit; default three repair rounds, not ten mandatory rounds |

## Website review
Install project dependencies with `npm ci`, then install the browser with `npx playwright install chromium` if necessary. Start the repository's extensionless static preview with `npm run preview:local`. In a second terminal run:

```sh
npm test
npm run review:website -- --base-url=http://127.0.0.1:4173 --output-dir=artifacts/website-review
```

The command creates JSON evidence and screenshots for phone portrait, phone landscape and desktop. Missing browser/dependencies, inaccessible pages and unverified live integrations are blockers, not passing checks. The command neither sends forms nor places orders nor makes calls.

The assistant reviews the screenshots and brief, fixes routine defects, and repeats affected checks. The command does not automatically call an AI model or invent repairs. It makes the evidence repeatable so the supervising builder/reviewer can perform the loop.

## Skim-first acceptance checks
- Can a visitor identify the offer and next action from the first screen?
- Can headings and short summaries explain the page without reading every paragraph?
- Are price, package scope, project status and essential conditions visible?
- Do navigation, images, mobile layout and quote-package handoff work?
- Are trust and business results supported by real evidence?

Earth's Clean & Pure acceptance adds: approved bottle references, consistent variant imagery, owner-agreed prices and sizes, and a tested payment-to-pickup path. This repository's agency homepage review does not certify the separate Earth storefront or Shopify integration.

## Decision loop
For strategy: identify the problem, compare evidence and options, recommend a decision, then measure the outcome. Do not keep iterating until AI tells Cecil what he wants to hear. A proposal is not an agreement; an agent's agreement is not evidence.

## Research foundation
Nielsen Norman Group, How Users Read on the Web: https://www.nngroup.com/articles/how-users-read-on-the-web/ . Scanning is a design principle, not a claim that nobody reads or a guaranteed conversion increase.
