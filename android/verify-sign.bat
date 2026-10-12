@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot
"C:\Users\mesau\AppData\Local\Android\Sdk\build-tools\36.0.0\apksigner.bat" verify --print-certs "C:\Users\mesau\proyectos\APK Examen de Conciencia\Examen_conciencia2\android\app\build\outputs\apk\release\app-release.apk"
pause