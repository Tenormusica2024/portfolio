# Public AI Secretary Proof Section Plan 2026-05-08

目的: 6本の公開AI秘書proofを、B2Bポートフォリオへ載せる前に情報設計として整理する。
このファイルは掲載構成案であり、B2B本番UI・CTA・レイアウトにはまだ反映していない。

## 対象proof

| proof | 公開repo | 役割 | 安全境界 |
|---|---|---|---|
| Daily Decision Assistant Proof | https://github.com/Tenormusica2024/daily-decision-assistant-proof | 今日やること / 後回し / 着手禁止の判断支援 | no-send / no-modify / no-execute |
| Gmail Triage Assistant Proof | https://github.com/Tenormusica2024/gmail-triage-assistant-proof | inbox風入力の分類とdraft-only返信 | draft-only / no-send / no-modify |
| Support Ticket Triage Proof | https://github.com/Tenormusica2024/support-ticket-triage-proof | 問い合わせ・保守依頼の一次整理 | no-comment / no-label-change / no-ticket-update |
| Schedule Digest Assistant Proof | https://github.com/Tenormusica2024/schedule-digest-assistant-proof | 日次予定の整理と準備漏れ防止 | no-calendar-update / no-notification-send |
| Reminder Confirmation Assistant Proof | https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof | フォローアップ候補の送信前レビュー | no-message-send / confirmation-required |
| Meeting Prep Assistant Proof | https://github.com/Tenormusica2024/meeting-prep-assistant-proof | 会議前briefと確認事項整理 | no-participant-send / no-calendar-update |

## 推奨方針

### 結論

B2B本番UIに最初から6本すべてを同列カードで並べるより、まずは代表3本を前面に出し、残り3本は「関連proof」または「追加パターン」として補助的に見せるのがよい。

理由:
- 6本を同列に並べると、初見では違いよりも量が目立つ。
- B2Bで伝えるべき主張は「AI秘書を完全自動化せず、確認キューで安全に入れる設計ができる」こと。
- 代表3本だけでも、判断支援・問い合わせ整理・予定/準備管理の幅が伝わる。
- 残り3本は、打ち合わせや提案時に「他にも同じ安全境界で展開できる」と示す材料に向く。

## 掲載案A: 代表3本を前面に出す

### 推奨掲載順

1. Daily Decision Assistant Proof
2. Support Ticket Triage Proof
3. Schedule Digest Assistant Proof

### なぜこの3本か

- Daily Decision: AI秘書の中核である「判断支援」を示せる。
- Support Ticket: B2B業務に近い「問い合わせ・依頼の一次整理」を示せる。
- Schedule Digest: AI秘書らしい「予定・準備漏れ防止」を示せる。

### セクション見出し案

AI秘書を安全に業務へ入れるための公開Proof

### セクション説明案

AIをいきなり完全自動化するのではなく、判断・分類・下書き・確認キューへ分けて業務に入れる公開Proof群です。サンプルデータだけで動作し、外部送信・予定変更・チケット更新などの副作用は自動実行しません。

### 代表3カード案

#### 1. AI秘書の「今日やること」判断支援 Proof

予定・タスク・ブロッカーを整理し、「今日やること」「後回し」「着手禁止」を分けるAI秘書Proofです。外部アクションは自動実行せず確認キューへ回し、人が承認する前提で安全に使える業務導入パターンを示しています。

Link: https://github.com/Tenormusica2024/daily-decision-assistant-proof

#### 2. 問い合わせ・保守依頼の一次整理 AI秘書Proof

問い合わせや保守依頼を分類し、返信案はdraft-onlyで作成し、外部更新は確認キューへ回すAI秘書Proofです。サンプルデータのみで動作し、サポート業務にAIを入れる前の安全境界を示しています。

Link: https://github.com/Tenormusica2024/support-ticket-triage-proof

#### 3. 日次予定の整理と準備漏れ防止 AI秘書Proof

日次予定を固定予定・準備・移動余裕・締切・確認必要に整理し、予定変更や通知送信は確認キューへ回すAI秘書Proofです。サンプルデータのみで動作し、予定運用にAIを入れる前の安全境界を示しています。

Link: https://github.com/Tenormusica2024/schedule-digest-assistant-proof

### 補助リンク案

代表3本の下に、短いテキストリンクで追加proofを置く。

- Gmail Triage Proof: draft-only返信と確認キュー
- Reminder Confirmation Proof: フォローアップ候補の送信前レビュー
- Meeting Prep Proof: 会議前briefと確認事項整理

## 掲載案B: 6本すべてを並べる

### 向いている場合

- 技術ポートフォリオとして、公開repo数と横展開力を強く見せたい場合。
- 読み手がAI agent / automation / GitHub repoを詳しく見る前提の場合。
- セクションが長くなっても問題ないページ構成の場合。

### 懸念

- 初見ではカードが多く、何を一番見ればよいか分かりにくくなる。
- 各proofの違いが細かく見え、メイン訴求が薄まる。
- UI上でリンクが多くなり、問い合わせCTAへの導線が散る。

### 使うなら

- 2列または3列の小さなカードにする。
- 各カード本文は2文以内にする。
- 代表proofにだけ強調ラベルを付ける。
- CTAはproof群の下に1つだけ置く。

## 掲載案C: 1本をメイン事例、残りをproof群として置く

### メイン候補

Support Ticket Triage Proof

### 理由

- B2B業務に近く、問い合わせ・保守依頼・作業依頼の一次整理として説明しやすい。
- draft-only / confirmation queue / no external update の安全境界が分かりやすい。
- 実運用に近いが、実データ不要で公開proofとして成立している。

### 構成案

1. メイン事例として Support Ticket Triage Proof を大きめに掲載。
2. 下に「同じ安全境界で展開できるAI秘書proof」として残り5本をリスト化。
3. CTAは「AI導入相談」ではなく「安全境界を前提にした業務AI導入の相談」寄りにする。

## 推奨する最初のUI反映方針

最初は `掲載案A: 代表3本を前面に出す` を推奨。

理由:
- 情報量と訴求力のバランスが良い。
- AI秘書の幅を見せつつ、読み手に見るべきものを絞れる。
- UI反映後の目視確認コストも抑えられる。
- 残り3本を補助リンクにすれば、6本作った事実も無駄にならない。

## UI反映前の未実施タスク

- 実際のB2Bページの余白・カード幅・モバイル表示を確認する。
- 代表3本のカード本文を、既存ページの文体に合わせてさらに短くする。
- GitHubリンクを各カードに置くか、proof indexへの1リンクに集約するか決める。
- local / production URL のdesktop・mobile目視確認を行う。

## UI反映時のガード

- 「自動で送信」「自動で更新」「完全自動化」とは書かない。
- 「判断支援」「下書き」「確認キュー」「人間承認前提」に寄せる。
- 公開用サンプルデータのみで動作することを明記する。
- proofリンクを増やしすぎて問い合わせCTAを弱めない。
- 目視確認できない状況では、本番UIへ反映しない。

## 次に進めるなら

1. このplanを元に、B2B UI用の最終3カード文案を1ファイルに切り出す。
2. その後、目視確認できるタイミングでUI実装する。
3. UI実装後は desktop / mobile / production URL のスクリーンショット確認を必須にする。

