#!/usr/bin/env python3
"""Push the destinations in affiliate-links.json into the article HTML.

Every affiliate mention in an article is a real, working link in the HTML:

    <a href="https://www.amazon.com/s?k=Codenames+Duet+board+game"
       class="affiliate-link" data-affiliate="board-game-bundle"
       target="_blank" rel="noopener sponsored nofollow">Codenames Duet</a>

That href is what makes the link work when JavaScript does not. It used to
be absent entirely -- 52 anchors shipped with no href at all, styled to look
clickable and doing nothing -- because assets/affiliate.js was expected to
fill them in at runtime. It no longer is; that script only appends the
Associates tag on top of the href already there.

The trade is that affiliate-links.json is no longer read for destinations at
page load, so editing a "url" there has no effect on its own. This script is
what makes the edit take: it rewrites every affiliate anchor's href across
every article from the JSON, so the two cannot drift apart.

Run it after changing any "url" in affiliate-links.json:

    python3 scripts/apply_affiliate_links.py

It reports how many hrefs it wrote and how many were already correct, and
exits non-zero if an article references a key the JSON does not define, or
if an affiliate anchor is missing its href entirely -- the exact defect this
file exists to keep from coming back.
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "affiliate-links.json"

# Every glob that may contain an affiliate anchor. This used to be the
# articles directory alone, which quietly stopped being the whole story the
# moment /quiz/ shipped affiliate links of its own: an anchor outside the
# glob is invisible to this script, so editing its "url" in the JSON has no
# effect and the two drift apart with nothing reporting it. Add a glob here
# whenever a new directory starts carrying data-affiliate anchors.
SOURCE_GLOBS = ("articles/*.html", "quiz/*/index.html")

# Matches an affiliate anchor's opening tag whether or not it has an href,
# so a regressed href-less anchor is repaired rather than skipped.
ANCHOR_RE = re.compile(
    r'<a\b(?P<attrs>[^>]*\bdata-affiliate="(?P<key>[a-zA-Z0-9\-_]+)"[^>]*)>'
)
HREF_RE = re.compile(r'\s*href="[^"]*"')


def main():
    if not DATA_FILE.exists():
        print(f"ERROR: could not find {DATA_FILE}", file=sys.stderr)
        return 1

    links = json.loads(DATA_FILE.read_text()).get("links", {})

    written = 0
    already = 0
    repaired = 0
    missing_keys = set()

    paths = sorted({p for glob in SOURCE_GLOBS for p in ROOT.glob(glob)})
    for path in paths:
        text = path.read_text()

        def rewrite(match):
            nonlocal written, already, repaired
            key = match.group("key")
            entry = links.get(key)
            if not entry:
                missing_keys.add(key)
                return match.group(0)

            had_href = 'href="' in match.group("attrs")
            if not had_href:
                repaired += 1

            # Rebuild the tag with the href first, matching losttouch-site.
            attrs = HREF_RE.sub("", match.group("attrs")).strip()
            rebuilt = f'<a href="{entry["url"]}" {attrs}>'

            if rebuilt == match.group(0):
                already += 1
            else:
                written += 1
            return rebuilt

        new_text = ANCHOR_RE.sub(rewrite, text)
        if new_text != text:
            path.write_text(new_text)
            print(f"Updated {path.relative_to(ROOT)}")

    print(f"\n{written} href(s) rewritten, {already} already correct.")
    if repaired:
        print(f"{repaired} anchor(s) had NO href and were dead without JavaScript.")

    if missing_keys:
        print(
            "\nERROR: these data-affiliate keys appear in articles but have no "
            "entry in affiliate-links.json: " + ", ".join(sorted(missing_keys)),
            file=sys.stderr,
        )
        return 1

    return 1 if repaired else 0


if __name__ == "__main__":
    sys.exit(main())
