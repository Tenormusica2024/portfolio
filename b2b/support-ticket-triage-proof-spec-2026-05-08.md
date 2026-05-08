# Support Ticket Triage Proof Spec Draft 2026-05-08

目的: 次の公開AI秘書proofとして `support-ticket-triage-proof` を作る前に、sample-first / public-safe / no external update の最小仕様を固定する。

この文書は仕様ドラフトであり、まだ新規repo作成やB2B本番UI反映は行わない。

## 公開repo名

第一候補:
- `support-ticket-triage-proof`

代替候補:
- `issue-triage-assistant-proof`

判断:
- 配布用・B2B説明用としては `support-ticket` の方が特定ツールに寄りすぎず自然。
- 実装内では `ticket`, `request`, `inquiry` を中心語にする。
- READMEでは「特定のissue管理ツール専用」ではなく「support ticket / inquiry intake / work request の一次整理」と説明する。

## 何を証明するか

AI秘書が問い合わせ・保守依頼・作業依頼を直接更新するのではなく、まず分類・返信下書き・確認キューに分ける安全な運用パターンを示す。

証明するパターン:
- sample ticket を分類する
- 緊急度と対応種別を説明する
- 返信が必要なものだけ draft を作る
- 外部更新が必要なものは confirmation queue へ入れる
- ticket更新、コメント投稿、ラベル変更、通知送信は行わない

## 最小データモデル

`samples/tickets.json`

```json
[
  {
    "id": "ticket-001",
    "source": "support_portal",
    "title": "Cannot access monthly report",
    "body": "The report page returns an error for my account.",
    "customer_tier": "standard",
    "urgency": 5,
    "impact": 4,
    "requires_reply": true,
    "requires_external_update": true,
    "blocked": false,
    "received_at": "2026-05-08T09:00:00Z"
  }
]
```

`samples/triage_rules.json`

```json
{
  "urgent_threshold": 16,
  "backlog_threshold": 7,
  "categories": ["urgent", "needs_reply", "backlog", "blocked", "no_action"],
  "safety": "sample-first / no-comment / no-label-change / confirmation-required"
}
```

## 分類カテゴリ

| category | 意味 | 外部操作 |
|---|---|---|
| `urgent` | 影響度・緊急度が高く、早めの人間確認が必要 | confirmation queue |
| `needs_reply` | 返信下書きを作るが送信しない | draft only |
| `backlog` | 急がない改善要望・確認候補 | no external update |
| `blocked` | 情報不足や承認待ちで進めない | no execution |
| `no_action` | 対応不要または記録のみ | no external update |

## 出力ファイル

`outputs/triage_report.md`
- scanned count
- category counts
- urgent items
- needs reply items
- backlog items
- blocked items
- confirmation queue
- reply drafts

`outputs/triage_report.json`
- markdownと同等の構造化出力
- CIでdeterministicに比較しやすい形にする

## 安全境界

デフォルトで行わないこと:
- ticket更新
- コメント投稿
- ラベル変更
- メール送信
- 通知送信
- CRM更新
- 外部API呼び出し

許可すること:
- sample JSONの読み込み
- ローカル分類
- ローカル返信下書き生成
- confirmation queue JSON/Markdown生成

## public/private boundary

公開repoに入れてよいもの:
- synthetic sample tickets
- deterministic triage rules
- local CLI demo
- tests
- public boundary check
- generated sample report

公開repoに入れないもの:
- 実ticket本文
- 実顧客名
- 実メールアドレス
- 実issue URL
- private support log
- local absolute path
- token / secret / credential
- private knowledge-base output

## 想定ファイル構成

```text
README.md
run_demo.py
samples/tickets.json
samples/triage_rules.json
outputs/triage_report.md
outputs/triage_report.json
src/triage_engine.py
src/reply_draft.py
src/confirmation_queue.py
tests/test_triage_engine.py
tests/test_public_boundary.py
docs/privacy-boundary.md
docs/public-export-checklist.md
docs/showcase-copy.md
scripts/check_public_boundary.py
.github/workflows/tests.yml
```

## READMEで最初に伝えること

- sample-first support ticket triage proof
- no external ticket updates by default
- reply draft is draft-only
- action-worthy items go to confirmation queue
- public-safe synthetic fixtures only
- useful for AI secretary / support operations / human-in-the-loop workflows

## showcase copy 初稿

### Short label

Support Ticket Triage Proof

### One-line description

Sample-first AI secretary proof that classifies support-ticket-like inputs, drafts safe replies, and queues external updates for human confirmation.

### Demo card copy

A public-safe proof for support intake workflows. It classifies synthetic tickets into urgent, needs-reply, backlog, blocked, and no-action groups, prepares draft-only replies where useful, and routes external updates into a confirmation queue. The demo does not update tickets, post comments, change labels, or call external APIs.

## testsで確認すること

- urgent item が正しく urgent に入る
- requires_reply item だけ draft が作られる
- requires_external_update item が confirmation queue に入る
- blocked item は実行候補から外れる
- string boolean の誤判定を防ぐ
- generated queue id が deterministic
- public boundary check が禁止語を検知する

## GitHub metadata候補

Description:
- `Sample-first AI secretary proof for support ticket triage, draft-only replies, and human confirmation queues.`

Topics:
- `ai-secretary`
- `support-ticket`
- `ticket-triage`
- `human-in-the-loop`
- `confirmation-queue`
- `public-proof`
- `showcase-proof`
- `python`

## v0.1.0完成条件

- repoがPUBLIC
- READMEがpublic-safe
- `python -X utf8 run_demo.py` が成功
- `python -m pytest tests -q` が成功
- `python scripts/check_public_boundary.py` が成功
- GitHub Actions success
- `docs/showcase-copy.md` がある
- `docs/privacy-boundary.md` がある
- `docs/public-export-checklist.md` がある
- `v0.1.0` releaseを作成済み

## 次の実装手順

1. `support-ticket-triage-proof` repoを作成する。
2. `gmail-triage-assistant-proof` の構成を参考にしつつ、mailbox固有語をticket/inquiryへ置換する。
3. sample ticketsを5件作る。
4. triage engine / draft / confirmation queue を最小実装する。
5. tests と public boundary check を追加する。
6. GitHub Actions を通す。
7. `v0.1.0` releaseを作る。
8. B2B掲載文案はrepo完成後に別ファイルで作る。

