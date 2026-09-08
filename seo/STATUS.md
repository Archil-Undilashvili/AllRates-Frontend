# Local SEO status — 2026-09-08

## Restored and verified

The current checkout had reverted the generated currency pages, article pages,
pair-page CSS/JS and shared navigation controllers. Restored the missing assets
from commit dcd5dae without reverting the newer article added in 904e660.
Restored clean URL and legacy redirect rules from d8229b9.

- 35 canonical sitemap URLs: 10 currency detail pages and 12 article pages.
- Static navigation and numeric currency snapshots in the initial HTML.
- Official detail pages use the approved shared design; market chart selection
  remains limited to USD/GEL and EUR/GEL.
- Legacy keyword URLs redirect to consolidated destinations.
- Generated .html aliases redirect to the canonical extensionless URLs.
- Admin and dashboard HTML include noindex.
- Audit checks missing local CSS/JS, metadata, H1, canonical, JSON-LD, and snapshots.
- Local HTTP checks cover sitemap routes, redirects, 404 and malformed requests.

## Data freshness and release

`npm run build:release` fetches current data, generates HTML and runs the audit.
It fails if the live API fetch fails. `npm run build:offline` intentionally retains
the saved snapshot. A normal build can also fall back to the saved snapshot with
a warning. Initial HTML contains the last build's values; browser JavaScript then
refreshes them. This is prerendering, not request-time SSR.

Production needs a regularly refreshed build or server rendering to keep the
initial HTML current between releases. A local build alone does not update the
public site. No deployment or external schedule was created in this task.

## Still requiring production evidence

- Verify the hosting platform honors the prepared redirect rules.
- Check Search Console indexing, Google-selected canonical, manual actions,
  sitemap processing and query/page performance after deployment.
- Measure actual mobile Core Web Vitals and rendered pages on production.
- Ranking position and competitor authority cannot be diagnosed from this audit
  alone; there is no guarantee of page-one rankings.

Google documents JavaScript rendering support and recommends prerendering/server
rendering for accessibility and performance. Missing raw-HTML content is a
technical risk, not evidence of an automatic ranking penalty:
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
Canonical guidance:
https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
