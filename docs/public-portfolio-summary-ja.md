# portfolio 公開向け説明メモ

作成日: 2026-04-30
対象 repo: `portfolio`

## 一言でいうと

C2Cポートフォリオ、B2B事業サイト、業種別デモサイト、分析・発信導線をまとめて管理する、公開実績と営業導線の中核リポジトリです。

## クライアント向けの説明粒度

### 1. 何のプロジェクトか

`portfolio` は、個人の制作物・技術実績・発信導線を公開するC2Cポートフォリオと、業務改善・AI導入支援を説明するB2Bサイトを同居させているリポジトリです。

C2C側は Urayaha Days として、作品性・個人性・技術的な興味を見せる入口です。B2B側は、法人・事業者向けにAI活用、業務自動化、営業/問い合わせ対応改善などを説明する入口です。

### 2. 具体的に何を管理しているか

- GitHub Pagesで公開しているC2Cポートフォリオ
- Cloudflare Pagesで公開しているB2Bサイト
- 美容室、クリニック、デザイナー、コーポレートなどのデモサイト
- AIトレンドダッシュボードやコードレビューシステム紹介ページ
- Contact / EmailJS / Formspree などの問い合わせ導線
- GA4 / UTM / Search Console などの計測・流入分析設定
- B2B proof asset、公開面チェック、B2B本番UI変更ガード

### 3. 普通のポートフォリオとの違い

一般的なポートフォリオは、作品一覧とプロフィールを置くことが主目的です。

この repo は、それに加えて、C2CとB2Bを分けた導線設計、複数の業種別デモ、問い合わせ導線、アクセス解析、SEO、Cloudflare / GitHub Pages / Vercel の複数ホスティング管理まで含んでいます。

単なる作品一覧ではなく、個人の公開面・営業面・実績証明・検証導線をまとめる公開オペレーション基盤です。

### 4. AI/Agent Operationsとして説明できる点

この repo は、AIエージェントによる公開面運用の実験場でもあります。

- C2C / B2B / demo site の役割を分けて管理する
- B2B本番UIのような高リスク領域は、レビュー担当者が目視確認できない状態では変更しないガードを置く
- 公開面を認証情報なしで確認するスクリプトを持つ
- proof asset と現行HTML参照画像を分けて扱う
- 内部の運用チェックから repo状態、公開URL、deploy providerを確認して優先度判断する
- UI変更時はURL提示とレビュー担当者の目視確認を前提にする

### 5. 使う場面・見せ方

- 個人ポートフォリオの運用実例
- C2C / B2Bを分けた公開導線設計
- 業種別デモサイトのショーケース
- AI開発・Agent Operationsの実績紹介
- B2B営業導線と実績証明の運用基盤
- Cloudflare/GitHub Pages/Vercelをまたぐ静的サイト運用例

## 30秒説明

このリポジトリは、個人ポートフォリオ、B2B事業サイト、業種別デモサイト、問い合わせ導線、分析設定をまとめて管理する公開実績の中核です。C2C側では作品性や技術的興味を見せ、B2B側ではAI活用・業務自動化・営業/問い合わせ改善の相談導線を持たせています。GitHub Pages、Cloudflare Pages、Vercelを使い分け、GA4やUTM、Search Console、proof asset、公開面チェックまで含めて、単なる作品一覧ではなく公開オペレーション基盤として運用しています。

## ポートフォリオでの見せ方

### タイトル案

- C2C/B2B Portfolio Operations
- C2C/B2B分離型ポートフォリオ運用基盤
- Public Proof & Business Site Operations

### 短い説明文案

C2Cポートフォリオ、B2B事業サイト、業種別デモサイト、問い合わせ導線、GA4/UTM/Search Consoleをまとめて管理する公開実績リポジトリ。GitHub Pages / Cloudflare Pages / Vercelを使い分け、公開面の証明・営業導線・分析導線を運用している。

### 強調できる技術・運用要素

- Static HTML/CSS/JS による複数サイト運用
- GitHub Pages / Cloudflare Pages / Vercel のホスティング分離
- C2C / B2B / demo site の情報設計
- EmailJS / Formspree による問い合わせ導線
- GA4 / UTM / Search Console の計測導線
- B2B proof asset と現行公開画像の切り分け
- 公開面チェックスクリプト
- UI変更時のレビュー担当者目視確認を前提にした運用ガード

## 公開時の注意

公開説明では、サイト構成、C2C/B2B導線、業種別デモ、計測・問い合わせ・公開面チェックの抽象説明は出して問題ありません。一方で、Analytics dashboardの認証情報、EmailJS/Formspree設定値、Search Consoleの所有権確認情報、GA4の詳細設定、B2B営業上の未公開メモ、Cloudflare/Vercelのproject設定やtokenは公開素材に混ぜないでください。
