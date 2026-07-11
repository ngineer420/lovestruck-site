/*
 * Lovestruck.us — affiliate link loader.
 *
 * Articles mark placeholder links like:
 *   <a class="affiliate-link" data-affiliate="date-night-kit">Date Night Box</a>
 *
 * This script fetches /affiliate-links.json and fills in the real href,
 * appending the Amazon Associates tag once the user has set one.
 * Until a real tag is added, links point at a plain (non-affiliate) Amazon
 * search URL so the site stays 100% functional before Associates approval.
 *
 * No third-party requests, no cookies, no analytics.
 */
(function () {
  function applyLinks(data) {
    var globalTag = data.amazonTagGlobal;
    var links = data.links || {};
    var placeholders = document.querySelectorAll("[data-affiliate]");

    placeholders.forEach(function (el) {
      var key = el.getAttribute("data-affiliate");
      var entry = links[key];
      if (!entry) {
        console.warn("[lovestruck] No affiliate-links.json entry for key:", key);
        return;
      }

      var url = entry.url;
      var tag = entry.tag || (entry.useGlobalTag ? globalTag : null);
      var hasRealTag = tag && tag.indexOf("REPLACE_WITH_YOUR_TAG") === -1;

      if (hasRealTag) {
        var sep = url.indexOf("?") === -1 ? "?" : "&";
        url = url + sep + "tag=" + encodeURIComponent(tag);
      }

      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener sponsored nofollow");
      if (el.textContent.trim() === "") {
        el.textContent = entry.label || key;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector("[data-affiliate]")) return;
    fetch("/affiliate-links.json")
      .then(function (res) { return res.json(); })
      .then(applyLinks)
      .catch(function (err) {
        console.warn("[lovestruck] Could not load affiliate-links.json", err);
      });
  });
})();
