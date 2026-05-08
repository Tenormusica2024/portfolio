# Public AI Secretary Proof Checklist 2026-05-08

目的: AI秘書系の公開proof repoを増やす時に、既存3本と同じ品質・公開境界で揃えるための横断チェックリスト。

対象:
- `daily-decision-assistant-proof`: https://github.com/Tenormusica2024/daily-decision-assistant-proof
- `gmail-triage-assistant-proof`: https://github.com/Tenormusica2024/gmail-triage-assistant-proof
- `support-ticket-triage-proof`: https://github.com/Tenormusica2024/support-ticket-triage-proof

## 現在の基準線

| 項目 | daily decision proof | Gmail triage proof | support ticket triage proof | 次回proofの基準 |
|---|---|---|---|---|
| repo visibility | PUBLIC | PUBLIC | PUBLIC | PUBLIC化前に境界チェック必須 |
| release | `v0.1.0` | `v0.1.0` | `v0.1.0` | 初期完成時に `v0.1.0` を作る |
| CI | pytest + public boundary check | pytest + public boundary check | pytest + public boundary check | tests と公開境界チェックを両方入れる |
| sample-first | はい | はい | はい | 実データなしでdemo可能にする |
| external side effect | no-send / no-modify / no-execute | draft-only / no-send / no-modify | draft-only / no-comment / no-label-change / no-ticket-update | 外部操作は自動実行しない |
| human confirmation | confirmation queue | confirmation queue | confirmation queue | 外部アクションは確認キューへ分離 |
| showcase copy | `docs/showcase-copy.md` | `docs/showcase-copy.md` | `docs/showcase-copy.md` | portfolio専用ではなくshowcase汎用名にする |
| public/private docs | あり | あり | あり | `privacy-boundary` と `public-export-checklist` を入れる |
| B2B copy draft | あり | repo内showcase copyあり | あり | UI反映前に短文版と掲載案を分ける |

## 現在の公開proof 3本

1. `daily-decision-assistant-proof`
   - 日次シグナルを focus / defer / no-go に整理する。
   - 判断結果と確認キューを分け、外部操作はしない。
2. `gmail-triage-assistant-proof`
   - sample mailbox を urgent / review / low priority に分類する。
   - 返信案は draft-only とし、送信はしない。
3. `support-ticket-triage-proof`
   - sample support ticket / inquiry を urgent / needs_reply / backlog / blocked / no_action に分類する。
   - 返信案と次アクション候補を作るが、ticket更新・コメント投稿・ラベル変更はしない。

## 次回proof repoの最小構成

```text
README.md
run_demo.py
samples/
outputs/
src/
tests/
docs/privacy-boundary.md
docs/public-export-checklist.md
docs/showcase-copy.md
scripts/check_public_boundary.py
.github/workflows/tests.yml
```

## READMEで必ず明記すること

- 何を判断・整理するproofなのか
- sample-firstで動くこと
- 実データ、内部ナレッジ、OAuth tokenを含まないこと
- AIが外部操作を自動実行しないこと
- 外部アクションはconfirmation queueへ入ること
- reviewerが最初に見るべきファイル

## CIで最低限確認すること

- `python -m pytest tests -q`
- `python scripts/check_public_boundary.py`

公開境界チェックでは、少なくとも以下を検知対象にする。

- 個人名・個人アカウント名
- private knowledge-base固有名
- private issue / support-ticket固有名
- local absolute path
- 実案件名・顧客名・NDA情報
- proof化前の内部機能名

## サンプルデータのルール

- 実メール、実予定、実Issue、実顧客情報を使わない
- タイトルや本文が特定ユーザー専用・社内専用に見えないよう一般化する
- ただし用途が分かる程度の業務文脈は残す
- IDやtimestampが必要な場合は、deterministicに生成する

## B2B掲載前のガード

- repoのPUBLIC状態を確認する
- latest CI successを確認する
- `v0.1.0` releaseがあることを確認する
- `docs/showcase-copy.md` から3〜5文へ圧縮する
- UI本体へ載せる前に、desktop / mobile / production URLで目視確認する
- 目視確認できない状況ではB2B本番UIの文言・CTA・レイアウト変更を避ける

## 次のAI秘書proof候補を選ぶ基準

優先する候補:
- sample-firstにしやすい
- private knowledge-baseや個人運用に強く依存しない
- 外部操作をconfirmation queueへ分離できる
- B2Bで説明しやすい安全境界がある
- 30〜90分で最小repo化できる

避ける候補:
- 実Gmail、実Calendar、実Issue、実顧客データがないと価値が伝わらない
- private knowledge-base前提の判断が中心
- OAuthやクラウド設定が主役になり、proofが複雑化する
- 自動送信・自動更新を売りにしないと成立しない

## 現時点の次候補メモ

1. Schedule digest assistant proof
   - sample予定・締切・移動余裕を日次digestへ整理する。
   - Calendar連携はせず、変更提案はconfirmation queueに留める。

2. Reminder confirmation assistant proof
   - sample reminder candidatesを、送る / 保留 / 不要に分ける。
   - 通知送信はせず、確認キューだけ作る。

3. Meeting prep assistant proof
   - sample agenda / participants / open questions / previous notes を会議前ブリーフに整理する。
   - 送信やカレンダー更新はせず、確認が必要な質問や送付物だけconfirmation queueへ入れる。

## 運用メモ

- `daily-decision-assistant-proof`、`gmail-triage-assistant-proof`、`support-ticket-triage-proof` は、公開proof repoの初期基準線として扱える。
- `support-ticket-triage-proof` は候補ではなく完成済みの基準線に移動済み。
- 次回以降は、このチェックリストを先に満たしてからB2B掲載文案へ進む。
- B2B本番UI反映は、copy draft作成とは別タスクに分ける。

