# runthe.ai

A small, static website for the things I build. DocLifts leads the page as a concrete example of software that lets a person stay in control while AI helps with the details.

## Run locally

Requires Node.js 22 or newer. No dependencies or build step.

```sh
npm run dev
```

Open http://127.0.0.1:4321. Run `npm run check` for JavaScript syntax validation.

## Structure

- `public/index.html`: page content and semantic structure
- `public/style.css`: responsive layout, typography, color, reduced-motion support
- `scripts/serve.mjs`: local preview server (not a production server)
- `.github/workflows/deploy.yml`: publish the public directory to GitHub Pages on pushes to main

The page links to the live DocLifts Alpha, its MCP connection guide and the enoch.ai case study. The former fictional workout walkthrough has been retired. This landing page makes no model calls, uploads no photos and stores no workout data. Google Fonts supplies DM Sans and Space Grotesk; system fonts are the fallback. There are no analytics or cookies.

## Deployment

The custom domain is https://runthe.ai/ and its public source repository is https://github.com/cjenoch/runthe-ai. GitHub Pages serves the website and the deployment workflow republishes on pushes to main. GitHub's Pages settings bind the deployment to `runthe.ai`; a CNAME file is not required for this Actions-based deployment.

Cloudflare manages DNS. The apex has four DNS-only A records pointing to GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`). `www` is a DNS-only CNAME to `cjenoch.github.io`, with GitHub Pages redirecting it to the apex. The original project URL https://cjenoch.github.io/runthe-ai/ also redirects to the custom domain. DNS was configured on 2026-10-03 using the existing authorized Cloudflare connection in Hermes; no new credential was created or copied into this repository.

The page can also be served by any static host using only `public/`. It requires no VPS process, database, or application secrets. Asset paths are relative so the page works both at a domain root and under a GitHub Pages project path.

## Verification

The separate UI playground at https://runthe.ai/testing/doclifts.html compares Guided, Set table, Notebook and Tap sets using shared sample data. It is an interactive design prototype, not connected to the live app. Prototype edits are kept in the visitor's browser; no accounts or real workout data are loaded. The standalone document includes its illustrative machine image and is marked `noindex, nofollow` (the URL is public, not access-controlled).

For the playground, check layout switching and shared set logging at 390px and 320px. The page is intentionally unlinked from the main landing page.

The clock opens timer settings (sound off by default, optional pulse/shake, duration and an alert preview). Audio uses Web Audio after a user gesture; locked-phone/background delivery is not guaranteed. Reduced-motion preferences disable the animations. RIR can follow the current prescription or a personal Show/Hide override; hidden values are retained. Edit workout stages additions/removals before applying them, with a one-step undo until subsequent set/note edits. "From now on" saves a local sample program; nothing is written to DocLifts.

Editable playground sources live in `prototypes/`. Rebuild the committed standalone page with `python scripts/export-playground.py /path/to/visualize/scripts/render.py` using the installed visualization renderer. Run `node --check prototypes/workout-interactions.js` before exporting. GitHub Pages serves the committed export directly.

Verify desktop and phone widths (1440, 390, and 320 pixels), no horizontal overflow, and the live-app, case-study, source and MCP-guide links. The deployment workflow also checks the preview server's JavaScript syntax. These checks cover the landing page, not the DocLifts application's acceptance suite.

## Content sources

Product descriptions reflect DocLifts 0.16.3 Alpha on 2026-10-03: a live multi-user app with photo identification, image screening, machine history and read-only MCP access. Muse has successfully read app sets and imported history, with optional notes access authorized. Other clients require individual verification. Alpha accounts are operator-managed; public signup is closed. This repository does not modify or deploy DocLifts.

Copyright 2026 Enoch AI LLC. All rights reserved.
