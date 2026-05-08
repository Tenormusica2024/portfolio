# Next Public AI Secretary Proof Candidates 2026-05-08

目的: `daily-decision-assistant-proof` と `gmail-triage-assistant-proof` の次に作る公開AI秘書proof候補を、sample-first / public-safe / B2B説明力の観点で順位化する。

前提:
- private実装を直接コピーしない。
- 実メール、実予定、実チケット、実顧客データを使わない。
- 外部操作は自動実行せず、confirmation queueへ分離する。
- 初期repoは README / samples / outputs / src / tests / docs / public boundary check / CI を最小構成にする。

## 推奨順位

### 1. Support Ticket Triage Assistant Proof

公開名候補:
- `support-ticket-triage-proof`
- `issue-triage-assistant-proof`

概要:
- sample issue / support ticket を urgent / needs-reply / backlog / blocked に分類する。
- 返信案や次アクション案は作るが、ticket更新・コメント投稿・ラベル変更はしない。
- 外部更新が必要なものは confirmation queue に入れる。

なぜ最優先か:
- 既存の Gmail triage proof と構造が近く、実装コストが低い。
- B2Bで「問い合わせ・タスク・保守依頼の一次整理」として説明しやすい。
- 特定のissue管理ツール固有にしすぎず、support ticket / inquiry intake として汎用化できる。
- 外部操作分離の価値が明確。

最小サンプル:
- 障害報告
- 仕様確認
- 低優先の改善要望
- blocker付き依頼
- 返信前に人間確認が必要な問い合わせ

注意:
- repo名やREADMEでは特定のissue管理ツール固有に寄せすぎない。
- `support ticket` / `inquiry` / `work request` でも通じる表現にする。

### 2. Schedule Digest Assistant Proof

公開名候補:
- `schedule-digest-assistant-proof`
- `daily-schedule-brief-proof`

概要:
- sample schedule / deadline / travel buffer / preparation task を日次digestへ整理する。
- 予定変更や通知送信はしない。
- 変更提案や確認が必要な予定は confirmation queue に入れる。

良い点:
- AI秘書らしさが分かりやすい。
- daily-decision proof と接続しやすい。
- 「予定を勝手に変えない」安全境界を説明しやすい。

懸念:
- Calendar連携に見えやすく、OAuthや実カレンダー連携の説明に引っ張られやすい。
- daily-decision proofとの差分を明確にしないと重複して見える。

### 3. Reminder Confirmation Assistant Proof

公開名候補:
- `reminder-confirmation-assistant-proof`
- `follow-up-reminder-proof`

概要:
- sample reminder candidates を send / hold / skip に分ける。
- 通知送信はせず、送る候補を confirmation queue に入れる。
- reminder理由、期限、相手、必要確認を出す。

良い点:
- シンプルで短時間にrepo化しやすい。
- no-send / confirmation queue の価値が明確。
- B2Bではフォローアップ漏れ防止として説明しやすい。

懸念:
- 単体だと機能が小さく、proofとしての見栄えはIssue triageより弱い。
- 相手や連絡先が絡むため、サンプルデータの匿名性に注意が必要。

### 4. Meeting Prep Assistant Proof

公開名候補:
- `meeting-prep-assistant-proof`
- `meeting-brief-assistant-proof`

概要:
- sample agenda / participants / open questions / previous notes を会議前ブリーフに整理する。
- 参加者への送信やカレンダー更新はしない。
- 確認が必要な質問や送付物だけ confirmation queue へ入れる。

良い点:
- 業務利用イメージが強い。
- B2Bで「会議前準備の型」として説明しやすい。

懸念:
- previous notes がprivate knowledge-base依存に見えやすい。
- 個人固有の会議運用に寄ると公開proofとして弱くなる。

## 結論

次に着手するなら `Support Ticket Triage Assistant Proof` が最適。

理由:
- Gmail proofの分類・返信案・確認キューのパターンを再利用できる。
- daily-decision proofより具体的なB2B業務シーンに近い。
- private knowledge-baseや実アカウント連携に依存しない。
- サンプルデータだけで価値が伝わる。
- 30〜90分で最小repo化しやすい。

## 次の実装一手

1. public repo名は第一候補を `support-ticket-triage-proof`、代替候補を `issue-triage-assistant-proof` として決める。
2. sample tickets を5件作る。
3. categoriesを `urgent`, `needs_reply`, `backlog`, `blocked`, `no_action` にする。
4. action-worthy item は confirmation queue に入れる。
5. README / privacy-boundary / public-export-checklist / showcase-copy / public boundary check / pytest CI を既存2repoの型で作る。

## B2B掲載前ガード

- 初期repo完成後、`v0.1.0` releaseを作る。
- topics は `ai-secretary`, `public-proof`, `showcase-proof`, `human-in-the-loop`, `confirmation-queue`, `python` を基本にする。
- B2B本番UIへはすぐ載せず、まずcopy draftだけ作る。
