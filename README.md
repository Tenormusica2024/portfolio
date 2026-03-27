# Urayaha Days - Portfolio

Web制作スキルを示すポートフォリオサイト群。AI/MLプロジェクトのショーケースを含む。

## Site Structure

| Site | URL | Hosting |
|------|-----|---------|
| Main Portfolio (C2C) | https://tenormusica2024.github.io/portfolio/ | GitHub Pages |
| B2B Business Site (Ezlize) | https://ezlize.com/ | Vercel |
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

### Sub-projects (Vercel)
- `designer-portfolio/` - Designer portfolio (index.html, about.html, works.html + style.css, script.js)
- `beauty-salon/` - Beauty salon booking demo (single-file HTML with inline CSS/JS)
- `clinic/` - Medical clinic demo (single-file HTML with inline CSS/JS)
- `b2b/` - B2B business site (index.html, tokusho.html, privacy.html)
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

- Static HTML/CSS/JS (no build step)
- GitHub Pages / Vercel hosting
- EmailJS (contact form) / Formspree (B2B, Corporate forms)
- GA4 with cross-domain linker
- JSON-LD structured data (Schema.org)
- Multi-language support (ja/en)
- GSAP / Lenis smooth scroll (designer-portfolio)

## Deployment

Vercelサブプロジェクトはリポジトリ連携なし。手動デプロイ:（リポジトリルートで実行）

```bash
cd beauty-salon && npx vercel --prod --yes
cd clinic && npx vercel --prod --yes
cd designer-portfolio && npx vercel --prod --yes
cd b2b && npx vercel --prod --yes
cd corporate && npx vercel --prod --yes
```

## Docs

- `EMAILJS_SETUP.md` - EmailJS integration guide
- `UTM_PARAMETER_GUIDE.md` - UTM parameter usage
- `GOOGLE_SEARCH_CONSOLE_GUIDE.md` - Search Console setup
- `ZENN_AUTO_UPDATE_SPEC.md` - Zenn article auto-update spec
