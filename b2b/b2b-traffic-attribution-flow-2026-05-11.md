# B2B traffic attribution flow (2026-05-11)

Purpose: make B2B portfolio inflow measurable without relying on `(direct)` or ambiguous referrers.

## Current baseline

- Internal / owner / AI-agent production checks are suppressed by `b2b/analytics-opt-out-guard-2026-05-11.md`.
- Future promotion links should use UTM parameters.
- `get_ga4_data.py` now collects B2B traffic attribution with:
  - `sessionSource`
  - `sessionMedium`
  - `sessionCampaignName`
  - `sessionManualAdContent`
  - `pageReferrer`

## UTM naming rules

Use lowercase ASCII only. Do not use Japanese in UTM values.

Required:

- `utm_source`: where the click came from
- `utm_medium`: channel type
- `utm_campaign`: purpose / period

Optional:

- `utm_content`: placement or copy variant

Recommended campaign name for the current B2B push:

- `b2b_portfolio_202605`

## Standard B2B URLs

### LinkedIn profile

```text
https://ezlize.com/?utm_source=linkedin&utm_medium=profile&utm_campaign=b2b_portfolio_202605&utm_content=profile_link
```

### LinkedIn post

```text
https://ezlize.com/?utm_source=linkedin&utm_medium=social&utm_campaign=b2b_portfolio_202605&utm_content=post_main
```

### X / Twitter post

```text
https://ezlize.com/?utm_source=x&utm_medium=social&utm_campaign=b2b_portfolio_202605&utm_content=post_main
```

### Zenn profile or article

```text
https://ezlize.com/?utm_source=zenn&utm_medium=profile&utm_campaign=b2b_portfolio_202605&utm_content=profile_link
```

```text
https://ezlize.com/?utm_source=zenn&utm_medium=article&utm_campaign=b2b_portfolio_202605&utm_content=article_footer
```

### GitHub profile / README

```text
https://ezlize.com/?utm_source=github&utm_medium=profile&utm_campaign=b2b_portfolio_202605&utm_content=profile_link
```

### Email signature

```text
https://ezlize.com/?utm_source=email&utm_medium=signature&utm_campaign=b2b_portfolio_202605&utm_content=default_signature
```

### Coconala profile / service page

```text
https://ezlize.com/?utm_source=coconala&utm_medium=listing&utm_campaign=b2b_portfolio_202605&utm_content=profile_link
```

### Meetsmore profile

```text
https://ezlize.com/?utm_source=meetsmore&utm_medium=listing&utm_campaign=b2b_portfolio_202605&utm_content=profile_link
```

### Google Business Profile website field

```text
https://ezlize.com/?utm_source=google_business_profile&utm_medium=local_profile&utm_campaign=b2b_portfolio_202605&utm_content=website_button
```

### Bing Places website field

```text
https://ezlize.com/?utm_source=bing_places&utm_medium=local_profile&utm_campaign=b2b_portfolio_202605&utm_content=website_button
```

## Topic-specific links

Use these when the placement can target a specific service.

### Website production

```text
https://ezlize.com/website-production.html?utm_source=linkedin&utm_medium=social&utm_campaign=b2b_portfolio_202605&utm_content=website_production_post
```

### Sales operations pipeline

```text
https://ezlize.com/sales-operations-pipeline.html?utm_source=linkedin&utm_medium=social&utm_campaign=b2b_portfolio_202605&utm_content=sales_ops_post
```

### Inquiry workflow support

```text
https://ezlize.com/inquiry-workflow-support.html?utm_source=linkedin&utm_medium=social&utm_campaign=b2b_portfolio_202605&utm_content=inquiry_support_post
```

## Contact-form links

If linking directly to the contact section, put query parameters before the hash.

```text
https://ezlize.com/?topic=website-production&utm_source=linkedin&utm_medium=social&utm_campaign=b2b_portfolio_202605&utm_content=contact_cta#contact
```

```text
https://ezlize.com/?topic=workflow-automation&utm_source=email&utm_medium=signature&utm_campaign=b2b_portfolio_202605&utm_content=contact_cta#contact
```

## Platform rules

- If a platform accepts full URLs with query parameters, use the UTM URL.
- If a platform strips query parameters, use the plain URL and rely on `pageReferrer`.
- If the platform warns against tracking parameters or looks suspicious to users, use the plain URL and record it manually in this file.
- Do not use `?ga_off=1` in public links. That is only for owner / agent verification.

## Weekly check flow

1. Run GA4 collection when `config.ini` is available:

```powershell
python -X utf8 C:\Users\Tenormusica\portfolio\get_ga4_data.py --days 30
```

2. Check `analytics/data/latest.json`:

- `traffic_attribution.summary.source_medium`
- `traffic_attribution.summary.campaigns`
- `traffic_attribution.summary.referrers`

3. Interpret carefully:

- UTM links should appear as `source / medium` and campaign names.
- Non-UTM app/browser traffic may still appear as `(direct)`.
- Internal checks after 2026-05-11 should be mostly suppressed, but historical rows remain.

## GA4 UI check path

If browser confirmation is needed:

1. GA4 > Reports > Acquisition > Traffic acquisition
2. Primary dimension: `Session source / medium`
3. Add / switch to `Session campaign`
4. Filter or compare pages containing `Ezlize` / `ezlize.com` where possible
5. For deeper view, use Explore with:
   - Dimensions: Landing page, Page title, Session source, Session medium, Session campaign, Session manual ad content, Page referrer
   - Metrics: Sessions, Active users, Views

Use Codex App / grok4cx only for login-required UI confirmation, not for data that the local GA4 API already returns.
