# INVENTARIO DE DIRECCIONES Y PUERTOS - NAS UGOS Pro
**Última actualización:** 2026-10-12
**Propósito:** Control centralizado para evitar colisiones entre servicios

---

## 📋 RESUMEN EJECUTIVO

| Categoría | Servicios | Rango de puertos | Estado |
|-----------|-----------|------------------|--------|
| **ERP MMG (Producción)** | nginx, API, DB, Web | 8080, 8081, 8443, 8444, 15432, 5432 | ✅ PRODUCCIÓN - NO TOCAR |
| **Examen Conciencia (Nuevo)** | Caddy, Funnel | 18080, 18443 | ✅ NUEVO - AISLADO |
| **Plex Media Server** | Tailscale subnet router | 32400 (Plex), 41641/UDP (TS) | ✅ EXISTENTE - AISLADO |
| **Hermes NAS (24/7)** | Docker, Telegram bot, GitHub | 41641/UDP (TS) | ✅ EXISTENTE - AISLADO |
| **PocketBase** | (no expuesto externamente) | 8090 (interno) | ✅ EXISTENTE - INTERNO |
| **ngrok** | (solo cliente, no server) | - | ✅ EXISTENTE - CLIENTE |
| **Infraestructura base** | Tailscale daemon, Docker, UGOS | 41641 (UDP), varios | ✅ SISTEMA |

---

## 🏢 ERP MMG - SERVICIOS EXISTENTES (SAGRADOS)

### Puertos en NAS (Host Network / Docker Host Ports)

| Puerto | Protocolo | Servicio | Contenedor | Descripción |
|--------|-----------|----------|------------|-------------|
| **8080** | TCP/HTTP | nginx redirect | mmg-erp-web | HTTP → HTTPS redirect (producción) |
| **8081** | TCP/HTTP | nginx redirect | mmg-erp-web | HTTP → HTTPS redirect (pruebas) |
| **8443** | TCP/HTTPS | nginx + API | mmg-erp-web | **Producción** - API + Frontend |
| **8444** | TCP/HTTPS | nginx + API | mmg-erp-web | **Pruebas** - API + Frontend |
| **9090** | TCP/HTTP | (no usado actualmente) | - | Reservado / legacy |
| **9091** | TCP/HTTP | (no usado actualmente) | - | Reservado / legacy |

### Base de Datos (PostgreSQL)

| Puerto | Protocolo | Binding | Servicio | Descripción |
|--------|-----------|---------|----------|-------------|
| **15432** | TCP | `127.0.0.1:15432:5432` | mmg-erp-db | **Loopback interno** - DB publica solo en localhost |
| **5432** | TCP | Tailscale Funnel | tailscale | **Expuesto a tailnet** via `tailscale funnel` → `tcp://mmg-erp-nas.taila3320d.ts.net:5432` |

### Acceso Externo (Tailscale MagicDNS)

| Hostname | Puerto | Servicio | Red | Uso |
|----------|--------|----------|-----|-----|
| `mmg-erp-nas.taila3320d.ts.net` | 443 (HTTPS) | ERP Web/Api | Tailnet (MagicDNS) | Acceso equipo autorizado |
| `mmg-erp-nas.taila3320d.ts.net` | 5432 (TCP) | PostgreSQL | Tailnet (Funnel) | DBeaver, scripts PC |

### IPs Internas

| IP | Interfaz | Servicio |
|----|----------|----------|
| `192.168.1.26` | LAN (eth0) | NAS management, SSH, Docker host |
| `100.102.157.126` | Tailscale (tun0) | MagicDNS `mmg-erp-nas.taila3320d.ts.net` |
| `127.0.0.1` | Loopback | DB interno (15432), nginx upstream |

---

## 📱 EXAMEN CONCIENCIA - NUEVO SERVICIO (AISLADO)

### Puertos en NAS (Host Network / Docker Host Ports)

| Puerto | Protocolo | Servicio | Contenedor | Descripción |
|--------|-----------|----------|------------|-------------|
| **18080** | TCP/HTTP | Caddy | examen-conciencia-web | **HTTP interno** - Sirve archivos estáticos |
| **18443** | TCP/HTTPS | Caddy | examen-conciencia-web | **HTTPS interno** - Cert auto-firmado (LAN) |

