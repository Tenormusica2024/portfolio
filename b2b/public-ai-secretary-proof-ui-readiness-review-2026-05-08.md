# Public AI Secretary Proof UI Readiness Review 2026-05-08

目的: B2B UIへ公開AI秘書proofセクションを反映する前に、文案・構成・リンク方針・リスクを確認する。  
このファイルはレビュー結果であり、B2B本番UI・CTA・レイアウトにはまだ反映していない。

## レビュー対象

- `b2b/public-ai-secretary-proof-section-plan-2026-05-08.md`
- `b2b/public-ai-secretary-proof-final-card-copy-2026-05-08.md`
- `b2b/public-ai-secretary-proof-index-2026-05-08.md`
- 6本の公開proof repo
  - `daily-decision-assistant-proof`
  - `gmail-triage-assistant-proof`
  - `support-ticket-triage-proof`
  - `schedule-digest-assistant-proof`
  - `reminder-confirmation-assistant-proof`
  - `meeting-prep-assistant-proof`

## 結論

UI反映前のdocs素材は、おおむね実装可能な状態。  
ただし、B2B本番UIへ入れる時は「代表3カード + 補助3リンク + CTA 1つ」に絞る方針を守るのが安全。

理由:
- 6本すべてを同列カード化すると、初見で情報量が多くなる。
- 代表3本だけで、判断支援・問い合わせ整理・予定整理の幅は伝わる。
- 補助3本は、追加パターンとして短く見せれば「横展開できる」証拠になる。
- CTAを増やさないことで、問い合わせ導線を弱めにくい。

## 整合性チェック

| 観点 | 判定 | コメント |
|---|---|---|
| 代表3本の選定 | OK | Daily Decision / Support Ticket / Schedule Digest はB2Bで説明しやすい |
| 補助3本の扱い | OK | Gmail / Reminder / Meeting Prep は補助リンクとして十分 |
| 安全境界 | OK | no-send / no-update / confirmation queue が一貫している |
| 文案の長さ | 要注意 | 現在のカード本文は2文だが、UI幅によっては長く見える可能性あり |
| リンク数 | OK | 代表3カードに各1リンク、補助3本は1行リンクなら過剰ではない |
| CTA | OK | セクション全体で1つに留める方針が明記済み |
| 公開境界 | OK | 公開repo URLと一般化した説明のみ。内部運用名は含めない方針 |
| UI反映可否 | 条件付きOK | desktop / mobile / production URL の目視確認ができる時に限る |

## 推奨実装方針

### セクション構成

1. セクション見出し
   - `AI秘書を安全に業務へ入れるための公開Proof`
2. リード文
   - final-card-copy のセクションリード文を使用。
3. 代表3カード
   - Daily Decision
   - Support Ticket Triage
   - Schedule Digest
4. 関連proofリンク
   - Gmail Triage
   - Reminder Confirmation
   - Meeting Prep
5. CTA
   - proof群の下に1つだけ置く。

### 実装時のカード仕様

- カードタイトル: 1行から2行に収まる長さを優先。
- 本文: 2文まで。説明を増やさない。
- 安全境界ラベル: 小さめの補助テキストとして置く。
- GitHubリンク: 代表3カードに1つずつ。
- 補助リンク: 3本を1行ずつ。カード化しない。

## UI反映前のリスク

### 1. 情報過多

リスク:
- 代表3カード + 補助3リンクでも、既存ページの文量次第では重く見える可能性がある。

対策:
- まず代表3カードだけで実装し、補助3リンクは短いテキストブロックにする。
- 長く見える場合は、補助3リンクを `その他の公開Proof` 1リンクへ集約する。

### 2. 「完全自動化」に見える誤解

リスク:
- AI秘書という言葉だけを見ると、自動送信・自動更新の印象を持たれる可能性がある。

対策:
- リード文とCTA近くの補足で、確認キュー・人間承認前提を明記する。
- 「自動送信」「自動更新」「完全自動化」は使わない。

### 3. GitHubリンクがCTAを弱める

リスク:
- GitHubリンクが多いと、問い合わせCTAよりrepo閲覧に流れる可能性がある。

対策:
- 代表3カードのGitHubリンクは小さめに置く。
- 補助3本はテキストリンク扱いにする。
- CTAはセクション下に1つだけ置く。

### 4. モバイル表示でカードが長くなる

リスク:
- 2文本文でも、mobileではカードが縦に長く見える可能性がある。

対策:
- mobile確認時に、本文を1文版へ短縮する代替案を用意する。
- 安全境界ラベルを折り返しにくい短い表記にする。

## 未決事項

1. CTA文言
   - 既存ページのCTAと合わせる必要があるため、このdocsでは未確定。
2. 補助3リンクの配置
   - 代表3カード直下に置くか、proof indexへの1リンクにまとめるかはUI幅を見て判断。
3. セクション位置
   - 既存B2Bページ内のどこに置くかは、実際のページ構成確認後に判断。
4. mobile本文量
   - 目視確認後、必要なら1文版へ短縮する。

## UI反映に進む条件

- localで対象ページを起動できる。
- desktop / mobile のスクリーンショット確認ができる。
- production URL反映後の表示確認ができる。
- 変更範囲をproofセクション追加または既存proofセクション更新に限定できる。
- CTAや既存ページ全体の導線を不用意に変えない。

## 今すぐUIへ反映しない理由

- UI変更は目視確認が必須。
- カード幅、改行、CTAとの距離は実画面で見ないと判断しにくい。
- 現時点ではdocs素材を揃える段階として十分に前進している。

## 次アクション

目視確認できるタイミングで、以下の順に進める。

1. B2Bページの該当セクション候補を確認する。
2. final-card-copy の代表3カードをlocal UIへ反映する。
3. desktop / mobileで表示確認する。
4. 必要なら本文を短縮する。
5. production URLへ反映し、再度desktop / mobile確認する。
