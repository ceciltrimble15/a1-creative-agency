# Original homepage refinement — October 15, 2026

## Intent

Cecil asked to keep the original agency website close to its existing design while making it feel smoother, more sophisticated and less technical. This revises the original homepage. It does not extend the separate ivory/plum concept or replace the agency with a new portfolio layout.

## Baseline

Current sales-readiness PR #30, remote head `9e69d4de15c5cce882e042d0a13b32fa88103937`, tree `1f64a89e2a984fbc9ef530a384048bc35afc480e`. The local equivalent commit `b9d0280` has exactly the same tree. This review branch is stacked on PR #30 so package-aware requests and its clarified offer wording are retained. It must not be merged independently to production without reconciling the existing preview/production divergence.

## Changes

- Keep the official lightbulb logo, “Get Plugged In” headline, blue/gold identity, navigation, original section order, four packages and footer.
- Add a homepage-only stylesheet with calmer charcoal/navy backgrounds, restrained blue, warm supporting type, reduced glow, no circuit decoration and a brief logo fade instead of the power-on flicker. Shared page styles stay intact.
- Add clearer creative/business language and Cecil’s founder attribution. No invented portrait, outcome, testimonial or performance number.
- Add Earth’s Clean & Pure as explicitly labeled current client work inside the existing Proof of Work section. Retain every existing portfolio project.
- Use the actual product photo already present in the ECP project, resized to WebP. Identify Jymii as the client founder. State work-in-progress limits next to the project links.
- Link to the existing project preview, existing quote route and existing About page. The preview’s access policy remains unchanged; this link is for owner review and is not certified for public portfolio access.

## Preserved behavior

Quote, assessment, contact, booking, package prefills, SMS consent, serverless functions, shared JavaScript, deployment configuration and pricing pages are unchanged. Existing homepage CTA destinations and all four package query parameters remain intact. No external submissions or customer messages are sent during validation.

## Validation

Run the existing `npm test`, `npm run build`, and `git diff --check`. Compare all original homepage link destinations and inline script blocks against the baseline, and verify all existing files outside the intended homepage/asset additions have identical Git blobs. Verify unique IDs and local assets. These checks do not certify rendered visual behavior or real lead/phone delivery.

Before public rollout: review the actual rendered desktop/mobile homepage, mobile menu and keyboard focus; confirm the ECP project preview can be opened by the intended audience or replace that link with an approved public case study. Keep the existing production-release gates from PR #30.

## Scope boundary

This is a review revision. No production merge/deploy, DNS changes, hardware purchase, Shopify configuration or Twilio changes are included.
