# UTMパラメータ付きURL一覧ガイド

## 📊 概要
このドキュメントは、SNS投稿・記事・外部サイトでポートフォリオを紹介する際に使用するUTMパラメータ付きURLの一覧です。
Google Analytics（GA4）で流入経路を正確に追跡するために、各URL末尾にUTMパラメータを追加しています。

## 🎯 UTMパラメータの基本構造

```
?utm_source=<流入元>&utm_medium=<媒体>&utm_campaign=<キャンペーン名>
```

- **utm_source**: 流入元（twitter, zenn, github, linkedin等）
- **utm_medium**: 媒体タイプ（social, article, profile, email等）
- **utm_campaign**: キャンペーン識別子（具体的な目的や内容）

---

## 🔗 ポートフォリオトップページ用URL

### Twitter（X）投稿用
```
https://tenormusica2024.github.io/portfolio/?utm_source=twitter&utm_medium=social&utm_campaign=portfolio_2025
```

### Zenn記事用
```
https://tenormusica2024.github.io/portfolio/?utm_source=zenn&utm_medium=article&utm_campaign=ai_development
```

### GitHub Profile用
```
https://tenormusica2024.github.io/portfolio/?utm_source=github&utm_medium=profile&utm_campaign=portfolio_link
```

### LinkedIn投稿用
```
https://tenormusica2024.github.io/portfolio/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio_share
```

### Qiita記事用
```
https://tenormusica2024.github.io/portfolio/?utm_source=qiita&utm_medium=article&utm_campaign=technical_showcase
```

### Note記事用
```
https://tenormusica2024.github.io/portfolio/?utm_source=note&utm_medium=article&utm_campaign=portfolio_intro
```

---

## 📁 プロジェクトページ用URL

### Twitter投稿用（プロジェクト紹介）
```
https://tenormusica2024.github.io/portfolio/projects.html?utm_source=twitter&utm_medium=social&utm_campaign=project_showcase
```

### Zenn記事用（技術解説）
```
https://tenormusica2024.github.io/portfolio/projects.html?utm_source=zenn&utm_medium=article&utm_campaign=sound_platform_intro
```

---

## 👤 プロフィールページ用URL

### LinkedIn経由
```
https://tenormusica2024.github.io/portfolio/profile.html?utm_source=linkedin&utm_medium=profile&utm_campaign=professional_profile
```

### 企業応募メール用
```
https://tenormusica2024.github.io/portfolio/profile.html?utm_source=email&utm_medium=application&utm_campaign=job_application
```

---

## 🎨 特定プロジェクトへの直リンク

### Sound Platform紹介（Twitter）
```
https://tenormusica2024.github.io/portfolio/projects.html#section-ai-dev?utm_source=twitter&utm_medium=social&utm_campaign=sound_platform_feature
```

### AIツールトレンド分析紹介（Zenn）
```
https://tenormusica2024.github.io/portfolio/projects.html#section-data-viz?utm_source=zenn&utm_medium=article&utm_campaign=ai_trend_analysis
```

---

## 📧 お問い合わせページ用URL

### Twitter経由の制作依頼導線
```
https://tenormusica2024.github.io/portfolio/index.html#contact?utm_source=twitter&utm_medium=social&utm_campaign=contact_inquiry
```

### Zenn記事経由の制作依頼導線
```
https://tenormusica2024.github.io/portfolio/index.html#contact?utm_source=zenn&utm_medium=article&utm_campaign=project_request
```

---

## 📊 GA4で確認できるイベント

以下のイベントがGA4で自動計測されます：

### CTAクリックイベント
- **event_name**: `cta_click`
- **event_category**: `engagement` / `project_demo` / `project_github`
- **event_label**: クリックされたボタンの内容（例：「制作依頼CTA」「Sound Platform_Live」）

### 計測されるCTAボタン
1. ページ上部「制作依頼はこちら」ボタン
2. ページ上部「プロフィールを見る」ボタン
3. 各プロジェクトカードの「Live Demo」「Dashboard」リンク
4. 各プロジェクトカードの「GitHub」リンク

---

## 🚀 使用方法

1. **SNS投稿時**: 上記のUTMパラメータ付きURLをそのままコピー＆ペースト
2. **記事執筆時**: 記事の種類（Zenn/Qiita/Note等）に応じたURLを選択
3. **メール送信時**: 企業応募メール用URLを使用

---

## 📈 効果測定の方法

### Google Analytics（GA4）での確認手順
1. GA4ダッシュボードにログイン
2. 「レポート」→「集客」→「トラフィック獲得」を選択
3. 「セッションのデフォルト チャネル グループ」を「セッションの参照元/メディア」に変更
4. UTMパラメータごとの流入数・滞在時間・コンバージョン率を確認

### CTAクリック率の確認
1. GA4ダッシュボード →「イベント」
2. イベント名「cta_click」を検索
3. 「event_label」でどのCTAが最も効果的か分析

---

## 💡 推奨設定

### 優先度の高いUTM設定
1. **Twitter投稿**: 最も頻繁に使用するため、すべてのプロフィールリンクに設定
2. **Zenn記事**: 技術記事経由の流入は質が高いため、記事ごとに個別のcampaign名を設定
3. **GitHub Profile**: README.mdのポートフォリオリンクに設定

### 定期的な見直し
- 月1回：GA4データを確認し、効果的な流入経路を特定
- 四半期ごと：campaign名を見直し、新しいマーケティング施策に対応

---

## 🔍 トラブルシューティング

### UTMパラメータが反映されない場合
- URLの最初のパラメータは `?` で開始
- 2つ目以降のパラメータは `&` で連結
- URLエンコードが必要な文字（日本語等）は使用しない

### GA4でデータが表示されない場合
- GA4トラッキングコードが正しく設置されているか確認
- リアルタイムレポートで即座に反映されるか確認
- プライバシー設定やAdBlockerでブロックされていないか確認

---

**最終更新**: 2025年11月27日  
**作成者**: Claude Code (AI Assistant)  
**目的**: ポートフォリオサイトの集客力改善・効果測定の自動化
