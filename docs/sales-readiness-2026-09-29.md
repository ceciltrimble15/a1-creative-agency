# Sales-readiness changes — September 29, 2026

Status: draft for review; not approved for production.

## Source and scope

Based on `claude/a1-creative-website-2-fresh` at `2a0b8be`, the current head of preview PR #17. This retains the existing QuickLaunch scope, TRHUE portfolio restoration, and phone-handler code fixes. The production branch is separate. PR #17 was reported non-mergeable; this change does not resolve or authorize the wider production promotion.

## Changes

- Keep the existing official logo, navy/gold design, and broader connected-system positioning.
- Reduce hero logo height; show sales copy and buttons immediately instead of waiting for entrance animation.
- Explain websites, booking, and follow-up in the opening copy; surface the $500 QuickLaunch request and its scope link.
- Move pricing after the problem section, ahead of the longer system explanation.
- Present the defined QuickLaunch scope as a $500 one-time build; retain separately scoped recurring costs and extras. Update the matching structured price.
- Carry each package selection into the quote form using a whitelist. Prefill existing service values and an editable message, keeping the backend schema unchanged.
- Remove absolute inquiry/booking outcomes and open-ended support wording in the edited sections. Written scope controls timing and support.
- Repair missing homepage portfolio chip styles; retain existing client/affiliated project labels without inventing deployment status or results.
- Explain that a request is not payment or a commitment; provide email as the quote form alternative and a no-JavaScript fallback.

## Verification

Passed: `git diff --check`, `npm run build`, and the existing `npm test` suite (18-page consent checks, backend consent, opt-out behavior, voice recovery with mocks).

Passed in a local DOM simulation: all four package links and prefills, request payloads and success states using mocked fetch, phone optional, SMS unchecked, unknown and unsafe package keys ignored, and recovery after a simulated backend error. No real forms submitted, emails sent, CRM records created, calls placed, or payments taken.

Not completed: rendered mobile/tablet/desktop QA. Local Chromium download failed; browser tool timed out. Static build/test success is not visual or live-service proof.

## Remaining before production

1. Review the rendered preview on phone and desktop, including quote and pricing pages.
2. Resolve the existing production/preview branch divergence as a separately reviewed change; do not publish an old deployment from the dashboard.
3. Perform an explicitly approved end-to-end lead test and confirm both the record and operations notification.
4. Verify the real phone/callback route before relying on it in sales outreach.
5. Confirm the payment method, written scope, delivery date, and payment schedule for any actual sale. This change adds no checkout and promises no launch date.
6. Obtain Cecil's production approval before merge or deployment.

## Sales today

The concrete entry offer remains $500: one mobile-ready page, up to six sections, a quote form to one inbox, click-to-call, and one consolidated revision. Domains, hosting, paid software, ongoing maintenance, and expanded functionality remain separate. Agree scope, costs, timing, and payment terms in writing before collecting payment. No automatic outreach is authorized by this change.
