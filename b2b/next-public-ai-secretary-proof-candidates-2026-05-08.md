# Next Public AI Secretary Proof Candidates 2026-05-08

目的: 既存5本の公開AI秘書proofの次に作る候補を、sample-first / public-safe / B2B説明力の観点で順位化する。

更新メモ:
- `Support Ticket Triage Assistant Proof` は `support-ticket-triage-proof` として実装・公開済み。
- `Schedule Digest Assistant Proof` は `schedule-digest-assistant-proof` として実装・公開済み。
- `Reminder Confirmation Assistant Proof` は `reminder-confirmation-assistant-proof` として実装・公開済み。
- 以後の候補は、既存5本との差分が明確で、かつ公開境界を単純に保てるものを優先する。

## 完成済み基準線

- `daily-decision-assistant-proof`: 意思決定briefと確認キュー
- `gmail-triage-assistant-proof`: mailbox triageとdraft-only reply
- `support-ticket-triage-proof`: support ticket / inquiry triage
- `schedule-digest-assistant-proof`: 日次予定digestと準備漏れ防止
- `reminder-confirmation-assistant-proof`: リマインダー候補の送信前レビュー

以後の候補では、「sample-first」「実サービス連携を主役にしない」「外部操作なし」「確認キュー分離」「公開境界チェック」を最低基準にする。

## 次の推奨順位

### 1. Meeting Prep Assistant Proof

公開名候補:
- `meeting-prep-assistant-proof`
- `meeting-brief-assistant-proof`

概要:
- sample agenda / participants / open questions / previous notes を会議前ブリーフに整理する。
- 参加者への送信やカレンダー更新はしない。
- 確認が必要な質問や送付物だけ confirmation queue へ入れる。

なぜ次候補として強いか:
- 既存5本と並べた時に、AI秘書の用途が「会議前準備」まで広がる。
- B2Bで「会議前に論点・未確認事項・送付前確認を整理する型」として説明しやすい。
- 外部送信やカレンダー更新をconfirmation queueへ分離すれば、安全境界を維持しやすい。

懸念:
- previous notes がprivate knowledge-base依存に見えやすい。
- 個人固有の会議運用に寄ると公開proofとして弱くなる。
- sample notes を使う場合は、実会議ログ風にしすぎない。

## 結論

次に着手するなら `Meeting Prep Assistant Proof` が最適。

理由:
- 既存5本で意思決定・メール・問い合わせ・予定・リマインダーは揃ったため、次は会議準備が自然な拡張になる。
- sample agenda と sample open questions だけで成立し、実会議ログや実参加者情報を使わずに公開proof化できる。
- B2Bでは会議前準備の抜け漏れ防止として説明しやすい。

## 次の実装一手

1. public repo名は第一候補を `meeting-prep-assistant-proof`、代替候補を `meeting-brief-assistant-proof` として決める。
2. sample meetings を5件前後作る。
3. 出力カテゴリを `ready`, `needs_agenda`, `needs_context`, `needs_confirmation`, `send_later` にする。
4. 参加者への送付・カレンダー更新が必要なものは confirmation queue に入れる。
5. README / privacy-boundary / public-export-checklist / showcase-copy / public boundary check / pytest CI を既存5repoの型で作る。

## B2B掲載前ガード

- 初期repo完成後、`v0.1.0` releaseを作る。
- topics は `ai-secretary`, `public-proof`, `showcase-proof`, `human-in-the-loop`, `confirmation-queue`, `python` を基本にする。
- B2B本番UIへはすぐ載せず、まずcopy draftだけ作る。
- UI反映は、desktop / mobile / production URLで目視確認できるタイミングに分離する。
