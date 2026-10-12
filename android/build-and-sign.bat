@echo off
setlocal
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot
set ANDROID_HOME=C:\Users\mesau\AppData\Local\Android\Sdk

cd /d C:\Users\mesau\proyectos\APK Examen de Concienca\android

echo === Building APK ===
call gradlew.bat assembleRelease --no-daemon

echo.
echo === Signing APK with apksigner (SDK build-tools) ===
set APK_IN=app\build\outputs\apk\release\app-release.apk
set APK_OUT=app\build\outputs\apk\release\app-release-signed.apk
set KS=examen-conciencia.keystore

REM Use apksigner from build-tools with explicit JAVA_HOME
"%ANDROID_HOME%\build-tools\36.0.0\apksigner.bat" sign ^
    --ks "%KS%" ^
    --ks-pass pass:examenconciencia2024 ^
    --ks-key-alias examen-conciencia ^
    --key-pass pass:examenconciencia2024 ^
    --v2-signing-enabled true ^
    --v3-signing-enabled true ^
    --out "%APK_OUT%" ^
    "%APK_IN%"

if %ERRORLEVEL% neq 0 (
    echo ERROR: apksigner failed
    exit /b 1
)

echo.
echo === Verifying signature ===
"%ANDROID_HOME%\build-tools\36.0.0\apksigner.bat" verify --print-certs "%APK_OUT%"

if %ERRORLEVEL% neq 0 (
    echo ERROR: verification failed
    exit /b 1
)

echo.
echo SUCCESS: Signed APK at %APK_OUT%