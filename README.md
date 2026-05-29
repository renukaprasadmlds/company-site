# Dhiphos — website

A static, single-page site for **Dhiphos**.

> Industrial software layers. Strictly software. Hardware-agnostic.

## Stack

- Plain HTML, CSS, and a small bit of vanilla JS.
- No build step. No framework. No tracking.
- Auto-adapts to light / dark via `prefers-color-scheme`.

## Files

```
dhiphos-site/
├── index.html                      # main landing page
├── privacy.html                    # standalone privacy notice
├── robots.txt                      # crawler directives + sitemap pointer
├── sitemap.xml                     # XML sitemap for search engines
├── README.md
└── assets/
    ├── css/
    │   └── styles.css              # styling, palette, markers, themes, @font-face
    ├── js/
    │   └── script.js               # year stamp + signup form handler
    ├── fonts/
    │   ├── geist-sans.woff2                   # display + body (variable, full latin)
    │   ├── geist-mono.woff2                   # identifiers — chips, eyebrows, entry titles (variable, full latin)
    │   └── space-grotesk-latin.woff2          # brand wordmark only (variable, latin subset)
    └── img/
        ├── logo-light.svg          # light-theme logo (boxed graphic)
        ├── logo-dark.svg           # dark-theme logo (graphic only)
        ├── offerings-light.png     # offerings illustration (light theme)
        ├── offerings-dark.png      # offerings illustration (dark theme)
        ├── services-light.png      # services illustration (light theme)
        └── services-dark.png       # services illustration (dark theme)
```

All site assets live under `assets/` and are split by type (`css/`, `js/`,
`img/`). Filenames are lowercase kebab-case so URLs stay portable across
case-sensitive hosts and don't require URL-encoding for spaces.

The `privacy.html` page reuses the same stylesheet, palette, fonts, top nav,
and footer as `index.html`. Update its hardcoded "Last updated" date whenever
the page is revised.

## Run locally

Open `index.html` in any browser, or serve it:

```
python -m http.server 8080
```

Then visit <http://localhost:8080>.

## Sections

- `header.hero` — logo, brand wordmark, tagline, lede, signup form.
- `#offerings` — `mes-mom`, `iiot-edge`, `digital-twin`, `physical-ai`.
- `#services` — `specialized-implementation`, `custom-integration`, `system-architecture`, `app-modernization`.
- `#team` — short team blurb.
- `footer.foot` — contact email, LinkedIn, copyright.

To add an entry, copy an existing `.entry` block in `index.html` and edit its `<h3>` and `<p>`.

## Logo

Two SVGs ship with the project. The right one is shown automatically based on OS theme:

- `assets/img/logo-light.svg` — used when the OS is in **light** mode (boxed graphic).
- `assets/img/logo-dark.svg`  — used when the OS is in **dark**  mode (graphic only, rendered at ~73% to compensate for the missing box).

Swap files of the same names to update the mark.

## Signup form

Out of the box the form validates the email client-side and falls back to opening the visitor's mail client (`mailto:`). To wire up a real backend:

1. Pick a form backend (Formspree, Netlify Forms, Cloudflare Workers, your own API, etc.).
2. In `assets/js/script.js`, set:
   ```js
   var endpoint = "https://formspree.io/f/xxxxxx";
   ```
3. The form will then POST `{ email, source }` as JSON to that endpoint.

The contact address is also configurable in `assets/js/script.js` via `contactAddress`.

## Design tokens

Defined as CSS variables at the top of `assets/css/styles.css`:

| Token         | Light value | Role                                            |
| ------------- | ----------- | ----------------------------------------------- |
| `--bg`        | `#ffffff`   | page background                                 |
| `--fg`        | `#333333`   | primary text + filled button background         |
| `--muted`     | `#888888`   | secondary text, hairlines                       |
| `--accent`    | `#B45309`   | amber/forge — diamond markers, links, focus    |
| `--accent-2`  | `#F59E0B`   | softer amber for hover glows                    |
| `--on-accent` | `#ffffff`   | text color on filled accent surfaces            |

In dark mode the accent shifts up to `#F59E0B` against a `#1a1a1a` background.

Section headings, the email input, and the footer email line are prefixed with
a small filled diamond drawn entirely in CSS — adjust its size via the
`--mark-size` variable in `:root`.

## Typography

Three faces, all **self-hosted** from `assets/fonts/` as variable-font WOFF2:

- **Geist** — display + body. Frontier-tech neutral sans (Vercel, OFL). Variable weight `100–900`.
- **Geist Mono** — identifiers (entry titles, chips, eyebrows, topnav links). Pairs natively with Geist. Variable weight `100–900`.
- **Space Grotesk** — brand wordmark only. Used in exactly one place: `.topnav-wordmark` (rendered as `DHIPHOS`). Gives the brand name a distinct typographic signature. Variable weight `400–700`, latin subset.

The `@font-face` declarations live at the top of `assets/css/styles.css`. The
display + mono families ship as single full-Latin variable WOFF2 files; Space
Grotesk is restricted to the latin `unicode-range` since the wordmark is
ASCII-only. System-font fallbacks are defined via `--font-display`,
`--font-mono`, and `--font-brand` CSS tokens.

There are no third-party font CDN requests at runtime. All three fonts are
licensed under the **SIL Open Font License (OFL) 1.1**.

## Brand naming

The source-of-truth in markup, metadata, alt text, page titles, and prose is
**`Dhiphos`** (mixed case). The all-caps rendering on the top-nav wordmark is
purely typographic, handled by CSS:

```css
.topnav-wordmark { text-transform: uppercase; }
```

A single edit to `Dhiphos` in markup updates the whole site while the wordmark
surface still displays as `DHIPHOS`. The wordmark is also the only place
**Space Grotesk** is used — the rest of the site is set in Geist (see
[Typography](#typography)).

## Deploying

Plain static site — no build step. Publish directory: this folder.

The site is hosted on **GitHub Pages**, served from the `main` branch at the
custom domain `dhiphos.com`. Two repo-root files anchor the deployment:

- `CNAME` — contains the custom domain. GitHub Pages reads this and configures
  the TLS certificate and routing automatically.
- `.nojekyll` — disables the default Jekyll preprocessing so filenames starting
  with `_` are served as-is.

To deploy, push to `main`:

```sh
git push origin main
```

GitHub Pages picks up the change within ~30–60 seconds and re-publishes.

The site is also portable to **Netlify**, **Vercel**, **Cloudflare Pages**,
**S3 + CloudFront**, **nginx**, etc. — no build command, publish directory is
this folder.

## Credits

The four offerings/services illustrations
(`assets/img/{offerings,services}-{light,dark}.png`) were generated with
**Google Gemini**, acknowledged in the site footer.

## License

Copyright © Dhiphos. All rights reserved.