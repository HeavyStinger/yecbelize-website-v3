# Young's Engineering — Redesign (v2)

A complete, production-grade redesign of the YEC site. **Pure HTML, CSS & JS** — no build step.
Mobile-first, light mode, SEO-optimised, accessible. Built with the `impeccable`,
`frontend-design` and `ui-ux-pro-max` skills.

## Run it
It references images from the existing `../photos/` folder, so serve from the **project root**:

```bash
# from "Youngs Engineering v3"
python -m http.server 5577
# then open http://localhost:5577/claude%20design/index.html
```

(Opening `index.html` directly via file:// mostly works, but the ES-module `main.js` and the
Google Maps embed prefer http.)

## Pages (17)
- `index.html` — home
- `services.html`, `projects.html`, `our-team.html`, `our-affiliates.html`, `contact-us.html`
- `projects/*.html` — 11 project detail pages (generated, all consistent)

## Structure
```
claude design/
├── *.html                      # top-level pages
├── projects/*.html             # project detail pages
└── assets/
    ├── css/tokens.css          # design tokens (colour, type, spacing, motion) — single source of truth
    ├── css/style.css           # base + components (header, hero, cards, footer…)
    ├── css/pages.css           # inner-page components (people, project detail, contact, forms)
    ├── js/main.js              # nav, scroll-reveals, count-up, filters, form, parallax, motion
    ├── js/vendor/motion.umd.js # Motion (motion.dev) UMD build — loaded as a CLASSIC script (file://-safe)
    ├── img/yec/…               # all site imagery, bundled so paths never reach above this folder
    └── img/team/*.webp         # team headshots re-compressed 11–22 MB → 33–75 KB
```

### Portability (works regardless of how it's opened)
- **No ES modules.** Scripts are classic `defer` scripts, so opening `index.html` via `file://` does not hit module-CORS.
- **Self-contained assets.** Every image lives under `assets/img/`; nothing references `../photos`, so any server root works.
- **Cache-busting.** Local CSS/JS are linked with `?v=N` so clients always pick up updates (bump N when you change them).
- External-only: Google Fonts + the Google Maps embed (need internet; degrade gracefully otherwise).

## Design language
- **Identity:** the logo's navy + sky-blue, kept and elevated through execution.
- **Signature:** the logo's **sunray** as ambient light + a **survey/coordinate** layer
  (mono location labels, station-style section indexing, data figures).
- **Type:** Archivo (display) · IBM Plex Sans (body) · IBM Plex Mono (technical labels).
- **Layout:** 1240px container with a consistent fluid side "deadzone"; one uniform vertical rhythm.
- **Motion:** Motion (motion.dev) spring stagger on the hero + drawer links, spring hover-lift on
  project/people tiles, scroll-reveals, stat count-up — all respect `prefers-reduced-motion` and
  degrade to visible content if JS fails.

## For development / handoff
- Swap Unsplash-free: all imagery is the client's own.
- A real hero **video** can replace the hero `<img>` in `index.html` (`.hero__media`).
- Wire the contact form to a backend (Formspree / Netlify / serverless); it currently composes a
  `mailto:` as a no-backend fallback.
- Re-export team photos at ~1000px if originals change (see `assets/img/team`).
