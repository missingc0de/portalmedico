# PowerShell Script to create the official Windows Setup Installer for PORTAL MÉDICO v1.4.29

$WorkspaceDir = "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB"
Set-Location $WorkspaceDir

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "1. Building Python Executable..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\build_python_exe.ps1

if (-not (Test-Path "dist-python\run_webview.exe")) {
    Write-Error "Error: dist-python\run_webview.exe missing."
    Exit 1
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "2. Creating Windows Setup Installer..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$InstallerDir = "dist-installer"
if (-not (Test-Path $InstallerDir)) { New-Item -ItemType Directory -Path $InstallerDir | Out-Null }

$IconPath = Join-Path $WorkspaceDir "portalmedico.ico"
$HasIcon = Test-Path $IconPath

$SourceFile = Join-Path $InstallerDir "InstallerSource.cs"
$PayloadExe = Join-Path $WorkspaceDir "dist-python\run_webview.exe"
$OutInstallerExe = Join-Path $InstallerDir "PortalMedico_Setup_v1.4.29.exe"

$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$CscArgs = @("/target:winexe", "/codepage:65001", "/out:$OutInstallerExe", "/r:System.dll", "/r:System.Windows.Forms.dll", "/r:System.Drawing.dll", "/r:System.Core.dll", "/resource:$PayloadExe,PortalMedico.exe")

if ($HasIcon) {
    $CscArgs += "/win32icon:$IconPath"
}

$CscArgs += $SourceFile

Write-Host "Compiling setup installer with csc.exe..." -ForegroundColor Cyan
& $CscPath $CscArgs

if (Test-Path $OutInstallerExe) {
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "INSTALADOR CREADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "Installer executable generated at: $OutInstallerExe" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
} else {
    Write-Error "Failed to generate installer executable."
    Exit 1
}
