# Zenn記事自動更新システム 詳細仕様書

## 📋 概要

ポートフォリオサイト（https://tenormusica2024.github.io/portfolio/）のトップページに表示される「最新記事」セクションを、Zennの最新記事で自動的に更新するシステム。

**更新頻度**: 6時間ごと  
**対象URL**: https://tenormusica2024.github.io/portfolio/index.html  
**Zennアカウント**: https://zenn.dev/tenormusica

---

## 🎯 システム目的

- Zennで新しい記事を公開した際、手動でポートフォリオサイトを更新する手間を削減
- 常に最新の記事情報をポートフォリオサイトに自動反映
- GitHub Pages へのデプロイも自動化

---

## 🏗️ システム構成

### ファイル構成

```
C:\Users\Tenormusica\portfolio\
├── update_zenn_article.py      # メインスクリプト（Python）
├── run_zenn_update.bat         # 実行用バッチファイル
├── setup_zenn_task.ps1         # タスクスケジューラー登録スクリプト
├── index.html                  # 更新対象HTMLファイル
└── zenn_update.log             # 実行ログファイル（自動生成）
```

### システムフロー

```
[6時間ごとにトリガー]
    ↓
[run_zenn_update.bat 実行]
    ↓
[update_zenn_article.py 実行]
    ↓
[ZennのRSSフィード取得]
    ↓
[最新記事情報を抽出]
    ↓
[index.html の記事セクションを更新]
    ↓
[Git commit & push]
    ↓
[GitHub Pages 自動デプロイ]
```

---

## 📄 各ファイルの詳細仕様

### 1. update_zenn_article.py

**役割**: Zenn RSSフィードから最新記事を取得し、index.htmlを更新してGitHubにプッシュ

**依存ライブラリ**:
- `feedparser`: RSSフィード解析
- `re`: 正規表現によるHTML置換
- `subprocess`: Gitコマンド実行
- `pathlib`: ファイルパス操作

**主要関数**:

#### `fetch_latest_article()`
- **機能**: ZennのRSSフィードから最新記事を取得
- **取得URL**: `https://zenn.dev/tenormusica/feed`
- **戻り値**:
  ```python
  {
      'title': '記事タイトル',
      'description': '記事の説明文（要約）',
      'url': '記事URL',
      'published': '公開日時'
  }
  ```

#### `update_index_html(article)`
- **機能**: index.htmlの「最新記事」セクションを正規表現で置換
- **置換対象パターン**:
  ```regex
  (<div class="article-section">.*?<h2>📝 最新記事</h2>.*?<div class="article-card">.*?<h3 class="article-title">)(.*?)(</h3>.*?<p class="article-description">)(.*?)(</p>.*?<a href=")(.*?)(" class="article-link")
  ```
- **置換内容**:
  - タイトル: `article['title']`
  - 説明文: `article['description']`
  - URL: `article['url']`
- **戻り値**: 更新があった場合 `True`、変更なしの場合 `False`

#### `git_commit_and_push()`
- **機能**: 変更をGitにコミット・プッシュ
- **実行コマンド**:
  1. `git add index.html`
  2. `git commit -m "Update latest Zenn article\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"`
  3. `git push origin main`
- **戻り値**: 成功時 `True`、失敗時 `False`

#### `main()`
- **機能**: メイン処理フロー
- **処理手順**:
  1. 最新記事取得
  2. index.html更新判定
  3. 変更があればGitプッシュ

**実行例**:
```bash
cd "C:\Users\Tenormusica\portfolio"
python update_zenn_article.py
```

**出力例**:
```
=== Zenn Article Update Script - 2025-10-19 15:04:53.458359 ===
Latest article: Karpathy「AIエージェントは1年ではなく10年かかる」- 過剰予測への警告
Published: Sun, 19 Oct 2025 05:43:30 GMT
URL: https://zenn.dev/tenormusica/articles/karpathy-ai-agents-decade-not-year
Updated index.html with latest article: Karpathy「AIエージェントは1年ではなく10年かかる」- 過剰予測への警告
Successfully committed and pushed to GitHub
```

---

### 2. run_zenn_update.bat

**役割**: Pythonスクリプトを実行し、ログを記録

**内容**:
```batch
@echo off
cd /d C:\Users\Tenormusica\portfolio
python update_zenn_article.py >> zenn_update.log 2>&1
```

**機能説明**:
- `@echo off`: コマンド表示を抑制
- `cd /d C:\Users\Tenormusica\portfolio`: 作業ディレクトリに移動
- `>> zenn_update.log 2>&1`: 標準出力とエラー出力をログファイルに追記

