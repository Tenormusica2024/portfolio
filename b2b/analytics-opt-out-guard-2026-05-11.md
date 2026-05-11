# B2B GA4 internal preview opt-out guard (2026-05-11)

Purpose: keep owner / AI-agent / local verification traffic out of GA4 as much as possible after deployment.

Implemented in all `b2b/**/*.html` GA4 bootstrap snippets.

## Suppression rules

GA4 is not loaded when any of the following is true:

- Host is not `ezlize.com` or `www.ezlize.com`
- URL contains one of: `?ga_off`, `?analytics_off`, `?internal_preview`, `?preview`, `?no_ga`
- `localStorage.ezlize_ga_opt_out` is `1`
- Browser automation is detected via `navigator.webdriver` or automation/headless user agent keywords
- Referrer is local preview: `localhost`, `127.0.0.1`, `0.0.0.0`, or `file://`

When suppression runs, `window.ezlizeAnalyticsSuppressed = true` is set for verification.

## Owner / agent operation

- Before checking production manually, open `https://ezlize.com/?ga_off=1` once in that browser profile.
- After that, normal `https://ezlize.com/` visits from the same browser profile will not load GA4.
- To re-enable GA4 in that browser profile, open `https://ezlize.com/?ga_on=1`.

## Notes

- This prevents future GA4 hits. It does not remove historical GA4 rows.
- LinkedIn or other external traffic without UTM may still appear as `(direct)`, so campaign links should use UTM parameters.
- CI / Playwright checks should remain suppressed automatically.
