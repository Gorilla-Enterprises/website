---
name: verify-website
description: Drives the Gorilla Enterprises marketing site (Next.js 16 App Router, single "/" route) in a real browser via Playwright, and captures screenshots/assertions as evidence. Use before declaring any landing-page change (copy, brand assets, layout, tokens) complete.
---

# Verify website

Single-surface app: a static, full-screen landing page at `/` (`app/page.tsx`).
No auth, no forms, no API routes, no client state.

## Launch

```bash
npm run dev > /tmp/ge-website-dev.log 2>&1 &
timeout 30 bash -c 'until grep -q "Ready in" /tmp/ge-website-dev.log 2>/dev/null; do sleep 0.5; done' && echo READY
```

- Serves at `http://localhost:3000`.
- Readiness signal: the `✓ Ready in <N>ms` line in the log (not just the port
  answering — Turbopack can bind the port slightly before the app is servable).
- **Isolation is NOT available.** Next.js 16 detects a second `next dev` against
  this same checkout and refuses to start it, printing the existing PID and
  `.next/dev/logs/next-development.log` instead of running — you cannot drive
  two verification passes against this repo concurrently. If port 3000 is
  already in use by an unrelated process, Next auto-bumps to 3001 and logs a
  warning; check the log for the actual port before driving.

## Doctor

One read-only check that the instance is worth driving — confirms the server
answers *and* rendered the real page, not a crash/500 page:

```bash
curl -s http://localhost:3000 | grep -q "Gorilla Enterprises" && echo OK || echo FAIL
```

## Drive

Playwright (`@playwright/test`, Chromium only) is already a devDependency,
configured at `playwright.config.ts` (repo root). Two ways to drive it:

**1. Run the committed regression spec** — exercises the full assertion set
in one shot (starts/reuses the dev server itself per `webServer` in the
config, so `Launch` above is optional for this path):

```bash
npm run test:e2e
```

**2. Drive ad hoc** (exploratory checks, new viewports, new copy) with the
Playwright CLI against an already-launched server — no spec file needed:

```bash
npx playwright screenshot --viewport-size=<W>,<H> http://localhost:3000 <output-path>.png
```

Stable handles on this page (there are no `data-testid`s or ARIA landmarks
beyond these — the page is three static content pieces):

- The mark: `page.getByRole("img", { name: "Gorilla Enterprises" })` (from the
  `<Image alt="Gorilla Enterprises">` in `app/page.tsx`).
- The wordmark: `page.getByText("Gorilla", { exact: true })` and
  `page.getByText("Enterprises", { exact: true })`.
- The dateline: `page.getByText("July 2027")` and `page.getByText("Rwanda")`.

## Evidence

- **Functional**: `npm run test:e2e` output (pass/fail per assertion) — proves
  the mark, wordmark, and dateline text are actually present and visible, not
  just that the page returned 200.
- **Visual**: screenshots from `npx playwright screenshot`, saved to a
  scratch/evidence directory outside the repo (e.g. your scratchpad), one per
  viewport checked. Name them by viewport, e.g. `desktop-1440x900.png`,
  `mobile-390x844.png`. Look at the image — a screenshot that "exists" but
  wasn't inspected proves nothing.
- Cross-viewport claims require at least: a narrow phone width (~390px), and
  a standard desktop width (~1440px). Check for horizontal scroll / clipped
  content at both, not just that text is present.

## Cleanup

Kill only what this run's `Launch` step started, identified by the port it
bound — never by process name (`next`/`node` match unrelated processes):

```bash
fuser -k 3000/tcp
```

If `npm run test:e2e` started its own server (no server was already running
when you invoked it), Playwright tears it down itself when the test run
exits — no manual cleanup needed for that path.

Never delete captured screenshots as part of cleanup.

## Helpers

None — `npm run test:e2e` and `npx playwright screenshot` cover this app's
entire surface directly; a wrapper script would be pure indirection for a
single static page.
