# Portfolio Project Instructions

## サイト概要
- **ブランド**: Urayaha Days（C2C・個人向けポートフォリオ）
- **URL**: https://tenormusica2024.github.io/portfolio/
- **B2Bサイト**: Ezlize（`b2b/` ディレクトリ。Vercelプロジェクト `urayahadays-b2b` でデプロイ）
- **B2B URL**: https://ezlize.com/

## C2C方針（必須）
- **採用向け情報を載せない**: 希望年収・正社員希望・フルタイム募集はB2Bサイト（Ezlize）側の情報
- **フリーランスは「副業」として位置づける**: 「フリーランスとして就労」ではなく「副業フリーランスとして活動」
- **現職特定を防ぐ表現**: 「社内展開」→「現場展開」、「社内環境」→「実務環境」

## コンテンツ方針
- **Under Constructionリンク**: `href="#"` のリンクは削除（カード本体は残す）
- **Presentationsページ本文**: 英語対応なし（日本語のみ）。ナビのラベルは英語対応あり
- **作業用MVのリンク先**: `creation.html` に統一（projects.htmlからもcreation.htmlへ）
- **制作日**: 全プロジェクトカードに `.project-year` バッジで年を表示
- **NEWバッジ**: 年をまたいで全件NEWは不自然 → creation.htmlでは使わない（削除済み）
- **現職特定防止の追加パターン**: 「社内FAQ」→「FAQ」、「本業で〜実績」→「実務で〜実績」
- **ツール表記**: philosophy文脈では「Codex CLI」でなく「Cursor」を使用（旬感を維持）
- **数値クレーム**: 「90%自動化達成」等は現状維持（根拠あり前提で掲載継続）

## SEO方針
- Title: 45〜60文字・キーワード入り
- Meta description: 120〜160文字
- target="_blank" には必ず rel="noopener noreferrer"

## 技術情報の確認ルール
- AIモデルのバージョン・リリース状況など、知識カットオフ以降の情報は **必ずWebSearchで確認してから提案する**
- grok-3-miniはweb非対応のため、最新技術情報はWebSearch toolを使用

## Vercel デプロイ構成と ezlize.com 3層防御

**リポジトリ構成:**
- ルート `/` → C2C ポートフォリオ（GitHub Pages: tenormusica2024.github.io/portfolio/）
- `b2b/` → B2B ポートフォリオ（Vercel: ezlize.com）
- `corporate/` → コーポレートサイト（デプロイ先別途）
- その他 `beauty-salon/`, `clinic/`, `designer-portfolio/` → 各デモサイト

**Vercelプロジェクト `urayahadays-b2b`:**
- Root Directory: `b2b`（ダッシュボード Build & Deployment で設定）
- GitHub連携: `Tenormusica2024/portfolio` リポジトリの `main` ブランチ
- 自動デプロイ: push ごとに発火（`update-analytics.yml` が毎日 09:00 JST に push）

**ezlize.com に c2c が表示される問題の再発防止（3層防御）:**
1. **Vercel Root Directory = `b2b`** - ダッシュボードで設定。正常時はこれだけで b2b がデプロイされる
2. **フェイルセーフリダイレクト** - ルート `index.html` の `<head>` 直後に `window.location.hostname === 'ezlize.com'` 検出スクリプトを設置。Root Directory が `./` に戻っても ezlize.com アクセス時は `/b2b/index.html` にリダイレクト
3. **ルート `.vercel/project.json` 削除済み** - CLI からルートで `vercel deploy` した際の誤デプロイを防止（`.gitignore` で `.vercel` は除外済み）

**再発原因の分析:**
- Vercel CLI をリポジトリルートで実行すると Root Directory 設定が上書きされる可能性がある
- Root Directory が `./` に戻ると、毎日の analytics push で c2c コンテンツが再デプロイされる
- **対策**: CLI デプロイは必ず `b2b/` ディレクトリから実行すること

## 学んだ教訓
- 2026-03-28 Gemini 3の存在確認: Gemini 3は2025年11月18日リリース済み（3.1 Proも登場）。古い知識ベースで「未リリース」と提案してしまった → 技術情報は事前にWebSearchで確認
- 2026-03-30 ezlize.com c2c/b2b フリップ再発: Root Directory `./` リセット + 毎日の analytics push で c2c が再デプロイされた → 3層防御（Root Directory設定 + フェイルセーフリダイレクト + CLI誤デプロイ防止）で根本対策実施
