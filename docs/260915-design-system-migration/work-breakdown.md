# Work Breakdown: Migrate website to `@gorilla/design-system`

Basis: `docs/260915-design-system-migration/technical-discovery.md`
(no separate spec exists for this initiative; the discovery finding's
"Recommendation" section is the approved scope).

Scope note: the website currently has no reusable UI components of its
own (single route, `app/page.tsx`, no Button/Card/etc.). This plan only
covers wiring in the package and migrating the existing token/CSS layer
— it does not invent component-swap work that doesn't exist yet.

## Task: Add `@gorilla/design-system` as a project dependency

Purpose: Make the package's components, `utils` entry, and `styles.css`
resolvable from the website so later tasks can import from it.
Depends on: none
Surfaces: `package.json`, `package-lock.json`
Acceptance criteria:
- `package.json` `dependencies` includes `"@gorilla/design-system": "file:../design-system/dist-pack/gorilla-design-system-0.1.0.tgz"`.
- `node_modules/@gorilla/design-system` exists after install and its `package.json` resolves the `exports` map (`.`, `./utils`, `./styles.css`).
Verify: Run `npm install`, then `node -e "console.log(require.resolve('@gorilla/design-system/styles.css'))"` to confirm the styles entry resolves; confirm no peer-dependency warnings for `react`, `react-dom`, `tailwindcss` are printed during install.
Risks: `file:` installs copy the tarball's unpacked contents rather than symlinking — a stale `node_modules` copy after a future design-system rebuild is a re-install problem, not a bug in this task. `npm install` also touches `package-lock.json`; review the diff is limited to the new dependency before it's included in any commit.

## Task: Import the design system's stylesheet after Tailwind, and drop the redundant token block

Purpose: Bring in the design system's semantic tokens and base styles so `bg-background`, `text-foreground`, etc. become available, per the required `@import "tailwindcss";` → `@import "@gorilla/design-system/styles.css";` order documented in the discovery finding.
Depends on: Add `@gorilla/design-system` as a project dependency
Surfaces: `app/globals.css`
Acceptance criteria:
- `@import "@gorilla/design-system/styles.css";` appears immediately after the existing `@import "tailwindcss";` line.
- The hand-rolled `:root { --ge-surface-base; --ge-ink-primary; --ge-ink-secondary; --ge-ink-muted; }` block and its `@theme inline` mapping (`--color-surface-base`, `--color-ink-primary`, `--color-ink-secondary`, `--color-ink-muted`) are removed, since the design system now supplies the equivalent tokens.
- The `body { background; color; font-family; }` rule in `app/globals.css` is removed (the design system's own `@layer base` rule sets these from `--background`/`--foreground`/`--font-body`), avoiding two competing rules.
Acceptance criteria (build-level):
- `npm run build` completes without a Tailwind/PostCSS error (e.g. missing token, duplicate `@theme` key).
Verify: `npm run build`; visually the change is inert until the next task adds the `.dark` scope — do not check rendered color yet.
Risks: Removing `--color-ink-secondary`/`--color-ink-muted` from the website's own block is safe only because the design system defines tokens of the same name (confirmed in discovery); if that ever diverges, `page.tsx`'s `text-ink-secondary`/`text-ink-muted` usages would silently fall back to unstyled defaults — covered by the visual check in the next task, not this one.

## Task: Activate the design system's theme scope on `<html>`

Purpose: The design system's semantic tokens (`--background`, `--foreground`, `--border`, etc.) only exist inside a `.dark` or `.light` scope; without this the previous task's import contributes no usable tokens.
Depends on: Import the design system's stylesheet after Tailwind, and drop the redundant token block
Surfaces: `app/layout.tsx`
Acceptance criteria:
- The `<html>` element's `className` includes `dark` alongside the existing font-variable classes and `h-dvh antialiased` (matches the site's current dark, high-contrast look per the discovery finding's open-question resolution toward `.dark`).
Verify: `npm run dev`, load `/`, and inspect computed styles on `<body>` in devtools — `background-color` should resolve to `--ge-surface-base` (#0a0b0a) and `color` to `--ge-ink-primary` (#edeeea) via the `.dark` scope, not the browser default.
Risks: If `.dark` is wrong per brand intent (open question in the discovery finding), this is a one-class flip to `.light` later — flag to the user rather than deciding silently if the rendered result looks off-brand.

## Task: Rename `text-ink-primary` to `text-foreground` in the landing page

Purpose: `text-ink-primary` has no backing token once the old `--color-ink-primary` mapping is removed; the design system's equivalent token is `--foreground` / `text-foreground`.
Depends on: Activate the design system's theme scope on `<html>`
Surfaces: `app/page.tsx`
Acceptance criteria:
- The `<span>` wrapping "Gorilla" uses `text-foreground` instead of `text-ink-primary`.
- `text-ink-secondary` (on "Enterprises") and `text-ink-muted` (on the dateline) are unchanged.
Verify: `npm run dev`, load `/`, confirm "Gorilla" renders in the same light ink color as before (no unstyled/black text), via a visual check or the Playwright test in the next task.
Risks: Low — single class rename, no logic change.

## Checkpoint: Full-stack visual and automated verification

Purpose: Confirm the migration produced no visible or functional regression on the only route in the app before considering the migration done.
Depends on: Rename `text-ink-primary` to `text-foreground` in the landing page
Surfaces: whole app (read-only verification, no further edits expected)
Acceptance criteria:
- `npm run test:e2e` (the existing `tests/landing.spec.ts`) passes unchanged — it asserts the mark, wordmark, and dateline are visible, which is indifferent to token names but would catch a broken import or build failure.
- A manual or `verify-website` skill pass confirms colors, fonts, and spacing visually match the pre-migration screenshot (mark, "Gorilla" / "Enterprises" text, dateline, dark background) at both desktop and mobile widths.
Verify: `npm run test:e2e`; invoke the `verify-website` skill (covers `features/landing-render.md` and `features/responsive-layout.md`) for the visual pass.
Risks: If `verify-website`'s feature map assumes specific token/class names that changed here, update it as part of closing this checkpoint rather than leaving it stale — check `skills/verify-website/features/*.md` for hard-coded references to `text-ink-primary` or the removed `--ge-*` tokens.

## Open questions carried from discovery (not resolved by this plan)

- Whether the website should eventually move to an npm-workspace link with `../design-system` instead of a re-pack-and-reinstall `file:` tarball flow.
- Whether `.dark` (chosen above to match the site's current look) is the intended long-term theme, or whether `.light` should be offered/used instead.