**ログファイル**: `C:\Users\Tenormusica\portfolio\zenn_update.log`

---

### 3. setup_zenn_task.ps1

**役割**: Windows タスクスケジューラーにタスクを登録

**内容**:
```powershell
$taskName = "ZennArticleAutoUpdate"
$scriptPath = "C:\Users\Tenormusica\portfolio\run_zenn_update.bat"

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 6)

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Removed existing task: $taskName"
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Automatically update portfolio with latest Zenn article every 6 hours"
```

**タスク設定**:
- **タスク名**: `ZennArticleAutoUpdate`
- **実行間隔**: 6時間ごと（PT6H）
- **開始時刻**: スクリプト実行時刻から開始
- **バッテリー動作**: バッテリー駆動中も実行
- **説明**: "Automatically update portfolio with latest Zenn article every 6 hours"

**登録コマンド**:
```powershell
cd "C:\Users\Tenormusica\portfolio"
powershell -ExecutionPolicy Bypass -File setup_zenn_task.ps1
```

---

## 🔧 手動実行方法

### 即座に記事を更新したい場合

```bash
cd "C:\Users\Tenormusica\portfolio"
python update_zenn_article.py
```

### タスクスケジューラーの状態確認

```powershell
Get-ScheduledTask -TaskName "ZennArticleAutoUpdate"
```

### タスクの手動実行

```powershell
Start-ScheduledTask -TaskName "ZennArticleAutoUpdate"
```

### タスクの削除

```powershell
Unregister-ScheduledTask -TaskName "ZennArticleAutoUpdate" -Confirm:$false
```

---

## 📊 更新対象HTMLセクション

**ファイル**: `C:\Users\Tenormusica\portfolio\index.html`

**対象セクション**（行番号: 529-543）:
```html
<div class="article-section">
    <h2>📝 最新記事</h2>
    <div class="article-card">
        <span class="article-badge">NEW</span>
        <h3 class="article-title">【ここがタイトルに置き換わる】</h3>
        <p class="article-description">【ここが説明文に置き換わる】</p>
        <a href="【ここがURLに置き換わる】" class="article-link" target="_blank">記事を読む →</a>
    </div>
</div>
```

---

## 🔍 トラブルシューティング

### 記事が更新されない場合

1. **ログファイル確認**:
   ```bash
   type C:\Users\Tenormusica\portfolio\zenn_update.log
   ```

2. **手動実行でテスト**:
   ```bash
   cd "C:\Users\Tenormusica\portfolio"
   python update_zenn_article.py
   ```

3. **RSS フィード確認**:
   - ブラウザで https://zenn.dev/tenormusica/feed にアクセス
   - 最新記事が表示されているか確認

### Gitプッシュが失敗する場合

1. **Git認証確認**:
   ```bash
   git config --list | grep credential
   ```

2. **手動プッシュテスト**:
   ```bash
   cd "C:\Users\Tenormusica\portfolio"
   git status
   git push origin main
   ```

### タスクスケジューラーが動作しない場合

1. **タスクの状態確認**:
   ```powershell
   Get-ScheduledTask -TaskName "ZennArticleAutoUpdate" | Select-Object TaskName,State,LastRunTime,NextRunTime
   ```

2. **タスク履歴確認**:
   - タスクスケジューラーGUIを開く
   - `ZennArticleAutoUpdate` タスクを選択
   - 「履歴」タブで実行ログを確認

---

## 🔐 セキュリティ注意事項

- **Git認証情報**: Windows Credential Managerに保存
- **ログファイル**: 公開リポジトリに含めない（`.gitignore`に追加推奨）
- **RSS フィード**: 公開情報のため認証不要

---

## 📌 参考情報

- **GitHub リポジトリ**: https://github.com/Tenormusica2024/portfolio
- **GitHub Pages URL**: https://tenormusica2024.github.io/portfolio/
- **Zenn プロフィール**: https://zenn.dev/tenormusica
- **Zenn RSS フィード**: https://zenn.dev/tenormusica/feed

---

## 💡 今後の拡張案

1. **複数プラットフォーム対応**: Qiita、note等の記事も統合
2. **記事サムネイル自動取得**: OGP画像を取得して表示
3. **カテゴリー別表示**: 技術記事・創作記事を分離表示
4. **エラー通知**: 更新失敗時にメール通知
5. **統計情報表示**: 記事数・閲覧数等を自動取得

