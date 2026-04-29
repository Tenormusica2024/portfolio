# B2Bサイト全体レビュー TODO

レビュー日: 2026-04-26  
対象: `https://ezlize.com/` と `b2b` 配下の主要ページ

## 総評

**発注したくなくなる致命傷はない**です。  
でも、クライアント目線だと次の違和感は普通に刺さります。

---

## 最優先で直したい点

### 1. 業種別ページ3枚のヒーローが unfinished に見える

対象:

- https://ezlize.com/komuten-automation.html
- https://ezlize.com/real-estate-ai-secretary.html
- https://ezlize.com/shigyo-inquiry-automation.html

desktopで見ると、

- 右側が大きく空白
- sales page と違ってビジュアルがない
- テンプレだけ置いて途中で止まっている印象

になっています。

**client目線ではかなり危険**です。  
「sales page は作り込んでるのに、他ページは仮置き？」と見えます。

### 2. real-estate / shigyo の desktop 表示で文が右で切れて見える

特にこの2ページは hero の

- 見出し
- 本文

が右側で詰まって見えます。  
`overflow`っぽい見え方で、**品質不安を直接生むUI** です。

これは日本語の違和感というより、  
**“ちゃんと表示確認してないのでは”感** が出ます。

### 3. 日本語の重複が不自然

かなり目立つもの:

- `工務店向け業務自動化向けのよくあるご質問`
- `不動産向けAI秘書向けのよくあるご質問`
- `士業向け業務自動化向けのよくあるご質問`

あと:

- `工務店向け業務自動化向けの改善相談も`
- `不動産向けAI秘書向けの改善相談も`
- `士業向け業務自動化向けの改善相談も`

これは**普通に変**です。  
小さく見えて、B2Bではかなり印象を落とします。

### 4. 業種別ページの「← トップへ戻る」がヒーロー内にある

sales page では直したのに、他3ページには残っています。

client目線では、

- 相談導線に乗せたいのか
- 戻ってほしいのか

がブレて見えます。  
特に mobile では

- CTAボタン
- 実績を見る
- トップへ戻る

が同居していて、導線が散っています。

### 5. ブランド表記とCTA文言がページごとに揺れている

例:

- `幸田 晃典 / Ezlize`
- `Ezlize / 幸田 晃典`

CTAも:

- `無料相談`
- `相談する`
- `1つだけ困りごとを送る`
- `困りごとを相談する`

と揺れています。

大問題ではないですが、  
**全体の統一感不足 = 発注先としての完成度不足** に見えやすいです。

---

## 次に気になる点

### 6. ホームページが少し広すぎる

ホームでは

- Web制作
- 予約システム
- 業務自動化
- AI組み込み
- AI秘書
- 受発注管理
- データ集計
- 保守

まで全部載っています。

悪くはないですが、client目線では

> 結局この人は何が一番強いの？

が少しぼやけます。

特に今かなり強いのは  
**営業運用 / 問い合わせ運用 / 業務フロー設計** なのに、  
トップではまだ **何でも屋感** が少し残っています。

### 7. 「AI秘書的に」は少し軽く見える

例:

- `AI秘書的に補助`
- `AI秘書的な業務支援`

これは意味は通るけど、  
B2Bの発注担当者には少しふわっと見えます。

`一次整理を補助`  
`返信下書きと振り分けを支援`  
みたいな方が、発注イメージは湧きやすいです。

### 8. 業種別ページは sales page に比べて具体性が弱い

sales page は良いです。

でも他3ページはまだ

- 相性が良い理由
- 改善イメージ
- よくある改善テーマ

が**やや抽象的でテンプレ感**があります。

clientは、

- 何を納品してくれるのか
- どのツールを触るのか
- どこまで人が確認するのか

を知りたいので、  
sales page くらい具体化した方が強いです。

---

## 逆に良い点

これははっきり良いです。

