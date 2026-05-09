# Portfolio Project Instructions

## サイト概要
- **ブランド**: Urayaha Days（C2C・個人向けポートフォリオ）
- **URL**: https://tenormusica2024.github.io/portfolio/
- **B2Bサイト**: Ezlize（`b2b/` ディレクトリ。Cloudflare Pages project `ezlize-b2b` / repo `Tenormusica2024/portfolio` / production branch `main` / build command `node scripts/build_b2b_cloudflare.js` / output `dist/b2b` を2026-05-09にdashboard read-only確認済み。Vercel設定はlegacy/fallbackとして残存）
- **B2B URL**: https://ezlize.com/

## C2C方針（必須）
- **採用向け情報を載せない**: 希望年収・正社員希望・フルタイム募集はB2Bサイト（Ezlize）側の情報
- **フリーランスは「副業」として位置づける**: 「フリーランスとして就労」ではなく「副業フリーランスとして活動」
- **現職特定を防ぐ表現**: 「社内展開」→「現場展開」、「社内環境」→「実務環境」
- **C2Cの信頼軸**: 社会的信用・発注先としての硬さより、作っているもの・人間性・趣味/志向の近さから「友達になりたい」「一緒に作りたい」「この人に声をかけたい」と思われる方向を優先する
- **C2Cでも仕事導線は残す**: 仕事の相談を拒まない。ただしB2Bのような営業・費用・実務品質前面ではなく、作品や思想を見た上でのコラボ/相談/海外オファーの入口として扱う
- **クリエイティブB2Bは将来分岐**: クリエイティブ軸のプロフェッショナルなアウトプットが十分固まったら、Urayaha Daysとは別に「クリエイティブ版B2Bサイト」を作る。現時点のC2Cに営業色を混ぜすぎない

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

## B2B デプロイ構成と ezlize.com 防御

**2026-05-09 現状確認:**
- `ezlize.com` / `www.ezlize.com` のNSは Cloudflare（`elma.ns.cloudflare.com`, `eugene.ns.cloudflare.com`）
- HTTPSレスポンスは `Server: cloudflare` で、主要B2Bページは 200 を返す
- `scripts/build_b2b_cloudflare.js` で `b2b/` を `dist/b2b` へ静的出力する構成が追加済み
- Cloudflare Pages dashboard read-only確認済み: project `ezlize-b2b`, connected repo `Tenormusica2024/portfolio`, production branch `main`
- Dashboard側 build command: `node scripts/build_b2b_cloudflare.js`
- Dashboard側 output directory: `dist/b2b`
- Custom domains: `ezlize.com` / `www.ezlize.com` は dashboard上で active / SSL enabled
- Environment variables / bindings: dashboardで見える範囲では variable rows なし。secret値は読んでいない・記録していない
- Node.js version / package manager はdashboard上で明示確認できなかったため、必要になった場合のみread-onlyで追加確認する
- 旧Vercelプロジェクト/設定は残っているため、Vercel前提の記述や障害切り分けは legacy/fallback として扱い、現在の公開経路を決め打ちしないこと

**Cloudflare Pages verified B2B build:**
```bash
node scripts/build_b2b_cloudflare.js
```

- Local source: `b2b/`
- Dashboard output directory: `dist/b2b`
- Dashboard project: `ezlize-b2b`
- Dashboard production branch: `main`
- 追加確認方法: Cloudflare Dashboard read-only、または `CLOUDFLARE_API_TOKEN` 設定後に `npx wrangler pages project list`
- API token なしで公開面だけ確認する場合: `node scripts/check_b2b_cloudflare_public.js`
  - Cloudflare NS
  - 主要5ページの HTTP 200
  - `Server: cloudflare`
  - canonical WebP参照

**リポジトリ構成:**
- ルート `/` → C2C ポートフォリオ（GitHub Pages: tenormusica2024.github.io/portfolio/）
- `b2b/` → B2B ポートフォリオ（ezlize.com。Cloudflare Pages `ezlize-b2b` / `main` / `dist/b2b` をdashboard確認済み）
- `corporate/` → コーポレートサイト（デプロイ先別途）
- その他 `beauty-salon/`, `clinic/`, `designer-portfolio/` → 各デモサイト

