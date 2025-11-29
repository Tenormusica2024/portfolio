# OGP画像 & GA4イベント確認ガイド

**作成日**: 2025年11月27日  
**対象サイト**: https://tenormusica2024.github.io/portfolio/  
**目的**: SNSシェア表示確認・GA4イベント計測動作確認

---

## 📊 確認項目チェックリスト

### ✅ OGP画像確認（Twitter/Facebook）
- [ ] Twitter Card Validator確認完了
- [ ] Facebook Sharing Debugger確認完了
- [ ] 実際のTwitter投稿でプレビュー確認
- [ ] 実際のFacebook投稿でプレビュー確認

### ✅ GA4イベント確認
- [ ] CTAボタンクリックイベント確認
- [ ] プロジェクトDemoボタンクリックイベント確認
- [ ] プロジェクトGitHubボタンクリックイベント確認
- [ ] イベントパラメータ確認（event_category, event_label）

---

## 🐦 Twitter Card Validator（推奨）

### 手順1: Twitter Card Validatorにアクセス

```
https://cards-dev.twitter.com/validator
```

⚠️ **注意**: Twitter Developer Accountが必要です（無料作成可能）

### 手順2: URLを入力

```
https://tenormusica2024.github.io/portfolio/
```

### 手順3: プレビュー確認

**確認ポイント:**
- ✅ OGP画像が表示される（ai-trend-dashboard.png）
- ✅ タイトル: "Urayaha Days - AI駆動開発のポートフォリオ"
- ✅ 説明文: "AI駆動開発のスペシャリスト..."
- ✅ カードタイプ: summary_large_image
- ✅ 画像サイズ: 1200x630px

**期待される表示:**
```
┌──────────────────────────────────┐
│                                  │
│  [AI Trend Dashboard 画像]       │
│                                  │
├──────────────────────────────────┤
│ Urayaha Days - AI駆動開発の      │
│ ポートフォリオ                    │
├──────────────────────────────────┤
│ AI駆動開発のスペシャリスト...    │
│ tenormusica2024.github.io        │
└──────────────────────────────────┘
```

---

## 📘 Facebook Sharing Debugger（推奨）

### 手順1: Facebook Sharing Debuggerにアクセス

```
https://developers.facebook.com/tools/debug/
```

⚠️ **注意**: Facebookアカウントでのログインが必要です

### 手順2: URLを入力して「デバッグ」をクリック

```
https://tenormusica2024.github.io/portfolio/
```

### 手順3: プレビュー確認

**確認ポイント:**
- ✅ OGP画像が表示される（ai-trend-dashboard.png）
- ✅ og:title: "Urayaha Days - AI駆動開発のポートフォリオ"
- ✅ og:description: "AI駆動開発のスペシャリスト..."
- ✅ og:image: 1200x630px
- ✅ og:site_name: "Urayaha Days Portfolio"

### 手順4: 「再度スクレイピング」をクリック

初回アクセス時やOGP更新後は、必ず「再度スクレイピング」ボタンをクリックしてキャッシュをクリアしてください。

---

## 🔄 実際のSNS投稿での確認（最終確認）

### Twitter投稿テスト

1. Twitter（X）にログイン
2. 新規投稿を作成
3. ポートフォリオURLをペースト:
   ```
   https://tenormusica2024.github.io/portfolio/
   ```
4. プレビューカードが自動表示されることを確認
5. **投稿せずに確認だけでOK**（下書き保存可能）

**確認ポイント:**
- ✅ AIツールトレンド分析の画像が表示される
- ✅ タイトル・説明文が正しく表示される
- ✅ 画像が綺麗に表示される（切れていない）

### Facebook投稿テスト

1. Facebookにログイン
2. 新規投稿を作成
3. ポートフォリオURLをペースト:
   ```
   https://tenormusica2024.github.io/portfolio/
   ```
4. プレビューが自動表示されることを確認
5. **投稿せずに確認だけでOK**

---

## 📊 GA4イベント動作確認

### 手順1: Google Analytics（GA4）を開く

```
https://analytics.google.com/
```

プロパティ: **G-YJ1WP1J2NQ**

### 手順2: リアルタイムレポートを開く

**ナビゲーション:**
```
左メニュー > レポート > リアルタイム
```

### 手順3: ポートフォリオサイトでCTAボタンをクリック

別タブでポートフォリオサイトを開き、以下のボタンをクリック:

#### 📍 projects.html（プロジェクトページ）

1. **「制作依頼はこちら」ボタン**をクリック
   - 期待されるイベント: `cta_click`
   - event_category: `engagement`
   - event_label: `制作依頼CTA`
   - value: `1`

2. **「プロフィールを見る」ボタン**をクリック
   - 期待されるイベント: `cta_click`
   - event_category: `engagement`
   - event_label: `プロフィール閲覧CTA`
   - value: `1`

