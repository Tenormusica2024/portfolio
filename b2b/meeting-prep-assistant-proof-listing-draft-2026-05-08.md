# Meeting Prep Assistant Proof - B2B Listing Draft

作成日: 2026-05-08
対象repo: `meeting-prep-assistant-proof`
公開repo: https://github.com/Tenormusica2024/meeting-prep-assistant-proof
Release: https://github.com/Tenormusica2024/meeting-prep-assistant-proof/releases/tag/v0.1.0

## 目的

B2Bポートフォリオへ掲載するか判断するための文案ドラフトです。
このファイルは掲載判断用であり、B2B本番UIにはまだ反映していません。

## 掲載タイトル候補

会議前準備と確認事項整理 AI秘書Proof

## 1行説明

サンプル会議情報を準備済み・議題不足・文脈不足・確認必要・後日対応に分類し、参加者送付やカレンダー更新は確認キューへ回すAI秘書Proofです。

## 掲載カード本文案

会議前準備をAIが直接送信・更新するのではなく、まず「準備済み」「議題不足」「文脈不足」「確認必要」「後日対応」に整理する公開Proofです。サンプル会議情報をもとに、agenda、open questions、context notes を確認し、会議前briefをdraft-onlyで作成します。参加者への送付、資料共有、カレンダー更新など外部に影響する操作は自動実行せず、confirmation queueへ分離します。

## B2B向け訴求ポイント

- 会議前準備・論点整理・未確認事項の抽出を説明しやすい
- AIが勝手に参加者へ送付・予定更新するのではなく、人間確認前提の導線を示せる
- no-participant-send / no-calendar-update / confirmation queue の安全境界が分かりやすい
- 既存のAI秘書proof群と並べて、業務補助の用途幅を見せられる
- 公開repoはサンプルデータのみで、実会議ログ・実参加者名・実リンクを含まない

## 成果指標候補

- 会議を準備済み / 議題不足 / 文脈不足 / 確認必要 / 後日対応へ分けられるか
- draft-onlyの会議前briefを作れるか
- 参加者送付やカレンダー更新が勝手に実行されず、確認キューに入るか
- 判断理由がagenda・context・open questionsの観点で説明できるか
- サンプルデータだけで安全にデモできるか

## 担当範囲として見せる内容

- meeting prep の安全境界設計
- サンプル会議データ設計
- agenda / context / open questions の分類設計
- draft-only meeting brief 設計
- confirmation queue 設計
- no-participant-send / no-calendar-update の運用ガード
- public proof化に向けたREADME、CI、release整備

## 掲載時の注意

- 「自動で参加者へ送る」「自動で予定を更新する」とは書かない
- 「会議前準備」「下書き」「確認キュー」「人間承認前提」の表現に寄せる
- 実会議ログや実参加者情報ではなく、公開用サンプルデータであることを明記する
- B2B本番UIへ載せる場合は、desktop / mobile / 実URLで目視確認してから反映する

## 短縮版コピー

会議情報をAIが直接送信・更新するのではなく、準備済み・議題不足・文脈不足・確認必要・後日対応に分類する公開Proofです。会議前briefはdraft-onlyで作成し、参加者送付やカレンダー更新は確認キューへ回すことで、AI秘書を会議準備に入れる前の安全境界を示しています。

## CTA近くに置く補足文案

AI秘書の価値は、会議資料や予定を勝手に送ることではなく、会議前に足りない議題・文脈・確認事項を見える化することです。このProofでは、外部操作を確認キューへ分離し、会議準備に入れやすい安全境界を示しています。

## 次にUIへ載せる場合の最小手順

1. この文案から掲載本文を3〜5文に圧縮する。
2. 既存proof群を同じセクションに並べるか、代表proofだけに絞るか判断する。
3. UI変更前に desktop / mobile の見え方を想定して短いセクション案を作る。
4. 実装後、local と production URL の両方を目視確認する。
5. 問い合わせCTAへの導線が過剰にならないよう、リンクは1箇所に絞る。
