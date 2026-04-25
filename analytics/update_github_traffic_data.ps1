# Update GitHub traffic data for the static analytics dashboard.
# This wrapper can be used manually or from Windows Task Scheduler.

[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [string]$Owner = 'Tenormusica2024',
    [switch]$CommitAndPush,
    [string]$CommitMessage = 'chore: update GitHub traffic analytics data'
)

$ErrorActionPreference = 'Stop'

$collectScript = Join-Path $PSScriptRoot 'collect_github_traffic.ps1'
& $collectScript -Owner $Owner -OutputDir (Join-Path $PSScriptRoot 'data')

if ($CommitAndPush) {
    Push-Location $RepoRoot
    try {
        git add -- analytics/data/github_traffic_latest.json analytics/data/github_traffic_history.csv
        $status = git status --porcelain -- analytics/data/github_traffic_latest.json analytics/data/github_traffic_history.csv
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host 'No GitHub traffic data changes to commit.'
            return
        }

        git commit -m $CommitMessage -- analytics/data/github_traffic_latest.json analytics/data/github_traffic_history.csv
        git push
    } finally {
        Pop-Location
    }
}
