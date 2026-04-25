# Register a Windows Task Scheduler job for GitHub traffic collection.
# Default: generate local JSON/CSV daily at 09:10.
# Add -CommitAndPush if this machine should also publish only the generated data files.

[CmdletBinding()]
param(
    [string]$TaskName = 'PortfolioGitHubTrafficCollect',
    [string]$At = '09:10',
    [switch]$CommitAndPush
)

$ErrorActionPreference = 'Stop'

$updateScript = Join-Path $PSScriptRoot 'update_github_traffic_data.ps1'
if (-not (Test-Path $updateScript)) {
    throw "Update script not found: $updateScript"
}

$arguments = @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', ('"{0}"' -f $updateScript)
)
if ($CommitAndPush) {
    $arguments += '-CommitAndPush'
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ($arguments -join ' ')
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description 'Collect GitHub repository traffic for portfolio analytics dashboard' -Force | Out-Null

Write-Host "Registered task: $TaskName"
Write-Host "Schedule: daily at $At"
Write-Host "Command: powershell.exe $($arguments -join ' ')"
if (-not $CommitAndPush) {
    Write-Host 'Note: data is generated locally only. Run with -CommitAndPush if you want the task to publish generated JSON/CSV files.'
}
