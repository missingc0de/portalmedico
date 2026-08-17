$WorkingDir = "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB"

# Create a temporary batch file that sets the environment variables and runs the command
$BatchScript = @'
@echo off
set GH_TOKEN=%GH_TOKEN%
set CSC_IDENTITY_AUTO_DISCOVERY=false
cd /d "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB"

echo ====================================================
echo 1. Ejecutando compilacion del Frontend (Vite build)...
echo ====================================================
call npm run build
if %errorlevel% neq 0 (
  echo Error en la compilacion de Vite. Proceso cancelado.
  pause
  exit /b %errorlevel%
)

echo ====================================================
echo 2. Construyendo PORTAL MEDICO para Windows 10/11 (Electron 28)...
echo ====================================================
call npx electron-builder --win --publish always --config.nsis.artifactName="PORTAL_MEDICO_Setup_Win10_v${version}.${ext}"
if %errorlevel% neq 0 (
  echo Error en la compilacion de la version Windows 10. Proceso cancelado.
  pause
  exit /b %errorlevel%
)

echo ====================================================
echo ¡PROCESO FINALIZADO CON EXITO! La version de Windows 10 fue publicada.
echo ====================================================
pause
'@

$BatchPath = "$env:TEMP\build_electron_admin.bat"
Set-Content -Path $BatchPath -Value $BatchScript

# Run it as Administrator
Start-Process -FilePath "cmd.exe" -ArgumentList "/c ""$BatchPath""" -Verb RunAs -Wait
