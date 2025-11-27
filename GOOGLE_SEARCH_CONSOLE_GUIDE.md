# Google Search Console 登録ガイド

**作成日**: 2025年11月27日  
**対象サイト**: https://tenormusica2024.github.io/portfolio/  
**目的**: SEO効果測定・検索パフォーマンス分析・sitemap.xml送信

---

## 📋 事前準備

### 必須項目
- Googleアカウント（tenormusica7@gmail.com 推奨）
- GitHub Pages デプロイ済み（✅ 完了）
- sitemap.xml 作成済み（✅ 完了）
- robots.txt 作成済み（✅ 完了）

---

## 🚀 登録手順（全7ステップ）

### ステップ1: Google Search Console にアクセス

1. ブラウザで以下にアクセス:
   ```
   https://search.google.com/search-console
   ```

2. Googleアカウントでログイン
   - 推奨アカウント: `tenormusica7@gmail.com`

---

### ステップ2: プロパティの追加

1. 左上の「プロパティを追加」をクリック

2. プロパティタイプを選択:
   - **「URLプレフィックス」を選択**（推奨）
   - 入力するURL: `https://tenormusica2024.github.io/portfolio/`
   - ⚠️ 末尾の `/` を忘れずに入力

3. 「続行」をクリック

---

### ステップ3: 所有権の確認（GitHub Pages 向け）

GitHub Pages の場合、**HTMLファイルアップロード方式**が最も確実です。

#### 方法1: HTMLファイルアップロード（推奨）

1. Google Search Console が HTML確認ファイルをダウンロードリンク表示
   - ファイル名例: `google1234567890abcdef.html`

2. このファイルを portfolio リポジトリのルートディレクトリに配置:
   ```
   portfolio/
   ├── google1234567890abcdef.html  ← 追加
   ├── index.html
   ├── projects.html
   └── ...
   ```

3. Git commit & push:
   ```bash
   git add google1234567890abcdef.html
   git commit -m "Google Search Console所有権確認ファイル追加"
   git push origin main
   ```

4. GitHub Pages デプロイ完了後（約1-2分）、Google Search Console で「確認」ボタンをクリック

5. 確認成功メッセージが表示されれば完了 ✅

#### 方法2: HTMLタグ（メタタグ）

1. Google が提供する `<meta>` タグをコピー:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXX" />
   ```

2. `index.html` の `<head>` セクション内に追加:
   ```html
   <head>
       <!-- Google Search Console verification -->
       <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXX" />
       
       <!-- 他のメタタグ -->
       <meta charset="UTF-8">
       ...
   </head>
   ```

3. Git commit & push

4. デプロイ完了後、Google Search Console で「確認」ボタンをクリック

---

### ステップ4: sitemap.xml の送信

1. 左メニューから「サイトマップ」をクリック

2. 「新しいサイトマップの追加」に以下を入力:
   ```
   https://tenormusica2024.github.io/portfolio/sitemap.xml
   ```

3. 「送信」ボタンをクリック

4. ステータスが「成功しました」になるまで待機（数分〜数時間）

---

### ステップ5: robots.txt の確認

1. 左メニューから「設定」→「クロール」→「robots.txt テスター」を選択

2. 以下のURLでテスト:
   ```
   https://tenormusica2024.github.io/portfolio/robots.txt
   ```

3. 「取得」ボタンをクリック

4. 結果を確認:
   - ✅ 正常: robots.txt の内容が表示される
   - ❌ エラー: 404エラーが表示される場合はファイル配置を確認

---

### ステップ6: インデックス登録のリクエスト

1. 左メニューから「URL検査」をクリック

2. 以下のURLを入力してテスト:
   ```
   https://tenormusica2024.github.io/portfolio/
   https://tenormusica2024.github.io/portfolio/projects.html
   https://tenormusica2024.github.io/portfolio/profile.html
   ```

3. 各ページで「インデックス登録をリクエスト」をクリック

4. 数日〜1週間でインデックスに登録される

---

### ステップ7: 初期設定完了の確認

#### 確認すべき項目:

1. **プロパティ所有権**: ✅ 確認済み
2. **sitemap.xml**: ✅ 送信済み・ステータス「成功」
3. **robots.txt**: ✅ 正常に取得可能
4. **インデックス登録**: ⏳ リクエスト済み（数日待機）

---

## 📊 効果測定方法（登録後1-2週間以降）

### 1. 検索パフォーマンスの確認

1. 左メニューから「検索パフォーマンス」をクリック

2. 確認できるデータ:
   - **クリック数**: 検索結果からサイトへのクリック数
   - **表示回数**: Google検索結果に表示された回数
   - **平均CTR**: クリック率（クリック数 / 表示回数）
   - **平均掲載順位**: Google検索での平均順位

3. フィルタ機能:
   - **クエリ**: どの検索キーワードで表示されたか
   - **ページ**: どのページが表示されたか
   - **国**: どの国からのアクセスか
   - **デバイス**: PC/モバイル/タブレット

---

### 2. インデックス カバレッジの確認

1. 左メニューから「インデックス作成」→「ページ」をクリック

2. 確認できるデータ:
   - **インデックス登録済み**: Googleにインデックスされたページ数
   - **インデックス未登録**: インデックスされていないページとその理由
   - **エラー**: インデックス登録時のエラー

3. 理想的な状態:
   - 全8ページがインデックス登録済み
   - エラー: 0件
   - 除外ファイル（robots.txt指定）は「インデックス未登録」として正常

---

### 3. 構造化データの確認

1. 左メニューから「拡張」をクリック

2. 確認できるデータ:
   - **Person型**: プロフィール情報が正しく認識されているか
   - **WebSite型**: サイト情報が正しく認識されているか
   - **CollectionPage型**: プロジェクト一覧が正しく認識されているか

3. エラーがある場合:
   - Schema.org Validator で再検証
   - JSON-LD の構文エラーを修正

---

### 4. リッチスニペットの確認

1. Google検索で以下を検索:
   ```
   site:tenormusica2024.github.io/portfolio/
   ```

2. 確認すべきポイント:
   - タイトルが正しく表示されているか
   - OGP画像が表示されているか（Twitter/Facebook）
   - プロフィール情報がリッチスニペットとして表示されているか
   - ⚠️ リッチスニペット表示には数週間〜数ヶ月かかる場合あり

---

## 🎯 目標KPI（登録後3ヶ月）

### 定量的目標:

| 指標 | 現状 | 1ヶ月後目標 | 3ヶ月後目標 |
|------|------|-------------|-------------|
| インデックス数 | 0ページ | 8ページ | 8ページ |
| 検索表示回数 | 0回 | 100回 | 500回 |
| クリック数 | 0回 | 10回 | 50回 |
| 平均CTR | - | 5% | 8% |
| 平均掲載順位 | - | 30位 | 15位 |

### 定性的目標:

- ✅ リッチスニペット表示（Person型）
- ✅ ナレッジグラフ掲載（長期目標）
- ✅ 「AI エンジニア ポートフォリオ」で上位表示

---

## ⚠️ よくあるトラブルシューティング

### 問題1: 所有権確認ができない

**原因:**
- HTMLファイルが正しく配置されていない
- GitHub Pages デプロイが完了していない
- キャッシュが残っている

**解決策:**
1. HTMLファイルのパスを確認: `portfolio/google*.html`
2. ブラウザで直接アクセス: `https://tenormusica2024.github.io/portfolio/google*.html`
3. 200ステータスコードが返ることを確認
4. キャッシュクリア（Ctrl+Shift+R）

