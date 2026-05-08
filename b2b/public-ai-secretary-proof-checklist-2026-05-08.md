# Public AI Secretary Proof Checklist 2026-05-08

目的: AI秘書系の公開proof repoを増やす時に、既存6本と同じ品質・公開境界で揃えるための横断チェックリスト。

対象:
- `daily-decision-assistant-proof`: https://github.com/Tenormusica2024/daily-decision-assistant-proof
- `gmail-triage-assistant-proof`: https://github.com/Tenormusica2024/gmail-triage-assistant-proof
- `support-ticket-triage-proof`: https://github.com/Tenormusica2024/support-ticket-triage-proof
- `schedule-digest-assistant-proof`: https://github.com/Tenormusica2024/schedule-digest-assistant-proof
- `reminder-confirmation-assistant-proof`: https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof
- `meeting-prep-assistant-proof`: https://github.com/Tenormusica2024/meeting-prep-assistant-proof

## 現在の基準線

| 項目 | 基準 |
|---|---|
| repo visibility | PUBLIC化前に境界チェック必須 |
| release | 初期完成時に `v0.1.0` を作る |
| CI | pytest と public boundary check を両方入れる |
| sample-first | 実データなしでdemo可能にする |
| external side effect | no-send / no-modify / no-update / no-notification を明記する |
| human confirmation | 外部アクションはconfirmation queueへ分離する |
| showcase copy | `docs/showcase-copy.md` を置き、portfolio専用名にしない |
| public/private docs | `privacy-boundary` と `public-export-checklist` を入れる |
| B2B copy draft | UI反映前に短文版と掲載案を分ける |

## 現在の公開proof 6本

1. `daily-decision-assistant-proof` — 日次シグナルを focus / defer / no-go に整理する。
2. `gmail-triage-assistant-proof` — sample mailbox を分類し、返信案は draft-only に留める。
3. `support-ticket-triage-proof` — sample support ticket / inquiry を分類し、外部更新はしない。
4. `schedule-digest-assistant-proof` — sample schedule を日次digestへ整理し、予定変更・通知は確認キューへ分離する。
5. `reminder-confirmation-assistant-proof` — sample reminder candidates を送信前レビューし、外部送信は確認キューへ分離する。
6. `meeting-prep-assistant-proof` — sample meeting inputs を会議前briefへ整理し、参加者送付・カレンダー更新は確認キューへ分離する。

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

- 6本揃ったため、次は新規repo追加よりもB2B掲載構成の整理・代表proofの選定を優先する。
- UI本体への反映は、desktop / mobile / production URLで目視確認できるタイミングに分離する。

## 運用メモ

- 既存6本は、公開proof repoの初期基準線として扱える。
- `support-ticket-triage-proof`、`schedule-digest-assistant-proof`、`reminder-confirmation-assistant-proof`、`meeting-prep-assistant-proof` は候補ではなく完成済みの基準線に移動済み。
- 次回以降は、このチェックリストを先に満たしてからB2B掲載文案へ進む。
- B2B本番UI反映は、copy draft作成とは別タスクに分ける。
