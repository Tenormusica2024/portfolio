# C2C GA4 self-access opt-out guard (2026-05-20)

Purpose: keep owner / AI-agent / local verification traffic out of GA4 as much as possible after deployment.

Implemented in top-level C2C portfolio HTML pages that load `G-YJ1WP1J2NQ`:

- `index.html`
- `projects.html`
- `presentations.html`
- `creation.html`
- `contact.html`
- `profile.html`
- `archive.html`
- `code-reviewer-system.html`
- `privacy.html`

## Suppression rules

GA4 is disabled when any of the following is true:

- Host is not `tenormusica2024.github.io`
- URL contains one of: `?ga_off`, `?analytics_off`, `?internal_preview`, `?preview`, `?no_ga`, `?ga_status`
- `localStorage.urayaha_ga_opt_out` is `1`
- Browser automation is detected via `navigator.webdriver` or automation/headless user agent keywords
- Referrer is local preview: `localhost`, `127.0.0.1`, `0.0.0.0`, or `file://`

When suppression runs, the page sets:

- `window['ga-disable-G-YJ1WP1J2NQ'] = true`
- `window.urayahaAnalyticsSuppressed = true`

## Owner / agent operation

- Before checking production manually, open a C2C page with `?ga_off=1` once in that browser profile.
- Example pattern: `/portfolio/projects.html?ga_off=1`
- After that, normal C2C portfolio visits from the same browser profile should not send GA4 hits.
- To re-enable GA4 in that browser profile, open a C2C page with `?ga_on=1`.

## Status diagnostics

- Open a C2C portfolio page with `?ga_status=1` to show a fixed in-page diagnostic panel.
- `?ga_status=1` also behaves as a current-visit opt-out trigger, so the diagnostic check itself should not create a normal GA4 hit even before considering the persisted browser opt-out.
- Expected OK marker on a suppressed C2C page:
  - `GA_OPT_OUT_STATUS=OK`
  - `C2C_OPT_OUT=true` or `C2C_URL_OPT_OUT=true`
  - `C2C_SUPPRESSED=true`
  - `C2C_GA_DISABLE=true`

## Notes

- This prevents future GA4 hits. It does not remove historical GA4 rows.
- Historical self-access must be handled by post-processing / adjusted reports because GA4 aggregate data does not expose IP or user identity.
- B2B has a separate guard documented in `b2b/analytics-opt-out-guard-2026-05-11.md`.
