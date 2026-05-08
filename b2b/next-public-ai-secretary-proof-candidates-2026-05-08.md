# Next Public AI Secretary Proof Candidates 2026-05-08

目的: 既存6本の公開AI秘書proofを踏まえて、次に進めるべき残タスクを sample-first / public-safe / B2B説明力の観点で順位化する。

更新メモ:
- `Support Ticket Triage Assistant Proof` は `support-ticket-triage-proof` として実装・公開済み。
- `Schedule Digest Assistant Proof` は `schedule-digest-assistant-proof` として実装・公開済み。
- `Reminder Confirmation Assistant Proof` は `reminder-confirmation-assistant-proof` として実装・公開済み。
- `Meeting Prep Assistant Proof` は `meeting-prep-assistant-proof` として実装・公開済み。
- `B2B掲載構成の整理` は `b2b/public-ai-secretary-proof-section-plan-2026-05-08.md` として作成済み。
- `B2B UI用の最終3カード文案` は `b2b/public-ai-secretary-proof-final-card-copy-2026-05-08.md` として作成済み。
- これでAI秘書の公開proofは、意思決定・メール整理・問い合わせ整理・予定整理・リマインダー確認・会議準備の6本になった。

## 完成済み基準線

- `daily-decision-assistant-proof`: 意思決定briefと確認キュー
- `gmail-triage-assistant-proof`: mailbox triageとdraft-only reply
- `support-ticket-triage-proof`: support ticket / inquiry triage
- `schedule-digest-assistant-proof`: 日次予定digestと準備漏れ防止
- `reminder-confirmation-assistant-proof`: リマインダー候補の送信前レビュー
- `meeting-prep-assistant-proof`: 会議前briefと確認事項整理

## 次の推奨順位

### 1. UI反映前のproof index / 横断README作成

概要:
- 6本のrepoリンク、役割、安全境界、確認キューの違いを1枚にまとめる。
- B2B UIにはまだ触らず、リンク集兼説明資産としてdocsに置く。
- 最終3カード文案から参照できる補助資料にする。

なぜ次候補として強いか:
- 6本の成果を一つの説明資産にまとめやすい。
- B2B掲載文案、提案資料、GitHub紹介文へ転用できる。
- UI反映前でも安全に進められる。

ガード:
- 本番UI・CTA・レイアウト変更はまだ行わない。
- proof indexを作る場合も、公開repo URLと一般化した説明だけに留める。

### 2. B2B UI反映

概要:
- `public-ai-secretary-proof-final-card-copy-2026-05-08.md` の代表3カードをB2B UIへ反映する。
- local / production URL のdesktop・mobile目視確認を必須にする。

良い点:
- proof群を実際のB2Bポートフォリオで見せられる。

懸念:
- UI変更は目視確認が必要。
- 目視確認できない状況では避ける。

## 結論

次に着手するなら `UI反映前のproof index / 横断README作成` が最適。

理由:
- final-card-copyは作成済みで、UI実装に入る前の補助資料を整える段階。
- UI本体を触らず、6本の役割と安全境界を一覧化できる。
- 代表3カードだけでは拾いきれない残り3本の価値も説明できる。

## 次の実装一手

1. `b2b/public-ai-secretary-proof-index-2026-05-08.md` を作る。
2. 6本のrepo URL、役割、安全境界、使いどころを1表にまとめる。
3. 代表3本と補助3本の違いを明記する。
4. UI反映は別タスクとして残す。