### Tailscale Funnel (Acceso Internet Público)

| Puerto funneleado | Protocolo | Hostname público | Certificado |
|-------------------|-----------|------------------|-------------|
| **18080** → Internet | HTTPS (TLS término en Tailscale) | `plex-router.taila3320d.ts.net` | Let's Encrypt automático |

### Acceso

| URL | Red | Uso |
|-----|-----|-----|
| `http://192.168.1.26:18080/` | LAN | Test local, navegador en red local |
| `https://192.168.1.26:18443/` | LAN | HTTPS local (cert warning normal) |
| `https://plex-router.taila3320d.ts.net/` | **Internet completo** | **Producción** - APK, JSON, usuarios móviles |

### IPs

| IP | Interfaz | Servicio |
|----|----------|----------|
| `192.168.1.26` | LAN | Caddy host binding (18080, 18443) |
| `100.x.x.x` | Tailscale | Funnel ingress (interno, no expuesto directo) |

---

## 🎬 PLEX MEDIA SERVER - EXISTENTE (AISLADO VIA TAILSCALE SUBNET ROUTER)

### Arquitectura
- **Contenedor propio** con `--network host`, `--cap-add NET_ADMIN --cap-add NET_RAW`, `--device /dev/net/tun`, `--sysctl net.ipv4.ip_forward=1`
- **tailscaled directo** (no containerboot), interfaz `tailscale0` (modo kernel)
- Anuncia ruta: `192.168.1.0/24` con SNAT
- Hostname Tailscale: `plex-router`
- **NO usa Funnel** — usa subnet router para que Plex vea tráfico como LOCAL (`is local: 1`)

### Puertos

| Puerto | Protocolo | Binding | Servicio | Descripción |
|--------|-----------|---------|----------|-------------|
| **32400** | TCP | LAN (0.0.0.0:32400) | Plex Media Server | Puerto nativo Plex (solo LAN) |
| **41641** | UDP | Tailscale | tailscaled (subnet router) | Control plane + data plane |

### Acceso

| Tipo | Detalle |
|------|---------|
| **LAN** | `http://192.168.1.26:32400/web` |
| **Tailnet (MagicDNS)** | `http://plex-router.taila3320d.ts.net:32400/web` (tráfico marcado `is local: 1`) |
| **Internet público** | **NO EXPUESTO** (requiere Plex Pass o Tailscale en cliente) |

### ⚠️ Reglas críticas Plex
- **NO publicar IP tailnet en Plex** (URL personalizada / `customConnections`) → rompería `is local: 1`
- **NO usar `allowedNetworks`** sin Plex Pass (error 400)
- **Smart TV sin Tailscale** → no funcionan gratis (requieren pagar o Fire TV / Android TV)
- **Límite DERP relay**: 2.2 Mbps máx en CGNAT → bajar calidad a 720p/480p

---

## 🤖 HERMES NAS (24/7) - EXISTENTE (AISLADO)

### Contenedor
- Imagen: `nousresearch/hermes-agent:latest`
- Comando: `gateway run`
- Restart: `unless-stopped`
- Volumen: `/volume1/docker/hermes/data` → `/opt/data` (perfil completo)
- Usuario: `PUID=1000 PGID=10`

### Acceso
- **Solo Telegram Bot**: `@hermes_menas_bot` (long-polling, **sin puertos abiertos**)
- **GitHub CLI**: `gh` en `/opt/data/bin/gh` (token fine-grained en `.env`)
- **Sincronización apuntes**: Cron cada 20 min → repo privado `hermes-perfil` (deploy key SSH)

### Puertos

| Puerto | Protocolo | Uso |
|--------|-----------|-----|
| **41641** | UDP | Tailscale control plane (compartido con daemon host) |
| **Ninguno expuesto** | - | Telegram long-polling, GitHub API (saliente) |

---

## 🗄️ POCKETBASE - EXISTENTE (INTERNO)

### Contenedor
- Puerto interno: **8090** (HTTP)
- **NO expuesto a LAN ni internet** (solo acceso interno / reverse proxy si se usa)
- Base de datos: SQLite embebida

### Acceso
- Solo via red Docker interna o `curl http://localhost:8090` desde el NAS
- **NO configurar Funnel, MagicDNS, ni port forwarding**