- sales page の完成度は高い
- blog は技術力の裏付けとして強い
- privacy / 特商法があるのは信頼に効く
- NDA対応、最短2週間、保守あり、などは安心材料
- 「まずは1つだけ」系の相談導線はかなり良い

なので方向性自体はかなり合っています。  
問題は **一部ページだけ完成度が置いていかれていること** です。

---

## 優先順位

### まず直すべき5つ

1. 業種別3ページの hero 崩れ / 空白感
2. `向け...向け` 日本語重複
3. `トップへ戻る` を hero から外す
4. ブランド表記統一
5. CTA文言統一

### その次

6. 業種別ページを sales page 並みに具体化
7. `AI秘書的に` など曖昧表現の整理
8. ホームの専門性を少し絞って見せる

---

## 一言でいうと

**今の一番の損失は、sales page の強さが他ページに波及していないこと**です。

---

## 2026-04-29 追加: デプロイ以外の残タスク

直近の改善で、業種別ページの画像追加、費用目安、WebP軽量化、モバイル横スクロール対応は進みました。  
次は **本番デプロイ以外のローカルQAと整合性確認** を優先します。

### 最優先

1. **ローカル全ページQA**
   - 対象: トップ、全サービス詳細、問い合わせ導線、料金目安、ブログ導線
   - desktop / mobile の両方で確認
   - 1文字改行、読みにくい改行、横はみ出し、画像崩れを確認
   - 完了報告前に実画面スクショ確認を行う

2. **料金表示の最終整合性チェック**
   - トップのサービスカード
   - 詳細ページの費用目安
   - Priceセクション
   - FAQ / 構造化データの `priceRange`
   - 「安めに提案したい」方針と矛盾がないか確認

3. **リンク・404再チェック**
   - 内部リンク
   - サービスカードから詳細ページ
   - footer
   - blog / contact / privacy / tokusho
   - 画像差し替え後の旧PNG参照が残っていないか確認

### 次に進める

4. **未圧縮画像の追加軽量化**
   - 主要JPGはWebP化済み。画質を見ながら必要に応じて追加確認

5. **トップHero右側カードの見た目レビュー**
   - 空白対策としてカードを追加済み
   - まだ仮置き感がないか確認
   - 「小さく始める」「費用感」「運用で使える」をより自然に見せられるか検討

6. **詳細ページの費用目安セクション位置確認**
   - 現在はワークフロー画像の後、Heroの前に配置
   - 「画像が売り」という方針とは合っている
   - ただしページによっては費用が早く出すぎないか、読み順として自然か確認

7. **SEO / 構造化データの最新状態確認**
   - title / description が現状の内容と合っているか
   - canonical / sitemap / robots
   - サービス内容・費用レンジ・画像差し替え後の矛盾確認

8. **問い合わせ導線のCV確認**
   - CTA文言の統一
   - フォーム位置
   - 「無料相談」「費用感を相談する」「相談する」の使い分け
   - 安めの費用感を出した後、問い合わせに進みやすいか確認

### 後回しでよい

9. **コード重複整理**
   - 各HTMLに同じCSSが重複している
   - 静的HTMLなので今すぐ致命的ではない
   - 共通CSS化は崩すリスクがあるため、QA完了後に検討

10. **不要ファイル・古い参照の確認**
    - 旧画像、未使用SVG/JPG、公開ディレクトリ内の不要メモ
    - analyticsや下書きファイルが公開側に残っていないか確認

### 次に着手するなら

まずは **1. ローカル全ページQA + 2. 料金整合性 + 3. リンク・404再チェック** をまとめて実施する。

### 2026-04-29 進捗メモ

- トップHero右側を、仮カードではなくフリーランス受託の信用感を出す高品質ビジュアルに差し替え
  - 生成画像: `assets/home-hero-freelance-ai-workflow.webp`
  - desktop / tablet / mobile で実表示確認済み
