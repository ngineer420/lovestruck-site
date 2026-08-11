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
assets/affiliate.js              Appends the Associates tag to links already in the HTML
affiliate-links.json             Central affiliate link data (see below)
scripts/apply_affiliate_links.py Pushes affiliate-links.json URLs into the article HTML
CNAME                            Custom domain config for GitHub Pages
robots.txt / sitemap.xml         Basic SEO plumbing
.nojekyll                        Tells GitHub Pages to serve files as-is (no Jekyll build)
DEPLOY.md                        DNS + Amazon Associates setup instructions
```

## How the affiliate links work (read this before applying to Amazon Associates)

Every affiliate link on the site is a real, complete `<a>` tag like this:

```html
<a href="https://www.amazon.com/s?k=DateBox+Club+date+night+subscription+box"
   class="affiliate-link" data-affiliate="date-night-kit"
   target="_blank" rel="noopener sponsored nofollow">Date Night Box</a>
```

**The `href` must be in the HTML.** That is what makes the link work. It is
not optional and it is not filled in later.

`assets/affiliate.js` runs on every article page, fetches
`/affiliate-links.json`, and appends the Associates `tag=` parameter to the
href that is already there. It only ever adds the tag; it never decides
where a link points. This means:

- **With JavaScript off, slow, or blocked**, every affiliate link still
  works and still goes to the right product. Only the commission is lost.
- **Once your tag is set**, links start earning the moment you edit one JSON
  file — no HTML editing required for the tag.

This used to work the other way around, and it was a bug: `affiliate.js`
wrote the href itself, so the anchors shipped with no href at all. Fifty-two
of them rendered as text styled exactly like links that did nothing when
tapped. Never write an affiliate anchor without an href.

### Changing where a link points

`affiliate-links.json` is still the single place you edit a destination, but
because the href now lives in the HTML, editing the JSON alone has no effect
on the pages. Push the change through:

```bash
python3 scripts/apply_affiliate_links.py
```

That rewrites every affiliate anchor's href across every article from the
JSON, so the two cannot drift apart. It exits non-zero if an article uses a
key the JSON does not define, or if any anchor is missing its href.

### Swapping in your real Amazon Associates tag

1. Sign up for Amazon Associates (see `DEPLOY.md` for when/how) and get your
   tracking ID, which looks like `yourname-20`.
2. Open `affiliate-links.json` in the repo root.
3. Replace the placeholder value of `"amazonTagGlobal"` at the top of the
   file with your real tag, e.g.:
   ```json
   "amazonTagGlobal": "yourname-20",
   ```
   Every link entry has `"useGlobalTag": true`, so this single change updates
   every affiliate link on the entire site at once.
4. (Optional) If you ever want a specific link to use a *different* tag or
   program (e.g. a non-Amazon affiliate program), add a `"tag"` field to that
   specific entry — it takes priority over the global tag for that one link.
5. (Optional) If Amazon requires or you prefer real product URLs instead of
   search-result URLs, replace the `"url"` field for any entry with the
   direct Amazon product page URL, then run
   `python3 scripts/apply_affiliate_links.py` to push it into the articles.
   The affiliate `tag=` parameter is appended automatically either way.
6. Commit and push. GitHub Pages redeploys automatically — no build step,
   no waiting on anything else.

### Adding a new affiliate link to an article

1. Add a new entry to the `"links"` object in `affiliate-links.json` with a
   unique key, a `"label"`, a `"url"`, and `"useGlobalTag": true`.
2. In the article HTML, add the anchor **with its href**:
   ```html
   <a href="https://www.amazon.com/s?k=your+product"
      class="affiliate-link" data-affiliate="your-new-key"
      target="_blank" rel="noopener sponsored nofollow">Link text</a>
   ```
   If you would rather not copy the URL by hand, write the anchor without an
   href and run `python3 scripts/apply_affiliate_links.py` — it will fill it
   in from the JSON and tell you it repaired a dead link. Just never commit
   the href-less version.
3. Make sure the article's `<head>` includes
   `<script src="/assets/affiliate.js" defer></script>` (all article pages
   already do). This is only needed for the commission tag — the link itself
   works without it.

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
