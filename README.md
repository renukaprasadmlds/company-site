# Dhiphos — website

A static, single-page site for **Dhiphos**.
Minimalist, engineering-inspired, inspired by [kenn.io](https://kenn.io/).

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
    │   ├── space-grotesk-latin.woff2          # display font (variable, latin subset)
    │   ├── space-grotesk-latin-ext.woff2      # display font (variable, latin-ext subset)
    │   ├── jetbrains-mono-latin.woff2         # mono font (variable, latin subset)
    │   └── jetbrains-mono-latin-ext.woff2     # mono font (variable, latin-ext subset)
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
case-sensitive hosts (Linux, S3) and don't require URL-encoding for spaces.

### `privacy.html`

A standalone privacy notice that reuses the same `assets/css/styles.css`, palette, fonts, top nav, and footer as `index.html`. It lays out:

- a plain-English **summary** at the top,
- registered company info (Dhiphos Private Limited, Bengaluru, India),
- what we collect / don't collect (no cookies, no analytics, no trackers),
- third-party touch-points (hosting, LinkedIn link, email provider),
- DPDP Act 2023 / GDPR rights,
- how to contact us for privacy questions.

The hosting and email-provider third-party entries are filled in for our
current setup (GitHub Pages + Zoho Mail). If either changes, edit the matching
`<div class="entry">` in the **hosting &amp; third parties** section.

The "Last updated" date is hardcoded near the top — update it whenever you revise the page.

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
- `footer.foot` — `info@dhiphos.com`, LinkedIn, copyright.

To add an entry, copy an existing `.entry` block in `index.html` and edit its `<h3>` and `<p>`.

## Logo

Two SVGs ship with the project. The right one is shown automatically based on OS theme:

- `assets/img/logo-light.svg` — used when the OS is in **light** mode (boxed graphic).
- `assets/img/logo-dark.svg`  — used when the OS is in **dark**  mode (graphic only, rendered at ~73% to compensate for the missing box).

Swap files of the same names to update the mark.

## Signup form

Out of the box the form validates the email client-side and falls back to opening the visitor's mail client (`mailto:info@dhiphos.com`). When ready:

1. Pick a form backend (Formspree, Netlify Forms, Cloudflare Workers, your own API, etc.).
2. In `assets/js/script.js`, set:
   ```js
   var endpoint = "https://formspree.io/f/xxxxxx";
   ```
3. The form will then POST `{ email, source }` as JSON to that endpoint.

Contact address is also configurable in `assets/js/script.js`:
```js
var contactAddress = "info@dhiphos.com";
```

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

In dark mode the accent shifts up to `#F59E0B` (amber-500) against a `#1a1a1a` background so it stays warm and legible.

### Why warm amber?

The `#B45309` hue connotes **hot metal, forge, oxide, hi-vis safety paint** — it reads industrial without resorting to literal blueprint-blue. It also stands well clear of the saturated blue/teal palette that's become default for B2B SaaS, which feels right for a builder-to-builder positioning. The wider visual reference is the warm-accent-on-neutral approach used by Anthropic, Arc, Replit, PostHog, etc.

### Diamond section marker

Every section heading, the email input, and the footer email line are prefixed with a small **filled diamond** (a square rotated 45°) drawn entirely in CSS — no font glyph required. It reads as a node/pivot mark on a schematic, and matches the geometric minimalism of brands like Linear, Vercel, and Notion. Adjust its size via the `--mark-size` variable in `:root`.

### LinkedIn icon

The footer LinkedIn link is rendered as the official `in` glyph in an inline SVG (`currentColor`-driven, so it inherits the muted/accent colors on hover). Drop additional social links by copying the `.social-link` markup and swapping the SVG path.

## Brand naming convention

The registered name and source-of-truth in all markup, metadata, alt text, page titles, and prose is **`Dhiphos`** (mixed case). The all-caps rendering you see in the hero brand-row and the top-nav wordmark is purely typographic — handled by CSS:

```css
.brand,
.topnav-wordmark { text-transform: uppercase; }
```

This means a single edit to `Dhiphos` anywhere updates the whole site, while the wordmark surfaces still display as `DHIPHOS`. Keep prose / SEO / OG metadata in mixed case to avoid SEO oddities and to keep the brand legible to humans in plain text contexts (search results, link previews, terminal logs).

## Typography

Two faces, both **self-hosted** from `assets/fonts/` as variable-font WOFF2
files (one file per font per unicode subset, covering every weight we use):

- **Space Grotesk** — display + body, including the **Dhiphos** brand wordmark. Geometric and slightly humanist; carries the calm half of the brand. Variable axis: `wght 400–700`.
- **JetBrains Mono** — used for entry titles (`mes-mom`, `iiot-edge`, `physical-ai`, …) so they read as identifiers/symbols. Its IDE-native pedigree gives them an authentic engineer-tooling feel. Variable axis: `wght 400–600`.

System-font fallbacks are defined for both, so the site degrades gracefully if the WOFF2 files fail to load. The `@font-face` declarations live at the top of `assets/css/styles.css` and pull from `../fonts/*.woff2`; both subsets (`latin`, `latin-ext`) are shipped with `unicode-range` set verbatim from Google Fonts' published ranges, so the browser only fetches the subset it actually needs for the page's characters.

There are **no third-party font CDN requests** at runtime — the previous `fonts.googleapis.com` / `fonts.gstatic.com` `<link>` tags have been removed from both pages. To refresh the WOFF2 files later (e.g. when the upstream fonts release a new version), see [Refreshing the fonts](#refreshing-the-fonts) below.

### Refreshing the fonts

The four WOFF2 files were sourced directly from Google's CDN with a modern Chrome User-Agent (so the API serves WOFF2 + variable-font URLs rather than legacy TTF). To re-download fresh copies, run from the project root:

```powershell
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
Invoke-WebRequest -UserAgent $ua "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap" -OutFile google-fonts.css
# inspect google-fonts.css for the latin / latin-ext .woff2 URLs, then:
Invoke-WebRequest -UserAgent $ua "<URL>" -OutFile "assets\fonts\<name>.woff2"
```

If the upstream `unicode-range` declarations change (rare), copy the new ranges into the matching `@font-face` blocks at the top of `assets/css/styles.css`.

Both fonts are licensed under the **SIL Open Font License (OFL) 1.1**, which permits redistribution and embedding in websites without attribution requirements in the document.

## Deploying

Plain static site — no build step. Publish directory: this folder.

### Production: GitHub Pages on `dhiphos.com`

The site is hosted on **GitHub Pages**, served from the `main` branch of
[`renukaprasadmlds/dhiphos-site`](https://github.com/renukaprasadmlds/dhiphos-site)
at the custom domain `dhiphos.com`.

Two repo-root files anchor the deployment:

- `CNAME` — contains `dhiphos.com`. GitHub Pages reads this and configures
  the custom-domain TLS certificate and the `dhiphos.com` ↔ `*.github.io`
  routing automatically. **Do not delete or edit this file** unless you're
  changing the production domain.
- `.nojekyll` — an empty marker file. Disables the default Jekyll preprocessing
  GitHub Pages would otherwise run. Our site is plain HTML/CSS/JS with no
  Jekyll templating; `.nojekyll` keeps Pages from trying to interpret any
  filename starting with `_` (none today, but a safety net for future
  filenames like `_redirects`, `_headers`, etc.).

To deploy, just push to `main`:

```sh
git push origin main
```

GitHub Pages picks up the change within ~30–60 seconds and re-publishes.
A green "Active" indicator under repo Settings → Pages confirms the build
status.

### DNS (Hostinger → GitHub Pages)

The `dhiphos.com` domain is registered through **Hostinger**. The
DNS records point at GitHub Pages' four anycast IPs for the apex,
plus a `CNAME` record on `www` for redirect support:

```
A     @         185.199.108.153
A     @         185.199.109.153
A     @         185.199.110.153
A     @         185.199.111.153
CNAME www       renukaprasadmlds.github.io.
```

After DNS propagates (typically 5 minutes to a few hours), GitHub Pages
issues a Let's Encrypt SSL cert automatically. The "Enforce HTTPS"
checkbox on Settings → Pages should then be enabled.

### Alternative hosts (not currently used)

Plain static — drop the folder onto **Netlify**, **Vercel**, **Cloudflare
Pages**, **S3 + CloudFront**, **nginx**, **Zoho Sites**, etc. No build
command. Publish directory: this folder.

## Credits

The four offerings/services illustrations (`assets/img/offerings-{light,dark}.png`,
`assets/img/services-{light,dark}.png`) were generated with **Google Gemini**.
This is acknowledged on the public site via a one-line note in the page footer
("Illustrations generated with Google Gemini.") on both `index.html` and
`privacy.html`. If the illustrations are replaced or re-sourced, update both
that footer line and this section.

## License

Copyright © Dhiphos. All rights reserved.