- ローカル全HTML 15ページのQAを実施
  - desktop / mobile の横はみ出しなし
  - broken image なし
  - H1末尾句点・読点なし
  - H1の1〜2文字行なし
  - `main#main-content` とスキップリンクの不足を修正
- 内部リンク / アンカー / 画像参照の簡易チェックを実施
  - missing file: 0
  - missing anchor: 0
- 料金表示の整合性を確認
  - 詳細ページの費用目安はトップのサービスカードと一致
  - 特商法表記の目安を `2万円〜50万円` に修正

残りは、SEO / 構造化データの詳細確認、問い合わせ導線のCV文言レビュー、コード重複整理。

---

## B2Bデザイン方針メモ

### AI訴求の出し方

- Heroの主見出しではAIを明示してよい。
- ただしページ全体でAIを露骨に連呼しすぎない。
- 特に信頼獲得が重要な場所では、AIそのものよりも **運用で使える・人が確認できる・ログが残る・安全に進める** 価値を前面に出す。
- 「AIに頼りきり」「HITLチェックが甘い」印象を避ける。
- AIアイコン、ロボット感、過度な先進感、ネオン系・SF系表現は控える。
- 画像・ビジュアルでは、AI感よりも **実務品質、受託開発としての信用、業務フローの分かりやすさ** を優先する。
- `Image2` 的な高品質ビジュアルは強みとして活かすが、見せ方は「AIを使っている」より「ちゃんと作れる・運用まで整えられる」に寄せる。

### 2026-04-29 追加調整

- 問い合わせ欄のカッコ書き補足を削除
  - `LINE（友達追加）` → `LINE`
  - `Zenn（技術発信）` → `Zenn`
  - `GitHub（コードを見る）` → `GitHub`
- トップページのAI露出を一部抑制
  - `AI秘書` 系の見出しを `問い合わせ支援` / `問い合わせ一次整理` に変更
  - 「AIが先に〜」のような表現を、要約・分類・確認・ログの運用品質寄りに変更
  - AIそのものより、担当者確認・承認・運用パイプラインを前面に出す

- 詳細ページ側もAI露出を追加で抑制
  - 問い合わせ整理、営業運用、工務店、不動産、士業ページでは、AIそのものより「整理・下書き・人の確認・ログ」に寄せた文言へ調整
  - `AI秘書` など先鋭的に見える呼称は、サービス文脈では `反響対応支援` など実務寄りの表現に変更
  - AI組み込み開発ページはサービス名として残しつつ、本文は `LLM API` / `出力` / `支援ツール` 寄りに整理


- 未圧縮JPGの追加軽量化を実施
  - `website-production-workflow-photo.jpg` / `data-report-workflow-photo.jpg` / `reservation-workflow-photo.jpg` / `system-maintenance-workflow-photo.jpg` をWebP化して参照を更新
  - 未使用の旧JPG / 旧WebPを削除し、`.jpg` 参照が残っていないことを確認
- 公開ディレクトリ内の作業用Markdownが本番配信されないよう、`b2b/.vercelignore` を追加
- SEO / 構造化データ / 内部リンク / 画像参照の簡易チェックを再実施
  - JSON-LD parse error: 0
  - missing meta title / description: 0
  - missing file: 0
  - old jpg refs: 0
- 追加QAで見つかった見出しの1文字改行を修正
  - data-report / komuten / order-inventory / reservation / system-maintenance / website-production の大見出しを短縮・言い換え
  - 全HTML 15ページを desktop / mobile で再確認し、横はみ出し・broken image・見出しの不自然改行が 0 件であることを確認
- 問い合わせ導線とSEO文言の見直しを実施
  - トップ / 営業運用のmeta descriptionから、Hero以外で強く見えすぎるAI訴求を抑制
  - 詳細ページ下部CTAの汎用的な `相談する` を、各サービス文脈に合わせた具体的な相談CTAへ変更
  - 安めの費用感から問い合わせへ進む流れが分かるよう、トップの `費用感を相談する` は維持
