# CLAUDE.md — text-compare (Text Diff Comparison Tool)

This file documents how Claude Code should work on this repository. The app itself already exists under `public/` and is live; use this file as the source of truth for scope and conventions when making further changes.

## 1. Project purpose

A web tool, equivalent to `https://text-compare.com/`, for comparing two blocks of text. Text is pasted into two side-by-side columns, and additions, deletions, and changes are highlighted. The primary live deployment is GitHub Pages; Cloudflare Pages remains available as an optional alternative host.

## 2. Key constraints

- Diffing runs entirely in the browser (client-side). The text pasted into the two columns is never sent to or stored on a server.
- No backend, no database, no accounts.
- Development happens inside the devcontainer.

## 3. Tech stack

- HTML / CSS / vanilla JavaScript (no framework)
- Diff library: jsdiff (npm package `diff`), loaded from a CDN (jsDelivr)
- Hosting: GitHub Pages (primary live site, see §7) and/or Cloudflare Pages (optional, publish directory `public/`)
- Local preview: `http-server`
- Deploy: `wrangler` (Cloudflare Pages only)

## 4. File layout

```
text-compare/
├── CLAUDE.md
├── SETUP.md
├── README.md
├── package.json
├── wrangler.toml
├── .gitignore
├── .devcontainer/
│   └── devcontainer.json
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js
    ├── icon.svg        ← favicon + inline header icon
    ├── og-image.png     ← Open Graph / Twitter Card preview image (1200×630)
    ├── robots.txt
    └── sitemap.xml
```

## 5. Features / diff display spec

- Two side-by-side input columns (Before / After).
- Line-level diff via `Diff.diffLines`.
- When a removed line is immediately followed by an added line, treat the pair as a "changed" line and show an inline diff.
  - Use `Diff.diffChars`, not `Diff.diffWords`, for the inline diff — `diffWords` relies on `\w` word boundaries and cannot tokenize scripts without spaces (e.g. CJK text), so it ends up marking the entire line as changed instead of the actual differing span. `diffChars` produces meaningful highlights regardless of script.
- Added lines are green, removed lines are red, and the inline-changed span within a line gets a further, stronger highlight.
- Line numbers are shown on both sides.
- Added/removed/changed line counts are summarized above the diff.
- Controls: "Compare", "Swap Sides", "Clear", "Ignore leading/trailing whitespace", and "Wrap long lines" (checked by default).
- `Ctrl` (`Cmd` on Mac) + `Enter` runs the comparison.
- UI copy is in English; the footer states plainly that input is never sent externally.
- Both sides render inside a single CSS grid (line-number and content columns per side, one grid row per line index) rather than two independently-scrolling panes. This is what keeps the two sides vertically aligned even when a long line wraps — a CSS grid row's height is shared by every cell in that row. Don't reintroduce two separate scrolling containers for the diff view; that reopens the alignment bug.
- When "Wrap long lines" is off, overflowing text is clipped (`overflow: hidden`), not scrolled — no scrollbar and no scroll cursor on the row. Don't switch this back to `overflow-x: auto`; that was tried and rejected (looked out of place next to non-scrolling rows).
- The page uses the full viewport width — no fixed `max-width` centering that leaves large empty side margins.
- Responsive: on narrow screens, the input textareas stack vertically; the diff grid stays a single grid (not split into stacked panes) so alignment is never at risk.
- Header shows `icon.svg` immediately followed by the "Text Compare" text on one line (`.brand` flex row). Keep it a single line — don't reintroduce a stacked/second-line title.
- Icon (`public/icon.svg`): intentionally minimal — a circle, left half solid black, right half white with a black outline (a "before/after compare" motif). A prior, more detailed design (two document rectangles plus an arrow) was replaced because it turned into a muddy blob at favicon/inline-header size. If redesigning again, verify legibility at both a large size and ~16–28px before committing to it.

## 6. Dev commands

- Local: `npm run dev` (`http://localhost:8080`)
- Deploy (Cloudflare, optional): `npm run deploy` (`wrangler pages deploy public`)

## 7. Git workflow (important)

- Commit and push proactively at sensible checkpoints, without waiting for explicit instruction each time.
- The GitHub repository is **public** (`gh repo create text-compare --public --source=. --remote=origin --push`).
- Write commit messages in English, concise and descriptive of the actual change.
- Never commit secrets (tokens, `.dev.vars`, etc.) — respect `.gitignore`.
- **`master` is the source; `gh-pages` is the published build.** GitHub Pages serves the `gh-pages` branch (root), because Pages can't serve a subdirectory like `public/` directly. `gh-pages` contains only the built contents of `public/` at its root — no `CLAUDE.md`, no other project files.
- Whenever `public/` changes on `master`, mirror it into `gh-pages` in the same session (see `SETUP.md` §5 for the exact commands) so `https://isitest1.github.io/text-compare/` never goes stale relative to `master`.

## 8. SEO & analytics (already configured — don't re-add or duplicate)

- `index.html` `<head>` already has: canonical link, Open Graph + Twitter Card tags, `og-image.png` reference, WebApplication JSON-LD, and a Google Search Console `google-site-verification` meta tag. Don't remove these; update the OG/description copy in lockstep if the app's tagline changes.
- `public/robots.txt` and `public/sitemap.xml` reference the live URL `https://isitest1.github.io/text-compare/`. If the canonical domain ever changes, update both files plus the canonical/OG URLs in `index.html` together.
- A Cloudflare Web Analytics beacon script is embedded near the end of `<body>` in `index.html`. This is the one intentional exception to "nothing is sent externally" in §2 — it only reports page views/clicks to Cloudflare, never the contents of the textareas, so the footer's privacy claim stays accurate. Don't add Google Analytics or any other tracker on top of it; the user explicitly opted out of GA4 as too much setup for what they wanted (see `SETUP.md` for the reasoning if it needs revisiting).

## 9. Out of scope

- No backend or database.
- No code path that sends the compared text anywhere external (the jsdiff CDN load and the analytics beacon are static-asset/pageview traffic only — neither ever receives textarea content).
- No user accounts or login.
