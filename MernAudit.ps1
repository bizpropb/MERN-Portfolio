# MERN Stack Dependency Audit Script
# PURPOSE: Safe read-only health check of all your MERN packages
# WHAT IT DOES:
#   1. Lists all installed packages in root/client/server
#   2. Shows which packages are outdated 
#   3. Scans for security vulnerabilities
#   4. Checks bundle sizes
# HOW TO USE: Run .\mern_audit.ps1 from project root
# SAFE: Changes nothing, only reads and reports

Write-Host "=== MERN Stack Dependency Audit ===" -ForegroundColor Green

# Check current location
Write-Host "`nCurrent directory: $(Get-Location)" -ForegroundColor Yellow

# First, let's see the current package.json files
Write-Host "`n1. Checking package.json files..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Write-Host "Root package.json found"
    npm list --depth=0
}

if (Test-Path "client/package.json") {
    Write-Host "`nClient package.json found"
    Set-Location client
    npm list --depth=0
    Set-Location ..
}

if (Test-Path "server/package.json") {
    Write-Host "`nServer package.json found"
    Set-Location server
    npm list --depth=0
    Set-Location ..
}

# Check for outdated packages
Write-Host "`n2. Checking for outdated packages..." -ForegroundColor Cyan
Write-Host "Root:" -ForegroundColor Yellow
npm outdated

if (Test-Path "client/package.json") {
    Write-Host "`nClient:" -ForegroundColor Yellow
    Set-Location client
    npm outdated
    Set-Location ..
}

if (Test-Path "server/package.json") {
    Write-Host "`nServer:" -ForegroundColor Yellow
    Set-Location server
    npm outdated
    Set-Location ..
}

# Check for security vulnerabilities
Write-Host "`n3. Security audit..." -ForegroundColor Cyan
npm audit --audit-level=moderate

if (Test-Path "client/package.json") {
    Set-Location client
    npm audit --audit-level=moderate
    Set-Location ..
}

if (Test-Path "server/package.json") {
    Set-Location server
    npm audit --audit-level=moderate
    Set-Location ..
}

# Check bundle sizes (if applicable)
Write-Host "`n4. Bundle analysis..." -ForegroundColor Cyan
if (Test-Path "client/package.json") {
    Set-Location client
    if (Get-Command "npx" -ErrorAction SilentlyContinue) {
        Write-Host "Analyzing client bundle size..."
        npx webpack-bundle-analyzer --help | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "webpack-bundle-analyzer available - run manually: npx webpack-bundle-analyzer build/static/js/*.js"
        }
    }
    Set-Location ..
}

Write-Host "`n=== Audit Complete ===" -ForegroundColor Green
Write-Host "Review the output above and run the cleanup script next." -ForegroundColor Yellow