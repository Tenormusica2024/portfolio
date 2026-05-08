# Public AI Secretary Proof Index 2026-05-08

目的: 6本の公開AI秘書proofを、役割・安全境界・使いどころで横断整理する。B2B本番UIへはまだ反映しない。

## 全体コンセプト

AI秘書をいきなり完全自動化するのではなく、まず「判断」「分類」「下書き」「確認キュー」に分けて業務へ入れるための公開proof群です。すべてサンプルデータのみで動作し、外部送信・予定変更・チケット更新などの副作用は自動実行しません。

## 6本の一覧

| proof | repo | 役割 | 主な出力 | 安全境界 | B2Bでの使いどころ |
|---|---|---|---|---|---|
| Daily Decision Assistant Proof | https://github.com/Tenormusica2024/daily-decision-assistant-proof | 今日やること / 後回し / 着手禁止の判断支援 | daily brief / confirmation queue | no-send / no-modify / no-execute | AI秘書の中核である判断支援を見せる |
| Gmail Triage Assistant Proof | https://github.com/Tenormusica2024/gmail-triage-assistant-proof | inbox風入力の分類とdraft-only返信 | triage report / draft replies / confirmation queue | draft-only / no-send / no-modify | メール・問い合わせ入口の整理パターンを見せる |
| Support Ticket Triage Proof | https://github.com/Tenormusica2024/support-ticket-triage-proof | 問い合わせ・保守依頼の一次整理 | triage report / draft replies / confirmation queue | no-comment / no-label-change / no-ticket-update | B2B業務に近い問い合わせ整理を見せる |
| Schedule Digest Assistant Proof | https://github.com/Tenormusica2024/schedule-digest-assistant-proof | 日次予定の整理と準備漏れ防止 | schedule digest / preparation highlights / confirmation queue | no-calendar-update / no-notification-send | AI秘書らしい予定運用支援を見せる |
| Reminder Confirmation Assistant Proof | https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof | フォローアップ候補の送信前レビュー | reminder report / draft action notes / confirmation queue | no-message-send / confirmation-required | 連絡漏れ防止と送信前レビューを見せる |
| Meeting Prep Assistant Proof | https://github.com/Tenormusica2024/meeting-prep-assistant-proof | 会議前briefと確認事項整理 | meeting prep report / draft briefs / confirmation queue | no-participant-send / no-calendar-update | 会議準備・論点整理の業務補助を見せる |

## 代表3本と補助3本

### 代表3本

B2B UIで最初に前面へ出す候補です。

1. Daily Decision Assistant Proof
   - 理由: AI秘書の中核である「判断支援」を示せる。
   - 見せ方: 今日やること / 後回し / 着手禁止を分ける。
2. Support Ticket Triage Proof
   - 理由: B2B業務に近い「問い合わせ・保守依頼の一次整理」を示せる。
   - 見せ方: 返信案はdraft-only、外部更新は確認キューへ分離する。
3. Schedule Digest Assistant Proof
   - 理由: AI秘書らしい「予定・準備漏れ防止」を示せる。
   - 見せ方: 予定変更や通知送信は確認キューへ分離する。

### 補助3本

代表カードの下で、関連proofとして短く見せる候補です。

1. Gmail Triage Assistant Proof
   - inbox風入力の分類とdraft-only返信。
2. Reminder Confirmation Assistant Proof
   - フォローアップ候補の送信前レビュー。
3. Meeting Prep Assistant Proof
   - 会議前briefと確認事項整理。

## 共通する安全設計

- sample-first: 実データを使わず、サンプル入力だけで動作する。
- draft-only: 返信・連絡・briefは下書きや提案に留める。
- no external side effect: 外部送信、予定変更、チケット更新、通知送信を自動実行しない。
- confirmation queue: 外部に影響する可能性がある操作は人間確認へ回す。
- public boundary check: 公開repoに内部情報・local path・secretが入らないようチェックする。
- CI: pytest と public boundary check をGitHub Actionsで回す。

## B2B説明の中心メッセージ

AI導入で重要なのは、最初から完全自動化することではなく、AIが整理する部分と人が承認する操作を分けることです。このproof群では、判断・分類・下書きまではAIに任せ、外部に影響する操作は確認キューに分離する設計を示しています。

## 掲載・提案で避ける表現

避ける:
- 自動で送信する
- 自動で予定を変更する
- 自動でチケット更新する
- 完全自動化できる
- 実データでそのまま動く

使う:
- 判断支援
- 一次整理
- draft-only
- 確認キュー
- 人間承認前提
- sample-first
- no external side effect

## UI反映時のリンク方針

推奨:
- 代表3本は各カードにGitHubリンクを1つずつ置く。
- 補助3本はカード化せず、短い関連リンクとして置く。
- CTAはproof群の下に1つだけ置く。

避ける:
- 6本すべてに大きなCTAを置く。
- 各proofに複数リンクを置く。
- GitHubリンクが問い合わせCTAより目立ちすぎる配置にする。

## UI反映前に残すタスク

1. `public-ai-secretary-proof-final-card-copy-2026-05-08.md` の文案をB2Bページの既存トーンへ合わせる。
2. UI実装後、desktop / mobile / production URLで目視確認する。
3. 表示が長い場合は、補助3本を折りたたむか、このindexへの1リンクに集約する。

## 現時点の判断

- 新規proof追加は一旦十分。
- 次はB2B UIへの反映可否判断、またはこのindexを使った提案文案化が自然。
- 目視確認できない状況では、B2B本番UI・CTA・レイアウト変更は避ける。
