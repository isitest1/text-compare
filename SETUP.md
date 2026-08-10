# SETUP.md — Setup Guide

This document walks through developing `text-compare` in the devcontainer and publishing it.

## Prerequisites

- Docker Desktop installed
- Visual Studio Code with the "Dev Containers" extension installed
- A GitHub account
- (Optional) A Cloudflare account, if you want to deploy to Cloudflare Pages

## 1. Open in the devcontainer

1. Open this folder in VS Code.
2. From the command palette (`F1`), choose "Dev Containers: Reopen in Container".
3. Once the container finishes building, `postCreateCommand` installs `wrangler`, `http-server`, and the project dependencies automatically.

## 2. App implementation

The app lives under `public/` (`index.html`, `styles.css`, `app.js`).

## 3. Run locally

```bash
npm run dev
```

Open `http://localhost:8080` in a browser, paste text into both columns, and click "Compare" to see the highlighted diff.

## 4. GitHub repository

The devcontainer includes the GitHub CLI (`gh`). After authenticating, create the repository and push in one step:

```bash
gh auth login
gh repo create text-compare --public --source=. --remote=origin --push
```

## 5. Publishing

### Option A: GitHub Pages (used for the current live preview)

GitHub Pages can't serve a subdirectory like `public/` directly, so the contents of `public/` are published as the root of a separate `gh-pages` branch.

First-time setup (already done for this repo, kept here for reference):

```bash
git worktree add --orphan -b gh-pages /tmp/gh-pages-wt
cp -r public/. /tmp/gh-pages-wt/
cd /tmp/gh-pages-wt
git add -A && git commit -m "Publish public/ for GitHub Pages"
git push -u origin gh-pages
cd -
git worktree remove --force /tmp/gh-pages-wt

gh api -X POST repos/<owner>/text-compare/pages -f "source[branch]=gh-pages" -f "source[path]=/"
```

To publish a new update after changing `public/`:

```bash
git worktree add /tmp/gh-pages-wt gh-pages
rm -rf /tmp/gh-pages-wt/*
cp -r public/. /tmp/gh-pages-wt/
cd /tmp/gh-pages-wt
git add -A && git commit -m "Update GitHub Pages build"
git push
cd -
git worktree remove --force /tmp/gh-pages-wt
```

The site is served at `https://<owner>.github.io/text-compare/`.

### Option B: Cloudflare Pages (optional)

#### Git integration (recommended, auto-deploy)

1. Cloudflare dashboard → "Workers & Pages" → "Create application" → "Pages" → "Connect to Git".
2. Select the `text-compare` repository.
3. Build settings:
   - Framework preset: `None`
   - Build command: (leave empty)
   - Build output directory: `public`
4. Click "Save and Deploy". Every push to `main` will auto-deploy afterward.

#### Direct deploy with Wrangler

```bash
npx wrangler login
npm run deploy
```

On first run, Cloudflare creates the `text-compare` project and publishes it at a URL like `https://text-compare.pages.dev`.

## 6. Custom domain (optional)

From the Cloudflare Pages project settings → "Custom domains", assign any domain you own.

## Troubleshooting

- **Highlighting doesn't appear**: if the network is blocked, the CDN (jsDelivr) can't load the `diff` library. For fully offline use, download `diff.min.js` into `public/` and point `index.html` at the local path instead.
- **`wrangler` auth errors**: run `npx wrangler logout` then `npx wrangler login` again.
