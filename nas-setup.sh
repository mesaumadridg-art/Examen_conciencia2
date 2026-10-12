#!/bin/bash
# nas-setup.sh — Configura distribución APK Examen de Conciencia en NAS UGOS Pro
# Ejecutar UNA VEZ en el NAS via SSH:
#   ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "bash -s" < nas-setup.sh

set -euo pipefail

# ───── CONFIG (ajusta si cambia) ─────
WEB_ROOT="/volume1/docker/examen-conciencia"   # Carpeta en disco NAS (persistente)
PORT_HTTP=18080                                # Puerto HTTP interno (evita colisión con ERP 8080)
PORT_HTTPS=18443                               # Puerto HTTPS interno (evita colisión con ERP 8443)
CADDY_DATA="/volume1/docker/caddy/data"        # Persistencia certificados Caddy
CADDY_CONFIG="/volume1/docker/caddy/config"
# ──────────────────────────────────────

echo "=== Creando estructura en $WEB_ROOT ==="
mkdir -p "$WEB_ROOT"
chmod 755 "$WEB_ROOT"

echo "=== Creando docker-compose.yml para Caddy ==="
cat > /volume1/docker/examen-conciencia-compose.yml <<'COMPOSE'
version: '3.8'
services:
  caddy:
    image: caddy:2-alpine
    container_name: examen-conciencia-web
    restart: unless-stopped
    ports:
      - "18080:80"      # HTTP interno (evita colisión ERP 8080)
      - "18443:443"     # HTTPS interno (evita colisión ERP 8443)
    volumes:
      - /volume1/docker/examen-conciencia:/data:ro
      - /volume1/docker/caddy/data:/data/caddy
      - /volume1/docker/caddy/config:/config/caddy
    labels:
      caddy: |
        :80 {
            root * /data
            file_server browse
            header -Server
            @downloads path *.apk
            rate_limit @downloads {
                zone download 10r/s
                key {remote}
            }
        }
        :443 {
            root * /data
            file_server browse
            header -Server
            @downloads path *.apk
            rate_limit @downloads {
                zone download 10r/s
                key {remote}
            }
        }
COMPOSE

echo "=== Levantando Caddy ==="
cd /volume1/docker
docker compose -f examen-conciencia-compose.yml up -d

echo "=== Configurando Tailscale Funnel (acceso externo) ==="
# Expone el puerto HTTP (18080) al exterior via Tailscale
# El nombre público será: https://examen-conciencia.<TU_TAILNET>.ts.net
if command -v tailscale >/dev/null 2>&1; then
    echo "🌐 Activando Tailscale Funnel en puerto 18080..."
    tailscale funnel 18080 2>/dev/null || echo "   (Funnel ya activo o error - verifica con 'tailscale funnel status')"
    echo ""
    echo "🔗 URL pública: https://examen-conciencia.$(tailscale status --json | jq -r '.Self.DNSName' | cut -d. -f2-)/"
else
    echo "⚠️  Tailscale no encontrado. Instálalo en UGOS Pro → App Center → Tailscale"
    echo "   Luego ejecuta: tailscale funnel 18080"
fi

echo "=== Verificando ==="
sleep 3
docker ps --filter name=examen-conciencia-web --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Test local (LAN) ==="
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:18080/ && echo " HTTP 18080 OK" || echo " HTTP 18080 FAIL"
echo ""
echo "✅ Listo. Sirviendo en:"
echo "   LAN HTTP:  http://192.168.1.26:18080/"
echo "   LAN HTTPS: https://192.168.1.26:18443/ (cert auto-firmado)"
echo "   INTERNET:  https://examen-conciencia.<TU_TAILNET>.ts.net/ (via Tailscale Funnel)"
echo ""
echo "📁 Carpeta a poblar: $WEB_ROOT"
echo "   Pon ahí: app-v1.apk, update.json"
COMPOSE