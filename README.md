# LOGOSFORGE — Website

Marketing site for **Logosforge**, a narrative operating system for structured
writing that forges writing, structure and AI into a single terminal for
novelists, screenwriters and narrative designers.

> App repository: [`fopearcano/storyplanner`](https://github.com/fopearcano/storyplanner)

## Design language

The site is built in a dark **red-glow CRT panel aesthetic**
(inspired by the reference frames in [`/reference-ui`](./reference-ui)):

- Pure-black canvas with navy→maroon CRT panel interiors, glowing crimson
  (`#e8120a`) borders + corner markers, and gold (`#ffb300`) technical data
- A single vintage typewriter face (`Special Elite`) is used **everywhere**,
  including the `LOGOSFORGE` wordmark — fitting for a writing app. Faux-bold is
  disabled (`font-synthesis:none`) so it keeps an authentic single-weight look
- The official **AΦ logo mark** in the nav, footer and About section, and as
  the app/dock icon. No background animations.

## What's on the page

| Section | Contents |
|---|---|
| **Hero** | Full-bleed responsive `LOGOSFORGE` wordmark (SVG, spans the viewport at every size), tagline, deploy CTAs, live HUD meta |
| **Main Features** | Inline AI Assistant · Manuscript Editor · Structure Tools · Story Bible · Graph Visualization · Local/Cloud AI |
| **Writing Modes** | Five narrative engines — **Screenplay is featured as the priority unit** (market-gap business case), plus Novel, Graphic Novel, Series, Stage Script |
| **About** | The "narrative OS" manifesto + the Logosforge logo |
| **Pricing** | Phase 1 (desktop launch): Whiteboard free · Logosforge Pro one-time €59 (own it, free updates, 14-day trial) · BYO-AI, own your data, no subscription. Web app & cloud sync are a Phase 2 roadmap item (N/A at launch) |
| **Downloads** | Desktop (Windows / macOS / Linux) and Web (PC / iOS / Android PWA) |
| **Footer** | Discord (community/support), Telegram (updates), social links, credits / copyright / policy |

Navigation matches the brief: **Products** (Desktop → Download, Web),
**Pricing** (Free, Pro), **About**, **Help** (Support → Discord, Documentation).

## Tech

Zero build step — hand-authored static HTML / CSS / JS so it deploys anywhere.

```
index.html        # single-page site + inline SVG sprite (logo mark, icons)
screenshots.html  # Screenshots gallery (Whiteboard + Pro Studio) with lightbox
checkout.html     # plan-aware payment/licensing placeholder (?plan=)
css/style.css     # design system + all sections (responsive, reduced-motion aware)
js/main.js        # click dropdowns, mobile drawer, nav scrolled state
site.webmanifest  # PWA / dock-icon manifest
assets/           # logo.webp (original) + logo.png + icon PNGs (512/192/apple-touch)
reference-ui/     # style reference frames
```

## Run locally

```bash
npx http-server -p 8099 -c-1
# open http://127.0.0.1:8099
```

Or just open `index.html` in a browser. Fonts load from Google Fonts with
system fallbacks; the site degrades gracefully without JavaScript.

## Deploy (GitHub Pages)

Settings → Pages → deploy from branch, root (`/`). The included `.nojekyll`
file serves all assets verbatim.
