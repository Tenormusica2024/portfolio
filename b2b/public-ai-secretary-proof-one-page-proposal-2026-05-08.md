# Public AI Secretary Proof One Page Proposal 2026-05-08

目的: 6本の公開AI秘書proofを、提案資料・初回説明・問い合わせ返信後の補足資料に転用しやすい1ページ構成へ圧縮する。B2B本番UI・CTA・レイアウトには反映しない。

## 1ページ見出し

AI秘書を安全に業務へ入れるための公開Proof

## 一言で言うと

AIが業務を勝手に実行するのではなく、判断支援・分類・下書き・確認キューまでを担当し、外部送信や更新は人間承認前提にするための公開Proof群です。

## 解決する課題

- AIに任せたいが、いきなり自動送信・自動更新させるのは不安。
- メール、問い合わせ、予定、会議準備などの整理作業が細かく積み上がる。
- 業務AIを入れる前に、どこまでAIへ任せて、どこから人が確認するかを具体化したい。
- 抽象的なAI導入説明ではなく、サンプル入力・出力・テスト・安全境界を見て判断したい。

## 基本方針

1. sample-first: まずは実データではなくサンプルデータで確認する。
2. draft-only: 返信・連絡・briefは下書きや提案に留める。
3. confirmation queue: 外部に影響する操作は確認キューへ分離する。
4. no external side effect: 送信、予定変更、チケット更新、通知送信を自動実行しない。
5. small workflow first: 1つの業務単位から導入範囲を決める。

## 代表Proof 3本

### 1. Daily Decision Assistant Proof

今日やること、後回し、着手禁止を分ける判断支援Proofです。予定・タスク・ブロッカーを整理し、外部アクションは実行せず確認キューへ回します。

- 見せたい価値: AI秘書の中核である判断支援
- 安全境界: no-send / no-modify / no-execute
- Repo: https://github.com/Tenormusica2024/daily-decision-assistant-proof

### 2. Support Ticket Triage Proof

問い合わせや保守依頼を、緊急対応・返信必要・後回し・ブロック中・対応不要に分類するProofです。返信案はdraft-onlyで作成し、コメント投稿やチケット更新は自動実行しません。

- 見せたい価値: B2B業務に近い問い合わせ・保守依頼の一次整理
- 安全境界: draft-only / no-ticket-update / confirmation queue
- Repo: https://github.com/Tenormusica2024/support-ticket-triage-proof

### 3. Schedule Digest Assistant Proof

日次予定を固定予定・準備・移動余裕・締切・確認必要に整理するProofです。予定変更や通知送信は自動実行せず、確認キューへ分離します。

- 見せたい価値: 予定運用と準備漏れ防止
- 安全境界: no-calendar-update / no-notification-send / confirmation queue
- Repo: https://github.com/Tenormusica2024/schedule-digest-assistant-proof

## 追加Proof 3本

- Gmail Triage Assistant Proof: inbox風入力を分類し、draft-only返信と確認キューに分けるProof。
  https://github.com/Tenormusica2024/gmail-triage-assistant-proof
- Reminder Confirmation Assistant Proof: フォローアップ候補を送信前レビューし、外部送信を確認キューへ分離するProof。
  https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof
- Meeting Prep Assistant Proof: 会議前briefと確認事項を整理し、参加者送付やカレンダー更新を確認キューへ分離するProof。
  https://github.com/Tenormusica2024/meeting-prep-assistant-proof

## 導入相談時の進め方

1. 対象業務を1つ選ぶ。
   - 例: 問い合わせ整理、日次予定整理、会議前準備、リマインダー確認。
2. 入力データと分類したいカテゴリを決める。
   - 例: urgent / review / defer / no action など。
3. AIに任せる範囲を決める。
   - 要約、分類、優先度判断、下書き作成までを初期範囲にする。
4. 人間確認を残す操作を決める。
   - 送信、予定変更、チケット更新、通知送信などは確認キューへ回す。
5. サンプルデータでProofを作り、実データ投入前に安全境界を確認する。

## 初回説明用トーク

AI秘書を導入する時は、最初から完全自動化するのではなく、AIが整理する部分と人が承認する操作を分けるのが安全です。公開Proofでは、判断支援・問い合わせ整理・予定整理・会議前準備などをサンプルデータで再現し、外部送信や更新は自動実行せず確認キューへ分離しています。まずは1つの業務単位で、入力データ・分類カテゴリ・人間確認が必要な操作を整理し、小さく導入範囲を決める進め方ができます。

## 相手に確認する質問

- いま一番整理したい業務は、メール、問い合わせ、予定、会議準備、リマインダーのどれに近いですか？
- 現在の入力は、メール、フォーム、チケット、カレンダー、チャット、スプレッドシートのどれですか？
- AIに任せたいのは、要約、分類、優先度判断、下書き作成のどこまでですか？
- 送信、予定変更、チケット更新など、人間確認を必ず残したい操作は何ですか？
- まずサンプル化できる匿名例はありますか？

## 提案時に避ける表現

避ける:

- 自動で送信できます。
- 自動で予定を変更できます。
- 自動でチケットを更新できます。
- 完全自動化できます。
- 実データをそのまま投入できます。

使う:

- 判断支援
- 一次整理
- draft-only
- 確認キュー
- 人間承認前提
- sample-first
- no external side effect
- 小さなProofから導入範囲を決める

## 1ページ版の使い分け

- 初回返信: 代表Proofを1から2本だけ添える。
- 初回打ち合わせ: 代表3本を説明し、相手の業務に近いものへ絞る。
- 提案資料: 「解決する課題」「基本方針」「導入相談時の進め方」を中心に使う。
- 公開ページ掲載: この内容をそのまま載せず、UI用カード文案へ圧縮する。

## 次に進めるなら

- UI目視確認ができるタイミングでは、`public-ai-secretary-proof-final-card-copy-2026-05-08.md` を使ってB2B UIへ反映する。
- UI確認ができない場合は、この1ページ構成から、相手別の提案メール文面や業種別の短縮版へ展開する。
