# Technical Discovery: How to import `@gorilla/design-system` into the website and what migrating to it involves

## Finding

`npm run pack` in `../design-system` built the library and produced a
tarball at `../design-system/dist-pack/gorilla-design-system-0.1.0.tgz`
(package `@gorilla/design-system@0.1.0`). It should be added to the
website as a local dependency via a `file:` reference to that tarball
(or to the package directory) in `package.json`, then installed with
`npm install`. No `transpilePackages`, `serverExternalPackages`, or other
Next config change is required — the tarball ships pre-built ESM
(`dist/index.js`, `dist/utils.js`) with generated `.d.ts` files, not raw
TypeScript source, and the website is on the App Router, which allows
external stylesheets to be imported directly in any component or layout.

The package exports three entry points:
- `@gorilla/design-system` — all client components (Button, Input,
  Textarea, Checkbox, Radio/RadioGroup, Tag, Toggle, Card, Dialog, Toast
  + `toast`, TopNav, Sidebar, Tabs, Breadcrumb, Avatar/AvatarGroup,
  ProgressBar, CommandTrigger). Bundled with a `"use client"` banner.
- `@gorilla/design-system/utils` — server-safe helpers (currently `cn`).
- `@gorilla/design-system/styles.css` — design tokens + Tailwind v4
  `@theme` mapping + base styles, meant to be imported *after*
  `@import "tailwindcss";` in the consumer's own global stylesheet.

Peer dependencies are `react@^19`, `react-dom@^19`, `tailwindcss@^4` —
these match the website's current versions exactly
(`react@19.2.4`, `react-dom@19.2.4`, `tailwindcss@^4`), so no version
bump is needed. The library's own runtime dependencies (Radix UI
primitives, `class-variance-authority`, `clsx`, `lucide-react`, `sonner`,
`tailwind-merge`) install transitively and need no manual handling.

## Evidence

- Tarball contents and packaged `package.json` (`exports`, `peerDependencies`,
  `dependencies`) — `../design-system/dist-pack/gorilla-design-system-0.1.0.tgz`
- Pack script (`build` then `npm pack`) — `../design-system/packages/design-system/package.json` (`scripts.pack`)
- Pre-bundled ESM output, `"use client"` banner strategy, `external: ["react", "react-dom"]` — `../design-system/packages/design-system/tsup.config.ts`
- Component surface — `../design-system/packages/design-system/src/index.ts`
- Theme tokens, required import order, `.dark`/`.light` scoping via `@custom-variant dark (&:is(.dark *):not(.light *))` — `../design-system/packages/design-system/src/styles/theme.css`
- Next.js allows importing external stylesheets anywhere in the `app` directory (no special config) — `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`, "External stylesheets" section
- `transpilePackages` exists for un-built monorepo/`node_modules` source but is unnecessary here since the tarball is already compiled — `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/transpilePackages.md`
- Website's current dependency versions — `package.json`
- Website's current styling is hand-rolled and does not use the design system's semantic token names or `.dark`/`.light` scoping — `app/globals.css`, `app/page.tsx`

## Applicability and limits

- The tarball is `private: true` in its own `package.json`; this is fine
  for a `file:` install but means it can never be published to a
  registry as-is — re-pack-and-reinstall is the update loop until/unless
  the design system gets its own registry or workspace link.
- A `file:` tarball reference is copied into `node_modules` at install
  time and is **not** a symlink — after any future design-system change,
  someone must re-run `npm run pack` in `../design-system` and
  `npm install` in the website to pick it up. An `npm link` /
  workspace-style setup would auto-reflect changes but was not
  requested and is a bigger structural change (turning both repos into
  one workspace); not evaluated further here.
- The design system's `theme.css` intentionally does **not** call
  `@import "tailwindcss"` itself — it must be imported after Tailwind's
  own import in the website's global stylesheet, not on its own.
- The design system expects a `.dark` (or `.light`) class on an ancestor
  element (typically `<html>`) to activate its semantic tokens
  (`--background`, `--foreground`, `--border`, etc. only exist inside
  `.dark`/`.light` scopes). The website's `<html>` currently has no such
  class, so simply adding the CSS import is not sufficient — `layout.tsx`
  needs `className="dark"` (or `light`) added.
- Token names differ between the website's ad-hoc CSS and the design
  system's semantic tokens: the website defines
  `--color-surface-base`/`--color-ink-primary` used as `text-ink-primary`
  in `page.tsx`, while the design system provides `--color-background`/
  `--color-foreground` (`bg-background`/`text-foreground`) instead.
  `--color-ink-secondary` and `--color-ink-muted` happen to share the
  same names in both, so those class usages carry over unchanged, but
  `text-ink-primary` does not exist in the design system's tokens and
  must be replaced with `text-foreground`.
  The website's custom `--ge-surface-base` etc. block and the `@theme
  inline` mapping in `app/globals.css` become redundant once the design
  system's `styles.css` is imported, since it defines the same
  categories of tokens under different (semantic, not brand-prefixed)
  names.
- Font wiring already matches: the website's `next/font` CSS variable
  names (`--font-bricolage-grotesque`, `--font-mulish`,
  `--font-jetbrains-mono`) are exactly what the design system's
  `--font-display`/`--font-body`/`--font-mono` fall back to, so no
  change is needed there.
- The website currently has a single page (`app/page.tsx`) with no
  reusable components of its own — the only overlap to migrate is the
  ad-hoc color tokens and their three usages in `page.tsx`, plus the
  root `<html>` class. There are no existing Button/Card/Input-style
  components to replace.

## Recommendation

1. Add `"@gorilla/design-system": "file:../design-system/dist-pack/gorilla-design-system-0.1.0.tgz"` to `website/package.json` `dependencies` and run `npm install`.
2. In `app/globals.css`, keep `@import "tailwindcss";` first, then add `@import "@gorilla/design-system/styles.css";`, and delete the now-redundant `--ge-*`/`@theme inline` block that duplicates it.
3. In `app/layout.tsx`, add the `dark` class to the `<html>` element (alongside the existing font-variable classes) so the design system's semantic tokens resolve.
4. In `app/page.tsx`, replace `text-ink-primary` with `text-foreground` (the design system's equivalent); `text-ink-secondary` and `text-ink-muted` need no change.
5. Run the existing Playwright smoke test (and/or `verify-website` skill) after the change to confirm the landing page still renders correctly, since this touches every token the page uses.

## Open questions

- Should the website eventually move to an npm-workspace link with
  `../design-system` instead of a tarball, to avoid the manual
  re-pack-and-reinstall step on every design-system change? Not decided;
  out of scope unless requested.
- Should the site render in `.dark` or `.light` mode? Current ad-hoc
  tokens (`#060907` background, light ink) are a dark theme, so `.dark`
  is the natural choice, but this should be confirmed against brand intent
  rather than assumed.
