# portfolio 公開可否・セキュリティ確認メモ

作成日: 2026-04-30
対象 repo: `portfolio`

## 結論

条件付きでポートフォリオ掲載可能です。

この repo 自体が公開実績の中核であり、C2Cポートフォリオ、B2Bサイト、業種別デモ、問い合わせ導線、計測導線をまとめる運用基盤として説明価値があります。一方で、営業導線・問い合わせ設定・分析設定・Search Console・B2B本番UI・Cloudflare/Vercel設定に近い情報も含むため、公開する範囲と運用メモは明確に分ける必要があります。

## 公開してよい内容

- C2CポートフォリオとB2Bサイトを分けて運用している設計
- C2Cポートフォリオ / B2B事業サイト / 業種別デモサイトの抽象的な役割
- GitHub Pages / Cloudflare Pages / Vercel を使い分ける構成
- Static HTML/CSS/JS を中心にした軽量サイト運用
- GA4 / UTM / Search Console を使う計測導線の存在
- EmailJS / Formspree を使う問い合わせ導線の存在
- B2B proof asset と現行公開画像を分ける運用方針
- `public-portfolio-summary-ja.md` に書いた抽象説明・30秒説明・タイトル案

## 公開しない方がよい内容

- Analytics dashboard のパスワード・保護設定
- EmailJS Service ID / Template ID / Public Key の実値
- Formspree endpoint の実運用情報
- Google Search Console 所有権確認ファイルや確認メタタグの値
- GA4の内部設定、詳細な流入データ、未公開の計測結果
- Cloudflare / Vercel の token、project内部設定、Dashboard情報
- B2B営業上の未公開メモ、顧客情報、相談内容、見積もり情報
- B2B本番UIの属人的な文言判断・CTA判断の途中メモ
- `.env`、認証済みセッション、cookie、secret、credential

## 内部レビュー候補理由への判断

`portfolio_review_candidates.json` では、この repo は以下の理由で候補化されていました。

- `baseline-stale`
- `security=medium`

`portfolio_readiness` は `portfolio-ready` で、差別化説明は既に一定あります。今回の作業では、repo自体を「公開実績の中核」「C2C/B2B分離型の公開オペレーション基盤」として説明できる粒度を追加しました。

`security=medium` は、候補データ上では `CLAUDE.md`、`README.md`、`b2b/b2b-production-ui-pending-notes-2026-04-30.md` の credential 関連記述と `GOOGLE_SEARCH_CONSOLE_GUIDE.md` の Gmail/email 関連記述の検知です。セットアップガイドやB2B運用メモの性質上、語句検知としては自然です。ただし、実設定値・認証情報・営業上の未公開情報は公開対象外です。

## 実施した安全確認

- 作業前から `CLAUDE.md`、`README.md`、B2B UI変更ガード、公開面チェックscriptなどの変更・未追跡ファイルが存在していた
- 今回の変更は `docs/public-portfolio-summary-ja.md` と `docs/portfolio-security-readiness-2026-04-30.md` の追加に限定
- C2C/B2B UI、HTML、CSS、JS、画像、Cloudflare/Vercel設定、問い合わせ設定には触れていない
- 公開説明には実credential、認証値、営業上の未公開情報、計測結果の詳細を含めていない

## B2Bサイト についての注意

レビュー担当者が目視確認しにくい状態では、B2B本番UIの変更は原則行わない方針です。B2Bページは文言、改行、CTA、業種別ページ、公開状態など、個別ルールが多く、通常の汎用UI修正よりリスクが高いためです。

今回もB2B本番UIは変更していません。既存のB2B UI変更ガードに従い、UI反映はレビュー担当者が目視確認できるタイミングに回すのが安全です。

## 作業時の注意

この repo は公開サイトそのものを含むため、docs追加以外の変更は表示影響が出やすいです。特にB2Bサイトは営業導線に直結するため、レビュー担当者が目視確認できない状態では、文言・CTA・レイアウトを変更しないでください。UI変更を行う場合は、desktop / mobile / 実URLで目視確認し、レビュー担当者へURLを提示する必要があります。

## 残る注意点

ポートフォリオへこのrepo自体を説明する場合は、公開済みURLと抽象的な運用設計を中心にしてください。Analytics、Search Console、EmailJS、Formspree、Cloudflare/Vercelの実設定は、必要があってもマスク・抽象化した説明に留めるべきです。

## 次の一手

- この repo を公開候補として扱う場合は、レビュー担当者が掲載文面を確認する
- UI変更はレビュー可能なタイミングで、URL提示・目視確認付きで行う
- 内部レビュー側では、このレビュー結果を反映した baseline 更新を repo 単位で行う

