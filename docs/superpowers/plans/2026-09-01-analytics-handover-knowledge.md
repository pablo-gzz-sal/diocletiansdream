# Analytics Handover Knowledge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the September 2026 GA4 tracking release and its reporting workflow as durable project knowledge, with a separate internal work log.

**Architecture:** A new focused Analytics handover becomes the authoritative continuation document. The parent `AGENTS.md` points all future analytics work to it. A standalone internal work-log entry records the completed work and expected business outcome without changing the August client report.

**Tech Stack:** Markdown documentation, Git.

---

## File Structure

- Modify: `../AGENTS.md` — require review of the Analytics handover before analytics work and maintenance of the handover as tracking evolves.
- Create: `docs/analytics-tracking-knowledge.md` — authoritative GA4 implementation, reporting, interpretation, and continuation guide.
- Create: `docs/internal-work-log/2026-09-01-ga4-conversion-interaction-tracking.md` — internal-only tracking work log.

### Task 1: Establish the Analytics continuation source

**Files:**

- Modify: `../AGENTS.md`
- Create: `docs/analytics-tracking-knowledge.md`

- [ ] **Step 1: Add the mandatory AGENTS instruction**

Add this rule below the existing `docs/website.md` instruction:

```markdown
- Read `docs/analytics-tracking-knowledge.md` before analysing GA4, recommending analytics changes, reviewing tracked behaviour, or working on conversion measurement. Build on it after each meaningful analytics or tracking change.
```

Add the same file to the `Key Local Files` list with a description covering GA4 baseline context, the approved event contract, report-reading workflow, and continuation notes.

- [ ] **Step 2: Write the Analytics handover**

Create a concise Markdown guide that documents the four event names and parameters, exact tracking scope, excluded event noise, TuriTop and purchase safeguards, WordPress-era comparison limit, GA4 reports to request/review, key metrics and diagnostic rules, recommended reporting sequence, and future-chat checklist.

- [ ] **Step 3: Verify the instruction and handover cross-reference**

Run:

```bash
rg -n "analytics-tracking-knowledge|book_now_click|booking_widget_view|contact_click|language_switch" ../AGENTS.md docs/analytics-tracking-knowledge.md
```

Expected: AGENTS contains the mandatory review rule and the handover contains all four approved events.

- [ ] **Step 4: Commit the continuation source**

```bash
git add ../AGENTS.md docs/analytics-tracking-knowledge.md
git commit -m "docs: add analytics tracking handover"
```

### Task 2: Record the internal-only tracking work

**Files:**

- Create: `docs/internal-work-log/2026-09-01-ga4-conversion-interaction-tracking.md`

- [ ] **Step 1: Write the internal work log**

Record the completed GA4 interaction tracking work in client-readable internal language. Include: work completed, why it was necessary, desired outcome, safeguards preserved, verification, and the next reporting step after SiteGround deployment. State clearly that the work occurred after the August client-report period.

- [ ] **Step 2: Verify scope and required wording**

Run:

```bash
rg -n "Internal only|after the August|Why this was done|Expected outcome|dd-thankyou|SiteGround" docs/internal-work-log/2026-09-01-ga4-conversion-interaction-tracking.md
```

Expected: The log is clearly internal-only, outside the August report, explains purpose and outcome, and confirms purchase-flow protection.

- [ ] **Step 3: Commit the internal work log**

```bash
git add docs/internal-work-log/2026-09-01-ga4-conversion-interaction-tracking.md
git commit -m "docs: record GA4 interaction tracking work"
```

## Self-Review

- Spec coverage: Task 1 covers the persistent handover and AGENTS instruction; Task 2 covers the internal work-log request.
- Scope: No analytics implementation, Google configuration, TuriTop configuration, or client-report editing is included.
- Ambiguity: The handover is the source to read before analytics work; AGENTS requires it to be updated after meaningful future analytics changes.
