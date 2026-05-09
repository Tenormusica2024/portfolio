# Urayaha Days - Portfolio

Web制作スキルを示すポートフォリオサイト群。AI/MLプロジェクトのショーケースを含む。

## Site Structure

| Site | URL | Hosting |
|------|-----|---------|
| Main Portfolio (C2C) | https://tenormusica2024.github.io/portfolio/ | GitHub Pages |
| B2B Business Site (Ezlize) | https://ezlize.com/ | Cloudflare Pages (`ezlize-b2b`, branch `main`) |
| Beauty Salon Demo | https://beauty-salon-lumiere.vercel.app/ | Vercel |
| Clinic Demo | https://clinic-peach-seven.vercel.app/ | Vercel |
| Designer Portfolio | https://designer-portfolio-plum.vercel.app/ | Vercel |
| Corporate Demo | https://corporate-red-sigma.vercel.app/ | Vercel |

## Pages

### Main Portfolio (GitHub Pages)
- `index.html` - Top page with loading animation, hero, projects overview
- `projects.html` - Project showcase with live demo links
- `profile.html` - Profile and skills
- `contact.html` - Contact form (EmailJS)
- `presentations.html` - Presentation slides (ja/en bilingual)
- `archive.html` - Archive of past work
- `ai-trends.html` - AI trend dashboard
- `code-reviewer-system.html` - Code reviewer system showcase

### Sub-projects
- `designer-portfolio/` - Designer portfolio (index.html, about.html, works.html + style.css, script.js)
- `beauty-salon/` - Beauty salon booking demo (single-file HTML with inline CSS/JS)
- `clinic/` - Medical clinic demo (single-file HTML with inline CSS/JS)
- `b2b/` - B2B business site (index.html, tokusho.html, privacy.html; Cloudflare-served public surface)
- `corporate/` - Corporate site demo (6 pages: index, about, services, works, recruit, contact + style.css, script.js)

## 関連システム

| システム | 概要 | リポジトリ |
|---------|------|----------|
| 営業メール自動化 | Google Maps でリード発見 → AI がパーソナライズメール生成 → Discord 承認 → Gmail 送信（メール内に Ezlize へのリンクを含む） | [openclaw-claude-bridge](https://github.com/Tenormusica2024/openclaw-claude-bridge) |
| Coconala 受注管理 | 問い合わせ対応・見積もり・スケジュール管理 | coconala-freelance-hub（非公開） |

## Analytics

- **Google Analytics**: G-XXXXXXXXXX（測定IDはコード内参照）
- **Cross-domain tracking**: 8 domains (tenormusica2024.github.io, ezlize.com, beauty-salon-lumiere, clinic-peach-seven, sound-platform-v5, esports-tournament, asteroid-game, corporate-red-sigma)
- **Analytics Dashboard**: https://tenormusica2024.github.io/portfolio/analytics/ （パスワード保護済み）

## Tech Stack

- Static HTML/CSS/JS
- GitHub Pages / Cloudflare Pages / Vercel hosting
- EmailJS (contact form) / Formspree (B2B, Corporate forms)
- GA4 with cross-domain linker
- JSON-LD structured data (Schema.org)
- Multi-language support (ja/en)
- GSAP / Lenis smooth scroll (designer-portfolio)

## Deployment

### B2B / Ezlize (Cloudflare Pages)

2026-05-09時点では、`ezlize.com` は Cloudflare Pages project `ezlize-b2b` で配信されている。Dashboard read-only確認済み。secret値は読んでいない・記録していない。

- Production URL: `https://ezlize.com/`
- Cloudflare Pages project: `ezlize-b2b`
- Connected repo: `Tenormusica2024/portfolio`
- Production branch: `main`
- DNS: Cloudflare NS（`elma.ns.cloudflare.com`, `eugene.ns.cloudflare.com`）
- Build command: `node scripts/build_b2b_cloudflare.js`
- Output directory: `dist/b2b`
- Local source: `b2b/`

```bash
node scripts/build_b2b_cloudflare.js
```

Node.js version / package manager は dashboard上で明示確認できていない。運用上必要になった場合のみ Cloudflare Dashboard read-only、または `CLOUDFLARE_API_TOKEN` を設定した上で:

```bash
npx wrangler pages project list
```

を実行して追加確認する。

API token なしで公開面だけ確認する場合は:

```bash
node scripts/check_b2b_cloudflare_public.js
```

このチェックは `ezlize.com` のCloudflare NS、主要5ページのHTTP 200、`Server: cloudflare`、各ページのcanonical WebP参照を確認する。

旧Vercel設定（`b2b/vercel.json`, `b2b/.vercel/`）は legacy/fallback として残っている。Ezlizeの現行公開経路を判断するときは、古いVercel前提の記述ではなく Cloudflare Pages dashboard確認ログ、DNS / HTTP header / Cloudflare配信用build scriptを優先して確認する。

B2B以外のVercelサブプロジェクトはリポジトリ連携なし。手動デプロイ:（リポジトリルートで実行）

```bash
(cd beauty-salon && npx vercel --prod --yes)
(cd clinic && npx vercel --prod --yes)
(cd designer-portfolio && npx vercel --prod --yes)
(cd corporate && npx vercel --prod --yes)
```

### B2B head metadata の更新フロー

`b2b/` 配下の title / OG / canonical / shared icon head は、
個別 HTML を直接ばらばらに直すのではなく

- `scripts/b2b_head_config.json`

を source of truth として更新し、その後

```bash
python scripts/sync_b2b_shared_head.py
```

で各ページへ反映する。

変更前に drift だけ確認したいときは:

```bash
python scripts/sync_b2b_shared_head.py --check
```

が使える。`--check` は差分があるファイルを表示して non-zero exit する。

### B2B 変更時の最短 local validation

1. `scripts/b2b_head_config.json` を更新
2. `python scripts/sync_b2b_shared_head.py`
3. `git diff -- b2b scripts/b2b_head_config.json`

ここまでで、head metadata の source of truth と実ページが揃っているかを最低限確認できる。

## Docs

- `EMAILJS_SETUP.md` - EmailJS integration guide
- `UTM_PARAMETER_GUIDE.md` - UTM parameter usage
- `GOOGLE_SEARCH_CONSOLE_GUIDE.md` - Search Console setup
- `ZENN_AUTO_UPDATE_SPEC.md` - Zenn article auto-update spec