---

## 🌐 NGROK - EXISTENTE (SOLO CLIENTE)

### Uso
- Cliente ngrok corriendo en NAS para **túneles salientes** temporales
- **NO sirve como servidor** en el NAS
- No toca puertos de escucha en el NAS

---

## 🔐 TAILSCALE - INFRAESTRUCTURA COMPARTIDA (DAEMON ÚNICO)

### Tailnet
- **Dominio:** `taila3320d.ts.net` (verificar con `tailscale status --json`)
- **Dispositivo NAS (host):** `mmg-erp-nas` (MagicDNS)
- **Servicios Funnel:** `plex-router` (Examen Conciencia), `mmg-erp-nas` (DB)
- **Subnet Router:** `plex-router` (anuncia `192.168.1.0/24`)

### Puertos Tailscale

| Puerto | Protocolo | Uso | Servicio |
|--------|-----------|-----|----------|
| **41641** | UDP | Control plane (DERP, NAT traversal) | Daemon host (compartido) |
| **5432** | TCP | Funnel ERP DB | `tailscale funnel 5432` |
| **18080** | TCP | **Funnel Examen Conciencia** | `tailscale funnel 18080` (en `plex-router`) |
| **Subnet routes** | TCP/UDP | `192.168.1.0/24` via `plex-router` | Plex (NO funnel) |

### Servicios Funnel Activos

```bash
# Verificar en NAS:
tailscale funnel status
# Debe mostrar:
# - 5432 (ERP DB) → mmg-erp-nas.taila3320d.ts.net:5432
# - 18080 (Examen Conciencia) → plex-router.taila3320d.ts.net
```

### Subnet Routers Activos

```bash
# Verificar en NAS:
tailscale status --json | jq '.Peer[] | select(.Hostname=="plex-router")'
# Debe mostrar: "AdvertisedRoutes": ["192.168.1.0/24"], "ApprovedRoutes": ["192.168.1.0/24"]
```

---

## 🚫 MATRIZ DE COLISIONES - VERIFICACIÓN COMPLETA

| Puerto | ERP MMG | Examen Conciencia | Plex | Hermes | PocketBase | Conflicto | Acción |
|--------|---------|-------------------|------|--------|------------|-----------|--------|
| 8080 | ✅ nginx redirect | ❌ | ❌ | ❌ | ❌ | NO | - |
| 8081 | ✅ nginx redirect | ❌ | ❌ | ❌ | ❌ | NO | - |
| 8443 | ✅ HTTPS prod | ❌ | ❌ | ❌ | ❌ | NO | - |
| 8444 | ✅ HTTPS test | ❌ | ❌ | ❌ | ❌ | NO | - |
| 15432 | ✅ DB loopback | ❌ | ❌ | ❌ | ❌ | NO | - |
| 5432 | ✅ Funnel DB | ❌ | ❌ | ❌ | ❌ | NO | Funnel distinto |
| 32400 | ❌ | ❌ | ✅ Plex | ❌ | ❌ | NO | - |
| 8090 | ❌ | ❌ | ❌ | ❌ | ✅ PocketBase | NO | Interno |
| **18080** | ❌ | ✅ Caddy HTTP | ❌ | ❌ | ❌ | **NO** | **LIBRE** |
| **18443** | ❌ | ✅ Caddy HTTPS | ❌ | ❌ | ❌ | **NO** | **LIBRE** |
| 41641/UDP | ✅ TS daemon | ✅ TS daemon | ✅ TS daemon | ✅ TS daemon | ✅ TS daemon | **COMPARTIDO** | Mismo proceso |

### Hostnames MagicDNS / Funnel

| Hostname | Servicio | Tipo | Conflicto |
|----------|----------|------|-----------|
| `mmg-erp-nas.taila3320d.ts.net` | ERP Web/API + DB | MagicDNS + Funnel | NO |
| `plex-router.taila3320d.ts.net` | **Examen Conciencia + Plex Subnet Router** | Funnel + MagicDNS (subnet) | **NO** (hostname distinto) |
| `hermes` | Hermes NAS | (sin MagicDNS público) | NO |

---

## 📝 REGLAS DE ORO PARA FUTURAS ADICIONES

