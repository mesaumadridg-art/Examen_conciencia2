#!/bin/bash
# publish-apk.sh — Publica nueva versión APK en el NAS
# Uso: ./publish-apk.sh <versionCode> <versionName> "<changelog>" [force]
# Ejemplo: ./publish-apk.sh 2 1.1.0 "- Fix examen niños\n- Nueva oración" false

set -euo pipefail

# ───── CONFIG NAS (del ERP) ─────
NAS_USER="MEMG"
NAS_IP="192.168.1.26"
NAS_KEY="~/.ssh/mmg_nas_ed25519"
NAS_WEB_ROOT="/volume1/docker/examen-conciencia"
# URL base: usa Tailscale Funnel en dispositivo plex-router
TAILNET_DOMAIN="taila3320d.ts.net"
FUNNEL_DEVICE="plex-router"
NAS_URL_BASE="https://${FUNNEL_DEVICE}.${TAILNET_DOMAIN}"
# ────────────────────────────────

VERSION_CODE="${1:-}"
VERSION_NAME="${2:-}"
CHANGELOG="${3:-}"
FORCE="${4:-false}"

if [[ -z "$VERSION_CODE" || -z "$VERSION_NAME" ]]; then
    echo "Uso: $0 <versionCode> <versionName> \"<changelog>\" [force]"
    echo "Ej:  $0 2 1.1.0 \"- Fix login\n- Nueva feature\" false"
    exit 1
fi

APK_LOCAL="android/app/build/outputs/apk/release/app-release-signed.apk"
APK_REMOTE="app-v${VERSION_CODE}.apk"

if [[ ! -f "$APK_LOCAL" ]]; then
    echo "❌ No existe $APK_LOCAL. Ejecuta primero: ./build-and-sign.bat"
    exit 1
fi

echo "=== Publicando v${VERSION_NAME} (code: ${VERSION_CODE}) ==="

# 1. Subir APK
echo "📤 Subiendo APK..."
scp -i "$NAS_KEY" -o StrictHostKeyChecking=no "$APK_LOCAL" "${NAS_USER}@${NAS_IP}:${NAS_WEB_ROOT}/${APK_REMOTE}"

# 2. Generar y subir update.json
UPDATE_JSON=$(cat <<EOF
{
  "versionCode": ${VERSION_CODE},
  "versionName": "${VERSION_NAME}",
  "url": "${NAS_URL_BASE}/${APK_REMOTE}",
  "changelog": "${CHANGELOG}",
  "force": ${FORCE}
}
EOF
)

echo "$UPDATE_JSON" | ssh -i "$NAS_KEY" -o StrictHostKeyChecking=no "${NAS_USER}@${NAS_IP}" "cat > ${NAS_WEB_ROOT}/update.json"

# 3. Verificar
echo "✅ Verificando..."
ssh -i "$NAS_KEY" -o StrictHostKeyChecking=no "${NAS_USER}@${NAS_IP}" "ls -lh ${NAS_WEB_ROOT}/"
curl -s "${NAS_URL_BASE}/update.json" | jq .

echo ""
echo "🎉 Publicado v${VERSION_NAME}"
echo "   APK:     ${NAS_URL_BASE}/${APK_REMOTE}"
echo "   JSON:    ${NAS_URL_BASE}/update.json"
echo ""
echo "📱 En la app: Configuración → Actualizaciones → pega: ${NAS_URL_BASE}/update.json"