- トップHeroの広幅画面スケールを調整
  - 全画面時に見出しと右ビジュアルが小さく頭打ちにならないよう、`clamp()` で画面幅に合わせて拡大
  - 1366px / 2048px / tablet / mobile で実表示確認し、横はみ出し・見出し崩れなしを確認
- 追加でトップHeroの中間幅（1000px前後）を確認
  - 右背景だけが残って画像が下に落ちる状態を避けるため、1100px以下ではHero背景面を非表示に変更
  - 2048px / 1366px / 1000px / mobile で再確認し、横はみ出し・見出し崩れなし

### 現時点の残タスク整理

- サイト本体の主要QA、料金整合性、SEO簡易チェック、問い合わせ導線、Heroスケール調整は一通り完了。
- 残りは主に以下。
  - デプロイ再試行と本番反映確認
  - コード重複整理（共通CSS/JS化。崩れリスクがあるため後回し）
  - 外部集客チャネル整備（Google Business Profile / Bing / ミツモア等）

- 全画面表示時のHero / 主要ワークフローのスケール調整を実施
  - トップHeroは 1500px 以上で見出し・右ビジュアル・本文・統計カードを画面幅に合わせて拡大
  - 詳細ページは 1500px 以上で detail-wrap / workflow セクションの最大幅を拡張
  - 920px / 1366px / 2048px / mobile で横はみ出し・broken image・不自然改行が 0 件であることを確認

---

## 2026-04-29 追加: SEO / アクセス最適化 TODO

Cloudflare Pages移行、DNS切替、Search Console sitemap成功、GA4タグ確認、DMARC追加までは完了済み。  
ここからは公開後のSEO・流入・CV改善フェーズとして進める。

### 1. Core Web Vitals / 表示速度確認

- PageSpeed Insights または Lighthouse で desktop / mobile を測定する。
- 対象:
  - `/`
  - `/inquiry-workflow-support.html`
  - `/sales-operations-pipeline.html`
  - `/data-report-automation.html`
  - `/website-production.html`
- 確認観点:
  - LCP
  - INP
  - CLS
  - 画像のLCP化・遅延読み込みの妥当性
  - Cloudflare移行後にキャッシュ・圧縮が効いているか
- 完了条件:
  - 大きな赤信号がない
  - 改善が必要な場合は、画像・CSS・JS・フォントのどれが原因か切り分ける

進捗:

- 2026-04-29: Lighthouseで主要ページを測定し、mobile LCPが重い箇所を確認。
- 実施した改善:
  - Google Fontsをrender-blockingな通常CSS読み込みから `preload` + `onload` に変更
  - GTM / GA向け `preconnect` を追加
  - トップHero / 営業運用Hero / 営業運用ワークフローに `srcset` を追加
  - mobile用WebPを追加
    - `home-hero-freelance-ai-workflow-mobile.webp`
    - `sales-ops-pipeline-hero-mobile.webp`
    - `sales-ops-workflow-map-image2-mobile.webp`
    - `data-report-workflow-photo-mobile.webp`
    - `website-production-workflow-photo-mobile.webp`
  - salesページの下部Hero画像を `loading="lazy"` に変更
- 本番再測定結果（Lighthouse mobile / 2026-04-29）:
  - `/`（wwwで測定）: performance 84 / LCP 3568ms / CLS 0
  - `/data-report-automation.html`: performance 86 / LCP 4152ms / CLS 0
  - `/website-production.html`: performance 86 / LCP 4124ms / CLS 0
  - `/sales-operations-pipeline.html`: performance 82 / LCP 4836ms / CLS 0
- desktopはおおむね performance 91〜98。
- 残りの改善余地:
  - mobile LCPをさらに詰めるなら、GA/GTMの遅延読み込み、Cloudflare Web Analyticsの扱い、ファーストビュー画像のさらなる軽量化を検討。
  - ただし現状は大きな赤信号なし。見た目を崩してまで削る段階ではない。

### 2. 構造化データの拡充

