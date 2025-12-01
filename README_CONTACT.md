# お問い合わせフォーム セットアップ完了ガイド

## ✅ 完成した内容

### 📄 作成ファイル
1. **contact.html** - お問い合わせフォームページ
2. **EMAILJS_SETUP.md** - EmailJS設定手順書
3. **README_CONTACT.md** - このファイル

### 🎨 デザイン
- **カード型デザイン**: 既存ポートフォリオと統一
- **レスポンシブ対応**: モバイル・デスクトップ両対応
- **アニメーション**: フォーカス時のボーダー発光、ホバーエフェクト
- **多言語対応**: 日本語/英語切り替え準備完了

### 🔧 実装機能
- ✅ 名前・メールアドレス・件名・メッセージ入力
- ✅ 件名セレクト（プロジェクト相談/採用・求人/技術的な質問/その他）
- ✅ 送信成功・エラーメッセージ表示
- ✅ バリデーション（必須項目チェック）
- ✅ 送信中のボタン無効化
- ✅ レスポンス時間表示（24 hours）
- ✅ 直接メールアドレス表示

### 📍 ナビゲーション更新
- ✅ index.html にContactリンク追加
- ✅ projects.html にContactリンク追加
- ✅ profile.html にContactリンク追加
- ✅ 多言語翻訳キー追加（日本語/英語）

---

## 🚀 次にやること（必須）

### 1. EmailJSアカウント作成・設定

**所要時間**: 約10-15分

1. https://www.emailjs.com/ でアカウント登録
2. Email Service追加（Gmailを推奨）
3. Email Template作成（テンプレート内容は `EMAILJS_SETUP.md` 参照）
4. Public Key, Service ID, Template ID を取得

### 2. contact.html の設定値書き換え

`contact.html` の以下の3箇所を自分の値に書き換えてください:

```javascript
// 📍 contact.html の 225-227行目あたり
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';      // ← ここにPublic Keyを入力
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';      // ← ここにService IDを入力
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';    // ← ここにTemplate IDを入力
```

### 3. 動作確認

1. `contact.html` をブラウザで開く
2. テストメッセージを送信
3. 登録したGmailにメールが届くか確認

### 4. GitHub Pagesにデプロイ

```bash
cd C:\Users\Tenormusica\portfolio
git add contact.html index.html projects.html profile.html EMAILJS_SETUP.md README_CONTACT.md
git commit -m "Add contact form with EmailJS integration"
git push origin main
```

### 5. 本番環境で確認

https://tenormusica2024.github.io/portfolio/contact.html

---

## 📖 詳細設定手順

`EMAILJS_SETUP.md` を参照してください。

---

## 🎯 設定例（参考）

```javascript
// 例（実際の値は異なります）
const EMAILJS_PUBLIC_KEY = 'xA9B2cD3eF4gH5iJ6';
const EMAILJS_SERVICE_ID = 'service_abc1234';
const EMAILJS_TEMPLATE_ID = 'template_xyz5678';
```

---

## 🚨 トラブルシューティング

### メールが届かない
1. EmailJSダッシュボードで「Usage」確認（送信履歴）
2. Gmailの迷惑メールフォルダ確認
3. Service ID/Template IDが正しいか確認

### エラーメッセージが表示される
1. ブラウザのコンソールでエラー内容確認
2. Public Key/Service ID/Template IDの再確認
3. EmailJS無料プランの上限（月200件）を超えていないか確認

### 設定が未完了の警告が出る
```
⚠️ EmailJSの設定が未完了です。EMAILJS_SETUP.mdを参照して設定してください。
```
→ contact.html の設定値を書き換えてください

---

## 📊 EmailJS無料プランの制限

- **月200件まで**: 個人ポートフォリオには十分
- **2つのEmailサービス**: Gmail + Outlookなど
- **カスタムテンプレート**: 無制限

---

## 💡 今後の拡張案（オプション）

### 高優先度
- [ ] reCAPTCHA スパム対策追加
- [ ] 自動返信メール設定
- [ ] お問い合わせ履歴のデータベース保存

### 中優先度
- [ ] ファイルアップロード機能
- [ ] カテゴリ別の自動振り分け
- [ ] Slack/Discord通知連携

### 低優先度
- [ ] お問い合わせ統計ダッシュボード
- [ ] 返信テンプレート機能
- [ ] マルチステップフォーム

---

## 🎬 まとめ

✅ **完成した機能**:
- カード型お問い合わせフォーム
- EmailJS連携（設定値書き換え必要）
- ナビゲーションリンク追加
- 多言語対応準備
- エラーハンドリング

✅ **次のステップ**:
1. EmailJSアカウント作成（10分）
2. contact.html設定値書き換え（2分）
3. テスト送信（1分）
4. GitHub Pagesデプロイ（5分）

**合計所要時間**: 約20分で完全セットアップ完了♡

---

⏰ 作成日: 2025-12-01 18:45  
💻 作成者: Claude Code  
🎯 ステータス: セットアップ準備完了（EmailJS設定待ち）
