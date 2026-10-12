@echo off
setlocal
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot
set ANDROID_HOME=C:\Users\mesau\AppData\Local\Android\Sdk
cd /d C:\Users\mesau\proyectos\APK Examen de Concienca\android
call gradlew.bat assembleRelease --no-daemon --stacktrace