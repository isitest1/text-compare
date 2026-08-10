# Text Compare

A `text-compare.com`-style web tool for comparing two blocks of text. Paste text into the two columns and additions, deletions, and changes are highlighted.

## Features

- Additions in green, deletions in red, and word/character-level inline highlighting for changed lines
- Line numbers on both sides, plus a summary of added/removed/changed line counts
- "Swap Sides", "Clear", and "Ignore leading/trailing whitespace" controls
- Compare with `Ctrl` / `Cmd` + `Enter`
- Diffing runs entirely in the browser — input text is never sent anywhere
- No backend required — a static site, deployable as-is to Cloudflare Pages

## Tech stack

- HTML / CSS / vanilla JavaScript
- Diff library: jsdiff (`diff`)
- Hosting: Cloudflare Pages (optional) and/or GitHub Pages

## Live preview

https://isitest1.github.io/text-compare/

## Usage

See [SETUP.md](./SETUP.md) for setup and deployment instructions.

## License

MIT
