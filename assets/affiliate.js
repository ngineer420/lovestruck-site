/*
 * Lovestruck.us — affiliate tag appender.
 *
 * Every affiliate mention in an article is a plain, working link in the
 * HTML itself:
 *
 *   <a href="https://www.amazon.com/s?k=Codenames+Duet+board+game"
 *      class="affiliate-link" data-affiliate="board-game-bundle"
 *      target="_blank" rel="noopener sponsored nofollow">Codenames Duet</a>
 *
 * This script only ever ADDS the Associates tracking tag on top of the href
 * that is already there. It never decides where a link points.
 *
 * That distinction is the whole point. This file used to write the href
 * itself, which made JavaScript load-bearing for a plain link: 52 anchors
 * shipped with no href at all, so a reader with JS blocked, JS still
 * loading, or a flaky connection saw text styled exactly like a link that
 * did nothing when tapped. Now the worst case is an untagged link that
 * still takes the reader to the right product.
 *
 * Because the href now lives in the HTML, affiliate-links.json is no longer
 * read for destinations at page load — only for the tag. To change where a
 * link points, edit the "url" in affiliate-links.json and then run
 *   python3 scripts/apply_affiliate_links.py
 * to push it into every article. Do not hand-edit hrefs.
 *
 * No third-party requests, no cookies, no analytics.
 */
(function () {
  function withTag(url, tag) {
    try {
      var u = new URL(url, window.location.origin);
      u.searchParams.set("tag", tag);
      return u.toString();
    } catch (e) {
      // Fallback for anything URL() refuses to parse.
      var sep = url.indexOf("?") === -1 ? "?" : "&";
      return url + sep + "tag=" + encodeURIComponent(tag);
    }
  }

  function applyTags(data) {
    var globalTag = data.amazonTagGlobal;
    var links = data.links || {};

    document.querySelectorAll("[data-affiliate]").forEach(function (el) {
      var key = el.getAttribute("data-affiliate");
      var href = el.getAttribute("href");

      if (!href) {
        // Should be impossible: the href belongs in the HTML. If this ever
        // fires, an article was written without one and that link is dead
        // for every reader with JS off. Run scripts/apply_affiliate_links.py.
        console.warn("[lovestruck] affiliate anchor has no href in the HTML:", key);
        return;
      }

      var entry = links[key];
      if (!entry) {
        console.warn("[lovestruck] No affiliate-links.json entry for key:", key);
        return;
      }

      var tag = entry.tag || (entry.useGlobalTag ? globalTag : null);
      if (!tag || tag.indexOf("REPLACE_WITH_YOUR_TAG") !== -1) return;

      el.setAttribute("href", withTag(href, tag));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector("[data-affiliate]")) return;
    fetch("/affiliate-links.json")
      .then(function (res) { return res.json(); })
      .then(applyTags)
      .catch(function (err) {
        /* If this fails, links keep the plain hrefs already in the HTML.
           The reader still reaches the product; only the tag is lost. */
        console.warn("[lovestruck] Could not load affiliate-links.json", err);
      });
  });
})();
