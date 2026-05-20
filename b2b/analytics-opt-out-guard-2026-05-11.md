# B2B GA4 internal preview opt-out guard (2026-05-11)

Purpose: keep owner / AI-agent / local verification traffic out of GA4 as much as possible after deployment.

Implemented in all `b2b/**/*.html` GA4 bootstrap snippets.

## Suppression rules

GA4 is not loaded when any of the following is true:

- Host is not `ezlize.com` or `www.ezlize.com`
- URL contains one of: `?ga_off`, `?analytics_off`, `?internal_preview`, `?preview`, `?no_ga`, `?ga_status`
- `localStorage.ezlize_ga_opt_out` is `1`
- Browser automation is detected via `navigator.webdriver` or automation/headless user agent keywords
- Referrer is local preview: `localhost`, `127.0.0.1`, `0.0.0.0`, or `file://`

When suppression runs, `window.ezlizeAnalyticsSuppressed = true` is set for verification.

## Owner / agent operation

- Before checking production manually, open `https://ezlize.com/?ga_off=1` once in that browser profile.
- After that, normal `https://ezlize.com/` visits from the same browser profile will not load GA4.
- To re-enable GA4 in that browser profile, open `https://ezlize.com/?ga_on=1`.

## Status diagnostics

- Open a B2B page with `?ga_status=1` to show a fixed in-page diagnostic panel.
- `?ga_status=1` also behaves as a current-visit opt-out trigger, so the diagnostic check itself should not create a normal GA4 hit even before considering the persisted browser opt-out.
- Expected OK marker on a suppressed B2B page:
  - `GA_OPT_OUT_STATUS=OK`
  - `B2B_OPT_OUT=true` or `B2B_URL_OPT_OUT=true`
  - `B2B_SUPPRESSED=true`
  - `B2B_GTAG_FUNCTION=false`
  - `B2B_GTAG_SCRIPT_PRESENT=false`

## Notes

- This prevents future GA4 hits. It does not remove historical GA4 rows.
- LinkedIn or other external traffic without UTM may still appear as `(direct)`, so campaign links should use UTM parameters.
- CI / Playwright checks should remain suppressed automatically.
