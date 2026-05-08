# Public AI Secretary Proof Final Card Copy 2026-05-08

目的: B2B本番UIへ反映する前に、代表3本のカード文案・リンク方針・補助リンクを固定する。  
このファイルは文案確定用であり、B2B本番UI・CTA・レイアウトにはまだ反映していない。

## 掲載方針

- まずは代表3本をカードとして前面に出す。
- 残り3本は「関連proof」または「追加パターン」として短い補助リンクにする。
- CTAはproofカードごとに増やさず、セクション全体で1つに留める。
- GitHubリンクは各カードに1つずつ置く。補助リンクも1行ずつに留める。

## セクション見出し

AI秘書を安全に業務へ入れるための公開Proof

## セクションリード文

AIをいきなり完全自動化するのではなく、判断・分類・下書き・確認キューへ分けて業務に入れる公開Proof群です。サンプルデータだけで動作し、外部送信・予定変更・チケット更新などの副作用は自動実行しません。

## 代表3カード最終案

### 1. AI秘書の「今日やること」判断支援 Proof

本文:
予定・タスク・ブロッカーを整理し、「今日やること」「後回し」「着手禁止」を分けるAI秘書Proofです。外部アクションは自動実行せず確認キューへ回し、人が承認する前提で安全に使える業務導入パターンを示しています。

Link label:
GitHubでProofを見る

Link:
https://github.com/Tenormusica2024/daily-decision-assistant-proof

安全境界ラベル:
no-send / no-modify / no-execute

### 2. 問い合わせ・保守依頼の一次整理 AI秘書Proof

本文:
問い合わせや保守依頼を分類し、返信案はdraft-onlyで作成し、外部更新は確認キューへ回すAI秘書Proofです。サンプルデータのみで動作し、サポート業務にAIを入れる前の安全境界を示しています。

Link label:
GitHubでProofを見る

Link:
https://github.com/Tenormusica2024/support-ticket-triage-proof

安全境界ラベル:
draft-only / no-ticket-update / confirmation queue

### 3. 日次予定の整理と準備漏れ防止 AI秘書Proof

本文:
日次予定を固定予定・準備・移動余裕・締切・確認必要に整理し、予定変更や通知送信は確認キューへ回すAI秘書Proofです。サンプルデータのみで動作し、予定運用にAIを入れる前の安全境界を示しています。

Link label:
GitHubでProofを見る

Link:
https://github.com/Tenormusica2024/schedule-digest-assistant-proof

安全境界ラベル:
no-calendar-update / no-notification-send / confirmation queue

## 補助リンク最終案

代表3本の下に、1行ずつの補助リンクとして置く。

- Gmail Triage Proof — inbox風入力の分類、draft-only返信、確認キュー: https://github.com/Tenormusica2024/gmail-triage-assistant-proof
- Reminder Confirmation Proof — フォローアップ候補の送信前レビュー、no-message-send: https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof
- Meeting Prep Proof — 会議前brief、確認事項整理、no-participant-send: https://github.com/Tenormusica2024/meeting-prep-assistant-proof

## CTA近くの補足文案

AI導入で重要なのは、最初から完全自動化することではなく、AIが整理する部分と人が承認する操作を分けることです。これらのProofでは、外部に影響する操作を確認キューへ分離し、業務に入れやすい安全境界を示しています。

## UI実装時の注意

- 本ファイルはまだUI反映していない。
- 「自動送信」「自動更新」「完全自動化」とは書かない。
- 「判断支援」「下書き」「確認キュー」「人間承認前提」に寄せる。
- カード本文は2文のまま維持し、説明を増やしすぎない。
- GitHubリンクを増やしすぎて問い合わせCTAを弱めない。
- 実装後は local / production URL のdesktop・mobile目視確認を必須にする。

## 次に進めるなら

1. 目視確認できるタイミングで、この3カード文案をB2B UIへ反映する。
2. UI反映後、desktop / mobile / production URL を確認する。
3. 表示が長い場合は、補助リンク3本を折りたたむか、proof indexへの1リンクへ集約する。
