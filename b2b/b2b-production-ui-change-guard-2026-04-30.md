# B2B Production UI Change Guard 2026-04-30

## 判断

レビュー担当者が目視確認しにくい状態では、B2B本番UIの変更は原則行わない。
B2Bページは文言、改行、CTA、業種別ページ、公開状態など、個別ルールが多く、通常の汎用UI修正よりリスクが高い。

## 保留理由

- レビュー担当者が本番UIを目視確認できない状態では、文言・CTA・レイアウト変更のリスクが高い。
- B2Bは発注者向けの信頼・営業導線に直結するため、細かな文言・配置・改行の違いが影響しやすい。
- 公開面のヘルスチェックでは、主要ページが 200 を返し、canonical WebP 参照も確認済み。
- したがって、公開面の検証・運用手順固定までは進め、UI本文への反映はレビュー担当者が確認できるタイミングに回す。

## 現在確認済み

- 認証情報なし公開面チェック: `node scripts/check_b2b_cloudflare_public.js`
- Static build check: `node scripts/build_b2b_cloudflare.js`
- 主要5ページ: home + 4 service pages

## UI変更候補（レビュー可能なタイミングで再開）

1. B2B workflow proof素材の「担当範囲・成果指標」を、公開ページに載せるか判断する。
2. 載せる場合は1ページずつ小さく追加し、desktop / mobile / 実ページURLで目視確認する。
3. `workflow-proof-images/*.png` は現行HTMLの正ではなく、proof素材スナップショットとして扱う。
4. 現行ページ画像の正は `b2b/assets/*.webp` と各HTMLの参照。
5. Production provider settings、production branch、dashboard側build commandは未確認。Provider dashboard または権限付きCLIで確認する。

## 禁止・注意

- レビュー担当者が目視確認できない遠隔タスクでは、B2B本番UIの文言・CTA・レイアウトを原則変更しない。
- DOM確認だけで「表示OK」としない。
- reveal / animation state を強制変更して確認済みにしない。
- provider を古いdocsだけで決め打ちしない。
