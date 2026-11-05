# College Town Atlas — synthetic static demo

**Synthetic demonstration — no real housing-sale data.** All place names, prices, dates and schematic positions are invented. This separate project demonstrates software interactions, not findings about any real housing market.

## Separation and provenance

This project is independent of the local private-data Python application. It has no Python API, server dependency, imported source records, confidential aggregate values, original data lookup or private-repository checkout. It must have its own future repository/history. Do not copy a private repository's `.git` directory, dataset, reports, test expectations or deployment credentials into this project.

Only the data-independent visual CSS was reused to preserve the serif headings, paper/green palette, filter bar, summary cards, grid-map style, tables and trends. Demo markup, logic and data were created separately. The banner, hero, footer, map caption and explanatory section identify the sample as fictional.

`site/synthetic-data.js` invents three universities, six cities, three property categories and 1,944 observations across 2022–2024. For zero-based city/year/type/sample indices and month 1–12:

```text
price = 145000 + cityIndex*19000 + yearIndex*8000
        + month*350 + typeIndex*16000 + sampleIndex*2400
```

Each city/month/type has three examples on invented sample dates. These arbitrary constants were not calibrated against a housing dataset. Schematic x/y positions are display units, not latitude/longitude or property locations. Observation objects contain only fictional university/city keys, type, date and price; no address, parcel, personal identifier or property coordinate exists.

The full synthetic sample is intentionally visible in browser memory; none of it is confidential. Its sample medians are not suppressed because the observations are fabricated. It should never be substituted for a privacy policy on real data.

## Local checks and build

Requires Node.js 24; no npm install, lockfile, external runtime library or build-time dataset is needed. Run from this demo directory:

```sh
node --check site/app.js
node --check site/synthetic-data.js
node tests/test.cjs
node scripts/build.cjs
node scripts/audit.cjs dist
node tests/http.cjs
```

The last command starts and stops a temporary loopback-only HTTP test server. It may require local network permission. All tests work in a standalone copy containing only the project files listed below, with no private inputs or Python installation.

To preview the audited build locally, one optional static server is:

```sh
python3 -m http.server 8010 --bind 127.0.0.1 --directory dist
```

Open **http://127.0.0.1:8010**, then stop with Ctrl+C. Python is a preview convenience only, not a hosting requirement. Serve `dist` explicitly, never a parent project directory. Opening an HTML file directly is not the supported preview method because browser file-origin security can differ.

## Representative features

- Select a fictional university by dropdown, table or named map marker.
- Select a city by dropdown, table or marker; Show all cities returns to its university.
- Inclusive date-range and property-type filters apply to cards, city summaries, university comparisons and quarterly trends.
- The schematic grid supports zoom, pan and Fit view. Markers aggregate groups, never individual properties.
- Empty/invalid date selections display guidance; sparse selections are labeled. Reset restores all sample observations.
- Relative asset URLs work under a GitHub Pages project path. All filtering is browser-local, with no network data calls. System fonts and SVG avoid external assets.

## Exact repository files (12)

```text
.gitignore
.github/workflows/deploy.yml
README.md
VERIFICATION.md
scripts/audit.cjs
scripts/build.cjs
tests/http.cjs
tests/test.cjs
site/index.html
site/style.css
site/app.js
site/synthetic-data.js
```

Do not include `dist/` in a source commit: CI rebuilds it. This source directory is kept separate from the parent private project. Its Git root must be **this demo directory only**; do not copy parent history/remotes or stage the demo into its parent repository.

## Exact published artifact (4)

```text
dist/index.html
dist/style.css
dist/app.js
dist/synthetic-data.js
```

Only those files are copied/uploaded. `scripts/audit.cjs` rejects unknown/hidden files, directories, links, excessive file sizes, credential/private-source signatures, external data access, nonrelative assets, unexpected sample fields and deviations from the documented invented formula/catalog. The build fails closed if an existing dist contains unexpected material; it does not silently remove files. Audit output includes file hashes. These checks reduce accidental leakage but do not replace reviewing future edits; no generic scanner can prove the absence of every possible confidential value.

## GitHub Pages and automatic redeployment — approved

Approved public code repository: **https://github.com/jiisuuann/ra-level-a-static-demo**, containing only the 12 reviewed demo files. Synthetic-only website publishing is approved. The private application and data are not deployment inputs. GitHub Pages supports this static design without the private Python server.

The prepared workflow follows GitHub's [custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages):

1. A push to `main`, a pull request to `main`, or a manual workflow run starts checks.
2. Build job checks out only this demo repository, uses Node 24, runs syntax/functionality tests, builds the four-file artifact, tests HTTP/subpath serving and audits the final artifact.
3. Upload and deployment both require `main` and a non-pull-request event. Deployment depends on the tested build and publishes only its audited `dist` artifact. Pull requests run checks only. Safeguard tests assert both exact publishing conditions, the artifact path and the build dependency.
4. Once Pages is configured with GitHub Actions as its source, pushes to `main` automatically run all checks and publish passing synthetic-only updates at the same site URL. No automatic back-sync to any private application exists.

No custom access token, original-data secret, external data connection or private repository access is needed. Built-in GitHub credentials are used only by the standard Actions, and checkout does not persist credentials. Action versions are major-version references and should be reviewed before future publication; the initial verification-only workflow passed remotely; the enabled publishing run must be checked after pushing this activation change.

Required hosting configuration: Pages → Source: GitHub Actions, with Pages/OIDC workflow permissions allowed. Main/non-PR restrictions are enforced in both publishing gates; a main-only environment policy can additionally be configured in GitHub. The expected site URL is `https://jiisuuann.github.io/ra-level-a-static-demo/`. Check the latest Actions run for actual publishing status. A public demo should be treated as permanently downloadable, including its fully synthetic examples. GitHub Actions/Pages operations require internet; the deployed site has no runtime external services.

See **VERIFICATION.md** for local results and checks still requiring a browser or GitHub. Publishing approval applies only to this independently generated synthetic demo. Real-browser checks remain separate from local automated and remote workflow checks.
