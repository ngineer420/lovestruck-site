# Lovestruck.us

A small, static, dependency-free website about date ideas, gift guides, and
relationship advice. Plain HTML + CSS + a tiny vanilla JS file — no build
step, no framework, no npm install, no paid services. Hosted for free on
GitHub Pages with a custom domain.

## Structure

```
index.html                       Homepage
about.html                       About page
privacy-policy.html              Privacy policy
affiliate-disclosure.html        FTC / Amazon Associates disclosure
articles/                        The six long-form guides
assets/style.css                 All site styling
assets/affiliate.js              Loads affiliate-links.json and fills in real links
affiliate-links.json             Central affiliate link data (see below)
CNAME                            Custom domain config for GitHub Pages
robots.txt / sitemap.xml         Basic SEO plumbing
.nojekyll                        Tells GitHub Pages to serve files as-is (no Jekyll build)
DEPLOY.md                        DNS + Amazon Associates setup instructions
```

## How the affiliate links work (read this before applying to Amazon Associates)

Every affiliate link on the site is a placeholder `<a>` tag like this:

```html
<a class="affiliate-link" data-affiliate="date-night-kit">Date Night Box</a>
```

`assets/affiliate.js` runs on every article page, fetches `/affiliate-links.json`,
and fills in the real `href` for every element with a `data-affiliate`
attribute. This means:

- **Right now**, with no Amazon tag configured, every affiliate link simply
  points at a plain Amazon search results page for that product — fully
  functional, just not earning commission. This is intentional: the site
  reads as complete and useful today, with nothing broken or "coming soon."
- **Once you're approved**, links automatically start earning commission
  the moment you edit one JSON file — no HTML editing required anywhere.

### Swapping in your real Amazon Associates tag

1. Sign up for Amazon Associates (see `DEPLOY.md` for when/how) and get your
   tracking ID, which looks like `yourname-20`.
2. Open `affiliate-links.json` in the repo root.
3. Replace the placeholder value of `"amazonTagGlobal"` at the top of the
   file with your real tag, e.g.:
   ```json
   "amazonTagGlobal": "yourname-20",
   ```
   Every link entry uses this tag automatically — no per-entry setting
   needed — so this single change updates every affiliate link on the
   entire site at once.
4. (Optional) If you ever want a specific link to use a *different* tag or
   program (e.g. a non-Amazon affiliate program), add a `"tag"` field to that
   specific entry — it takes priority over the global tag for that one link.
5. (Optional) If Amazon requires or you prefer real product URLs instead of
   search-result URLs, replace the `"url"` field for any entry with the
   direct Amazon product page URL. The affiliate `tag=` parameter is
   appended automatically either way.
6. Commit and push. GitHub Pages redeploys automatically — no build step,
   no waiting on anything else.

### Adding a new affiliate link to an article

1. Add a new entry to the `"links"` object in `affiliate-links.json` with a
   unique key, a `"label"`, and a `"url"`. It picks up `amazonTagGlobal`
   automatically — no extra field required.
2. In the article HTML, add:
   ```html
   <a class="affiliate-link" data-affiliate="your-new-key">Link text</a>
   ```
3. Make sure the article's `<head>` includes
   `<script src="/assets/affiliate.js" defer></script>` (all article pages
   already do).

## Local preview

No build step needed — just open `index.html` in a browser, or run a tiny
local server so `fetch()` for `affiliate-links.json` works correctly (some
browsers block `fetch` on `file://` URLs):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Adding new articles

Copy an existing file in `articles/` as a starting template (it already has
the header, footer, disclosure note, and affiliate script tag wired up), add
a link to it from `index.html`'s article grid, and add a `<url>` entry to
`sitemap.xml`.

## Deployment

See `DEPLOY.md` for DNS setup and the Amazon Associates application process.
