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

## B2Bサイト プライバシーポリシー保守ルール
- **GA4を使っている場合、privacy.htmlの「Cookie未使用」記述は必ず削除・更新する**（虚偽表記になる）
- **Formspreeなど第三者サービスを使う場合は「第三者への提供・業務委託」に明記する**（個人情報保護法の業務委託先開示要件）

## B2B/UI スクリーンショット検証プロトコル（MANDATORY）
- **対象:** `b2b/` 配下のページ、および portfolio 内で HTML/CSS/UI/コピー/導線を変更したとき
- **完了報告前に必須:** 変更対象ページを **実際にスクリーンショット確認** する
- **最低確認セット:**
  1. desktop表示
  2. mobile表示
  3. 変更したセクションの近接スクショ
  4. 必要なら full page
- **原則 live確認:** ローカル確認だけで完了扱いにしない。可能なら **本番反映後の live URL** でも再度スクショ確認する
- **禁止:** DOM確認・コード確認・テキスト確認だけで「表示OK」と判断すること
- **以下が1つでも見つかったら完了報告禁止:**
  - 見切れ
  - 横にはみ出す文
  - 右端/下端で切れる見出しや本文
  - 意図しない大きな空白
  - スマホで読みにくいCTA並び
  - 画像の欠け / 404 / 非表示
  - 「途中までしか描画されていない」ように見えるUI
- **報告ルール:** 「確認済み」と言うときは、少なくとも desktop / mobile のどこを見たかを内部的に明確にしてから言う。曖昧な推測で「自然」「問題なし」と言わない
- **今回の再発防止の重点:** B2B業種別ページのような hero 右側空白・文字見切れ・レイアウト破綻は、軽微扱いせず **修正完了まで未完了** とみなす

## 学んだ教訓
- 2026-03-28 Gemini 3の存在確認: Gemini 3は2025年11月18日リリース済み（3.1 Proも登場）。古い知識ベースで「未リリース」と提案してしまった → 技術情報は事前にWebSearchで確認
- 2026-03-30 ezlize.com c2c/b2b フリップ再発: Root Directory `./` リセット + 毎日の analytics push で c2c が再デプロイされた → 3層防御（Root Directory設定 + フェイルセーフリダイレクト + CLI誤デプロイ防止）で根本対策実施
