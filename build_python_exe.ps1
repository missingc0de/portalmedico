# PowerShell script to compile frontend and build the Python webview executable

$WorkspaceDir = "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB"
Set-Location $WorkspaceDir

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "1. Compiling React Frontend (npm run build)..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "React compilation failed. Build aborted."
    Exit 1
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "2. Installing required Python libraries..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
pip install pywebview pyinstaller

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "3. Bundling application using PyInstaller..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Stop any running instances of the webview to prevent permission errors
Stop-Process -Name "run_webview" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Clean previous build artifacts
if (Test-Path "dist-python") { Remove-Item -Recurse -Force "dist-python" }
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "run_webview.spec") { Remove-Item -Force "run_webview.spec" }

# Build the executable
# --noconsole prevents the command prompt window from showing
# --onefile bundles everything into a single .exe
# --icon embeds the portal medico icon
# --add-data copies the static assets directory
python -m PyInstaller --noconsole --onefile --icon="portalmedico.ico" --add-data "dist;dist" --distpath "dist-python" run_webview.py

if ($LASTEXITCODE -ne 0) {
    Write-Error "PyInstaller bundling failed."
    Exit 1
}

Write-Host "==============================================" -ForegroundColor Green
Write-Host "¡PROCESO FINALIZADO CON EXITO!" -ForegroundColor Green
Write-Host "Executable generated at: dist-python\run_webview.exe" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
