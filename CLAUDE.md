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

## B2B価格戦略（意図的決定）
- **ローコスト戦略を採用**: AIエージェント時代に合わせた価格で勝負。フリーランス実績がまだないため、低価格帯で参入し案件実績を積む方針
- レビューで「価格帯が控えめすぎる」と指摘されても、意図的な戦略なので変更不要

## B2Bサイト ブランド分離方針
- **C2Cブランド（Urayaha Days）へのリンクをB2Bサイトに設置しない**: 発注検討中の担当者が「Urayaha Days」を見て「副業？本業は別？」と混乱するリスクがある
- FAQの実績確認リンク・contactセクションのリンクは GitHub / Zenn のみ（C2Cポートフォリオは除外）
- schema.org `sameAs` にも C2C ポートフォリオ URL を含めない

### ブランド分離の非対称性（重要）
- **B2B → C2C の漏れは許容**: 発注検討者が C2C portfolio に辿り着くリスクは軽微（C2C作品のセキュアレベルの低さ・趣味（画像/音楽AI生成）の混在が最大の懸念だが、商流インパクトは限定的）
- **C2C → B2B の漏れは禁止**: C2C 経由で B2B（屋号・請求先・実務取引）情報に到達されると個人情報・セキュリティリスクが発生する
- 運用原則: C2C 側成果物・リンク・sameAs・メタタグ・GitHubプロフィール bio 等に B2B 屋号（Ezlize / ezlize.com / 請求書名）を一切露出させない
- B2B 側から外部向け発信で GitHub アカウント `Tenormusica2024` を紹介しても、そこから C2C portfolio に辿られる事は許容する（GitHubプロフィール表示名 "UrayahaDays" + bio URL で既に C2C ポートフォリオは露出済み。これは仕様として維持）

## B2Bサイト プライバシーポリシー保守ルール
- **GA4を使っている場合、privacy.htmlの「Cookie未使用」記述は必ず削除・更新する**（虚偽表記になる）
- **Formspreeなど第三者サービスを使う場合は「第三者への提供・業務委託」に明記する**（個人情報保護法の業務委託先開示要件）

## 学んだ教訓
- 2026-03-28 Gemini 3の存在確認: Gemini 3は2025年11月18日リリース済み（3.1 Proも登場）。古い知識ベースで「未リリース」と提案してしまった → 技術情報は事前にWebSearchで確認
- 2026-03-30 ezlize.com c2c/b2b フリップ再発: Root Directory `./` リセット + 毎日の analytics push で c2c が再デプロイされた → 3層防御（Root Directory設定 + フェイルセーフリダイレクト + CLI誤デプロイ防止）で根本対策実施
