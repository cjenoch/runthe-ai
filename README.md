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
- `public/app.js`: illustrative workout interaction
- `scripts/serve.mjs`: local preview server (not a production server)
- `.github/workflows/deploy.yml`: publish the public directory to GitHub Pages on pushes to main

The walkthrough uses fictional data in memory only. It makes no model calls, uploads no photos, and does not connect to DocLifts or store real workouts. Reloading resets it. Google Fonts supplies DM Sans and Space Grotesk; system fonts are the fallback. There are no analytics or cookies.

## Deployment

The custom domain is https://runthe.ai/ and its public source repository is https://github.com/cjenoch/runthe-ai. GitHub Pages serves the website and the deployment workflow republishes on pushes to main. GitHub's Pages settings bind the deployment to `runthe.ai`; a CNAME file is not required for this Actions-based deployment.

Cloudflare manages DNS. The apex has four DNS-only A records pointing to GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`). `www` is a DNS-only CNAME to `cjenoch.github.io`, with GitHub Pages redirecting it to the apex. The original project URL https://cjenoch.github.io/runthe-ai/ also redirects to the custom domain. DNS was configured on 2026-10-03 using the existing authorized Cloudflare connection in Hermes; no new credential was created or copied into this repository.

The page can also be served by any static host using only `public/`. It requires no VPS process, database, or application secrets. Asset paths are relative so the page works both at a domain root and under a GitHub Pages project path.

## Verification

Checked in a browser at desktop and phone widths (1440, 390, and 320 pixels): layout, no horizontal overflow on small phones, adding example sets, accepting a name, undoing it without losing sets, deferring a suggestion, and resetting the walkthrough. JavaScript syntax is also checked by the deployment workflow. These checks cover this landing page, not the real DocLifts application or its phone acceptance.

## Content sources

Product descriptions were checked against the DocLifts changelog on 2026-10-03, including its photo workflow, machine history, live workout editing, and editable starter programs. The current README for DocLifts contains older descriptions; the homepage does not claim the private app is publicly available. This repository does not modify or deploy DocLifts.

Copyright 2026 Enoch AI LLC. All rights reserved.
