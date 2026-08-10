# CLAUDE.md — text-compare (Text Diff Comparison Tool)

This file documents how Claude Code should work on this repository. The app itself already exists under `public/`; use this file as the source of truth for scope and conventions when making further changes.

## 1. Project purpose

A web tool, equivalent to `https://text-compare.com/`, for comparing two blocks of text and publishing it on Cloudflare. Text is pasted into two side-by-side columns, and additions, deletions, and changes are highlighted.

## 2. Key constraints

- Diffing runs entirely in the browser (client-side). Input text is never sent to or stored on a server.
- No backend. Deployed as a static site to Cloudflare Pages.
- Development happens inside the devcontainer.

## 3. Tech stack

- HTML / CSS / vanilla JavaScript (no framework)
- Diff library: jsdiff (npm package `diff`), loaded from a CDN (jsDelivr)
- Hosting: Cloudflare Pages (publish directory is `public/`) — optional; GitHub Pages is also used for a quick public preview (see `SETUP.md`)
- Local preview: `http-server`
- Deploy: `wrangler`

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
    └── app.js
```

## 5. Features / diff display spec

- Two side-by-side input columns (Before / After).
- Line-level diff via `Diff.diffLines`.
- When a removed line is immediately followed by an added line, treat the pair as a "changed" line and show an inline diff.
  - Use `Diff.diffChars`, not `Diff.diffWords`, for the inline diff — `diffWords` relies on `\w` word boundaries and cannot tokenize scripts without spaces (e.g. CJK text), so it ends up marking the entire line as changed instead of the actual differing span. `diffChars` produces meaningful highlights regardless of script.
- Added lines are green, removed lines are red, and the inline-changed span within a line gets a further, stronger highlight.
- Line numbers are shown on both sides.
- Added/removed/changed line counts are summarized above the diff.
- Provide "Compare", "Swap Sides", "Clear", and "Ignore leading/trailing whitespace" controls, plus a "Wrap long lines" toggle.
- `Ctrl` (`Cmd` on Mac) + `Enter` runs the comparison.
- UI copy is in English; the footer states plainly that input is never sent externally.
- Both sides render inside a single CSS grid (line-number and content columns per side, one grid row per line index) rather than two independently-scrolling panes. This is what keeps the two sides vertically aligned even when a long line wraps — a CSS grid row's height is shared by every cell in that row. Don't reintroduce two separate scrolling containers for the diff view; that reopens the alignment bug.
- The page uses the full viewport width — no fixed `max-width` centering that leaves large empty side margins.
- Responsive: on narrow screens, the input textareas stack vertically.

## 6. Dev commands

- Local: `npm run dev` (`http://localhost:8080`)
- Deploy: `npm run deploy` (`wrangler pages deploy public`)

## 7. Git workflow (important)

- Commit and push proactively at sensible checkpoints, without waiting for explicit instruction each time.
- The GitHub repository is **public** (`gh repo create text-compare --public --source=. --remote=origin --push`).
- Write commit messages in English, concise and descriptive of the actual change.
- Never commit secrets (tokens, `.dev.vars`, etc.) — respect `.gitignore`.
- A `gh-pages` branch (containing only the built contents of `public/`) is published via GitHub Pages at `https://isitest1.github.io/text-compare/` for a quick public preview. When `public/` changes, mirror the update into `gh-pages` (see `SETUP.md`) so the live preview doesn't go stale.

## 8. Out of scope

- No backend or database.
- No code path that sends input text anywhere external.
- No user accounts or login.
