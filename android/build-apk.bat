@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot
set ANDROID_HOME=C:\Users\mesau\AppData\Local\Android\Sdk
cd /d C:\Users\mesau\proyectos\APK Examen de Conciencia\Examen_conciencia2\android
call gradlew.bat assembleRelease --no-daemon