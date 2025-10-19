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

Write-Host "`n=== Task Registration Complete ===" -ForegroundColor Green
Write-Host "Task Name: $taskName"
Write-Host "Interval: Every 6 hours"
Write-Host "Script: $scriptPath"
Write-Host "`nTo verify, run: Get-ScheduledTask -TaskName '$taskName'"
