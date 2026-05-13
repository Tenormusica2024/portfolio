# Cloud Market Racing Chart v2 UI / Performance Plan

作成日: 2026-05-13

## 目的

旧実装の Cloud Market Racing Chart を、現在のポートフォリオに載せやすい「軽いブラウザ実装 + 2026年時点のUI」に作り直す。
まずは UI レイアウト方針を固め、実装時にレーシングチャートが重くならない構成にする。

## UI レイアウト案

画像案:

- `images/repo-heroes/candidates/cloud-market-racing-chart-v2-ui-layout-formal-casual.webp`

採用した方向性:

- 1画面の中で Formal / Casual の2モードを比較できるデザインボードにした。
- Formal は白背景・業務ダッシュボード寄りで、採用担当やB2B文脈でも説明しやすい見た目。
- Casual は選択済みサムネイルAの方向性に近い、暗色・レーシング・データ可視化感のある見た目。
- どちらも同じデータ構造・同じチャート操作を使い、テーマだけを切り替える想定。

## 画面構成

- Header
  - Cloud Market Racing Chart v2
  - Formal / Casual segmented toggle
- Main Chart
  - Canvas-based racing bar chart
  - AWS / Azure / Google Cloud の横棒
  - 2015 → 2024 / 2024 Q4 表示
- Controls
  - Play / Pause
  - timeline scrubber
  - speed: 0.5x / 1x / 1.5x / 2x
  - reduced motion toggle
- Insights
  - leader
  - total market
  - previous quarter change
  - source link
- Performance Status
  - Canvas renderer
  - 60fps target
  - frame budget indicator

## 実装方針

推奨スタック:

- Vite + TypeScript
- Canvas 2D renderer
- UIは軽量に実装する。Reactを使う場合も、アニメーションフレームごとにReact stateを更新しない。
- D3.jsは使うとしても scale / interpolation / data shaping の補助に限定し、バー要素をDOMで毎フレーム更新しない。

## 重くしないためのベストプラクティス

1. チャート本体は SVG DOM ではなく Canvas 2D で描画する。
2. requestAnimationFrame の1ループで描画を集約し、setInterval は使わない。
3. UI state と animation state を分離する。
4. 再生中は React/Vue/Svelte の state 更新を毎フレーム発火させない。
5. 四半期データから補間フレームを事前計算、または必要最小限だけメモ化する。
6. レイアウト値、色、スケール、順位、ラベル幅は可能な範囲でキャッシュする。
7. resize は ResizeObserver + debounce / requestAnimationFrame でまとめる。
8. 非表示タブでは document.visibilityState を見て自動停止する。
9. prefers-reduced-motion と reduced motion toggle を実装する。
10. 大量データ化する場合は OffscreenCanvas + Worker を検討する。ただし現状の3系列程度ならメインスレッドCanvasで十分。
11. データ表示のアクセシビリティ用に、同じデータの静的テーブルを別途用意する。
12. 画像・装飾はCSS/Canvas側で抑制できるようにし、CasualモードでもGPU負荷の高い常時発光アニメーションを増やしすぎない。

## 次の実装順

1. 新規 Vite + TypeScript 構成を作る。
2. data/cloud-market-share.json を定義する。
3. Canvas renderer を先に作る。
4. Formal theme を実装する。
5. Casual theme を同じ renderer の theme config として追加する。
6. 再生/停止/速度/timeline scrubber をつける。
7. reduced motion / visibility pause / resize 最適化を追加する。
8. Lighthouse と手元のPerformance計測で frame budget を確認する。
