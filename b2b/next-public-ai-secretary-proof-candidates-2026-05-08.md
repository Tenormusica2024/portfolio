# Next Public AI Secretary Proof Candidates 2026-05-08

目的: 既存6本の公開AI秘書proofを踏まえて、次に進めるべき残タスクを sample-first / public-safe / B2B説明力の観点で順位化する。

更新メモ:
- `Support Ticket Triage Assistant Proof` は `support-ticket-triage-proof` として実装・公開済み。
- `Schedule Digest Assistant Proof` は `schedule-digest-assistant-proof` として実装・公開済み。
- `Reminder Confirmation Assistant Proof` は `reminder-confirmation-assistant-proof` として実装・公開済み。
- `Meeting Prep Assistant Proof` は `meeting-prep-assistant-proof` として実装・公開済み。
- `B2B掲載構成の整理` は `b2b/public-ai-secretary-proof-section-plan-2026-05-08.md` として作成済み。
- これでAI秘書の公開proofは、意思決定・メール整理・問い合わせ整理・予定整理・リマインダー確認・会議準備の6本になった。

## 完成済み基準線

- `daily-decision-assistant-proof`: 意思決定briefと確認キュー
- `gmail-triage-assistant-proof`: mailbox triageとdraft-only reply
- `support-ticket-triage-proof`: support ticket / inquiry triage
- `schedule-digest-assistant-proof`: 日次予定digestと準備漏れ防止
- `reminder-confirmation-assistant-proof`: リマインダー候補の送信前レビュー
- `meeting-prep-assistant-proof`: 会議前briefと確認事項整理

## 次の推奨順位

### 1. B2B UI用の最終3カード文案作成

概要:
- 作成済みsection planの推奨案Aをもとに、実装直前の3カード文案だけを切り出す。
- 既存B2Bページの文体へ寄せる前段として、カードタイトル・2文本文・リンク方針を固定する。
- まだ本番UI・CTA・レイアウトは触らない。

なぜ次候補として強いか:
- 代表3本方針が固まり、UI実装前の最後のテキスト整理に進める。
- UI反映時の迷いを減らせる。
- 目視確認できない状況でもdocsだけなら安全に進められる。

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

次に着手するなら `B2B UI用の最終3カード文案作成` が最適。

理由:
- B2B掲載構成はdocsで整理済みのため、次はUI実装に渡せる粒度へ圧縮する段階。
- UI本体を触らず、タイトル・本文・リンク方針だけ固められる。
- 代表proofの選定理由を保ったまま、実装時のテキスト迷いを減らせる。

## 次の実装一手

1. `b2b/public-ai-secretary-proof-final-card-copy-2026-05-08.md` を作る。
2. 代表3本のタイトル・2文本文・GitHubリンクを固定する。
3. 補助リンクとして残り3本を1行ずつ置くか判断する。
4. UI反映は別タスクとして残す。
