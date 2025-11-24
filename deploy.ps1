param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "Update portfolio content"
)

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

# Add all changes
Write-Host "1. Adding changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "2. Committing with message: '$Message'..." -ForegroundColor Yellow
git commit -m "$Message"

# Push
Write-Host "3. Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment pushed successfully! GitHub Pages will update shortly." -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
}
