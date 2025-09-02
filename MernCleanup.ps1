# MERN Stack Cleanup Script  
# PURPOSE: Aggressively removes problematic/outdated packages
# WHAT IT DOES:
#   1. Removes common trash packages (webpack in vite projects, etc)
#   2. Removes testing packages if you don't test
#   3. Clears node_modules and reinstalls everything fresh
#   4. Clears npm cache
# HOW TO USE: Run .\mern_cleanup.ps1 AFTER running audit script
# DANGEROUS: Will uninstall packages - make sure you have git backup
# WHEN TO USE: When packages are bloated, conflicting, or causing issues

Write-Host "=== MERN Stack Cleanup ===" -ForegroundColor Red
Write-Host "This will aggressively remove potentially problematic packages" -ForegroundColor Yellow

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

# Common problematic packages to remove
$commonTrash = @(
    "@types/node", # Often causes conflicts, let TS handle it
    "eslint-config-react-app", # Create React App baggage
    "react-scripts", # CRA dependency - you're using Vite
    "web-vitals", # CRA performance measuring
    "@testing-library/jest-dom", # If not testing
    "@testing-library/react", # If not testing
    "@testing-library/user-event", # If not testing
    "jest", # If not using
    "react-app-rewired", # CRA override tool
    "customize-cra", # CRA customization
    "workbox-webpack-plugin", # PWA stuff
    "source-map-explorer", # Bundle analyzer
    "craco", # CRA config override
    "@vitejs/plugin-legacy", # Legacy browser support
    "terser", # Minifier (Vite handles this)
    "autoprefixer", # CSS prefixer (often redundant)
    "postcss-preset-env" # CSS preprocessing (often redundant)
)

# Vite-specific cleanup
$viteTrash = @(
    "webpack", # Webpack with Vite is redundant
    "webpack-cli",
    "webpack-dev-server",
    "html-webpack-plugin",
    "mini-css-extract-plugin",
    "css-loader",
    "style-loader",
    "file-loader",
    "url-loader",
    "babel-loader", # Vite uses esbuild
    "@babel/core",
    "@babel/preset-env",
    "@babel/preset-react",
    "babel-preset-react-app"
)

# Server-side cleanup
$serverTrash = @(
    # "nodemon", # KEEP - needed for development
    "concurrently", # If using docker-compose
    "cross-env", # Environment variables (use .env)
    "rimraf", # File deletion utility
    "npm-run-all" # Script runner
)

function Remove-PackagesIfExists {
    param($packages, $location = ".")
    
    Push-Location $location
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $toRemove = @()
    
    foreach ($pkg in $packages) {
        if ($packageJson.dependencies.$pkg -or $packageJson.devDependencies.$pkg) {
            $toRemove += $pkg
        }
    }
    
    if ($toRemove.Count -gt 0) {
        Write-Host "Removing from $location`: $($toRemove -join ', ')" -ForegroundColor Yellow
        npm uninstall $toRemove
    }
    
    Pop-Location
}

# Clean root
Write-Host "`n1. Cleaning root packages..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Remove-PackagesIfExists $commonTrash
}

# Clean client
Write-Host "`n2. Cleaning client packages..." -ForegroundColor Cyan
if (Test-Path "client/package.json") {
    $clientTrash = $commonTrash + $viteTrash
    Remove-PackagesIfExists $clientTrash "client"
}

# Clean server
Write-Host "`n3. Cleaning server packages..." -ForegroundColor Cyan
if (Test-Path "server/package.json") {
    Remove-PackagesIfExists $serverTrash "server"
}

# Clear npm cache
Write-Host "`n4. Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force

# Clear node_modules and reinstall
Write-Host "`n5. Fresh install..." -ForegroundColor Cyan
$locations = @(".", "client", "server") | Where-Object { Test-Path "$_/package.json" }

foreach ($loc in $locations) {
    Push-Location $loc
    Write-Host "Cleaning $loc..." -ForegroundColor Yellow
    
    if (Test-Path "node_modules") {
        Remove-Item "node_modules" -Recurse -Force
    }
    if (Test-Path "package-lock.json") {
        Remove-Item "package-lock.json" -Force
    }
    
    Write-Host "Installing $loc..." -ForegroundColor Yellow
    npm install
    
    Pop-Location
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "Test your application now!" -ForegroundColor Yellow