---

### 問題2: sitemap.xmlが「取得できませんでした」

**原因:**
- sitemap.xmlのパスが間違っている
- ファイルの構文エラー
- robots.txtで除外されている

**解決策:**
1. ブラウザで直接アクセス: `https://tenormusica2024.github.io/portfolio/sitemap.xml`
2. XML構文エラーを確認（ブラウザでエラー表示される）
3. robots.txtで `Disallow: /sitemap.xml` がないことを確認

---

### 問題3: インデックス登録が進まない

**原因:**
- サイトが新しすぎる（Googleのクロール待ち）
- robots.txtで除外されている
- noindex タグが設定されている

**解決策:**
1. 「URL検査」から手動でインデックス登録リクエスト
2. robots.txtで `Allow: /` が設定されていることを確認
3. HTMLに `<meta name="robots" content="noindex">` がないことを確認
4. 1-2週間待機（通常のクロール頻度）

---

## 📝 登録完了後のチェックリスト

### 即座実施（登録当日）:
- [ ] Google Search Console プロパティ追加完了
- [ ] 所有権確認完了
- [ ] sitemap.xml 送信完了
- [ ] robots.txt テスター実行完了
- [ ] 主要ページのインデックス登録リクエスト完了

### 1週間後:
- [ ] インデックス数の確認（目標: 3ページ以上）
- [ ] sitemap.xml ステータス確認（「成功しました」）
- [ ] エラー・警告の確認（0件が理想）

### 1ヶ月後:
- [ ] 検索パフォーマンスデータ確認（表示回数・クリック数）
- [ ] インデックス カバレッジ確認（全8ページ登録済み）
- [ ] 構造化データの確認（エラー: 0件）

### 3ヶ月後:
- [ ] 検索順位の推移確認
- [ ] リッチスニペット表示確認
- [ ] CTR改善施策の検討
- [ ] SEO最適化の効果測定レポート作成

---

## 🔗 参考リンク

- Google Search Console: https://search.google.com/search-console
- Google 検索セントラル: https://developers.google.com/search
- sitemap.xml 仕様: https://www.sitemaps.org/
- robots.txt 仕様: https://www.robotstxt.org/
- Schema.org: https://schema.org/

---

**最終更新**: 2025年11月27日  
**作成者**: Claude Code (AI Assistant)  
**レビュー**: Urayaha Days