**Legacy / fallback Vercelプロジェクト `urayahadays-b2b`:**

以下は旧Vercel運用の再発防止メモ。2026-05-09時点では、Ezlizeの現行公開経路は Cloudflare Pages project `ezlize-b2b` としてdashboard確認済み。Vercel設定を現行公開経路として扱わない。

- Root Directory: `b2b`（ダッシュボード Build & Deployment で設定）
- GitHub連携: `Tenormusica2024/portfolio` リポジトリの `main` ブランチ
- 自動デプロイ: push ごとに発火（`update-analytics.yml` が毎日 09:00 JST に push）

**Legacy Vercelで ezlize.com に c2c が表示される問題の再発防止（3層防御）:**
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
- **レビュー時にも必須:** 実装担当でない場合でも、`sc-ir` / `sc-ifr` / 通常レビュー / 完成度確認 のタイミングで、まず **見切れ・崩れ・未描画っぽさ・読みにくさ** を重点確認する
- **確認状態の前提（最重要）:** 完了判定に使うスクリーンショットは、**実ユーザーがそのまま開いた自然表示状態** のものに限る
- **最低確認セット:**
  1. desktop表示
  2. mobile表示
  3. 変更したセクションの近接スクショ
  4. 必要なら full page
- **原則 live確認:** ローカル確認だけで完了扱いにしない。可能なら **本番反映後の live URL** でも再度スクショ確認する
- **禁止:** DOM確認・コード確認・テキスト確認だけで「表示OK」と判断すること
- **厳禁（今回の再発防止）:** スクショ確認のために DOM / state / class を改変しないこと
  - `.reveal` / `.visible` / `hidden` / `opacity` / animation state を **強制変更してから確認しない**
  - JSで `classList.add('visible')` のような操作をしてから完了判定しない
  - lazyload / animation / observer の挙動を飛ばした状態を「正常表示」とみなさない
  - DevTools / Playwright / script で **実表示と異なる状態** を作った確認は、補助確認には使えても **完了確認には使えない**
- **自然表示確認の原則:** first load・通常スクロール・通常クリックの範囲で表示された状態だけを「確認済み」に使う
- **以下が1つでも見つかったら完了報告禁止:**
  - 見切れ
  - 横にはみ出す文
  - 右端/下端で切れる見出しや本文
  - 意図しない大きな空白
  - スマホで読みにくいCTA並び
  - 画像の欠け / 404 / 非表示
  - 「途中までしか描画されていない」ように見えるUI
  - reveal / animation / observer 未発火により、**本来見えるはずの要素がユーザー環境で見えていない状態**
- **報告ルール:** 「確認済み」と言うときは、少なくとも desktop / mobile のどこを見たかを内部的に明確にしてから言う。曖昧な推測で「自然」「問題なし」と言わない
- **レビュー報告ルール:** レビュー時は、文言や戦略より先に **画面破綻がないか** を優先確認する。見切れや余白崩れを見落としたまま、コピーや導線だけを評価してはいけない
- **今回の再発防止の重点:** B2B業種別ページのような hero 右側空白・文字見切れ・レイアウト破綻は、軽微扱いせず **修正完了まで未完了** とみなす
- **B2Bヒーロー/大フォント見出しの重点:** `b2b/` のヒーローセクションや主見出しでは、改行位置そのものを品質判定対象にする。読点・句点・1〜2文字だけの孤立、意味単位を壊す改行、ユーザー指定コピーと違う行構成は軽微扱いせず、修正完了まで未完了とみなす。
- **今回の再発防止の追加重点:** reveal やアニメーション付き要素を、確認用スクリプトで無理やり表示して「正常」と誤判定しない。**自然表示で見えないなら未修正扱い** とする

## 学んだ教訓
- 2026-03-28 Gemini 3の存在確認: Gemini 3は2025年11月18日リリース済み（3.1 Proも登場）。古い知識ベースで「未リリース」と提案してしまった → 技術情報は事前にWebSearchで確認
- 2026-03-30 ezlize.com c2c/b2b フリップ再発: Root Directory `./` リセット + 毎日の analytics push で c2c が再デプロイされた → 3層防御（Root Directory設定 + フェイルセーフリダイレクト + CLI誤デプロイ防止）で根本対策実施
