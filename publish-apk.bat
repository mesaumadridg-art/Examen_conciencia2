@echo off
REM publish-apk.bat — Publica nueva versión APK en el NAS (Windows)
REM Uso: publish-apk.bat <versionCode> <versionName> "<changelog>" [force]
REM Ejemplo: publish-apk.bat 2 1.1.0 "- Fix examen niños^
- Nueva oración" false

setlocal enabledelayedexpansion

REM ───── CONFIG NAS (del ERP) ─────
set NAS_USER=MEMG
set NAS_IP=192.168.1.26
set NAS_KEY=%USERPROFILE%\.ssh\mmg_nas_ed25519
set NAS_WEB_ROOT=/volume1/docker/examen-conciencia
REM URL base: usa Tailscale Funnel en dispositivo plex-router
set TAILNET_DOMAIN=taila3320d.ts.net
set FUNNEL_DEVICE=plex-router
set NAS_URL_BASE=https://%FUNNEL_DEVICE%.%TAILNET_DOMAIN%
REM ────────────────────────────────

set VERSION_CODE=%1
set VERSION_NAME=%2
set CHANGELOG=%3
set FORCE=%4
if "%FORCE%"=="" set FORCE=false

if "%VERSION_CODE%"=="" if "%VERSION_NAME%"=="" (
    echo Uso: %0 ^<versionCode^> ^<versionName^> "^<changelog^>" [force]
    echo Ej:  %0 2 1.1.0 "- Fix login^
- Nueva feature" false
    exit /b 1
)

set APK_LOCAL=android\app\build\outputs\apk\release\app-release-signed.apk
set APK_REMOTE=app-v%VERSION_CODE%.apk

if not exist "%APK_LOCAL%" (
    echo ❌ No existe %APK_LOCAL%. Ejecuta primero: build-and-sign.bat
    exit /b 1
)

echo === Publicando v%VERSION_NAME% (code: %VERSION_CODE%) ===

REM 1. Subir APK
echo 📤 Subiendo APK...
scp -i "%NAS_KEY%" -o StrictHostKeyChecking=no "%APK_LOCAL%" "%NAS_USER%@%NAS_IP%:%NAS_WEB_ROOT%/%APK_REMOTE%"
if errorlevel 1 (
    echo ❌ Error subiendo APK
    exit /b 1
)

REM 2. Generar y subir update.json
echo 📝 Generando update.json...
set "UPDATE_JSON={\n  \"versionCode\": %VERSION_CODE%,\n  \"versionName\": \"%VERSION_NAME%\",\n  \"url\": \"%NAS_URL_BASE%/%APK_REMOTE%\",\n  \"changelog\": \"%CHANGELOG%\",\n  \"force\": %FORCE%\n}"

echo !UPDATE_JSON! | ssh -i "%NAS_KEY%" -o StrictHostKeyChecking=no "%NAS_USER%@%NAS_IP%" "cat > %NAS_WEB_ROOT%/update.json"
if errorlevel 1 (
    echo ❌ Error subiendo update.json
    exit /b 1
)

REM 3. Verificar
echo ✅ Verificando...
ssh -i "%NAS_KEY%" -o StrictHostKeyChecking=no "%NAS_USER%@%NAS_IP%" "ls -lh %NAS_WEB_ROOT%/"
curl -s "%NAS_URL_BASE%/update.json"

echo.
echo 🎉 Publicado v%VERSION_NAME%
echo    APK:     %NAS_URL_BASE%/%APK_REMOTE%
echo    JSON:    %NAS_URL_BASE%/update.json
echo.
echo 📱 En la app: Configuración → Actualizaciones → pega: %NAS_URL_BASE%/update.json