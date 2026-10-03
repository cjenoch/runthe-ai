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

GitHub Pages provides the initial HTTPS deployment. The custom domain can be connected after DNS access is available. Do not add a CNAME file until the DNS records and GitHub Pages custom domain configuration are ready.

The page can also be served by any static host using only `public/`. It requires no VPS process, database, or application secrets. Asset paths are relative so the page works both at a domain root and under a GitHub Pages project path.

## Content sources

Product descriptions were checked against the DocLifts changelog on 2026-10-03, including its photo workflow, machine history, live workout editing, and editable starter programs. The current README for DocLifts contains older descriptions; the homepage does not claim the private app is publicly available. This repository does not modify or deploy DocLifts.

Copyright 2026 Enoch AI LLC. All rights reserved.
