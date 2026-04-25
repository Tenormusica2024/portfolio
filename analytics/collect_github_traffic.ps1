# Collect GitHub repository traffic for the portfolio analytics dashboard.
#
# Requirements:
#   - GitHub CLI (`gh`) installed and authenticated as an account with push access
#   - Token scopes that can read repository traffic (repo scope is enough for private; public_repo for public)
#
# Default behavior intentionally exports PUBLIC, non-archived repositories only because
# files under analytics/data are published with the static portfolio site.

[CmdletBinding()]
param(
    [string]$Owner = "Tenormusica2024",
    [string]$OutputDir = "$PSScriptRoot\data",
    [ValidateSet('public','all')]
    [string]$Visibility = 'public',
    [switch]$IncludeArchived,
    [switch]$IncludePrivate
)

$ErrorActionPreference = 'Stop'

function Invoke-GhJson {
    param([Parameter(Mandatory=$true)][string[]]$Arguments)
    $raw = & gh @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "gh $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
    if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
    return $raw | ConvertFrom-Json
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$repoListArgs = @('repo','list',$Owner,'--limit','200','--json','name,nameWithOwner,isPrivate,isArchived,url,description,stargazerCount,forkCount,updatedAt,pushedAt')
if ($Visibility -eq 'public' -and -not $IncludePrivate) {
    $repoListArgs += @('--visibility','public')
}

$repos = Invoke-GhJson -Arguments $repoListArgs
if (-not $IncludeArchived) {
    $repos = @($repos | Where-Object { -not $_.isArchived })
}
if (-not $IncludePrivate) {
    $repos = @($repos | Where-Object { -not $_.isPrivate })
}

$collectedAt = (Get-Date).ToUniversalTime().ToString('o')
$rows = @()

foreach ($repo in $repos) {
    $name = $repo.name
    $base = "repos/$Owner/$name/traffic"

    $views = $null
    $clones = $null
    $referrers = @()
    $paths = @()
    $errorMessage = $null

    try {
        $views = Invoke-GhJson -Arguments @('api', "$base/views")
        $clones = Invoke-GhJson -Arguments @('api', "$base/clones")
        try { $referrers = @(Invoke-GhJson -Arguments @('api', "$base/popular/referrers")) } catch { $referrers = @() }
        try { $paths = @(Invoke-GhJson -Arguments @('api', "$base/popular/paths")) } catch { $paths = @() }
    } catch {
        $errorMessage = $_.Exception.Message
    }

    $viewCount = if ($views -and $null -ne $views.count) { [int]$views.count } else { 0 }
    $viewUniques = if ($views -and $null -ne $views.uniques) { [int]$views.uniques } else { 0 }
    $cloneCount = if ($clones -and $null -ne $clones.count) { [int]$clones.count } else { 0 }
    $cloneUniques = if ($clones -and $null -ne $clones.uniques) { [int]$clones.uniques } else { 0 }

    $rows += [pscustomobject]@{
        name = $name
        name_with_owner = $repo.nameWithOwner
        url = $repo.url
        description = $repo.description
        is_private = [bool]$repo.isPrivate
        is_archived = [bool]$repo.isArchived
        stars = [int]$repo.stargazerCount
        forks = [int]$repo.forkCount
        updated_at = $repo.updatedAt
        pushed_at = $repo.pushedAt
        views = $viewCount
        unique_visitors = $viewUniques
        clones = $cloneCount
        unique_cloners = $cloneUniques
        top_referrers = @($referrers | Select-Object -First 5)
        top_paths = @($paths | Select-Object -First 5)
        error = $errorMessage
    }
}

$rows = @($rows | Sort-Object -Property @{ Expression = 'views'; Descending = $true }, @{ Expression = 'clones'; Descending = $true }, @{ Expression = 'unique_visitors'; Descending = $true })

$summary = [pscustomobject]@{
    repo_count = $rows.Count
    total_views = [int](($rows | Measure-Object -Property views -Sum).Sum)
    total_unique_visitors = [int](($rows | Measure-Object -Property unique_visitors -Sum).Sum)
    total_clones = [int](($rows | Measure-Object -Property clones -Sum).Sum)
    total_unique_cloners = [int](($rows | Measure-Object -Property unique_cloners -Sum).Sum)
    repos_with_views = @($rows | Where-Object { $_.views -gt 0 }).Count
    repos_with_clones = @($rows | Where-Object { $_.clones -gt 0 }).Count
}

$output = [pscustomobject]@{
    collected_at = $collectedAt
    owner = $Owner
    window = 'GitHub Traffic API rolling 14 days'
    visibility = if ($IncludePrivate) { $Visibility } else { 'public' }
    includes_private = [bool]$IncludePrivate
    includes_archived = [bool]$IncludeArchived
    summary = $summary
    repositories = $rows
}

$latestPath = Join-Path $OutputDir 'github_traffic_latest.json'
$output | ConvertTo-Json -Depth 12 | Set-Content -Path $latestPath -Encoding UTF8

$historyPath = Join-Path $OutputDir 'github_traffic_history.csv'
$historyRows = foreach ($row in $rows) {
    [pscustomobject]@{
        collected_at = $collectedAt
        owner = $Owner
        repo = $row.name
        views = $row.views
        unique_visitors = $row.unique_visitors
        clones = $row.clones
        unique_cloners = $row.unique_cloners
        stars = $row.stars
        forks = $row.forks
    }
}

if (Test-Path $historyPath) {
    $historyRows | Export-Csv -Path $historyPath -NoTypeInformation -Encoding UTF8 -Append
} else {
    $historyRows | Export-Csv -Path $historyPath -NoTypeInformation -Encoding UTF8
}

Write-Host "Wrote $latestPath"
Write-Host "Appended $($historyRows.Count) rows to $historyPath"
Write-Host ("Repos: {0}, Views: {1}, Unique visitors: {2}, Clones: {3}" -f $summary.repo_count, $summary.total_views, $summary.total_unique_visitors, $summary.total_clones)
