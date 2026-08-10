# Text Compare

A `text-compare.com`-style web tool for comparing two blocks of text. Paste text into the two columns and additions, deletions, and changes are highlighted.

## Features

- Additions in green, deletions in red, and character-level inline highlighting for changed lines
- Line numbers on both sides, plus a summary of added/removed/changed line counts
- "Swap Sides", "Clear", "Ignore leading/trailing whitespace", and "Wrap long lines" controls
- Long lines stay perfectly aligned between the two sides whether wrapped or not
- Compare with `Ctrl` / `Cmd` + `Enter`
- Diffing runs entirely in the browser — the text you're comparing is never sent anywhere
- No backend required — a static site, deployable as-is to GitHub Pages or Cloudflare Pages

## Tech stack

- HTML / CSS / vanilla JavaScript
- Diff library: jsdiff (`diff`)
- Hosting: GitHub Pages (live) and/or Cloudflare Pages (optional)

## Live preview

https://isitest1.github.io/text-compare/

## Usage

See [SETUP.md](./SETUP.md) for setup and deployment instructions.

## License

MIT
