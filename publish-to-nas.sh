#!/bin/bash
# Script para publicar actualización en NAS
# Uso: ./publish-to-nas.sh <versionCode> <versionName> <changelog> [force]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# CONFIGURA ESTAS VARIABLES PARA TU NAS
NAS_USER="usuario"
NAS_HOST="192.168.1.100"
NAS_PATH="/mnt/datos/examen-conciencia"
NAS_URL_BASE="http://192.168.1.100/examen-conciencia"

# O si usas SSH key:
# NAS_USER="usuario"
# NAS_HOST="nas.local"
# NAS_PATH="/volume1/docker/examen-conciencia"
# NAS_URL_BASE="https://nas.tu-dominio.com/examen-conciencia"

VERSION_CODE=${1}
VERSION_NAME=${2}
CHANGELOG=${3}
FORCE=${4:-false}

if [ -z "$VERSION_CODE" ] || [ -z "$VERSION_NAME" ] || [ -z "$CHANGELOG" ]; then
    echo -e "${RED}Uso: $0 <versionCode> <versionName> <changelog> [force]${NC}"
    echo "Ejemplo: $0 2 1.1.0 \"- Fix login\n- Nueva pantalla\" false"
    exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK_SOURCE="$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk"
APK_DEST_NAME="app-v${VERSION_CODE}.apk"

echo -e "${YELLOW}=== Publicando versión $VERSION_NAME (build $VERSION_CODE) ===${NC}"

# Verificar que existe el APK
if [ ! -f "$APK_SOURCE" ]; then
    echo -e "${RED}ERROR: No se encuentra APK en $APK_SOURCE${NC}"
    echo "Primero ejecuta ./build-apk.sh"
    exit 1
fi

# Copiar APK al NAS
echo -e "${GREEN}[1/3] Copiando APK al NAS...${NC}"
scp "$APK_SOURCE" "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/${APK_DEST_NAME}"

# Generar update.json
echo -e "${GREEN}[2/3] Generando update.json...${NC}"
cat > /tmp/update.json <<EOF
{
  "versionCode": ${VERSION_CODE},
  "versionName": "${VERSION_NAME}",
  "url": "${NAS_URL_BASE}/${APK_DEST_NAME}",
  "changelog": "${CHANGELOG}",
  "force": ${FORCE}
}
EOF

scp /tmp/update.json "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/update.json"

# Verificar
echo -e "${GREEN}[3/3] Verificando en NAS...${NC}"
ssh "${NAS_USER}@${NAS_HOST}" "ls -la ${NAS_PATH}/ && cat ${NAS_PATH}/update.json"

echo ""
echo -e "${GREEN}=== Publicado correctamente ===${NC}"
echo -e "APK: ${NAS_URL_BASE}/${APK_DEST_NAME}"
echo -e "Update JSON: ${NAS_URL_BASE}/update.json"
echo ""
echo "Los usuarios verán la actualización al abrir Configuración > Actualizaciones desde tu NAS"