- 既存JSON-LDのparse errorがない状態は維持する。
- ページ別に追加候補を検討する:
  - `Service`
  - `FAQPage`
  - `BreadcrumbList`
  - `Organization` / `LocalBusiness` 相当
- 注意:
  - 盛りすぎない。
  - 実際にページ上で読める内容とJSON-LDを一致させる。
  - 料金レンジはトップ・詳細ページ・FAQと矛盾させない。
- 完了条件:
  - 主要サービスページで構造化データの内容がページ本文と一致
  - Rich Results Test相当で重大エラーなし

進捗:

- 2026-04-29: 既存JSON-LDを確認。
  - 主要サービスページには `Organization` / `WebSite` / `ProfessionalService` / `FAQPage` / `BreadcrumbList` / `WebPage` が既に存在。
  - トップには `Organization` / `WebSite` / `ProfessionalService` / `FAQPage` / `CollectionPage` が存在。
- 実施した拡充:
  - 詳細ページの `ProfessionalService` に、ページ本文の費用目安と一致する `priceRange` を追加。
  - 費用レンジが明確な詳細ページには `Offer` + `PriceSpecification` を追加。
  - 月額/単発が混在する「既存システム改修・保守」は、誤解を避けるため `priceRange` のみに留めた。
  - `WebPage` / `CollectionPage` から対象 `ProfessionalService` へ `mainEntity` を追加。
  - トップの `ProfessionalService` に `hasOfferCatalog` を追加し、主要8サービスと費用目安を整理。
- 検証:
  - JSON-LD parse error: 0
  - 主要ページのmobile実表示で横はみ出しなし
  - 構造化データの料金はページ本文に表示されている費用目安と一致
- 注意:
  - FAQPageは既に入っているが、GoogleのFAQ rich resultは表示対象が限定されるため、FAQを増やす方向ではなく、ページ内容との整合を優先する。
  - 料金やサービス内容を盛らず、本文に出ている範囲だけを構造化する。

### 3. robots.txt / Cloudflare Managed Content確認

- 現在の `robots.txt` はCloudflare Managed ContentのAI crawler制御が入っている。
- 確認観点:
  - `search=yes` / `Allow: /` により通常検索クロールを妨げていないか
  - AI crawler拒否設定が意図通りか
  - `Sitemap: https://ezlize.com/sitemap.xml` が維持されているか
- 完了条件:
  - Googlebot / Bingbotの通常クロールを阻害しない
  - AI学習拒否方針と矛盾しない

進捗:

- 2026-04-29: 本番 `https://ezlize.com/robots.txt` / `https://www.ezlize.com/robots.txt` を確認。
  - HTTP 200 / Cloudflare配信。
  - `User-agent: *` + `Allow: /` あり。
  - `Sitemap: https://ezlize.com/sitemap.xml` あり。
  - `https://ezlize.com/sitemap.xml` も HTTP 200 / XMLとして取得可能。
- Cloudflare Managed Contentの状態:
  - `Content-Signal: search=yes,ai-train=no`
  - Amazonbot / Applebot-Extended / Bytespider / CCBot / ClaudeBot / CloudflareBrowserRenderingCrawler / Google-Extended / GPTBot / meta-externalagent は `Disallow: /`
- 判断:
  - 通常検索クロールは許可されている。
  - Googlebot / Bingbotを明示的に拒否する指定はない。
  - AI学習・AI拡張系botの拒否方針は、現状のデータ保護・AI学習拒否方針と矛盾しない。
  - Cloudflareの `Content-Signal` はGoogle標準robotsディレクティブではないが、`Allow: /` と `Sitemap` があるため通常SEO上の阻害要因にはなっていない。
- ローカル確認:
  - `b2b/robots.txt` は `User-agent: *` / `Allow: /` / `Sitemap: https://ezlize.com/sitemap.xml`。
  - B2B HTML内に `noindex` / `nofollow` はなし。
  - canonical は主要HTMLに存在。

