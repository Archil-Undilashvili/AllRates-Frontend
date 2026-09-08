# Local HTML rendering and optimized assets

Run `npm ci`, then `npm run build` and `npm run serve`. Open
http://localhost:8080/ in Chrome.

## Fresh initial HTML

The Node server refreshes shared public spot-data snapshots while it is running:

- Company rates: 60 seconds (the upstream scraper controls actual publication times).
- Official NBG rates: 15 minutes.
- Forex feed: 5 minutes.
- Crypto spot prices: 60 seconds; market-cap metadata: 1 hour.

No crypto **history** request is made by this process. Chart history remains
on-demand. Requests from multiple visitors reuse the same snapshots. Browser
hydration consumes embedded initial company/official/Forex data; subsequent
spot updates use the shared local endpoint where configured.

Validated successful payloads are saved in `seo/page-snapshot.json`. Failed or
incomplete responses cannot erase the last successful payload or reset its
timestamp. Failed sources back off for a minute. HTML responses are cached by
template mtime and snapshot version, with `Cache-Control: no-cache`; source
publication dates remain intact. The initial response contains all company rows
and all NBG currencies. The normal top-10 presentation and expansion control
remain; without JavaScript the additional rows are visible.

Snapshot rendering reuses the established frontend render functions in a
network-free DOM. The selected local function declarations are parsed with
Acorn and executed with bounded VM time; remote responses are data, not code.

`npm run build:offline` reuses saved data; it does **not** claim data is fresh.
`npm run build:release` rejects missing or old core snapshots. The static build
also contains complete fallback HTML, but a static-only host does not run the
refresh loop. Production needs this server-side rendering/cache lifecycle (or
an equivalent scheduled rebuild) before claiming automatically fresh HTML.

Production on Netlify uses `netlify/functions/rate-page.js` for the homepage,
comparison page, official table and five official pair pages. On cache misses it
refreshes shared source data and renders the same templates. Durable CDN caching
limits page revalidation to once per minute; no chart history is fetched by HTML
rendering. Failures preserve the saved snapshot and its original publication dates.
The function never writes to the read-only deployment filesystem. `netlify.toml`
builds and tests the site, then publishes only the allowlisted `dist` assets;
backend files, source tools and saved upstream JSON are not public downloads.

## Assets and presentation

`npm run build` creates content-hashed/minified JS and CSS, a pinned local copy
of Chart.js, and responsive WebP versions of article images. Original images
are retained. `seo/assets-manifest.json` maps source files to generated assets.
Image dimensions preserve aspect ratios; the existing CSS controls display.
The local server gzips text and marks hashed assets immutable.

Headings preserve their visual styles. Analytics uses its existing chart title
as H1, without adding a panel or description. Homepage H1 gets a short
screen-reader-only context. Homepage currency/Forex cards are native links.

Run `npm test` for URL/metadata/static-content checks and cache, snapshot,
heading, link, image and script-order regression tests.
