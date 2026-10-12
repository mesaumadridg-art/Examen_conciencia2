#!/bin/bash
# Build script para generar APK firmado de Examen de Conciencia
# Requiere: Node.js, npm, Java/JDK, Android SDK

set -e

echo "=== Build Examen de Conciencia APK ==="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

echo -e "${YELLOW}Directorio del proyecto: $PROJECT_DIR${NC}"
echo -e "${YELLOW}Directorio Android: $ANDROID_DIR${NC}"

# 1. Verificar keystore.properties
if [ ! -f "$ANDROID_DIR/keystore.properties" ]; then
    echo -e "${RED}ERROR: No se encuentra android/keystore.properties${NC}"
    echo "Copia android/keystore.properties.example a android/keystore.properties y edita las contraseñas."
    exit 1
fi

# 2. Build web app
echo -e "${GREEN}[1/4] Building web app (Vite)...${NC}"
cd "$PROJECT_DIR"
npm run build

# 3. Sync Capacitor
echo -e "${GREEN}[2/4] Syncing Capacitor...${NC}"
npx cap sync android

# 4. Build APK
echo -e "${GREEN}[3/4] Building signed APK...${NC}"
cd "$ANDROID_DIR"
./gradlew assembleRelease

# 5. Verificar APK generado
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo -e "${GREEN}[4/4] APK generado exitosamente!${NC}"
    echo -e "${GREEN}Ubicación: $APK_PATH${NC}"
    
    # Info del APK
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${YELLOW}Tamaño: $APK_SIZE${NC}"
    
    # Verificar firma
    echo -e "${GREEN}Verificando firma...${NC}"
    if command -v jarsigner &> /dev/null; then
        jarsigner -verify -verbose -certs "$APK_PATH" 2>&1 | head -20
    fi
else
    echo -e "${RED}ERROR: No se generó el APK${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Build completado ===${NC}"
echo ""
echo "Para distribuir:"
echo "1. Copia el APK a tu NAS: $APK_PATH"
echo "2. Actualiza android/update.json con la nueva versionCode y URL"
echo "3. Sirve update.json y el APK desde tu NAS (HTTP/HTTPS)"
echo "4. Los usuarios verán la actualización en Configuración > Actualizaciones desde tu NAS"