### 4. Search Console URL検査

- sitemapは送信済み・成功済み・20ページ検出済み。
- 追加で主要ページをURL検査し、必要ならインデックス登録をリクエストする。
- 対象:
  - `/`
  - `/sales-operations-pipeline.html`
  - `/inquiry-workflow-support.html`
  - `/data-report-automation.html`
  - `/order-inventory-system.html`
  - `/website-production.html`
  - `/reservation-system-site.html`
  - `/system-maintenance-improvement.html`
- 完了条件:
  - トップと主要サービスページが取得可能
  - 旧Vercel配信や404のキャッシュが残っていない


進捗:

- 2026-04-29: Search Consoleで `https://ezlize.com/` のURL検査を実施。
  - 状態: 「URL が Google に登録されていません」
  - ユーザー操作で「インデックス登録をリクエスト」を実行済み。
- 2026-04-29: Search Consoleで `https://ezlize.com/sales-operations-pipeline.html` のURL検査を実施。
  - 状態: 「URL が Google に登録されていません」
  - ユーザー操作で「インデックス登録をリクエスト」を実行済み。
  - 次は残り主要サービスページを順にURL検査する。

### 5. CTA / アクセス導線改善

- GA4 / Search Console / 実画面レビューを見ながら、問い合わせ導線を改善する。
- 確認観点:
  - トップHeroの `費用感を相談する`
  - サービスカードの費用目安と詳細リンク
  - 詳細ページ上部の画像・費用・CTAの並び
  - footer/contactのクリック範囲
  - 電話よりフォーム・メール起点に見えるか
- 完了条件:
  - 初見で「何を相談できるか」「だいたいいくらか」「どこから相談するか」が迷いにくい
  - AI感より、実務品質・安全運用・小さく始められる印象が勝っている


進捗:

- 2026-04-29: トップページのCTA導線を改善。
  - サービス一覧下に「どのサービスに近いかわからない場合」の相談導線を追加。
  - 料金カードごとに「この範囲で相談する」リンクを追加。
  - Contact左側に、初回相談で送る内容の3点メモを追加。
  - 露骨なAI訴求ではなく、困りごと・既存ツール・費用感から相談できる導線に寄せた。
- 2026-04-29: 詳細ページからContactへ来たときの相談文脈を保持する導線を追加。
  - 詳細ページの主要CTAを `/?topic=...#contact` に変更。
  - トップページのCTAクリック時も相談テーマをフォームへ反映。
  - フォームの相談内容欄に「相談したい内容 / 困っている作業 / 今使っているツール / 希望する費用感・時期」の下書きを入れる形にした。
- 2026-04-29: フォーム送信データにも相談文脈を残すため、hidden fieldを追加。
  - `consultation_topic`: CTAやURL queryから取得した相談テーマ。
  - `source_url`: フォーム到達時のURL。
  - メール本文だけでなく送信メタデータとしても、どの導線から来た相談か確認できるようにした。

### 6. GA4計測対象の整理

- 2026-04-29: GA4 Data APIで当日データを確認。
  - B2B本番 `ezlize.com`: 3 users / 6 sessions / 7 PV。
  - Cloudflare preview `ezlize-b2b.pages.dev`: 7 users / 7 sessions / 7 PV。
  - local `127.0.0.1`: 1 users / 2 sessions / 7 PV。
  - `testDataFilterName` はすべて `(not set)` で、Internal Traffic / Developer Traffic のテスト一致は確認できなかった。
- 判断:
  - 今日時点では、local / preview の確認アクセスがGA4に入っていた。
  - 「僕とCodexの確認アクセスを取らない」は完全には反映されていなかった。
- 対応:
  - B2B側のGA4タグを `ezlize.com` / `www.ezlize.com` の本番ホストでのみ読み込むように変更。
  - `127.0.0.1` / `localhost` / `ezlize-b2b.pages.dev` では今後GA4送信しない。
