# Analytics Handover Knowledge Design

## Goal

Create durable project knowledge that lets a future Codex chat understand the September 2026 GA4 tracking release, interpret the resulting reports, and continue optimisation work without rediscovering the implementation.

## Deliverables

1. `docs/analytics-tracking-knowledge.md`: the authoritative internal handover.
2. `docs/internal-work-log/2026-09-01-ga4-conversion-interaction-tracking.md`: a standalone internal work-log entry, excluded from the August client report.

## Analytics Handover Structure

The handover will document:

- the property and website context, including the WordPress-era purchase-tracking limitation;
- the four approved events, the parameters they send, and the controls they cover;
- intentional exclusions that protect report quality;
- the preserved purchase flow on `/dd-thankyou/` and the rule not to modify TuriTop without separate approval;
- report-by-report GA4 reading instructions for engagement, pages, acquisition, conversion paths, and the new custom events;
- recommended comparison periods and the difference between interaction intent and a completed purchase;
- diagnostics for low engagement, weak booking intent, contact interest, language behaviour, and suspected tracking faults;
- the minimum information to collect when a future agent receives GA4 access.

## Internal Work-Log Structure

The work log will state what was added, why it was needed, the intended business outcome, safeguards retained, and the verification completed. It will use client-readable language but remain explicitly internal because it occurred after the August reporting period.

## Constraints

- No changes to analytics code, Google tag configuration, TuriTop, SiteGround, or GA4 settings.
- No personal data in documentation examples or event descriptions.
- The new tracking begins producing useful trend data only after the SiteGround package is deployed; it cannot repair missing historical WordPress purchase data.

## Success Criteria

A future Codex chat can identify the allowed tracking scope, ask for the right GA4 reports or use granted GA4 access effectively, distinguish between engagement signals and confirmed purchases, and avoid accidentally expanding event noise or affecting the checkout flow.
