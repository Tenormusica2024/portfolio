# Reminder Confirmation Assistant Proof - B2B Listing Draft

作成日: 2026-05-08
対象repo: `reminder-confirmation-assistant-proof`
公開repo: https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof
Release: https://github.com/Tenormusica2024/reminder-confirmation-assistant-proof/releases/tag/v0.1.0

## 目的

B2Bポートフォリオへ掲載するか判断するための文案ドラフトです。
このファイルは掲載判断用であり、B2B本番UIにはまだ反映していません。

## 掲載タイトル候補

フォローアップ確認と送信前レビュー AI秘書Proof

## 1行説明

サンプルのリマインダー候補を送信候補・保留・スキップ・文脈不足・確認必要に分類し、外部送信は確認キューへ回すAI秘書Proofです。

## 掲載カード本文案

フォローアップやリマインダーをAIが直接送信するのではなく、まず「送信候補」「保留」「スキップ」「文脈不足」「確認必要」に整理する公開Proofです。サンプル候補をもとに、期限・重要度・文脈の有無・宛先の有無を判定し、送る価値があるものだけdraft-onlyのアクションメモを作成します。メール、チャット、SMS、カレンダー通知など外部に影響する操作は自動実行せず、confirmation queueへ分離します。

## B2B向け訴求ポイント

- フォローアップ漏れ防止のAI秘書用途を説明しやすい
- AIが勝手に送信するのではなく、人間確認前提の導線を示せる
- no-send / draft-only / confirmation queue の安全境界が分かりやすい
- daily decision / Gmail triage / support ticket / schedule digest と並べてAI秘書の用途幅を見せられる
- 公開repoはサンプルデータのみで、実連絡先・実メッセージ履歴・実予定を含まない

## 成果指標候補

- リマインダー候補を送信候補 / 保留 / スキップ / 文脈不足 / 確認必要へ分けられるか
- draft-onlyのアクションメモを作れるか
- 外部送信が勝手に実行されず、確認キューに入るか
- 判断理由が期限・重要度・文脈の観点で説明できるか
- サンプルデータだけで安全にデモできるか

## 担当範囲として見せる内容

- reminder confirmation の安全境界設計
- サンプルリマインダー候補データ設計
- 期限・重要度・文脈不足の分類設計
- draft-only action note 設計
- confirmation queue 設計
- no-message-send の運用ガード
- public proof化に向けたREADME、CI、release整備

## 掲載時の注意

- 「自動で送信する」「自動で連絡する」とは書かない
- 「送信前レビュー」「下書き」「確認キュー」「人間承認前提」の表現に寄せる
- 実連絡先や実メッセージ履歴ではなく、公開用サンプルデータであることを明記する
- B2B本番UIへ載せる場合は、desktop / mobile / 実URLで目視確認してから反映する

## 短縮版コピー

フォローアップやリマインダーをAIが直接送信するのではなく、送信候補・保留・スキップ・文脈不足・確認必要に分類する公開Proofです。送る価値があるものはdraft-onlyのアクションメモを作成し、外部送信は確認キューへ回すことで、AI秘書を連絡業務に入れる前の安全境界を示しています。

## CTA近くに置く補足文案

AI秘書の導入で重要なのは、連絡をいきなり自動送信することではなく、送るべき候補と確認が必要な候補を分けることです。このProofでは、外部送信を確認キューへ分離し、フォローアップ業務に入れやすい安全境界を示しています。

## 次にUIへ載せる場合の最小手順

1. この文案から掲載本文を3〜5文に圧縮する。
2. daily / Gmail / support ticket / schedule / reminder の5 proofを同じセクションに並べるか判断する。
3. UI変更前に desktop / mobile の見え方を想定して短いセクション案を作る。
4. 実装後、local と production URL の両方を目視確認する。
5. 問い合わせCTAへの導線が過剰にならないよう、リンクは1箇所に絞る。
