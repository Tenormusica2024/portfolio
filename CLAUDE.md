# Portfolio Project Instructions

## サイト概要
- **ブランド**: Urayaha Days（C2C・個人向けポートフォリオ）
- **URL**: https://tenormusica2024.github.io/portfolio/
- **B2Bサイト**: Ezlize（別サイト。このリポジトリとは別管理）

## C2C方針（必須）
- **採用向け情報を載せない**: 希望年収・正社員希望・フルタイム募集はB2Bサイト（Ezlize）側の情報
- **フリーランスは「副業」として位置づける**: 「フリーランスとして就労」ではなく「副業フリーランスとして活動」
- **現職特定を防ぐ表現**: 「社内展開」→「現場展開」、「社内環境」→「実務環境」

## コンテンツ方針
- **Under Constructionリンク**: `href="#"` のリンクは削除（カード本体は残す）
- **Presentationsページ本文**: 英語対応なし（日本語のみ）。ナビのラベルは英語対応あり
- **作業用MVのリンク先**: `creation.html` に統一（projects.htmlからもcreation.htmlへ）
- **制作日**: 全プロジェクトカードに `.project-year` バッジで年を表示
- **NEWバッジ**: 年をまたいで全件NEWは不自然 → creation.htmlでは使わない（削除済み）
- **現職特定防止の追加パターン**: 「社内FAQ」→「FAQ」、「本業で〜実績」→「実務で〜実績」
- **ツール表記**: philosophy文脈では「Codex CLI」でなく「Cursor」を使用（旬感を維持）
- **数値クレーム**: 「90%自動化達成」等は現状維持（根拠あり前提で掲載継続）

## SEO方針
- Title: 45〜60文字・キーワード入り
- Meta description: 120〜160文字
- target="_blank" には必ず rel="noopener noreferrer"

## 技術情報の確認ルール
- AIモデルのバージョン・リリース状況など、知識カットオフ以降の情報は **必ずWebSearchで確認してから提案する**
- grok-3-miniはweb非対応のため、最新技術情報はWebSearch toolを使用

## 学んだ教訓
- 2026-03-28 Gemini 3の存在確認: Gemini 3は2025年11月18日リリース済み（3.1 Proも登場）。古い知識ベースで「未リリース」と提案してしまった → 技術情報は事前にWebSearchで確認
