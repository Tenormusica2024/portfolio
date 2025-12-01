# EmailJS セットアップガイド

## 📧 EmailJS アカウント作成・設定手順

### 1. アカウント登録
1. https://www.emailjs.com/ にアクセス
2. 「Sign Up Free」をクリック
3. メールアドレスで登録（Googleアカウントでも可）
4. メール認証を完了

### 2. Email Service 追加
1. ダッシュボードで「Add New Service」をクリック
2. **Gmail** を選択（または使用したいメールサービス）
3. 「Connect Account」でGmailアカウントを接続
4. Service ID をメモ（例: `service_xxxxxxx`）

### 3. Email Template 作成
1. 「Email Templates」タブを開く
2. 「Create New Template」をクリック
3. 以下の内容を設定:

**Template Name**: `contact_form`

**Subject**: 
```
【ポートフォリオお問い合わせ】{{subject}}
```

**Content (HTML)**:
```html
<p>以下の内容でお問い合わせがありました。</p>

<h3>お問い合わせ内容</h3>
<p><strong>お名前:</strong> {{from_name}}</p>
<p><strong>メールアドレス:</strong> {{reply_to}}</p>
<p><strong>件名:</strong> {{subject}}</p>

<h3>メッセージ:</h3>
<p>{{message}}</p>

<hr>
<p><small>このメールはポートフォリオサイトのお問い合わせフォームから送信されました。</small></p>
```

4. Template ID をメモ（例: `template_xxxxxxx`）

### 4. Public Key 取得
1. 「Account」→「General」タブを開く
2. Public Key をメモ（例: `xxxxxxxxxxxxxxxxxxx`）

### 5. contact.html に設定を反映

`contact.html` の以下の部分を自分の情報に書き換えてください:

```javascript
emailjs.init('YOUR_PUBLIC_KEY');  // ← ここに Public Key

emailjs.send(
    'YOUR_SERVICE_ID',     // ← ここに Service ID
    'YOUR_TEMPLATE_ID',    // ← ここに Template ID
    {
        from_name: name,
        reply_to: email,
        subject: subject,
        message: message
    }
)
```

### 6. 動作確認
1. `contact.html` をブラウザで開く
2. テストメッセージを送信
3. 登録したGmailにメールが届くか確認

---

## 🔑 設定値の例

```javascript
// 例（実際の値は異なります）
emailjs.init('xA9B2cD3eF4gH5iJ6');

emailjs.send(
    'service_abc1234',
    'template_xyz5678',
    templateParams
)
```

---

## 🚨 トラブルシューティング

### メールが届かない場合
1. EmailJSダッシュボードで「Usage」を確認（送信履歴）
2. Gmailの迷惑メールフォルダを確認
3. Service IDとTemplate IDが正しいか確認
4. Public Keyが正しいか確認

### エラーが出る場合
1. ブラウザのコンソールでエラー内容を確認
2. EmailJSの無料プランは月200件まで（超えてないか確認）
3. CORSエラーの場合 → EmailJSダッシュボードでドメイン設定確認

---

## 📊 EmailJS 無料プランの制限
- **月200件まで**: 個人ポートフォリオには十分
- **2つのEmailサービス**: Gmail + Outlookなど
- **カスタムテンプレート**: 無制限

---

## 🎯 次のステップ

設定完了後:
1. ✅ `contact.html` に設定値を反映
2. ✅ テスト送信で動作確認
3. ✅ index.html のナビゲーションに「Contact」リンク追加
4. ✅ GitHub Pages にデプロイ

---

⏰ 作成日: 2025-12-01  
💻 作成者: Claude Code
