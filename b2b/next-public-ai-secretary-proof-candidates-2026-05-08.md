# Next Public AI Secretary Proof Candidates 2026-05-08

目的: `daily-decision-assistant-proof`、`gmail-triage-assistant-proof`、`support-ticket-triage-proof` の次に作る公開AI秘書proof候補を、sample-first / public-safe / B2B説明力の観点で順位化する。

更新メモ:
- `Support Ticket Triage Assistant Proof` は `support-ticket-triage-proof` として実装・公開済み。
- 以後の候補は、既存3本との差分が明確で、かつ公開境界を単純に保てるものを優先する。

前提:
- private実装を直接コピーしない。
- 実メール、実予定、実チケット、実顧客データを使わない。
- 外部操作は自動実行せず、confirmation queueへ分離する。
- 初期repoは README / samples / outputs / src / tests / docs / public boundary check / CI を最小構成にする。
- OAuthや実サービス連携の取得手順は補足に留め、proof本体を複雑化しない。

## 完成済み基準線

### Support Ticket Triage Assistant Proof

公開repo:
- `support-ticket-triage-proof`: https://github.com/Tenormusica2024/support-ticket-triage-proof

位置づけ:
- sample support ticket / inquiry を urgent / needs_reply / backlog / blocked / no_action に分類する公開proof。
- 返信案や次アクション案は作るが、ticket更新・コメント投稿・ラベル変更はしない。
- 外部更新が必要なものは confirmation queue に入れる。

以後の候補では、このrepoと同じく「sample-first」「外部操作なし」「確認キュー分離」「公開境界チェック」を最低基準にする。

## 次の推奨順位

### 1. Schedule Digest Assistant Proof

公開名候補:
- `schedule-digest-assistant-proof`
- `daily-schedule-brief-proof`

概要:
- sample schedule / deadline / travel buffer / preparation task を日次digestへ整理する。
- 予定変更や通知送信はしない。
- 変更提案や確認が必要な予定は confirmation queue に入れる。

なぜ次候補として強いか:
- AI秘書らしさが分かりやすい。
- daily-decision proof と接続しやすいが、出力を「予定・準備・移動余裕」に絞れば差分が明確。
- 「予定を勝手に変えない」安全境界を説明しやすい。
- Calendar APIなしでも、sample JSON / CSV で価値を示せる。

最小サンプル:
- 固定ミーティング
- 締切付きタスク
- 移動余裕が必要な予定
- 事前準備が必要な予定
- 確認待ちの予定変更候補

注意:
- Calendar連携が主役に見えないよう、READMEでは「sample schedule input」を中心に説明する。
- OAuth取得手順は任意の発展項目に留める。
- daily-decision proof と重複しないよう、判断軸を「今日の予定運用」に寄せる。

### 2. Reminder Confirmation Assistant Proof

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
- 単体だと機能が小さく、proofとしての見栄えはSchedule Digestより弱い。
- 相手や連絡先が絡むため、サンプルデータの匿名性に注意が必要。

### 3. Meeting Prep Assistant Proof

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
- sample notes を使う場合は、実会議ログ風にしすぎない。

## 結論

次に着手するなら `Schedule Digest Assistant Proof` が最適。

理由:
- 既存3本と並べた時に、AI秘書の用途が「意思決定」「メール整理」「問い合わせ整理」「予定整理」へ広がる。
- Calendar APIなしでもsample-firstで成立する。
- 予定変更や通知送信をconfirmation queueへ分離することで、安全境界を説明しやすい。
- B2Bでは「日次予定の整理・準備漏れ防止」として伝わりやすい。

## 次の実装一手

1. public repo名は第一候補を `schedule-digest-assistant-proof`、代替候補を `daily-schedule-brief-proof` として決める。
2. sample schedules を5〜7件作る。
3. 出力カテゴリを `fixed`, `prepare`, `travel_buffer`, `deadline`, `needs_confirmation` にする。
4. 予定変更・通知・連絡が必要なものは confirmation queue に入れる。
5. README / privacy-boundary / public-export-checklist / showcase-copy / public boundary check / pytest CI を既存3repoの型で作る。

## B2B掲載前ガード

- 初期repo完成後、`v0.1.0` releaseを作る。
- topics は `ai-secretary`, `public-proof`, `showcase-proof`, `human-in-the-loop`, `confirmation-queue`, `python` を基本にする。
- B2B本番UIへはすぐ載せず、まずcopy draftだけ作る。
- UI反映は、desktop / mobile / production URLで目視確認できるタイミングに分離する。
