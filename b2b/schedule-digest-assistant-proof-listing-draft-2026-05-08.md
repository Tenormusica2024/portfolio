# Schedule Digest Assistant Proof - B2B Listing Draft

作成日: 2026-05-08
対象repo: `schedule-digest-assistant-proof`
公開repo: https://github.com/Tenormusica2024/schedule-digest-assistant-proof
Release: https://github.com/Tenormusica2024/schedule-digest-assistant-proof/releases/tag/v0.1.0

## 目的

B2Bポートフォリオへ掲載するか判断するための文案ドラフトです。
このファイルは掲載判断用であり、B2B本番UIにはまだ反映していません。

## 掲載タイトル候補

日次予定の整理と準備漏れ防止 AI秘書Proof

## 1行説明

サンプル予定を日次digestへ整理し、準備・締切・移動余裕・確認が必要な予定を見える化し、予定変更や通知送信は確認キューへ回すAI秘書Proofです。

## 掲載カード本文案

予定をAIが直接変更するのではなく、まず「固定予定」「準備が必要」「移動余裕が必要」「締切」「確認が必要」に整理する公開Proofです。サンプル予定をもとに、当日の準備ポイントとリスクを抽出し、予定変更・通知・連絡が必要になりそうなものはconfirmation queueへ分離します。Google CalendarやOutlookなどの実カレンダー連携を前提にせず、サンプルデータだけで安全境界を確認できる構成にしています。

## B2B向け訴求ポイント

- 日次予定整理・準備漏れ防止のAI秘書用途を説明しやすい
- AIが勝手に予定変更・通知送信するのではなく、人間確認前提の導線を示せる
- Calendar APIやOAuthなしで、sample-firstの公開Proofとして動かせる
- daily decision / Gmail triage / support ticket triage と並べてAI秘書の用途幅を見せられる
- 公開repoはサンプルデータのみで、実予定・実会議リンク・参加者情報を含まない

## 成果指標候補

- 予定を固定 / 準備 / 移動余裕 / 締切 / 確認必要へ分けられるか
- 準備が必要な予定をpreparation highlightsとして抽出できるか
- 予定変更・通知送信が勝手に実行されず、確認キューに入るか
- 判断理由がカテゴリ・次アクションとして説明できるか
- サンプルデータだけで安全にデモできるか

## 担当範囲として見せる内容

- schedule digest の安全境界設計
- サンプル予定データ設計
- 準備・締切・移動余裕の分類設計
- confirmation queue 設計
- no-calendar-update / no-notification-send の運用ガード
- public proof化に向けたREADME、CI、release整備

## 掲載時の注意

- 「自動で予定を変更する」「自動で通知する」とは書かない
- 「日次整理」「準備漏れ防止」「確認キュー」「人間承認前提」の表現に寄せる
- 実カレンダー連携ではなく、公開用サンプルデータであることを明記する
- B2B本番UIへ載せる場合は、desktop / mobile / 実URLで目視確認してから反映する

## 短縮版コピー

日次予定をAIが直接変更するのではなく、固定予定・準備が必要な予定・移動余裕・締切・確認が必要な予定へ整理する公開Proofです。予定変更や通知送信は自動実行せず、確認キューへ回すことで、AI秘書を予定運用に入れる前の安全境界を示しています。

## CTA近くに置く補足文案

AI秘書の価値は、予定を勝手に動かすことではなく、今日見るべき予定・準備・確認事項を先に整理することです。このProofでは、外部操作を確認キューへ分離し、予定運用に入れやすい安全境界を示しています。

## 次にUIへ載せる場合の最小手順

1. この文案から掲載本文を3〜5文に圧縮する。
2. daily / Gmail / support ticket / schedule の4 proofを同じセクションに並べるか判断する。
3. UI変更前に desktop / mobile の見え方を想定して短いセクション案を作る。
4. 実装後、local と production URL の両方を目視確認する。
5. 問い合わせCTAへの導線が過剰にならないよう、リンクは1箇所に絞る。
