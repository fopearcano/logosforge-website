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
- Heavy red glowing display type for the wordmark and section titles
  (`Oxanium`), with readable body copy (`Chakra Petch`) and `Share Tech Mono`
  for data labels
- A single quiet graphic — a static **triple-core diagram** in the About
  section (built in `js/main.js`, no libraries). No background animations.

## What's on the page

| Section | Contents |
|---|---|
| **Hero** | Full-bleed responsive `LOGOSFORGE` wordmark (SVG, spans the viewport at every size), tagline, deploy CTAs, live HUD meta |
| **Main Features** | Inline AI Assistant · Manuscript Editor · Structure Tools · Story Bible · Graph Visualization · Local/Cloud AI |
| **Writing Modes** | Five narrative engines — **Screenplay is featured as the priority unit** (market-gap business case), plus Novel, Graphic Novel, Series, Stage Script |
| **About** | The "narrative OS" manifesto + an animated triple-core critique radar |
| **Pricing** | Free (Whiteboard only · 0€) and Pro license (Complete · 99€) |
| **Downloads** | Desktop (Windows / macOS / Linux) and Web (PC / iOS / Android PWA) |
| **Footer** | Discord (community/support), Telegram (updates), social links, credits / copyright / policy |

Navigation matches the brief: **Products** (Desktop → Download, Web),
**Pricing** (Free, Pro), **About**, **Help** (Support → Discord, Documentation).

## Tech

Zero build step — hand-authored static HTML / CSS / JS so it deploys anywhere.

```
index.html        # single-page site + inline SVG sprite (logo mark, icons)
css/style.css     # design system + all sections (responsive, reduced-motion aware)
js/main.js        # click dropdowns, mobile drawer, nav state, static core diagram
assets/           # favicon
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
