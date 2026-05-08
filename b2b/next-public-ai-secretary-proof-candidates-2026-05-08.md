# Next Public AI Secretary Proof Candidates 2026-05-08

目的: 既存6本の公開AI秘書proofを踏まえて、次に進めるべき残タスクを sample-first / public-safe / B2B説明力の観点で順位化する。

更新メモ:
- `Support Ticket Triage Assistant Proof` は `support-ticket-triage-proof` として実装・公開済み。
- `Schedule Digest Assistant Proof` は `schedule-digest-assistant-proof` として実装・公開済み。
- `Reminder Confirmation Assistant Proof` は `reminder-confirmation-assistant-proof` として実装・公開済み。
- `Meeting Prep Assistant Proof` は `meeting-prep-assistant-proof` として実装・公開済み。
- これでAI秘書の公開proofは、意思決定・メール整理・問い合わせ整理・予定整理・リマインダー確認・会議準備の6本になった。

## 完成済み基準線

- `daily-decision-assistant-proof`: 意思決定briefと確認キュー
- `gmail-triage-assistant-proof`: mailbox triageとdraft-only reply
- `support-ticket-triage-proof`: support ticket / inquiry triage
- `schedule-digest-assistant-proof`: 日次予定digestと準備漏れ防止
- `reminder-confirmation-assistant-proof`: リマインダー候補の送信前レビュー
- `meeting-prep-assistant-proof`: 会議前briefと確認事項整理

## 次の推奨順位

### 1. B2B掲載構成の整理

概要:
- 6本すべてを本番UIに並べるか、代表3本に絞るかを決める。
- 各proofの短縮コピーを同じトーンへ揃える。
- UI実装前に、掲載セクションの情報設計だけをdocsで固める。

なぜ次候補として強いか:
- 公開repoを増やす段階から、見せ方を整える段階に移れる。
- B2B本番UIを直接触らずに進められる。
- 代表proofを選ぶことで、掲載時の情報過多を避けられる。

ガード:
- 本番UI・CTA・レイアウト変更はまだ行わない。
- desktop / mobile / production URLで目視確認できるタイミングまでUI反映は分離する。

### 2. proof群の横断README / index作成

概要:
- 6本のrepoリンク、役割、安全境界、確認キューの違いを1枚にまとめる。
- portfolio側docsとして作るか、専用のproof index repoにするかは別判断にする。

良い点:
- 6本の成果を一つの説明資産にまとめやすい。
- B2B掲載文案や提案資料に転用できる。

懸念:
- 新規repo化より、編集・構成判断が中心になる。
- UI掲載と混同しないよう、docs段階に留める必要がある。

## 結論

次に着手するなら `B2B掲載構成の整理` が最適。

理由:
- 新規proofは6本揃い、これ以上増やすより見せ方の設計に移る方が効果が高い。
- 代表proofの選定、短縮コピーの統一、掲載順の整理は、UIを触らず今すぐ進められる。
- B2B本番UI反映前の判断材料として使える。

## 次の実装一手

1. `b2b/public-ai-secretary-proof-section-plan-2026-05-08.md` を作る。
2. 6本全掲載案と代表3本案を比較する。
3. 推奨掲載順、カードタイトル、3文コピー、リンク方針を整理する。
4. UI反映は別タスクとして残す。