1. **Puertos 8080, 8081, 8443, 8444, 15432, 5432, 32400, 8090 → PROHIBIDOS** (ERP, Plex, PocketBase)
2. **Rango 18000-18999 → RESERVADO** para Examen Conciencia y futuros servicios web
3. **Nuevo servicio web** → Puerto base 18080+N, HTTPS 18443+N
4. **Nuevo Funnel** → Puerto base 18080+N, hostname `nuevo-servicio.taila3320d.ts.net`
5. **Nuevo Subnet Router** → Hostname `nuevo-router.taila3320d.ts.net`, anunciar ruta distinta
6. **SIEMPRE verificar** antes de agregar:
   ```bash
   # En NAS:
   ss -tlnp | grep -E '8080|8081|8443|8444|15432|5432|32400|8090|18080|18443'
   docker ps --format "table {{.Names}}\t{{.Ports}}"
   tailscale funnel status
   tailscale status --json | jq '.Peer[] | {Hostname, AdvertisedRoutes, ApprovedRoutes}'
   ```

---

## 📂 ARCHIVOS DE CONFIGURACIÓN CLAVE (NAS)

| Archivo | Servicio | Puerto | Modificable |
|---------|----------|--------|-------------|
| `/volume1/docker/mmg-erp/deploy/nas/docker-compose.yml` | ERP | 8080,8081,8443,8444 | ❌ NO |
| `/volume1/docker/mmg-erp/deploy/nas/nginx.conf` | ERP nginx | 8443,8444 | ❌ NO |
| `/volume1/docker/plex-router/` (script inicio) | Plex subnet router | 32400, subnet | ❌ NO (receta validada) |
| `/volume1/docker/hermes/data/` | Hermes NAS | - | ✅ Datos (volumen) |
| `/volume1/docker/examen-conciencia-compose.yml` | Examen Conciencia | **18080,18443** | ✅ SÍ |
| `/volume1/docker/examen-conciencia/caddy/` | Caddy certs | - | ✅ SÍ (datos) |
| `/opt/data/.env` | Hermes NAS (GH_TOKEN) | - | ✅ SÍ (secretos) |

---

## ✅ CHECKLIST PRE-DESPLIEGUE (cada vez que toques el NAS)

- [ ] `ss -tlnp` → puertos 18080, 18443 **LIBRES**
- [ ] `docker ps` → no contenedores en 18080/18443
- [ ] `tailscale funnel status` → 18080 **no funneleado** por otro servicio
- [ ] `tailscale status --json | jq -r '.Self.DNSName'` → tailnet domain confirmado
- [ ] ERP salud: `curl -sk https://192.168.1.26:8443/api/salud` → `ok:true`
- [ ] ERP DB: `timeout 5 bash -c 'cat < /dev/null > /dev/tcp/100.102.157.126/5432' && echo ABIERTO`
- [ ] Plex salud: `curl -s http://192.168.1.26:32400/identity` → `MediaContainer` XML
- [ ] Plex `is local`: verificar en logs Plex que conexiones tailnet marcan `is local: 1`
- [ ] Hermes NAS: `docker ps | grep hermes` → `Up` + `unless-stopped`
- [ ] Sync apuntes: `docker exec -u hermes -e HOME=/opt/data/home hermes sh /opt/data/scripts/sync_apuntes.sh` → salida vacía = OK

---

## 🆘 ROLLBACK RÁPIDO (si algo falla)

```bash
# Detener SOLO Examen Conciencia (no toca ERP, Plex, Hermes, PocketBase)
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "
  docker stop examen-conciencia-web &&
  docker rm examen-conciencia-web &&
  tailscale funnel 18080 off 2>/dev/null
"

# Verificar ERP intacto
curl -sk https://192.168.1.26:8443/api/salud

# Verificar Plex intacto
curl -s http://192.168.1.26:32400/identity

# Verificar Hermes NAS
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "docker ps | grep hermes"

# Verificar PocketBase
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "curl -s http://localhost:8090/api/health"
```

---

---

**Este documento vive en:** `C:\Users\mesau\proyectos\APK Examen de Concienca\INVENTARIO-DIRECCIONES.md`
**Actualizar SIEMPRE que cambie algo en el NAS.**