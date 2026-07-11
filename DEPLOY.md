# Deploying Lovestruck.us

This repo is already pushed to GitHub with Pages enabled, serving from the
`main` branch, root directory. The remaining steps are DNS (at your domain
registrar) and, once the site has real content live, applying to Amazon
Associates.

## 1. Point lovestruck.us at GitHub Pages

Log in to whichever registrar/DNS provider manages `lovestruck.us` (e.g.
Namecheap, GoDaddy, Google Domains, Cloudflare) and edit its DNS records.

### Apex domain (`lovestruck.us`) — required

Add four **A** records, all at the root (`@` / blank host), pointing to
GitHub Pages' load balancer IPs:

| Type | Host | Value            |
|------|------|------------------|
| A    | @    | 185.199.108.153  |
| A    | @    | 185.199.109.153  |
| A    | @    | 185.199.110.153  |
| A    | @    | 185.199.111.153  |

Optional but recommended — IPv6 **AAAA** records for the same root:

| Type | Host | Value                                  |
|------|------|-----------------------------------------|
| AAAA | @    | 2606:50c0:8000::153                     |
| AAAA | @    | 2606:50c0:8001::153                     |
| AAAA | @    | 2606:50c0:8002::153                     |
| AAAA | @    | 2606:50c0:8003::153                     |

### `www` subdomain — optional, recommended

Add a **CNAME** record so `www.lovestruck.us` also resolves:

| Type  | Host | Value                    |
|-------|------|--------------------------|
| CNAME | www  | ngineer420.github.io     |

The repo's `CNAME` file is already set to `lovestruck.us` (the apex), so
GitHub Pages will treat the apex as canonical and can redirect `www` to it.

### Notes

- DNS changes can take anywhere from a few minutes to 24-48 hours to
  propagate fully, depending on your registrar and previous TTL settings.
- Do not delete the repo's `CNAME` file — GitHub Pages uses it to know which
  custom domain to serve and to auto-provision an HTTPS certificate for it.
- Once DNS resolves correctly, go to the repo's Settings → Pages in GitHub
  and check "Enforce HTTPS" if it isn't already checked (it may take a bit
  after DNS propagates for the HTTPS certificate option to become available).

## 2. Verify the site is live

Visit `https://lovestruck.us` after DNS propagates and confirm the homepage
and a couple of articles load correctly, including over HTTPS.

## 3. Apply for Amazon Associates

Amazon requires a site to have real, original content and be publicly live
before approving an Associates application — this repo's content (6 full
articles, About, Privacy Policy, Affiliate Disclosure) is meant to satisfy
that bar. Once the domain is live:

1. Go to https://affiliate-program.amazon.com/ and sign up using your own
   name, address, tax, and bank details (Claude/this agent never touches
   this step — it requires your personal information).
2. When asked for your website, provide `https://lovestruck.us`.
3. Amazon will ask you to add a small number of affiliate links to your site
   within 180 days to keep the account active — the placeholders are already
   wired up, so this just means updating one JSON file (see below).
4. Once approved, Amazon gives you a tracking ID (e.g. `yourname-20`).

## 4. Activate your real affiliate links

Open `affiliate-links.json` in the repo root and replace:

```json
"amazonTagGlobal": "REPLACE_WITH_YOUR_TAG-20",
```

with your real tracking ID, e.g.:

```json
"amazonTagGlobal": "yourname-20",
```

Commit and push. Every affiliate link across every article updates
immediately — no other file needs to change. Full details on how the link
system works are in `README.md`.

## 5. Ongoing compliance reminders

- Amazon Associates requires you to generate a **minimum of 3 qualifying
  sales within 180 days** of signing up, or the account can be closed —
  keep an eye on this early on.
- Every page with affiliate links must keep a visible disclosure (already
  included at the top of each article) — don't remove those notes.
- If you join additional affiliate programs later, add them to
  `affiliate-links.json` following the same pattern, and make sure the
  Affiliate Disclosure page (`affiliate-disclosure.html`) still accurately
  describes every program you're part of.