3. **各プロジェクトの「Live Demo」ボタン**をクリック
   - 期待されるイベント: `cta_click`
   - event_category: `project_demo`
   - event_label: `AIツールトレンド分析` / `Sound Platform` 等
   - value: `1`

4. **各プロジェクトの「GitHub」ボタン**をクリック
   - 期待されるイベント: `cta_click`
   - event_category: `project_github`
   - event_label: `AIツールトレンド分析` / `Sound Platform` 等
   - value: `1`

### 手順4: GA4リアルタイムレポートでイベントを確認

**GA4画面の確認箇所:**

1. **「イベント名（過去30分間）」セクション**
   - `cta_click` イベントが表示されていることを確認
   - クリック回数が増加していることを確認

2. **「イベント数（イベント名別）」セクション**
   - `cta_click` をクリック
   - パラメータ詳細を確認:
     - `event_category`
     - `event_label`
     - `value`

**期待される表示例:**
```
イベント名        | イベント数
-----------------|----------
cta_click        | 5
page_view        | 3
```

**詳細パラメータ（cta_clickをクリック後）:**
```
event_category   | event_label           | value
-----------------|----------------------|------
engagement       | 制作依頼CTA           | 1
engagement       | プロフィール閲覧CTA    | 1
project_demo     | AIツールトレンド分析   | 1
project_github   | Sound Platform        | 1
```

### 手順5: UTMパラメータの確認

**トラフィック獲得レポート**で確認:
```
左メニュー > レポート > ライフサイクル > 集客 > トラフィック獲得
```

**確認項目:**
- ソース: `portfolio`, `gallery`, `index` 等
- メディア: `cta`, `social`, `article` 等
- キャンペーン: `contact_request`, `view_profile`, `view_projects` 等

---

## 🚨 トラブルシューティング

### Twitter Card Validatorでエラーが出る

**原因:**
- Twitter Developer Accountが未作成
- OGP画像のURLが間違っている
- 画像サイズが不適切

**解決策:**
1. Twitter Developer Accountを作成（無料）
2. curlコマンドでOGP画像のアクセス確認:
   ```bash
   curl -I https://tenormusica2024.github.io/portfolio/ai-trend-dashboard.png
   ```
   - HTTP 200が返ることを確認

### Facebook Sharing Debuggerで画像が表示されない

**原因:**
- Facebookのキャッシュが残っている
- OGP画像のパスが間違っている

**解決策:**
1. 「再度スクレイピング」ボタンを**複数回**クリック
2. 5分待機してから再度確認
3. curlコマンドで画像アクセス確認

### GA4でイベントが表示されない

**原因:**
- GA4タグが正しく設定されていない
- イベント名のスペルミス
- ブラウザの広告ブロッカーが有効

**解決策:**
1. ブラウザのコンソールを開く（F12）
2. 以下のエラーがないか確認:
   ```
   gtag is not defined
   ```
3. 広告ブロッカーを一時的に無効化
4. シークレットモードで再度テスト
5. 5-10分待機してからリアルタイムレポート再確認

### GA4リアルタイムレポートに自分のアクセスが表示されない

**原因:**
- Internal Traffic Filter（内部トラフィック除外）が有効
- IPアドレスが除外設定されている

**解決策:**
1. GA4の「管理」→「データストリーム」→「ウェブストリームの詳細」を開く
2. 「拡張計測機能」が有効になっていることを確認
3. 別のネットワーク（スマホ4G等）でテスト

---

## ✅ 確認完了後のレポート

確認が完了したら、以下の情報をまとめてください:

### OGP確認結果

- [ ] Twitter Card Validator: 正常表示 / エラー発生
- [ ] Facebook Sharing Debugger: 正常表示 / エラー発生
- [ ] 実際のTwitter投稿: 正常表示 / エラー発生
- [ ] 実際のFacebook投稿: 正常表示 / エラー発生

**スクリーンショット:** （各ツールのスクリーンショットを添付）

### GA4イベント確認結果

- [ ] cta_clickイベント計測: 成功 / 失敗
- [ ] イベントパラメータ: 正常 / 異常
- [ ] UTMパラメータ: 正常 / 異常

**GA4スクリーンショット:** （リアルタイムレポートのスクリーンショットを添付）

---

## 📝 確認完了後の次のステップ

### 即座実施（確認完了後）
- [ ] OGP/GA4確認結果をClaude Codeに報告
- [ ] 問題があれば修正依頼
- [ ] 問題なければタスク完了マーク

### 1週間後確認
- [ ] GA4「探索」レポートでイベント蓄積データ確認
- [ ] CTAボタンのクリック率分析
- [ ] 流入経路別のコンバージョン率確認

### 1ヶ月後確認
- [ ] SNSからの流入数測定
- [ ] OGP画像のCTR（クリック率）分析
- [ ] 改善施策の検討

---

**最終更新**: 2025年11月27日  
**作成者**: Claude Code (AI Assistant)  
**レビュー**: Urayaha Days
