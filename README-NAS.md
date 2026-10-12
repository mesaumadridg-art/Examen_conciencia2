# NAS Setup - Examen de Conciencia APK Distribution (con Tailscale Funnel)

## Resumen
Configura tu NAS (UGOS Pro) para servir el APK y JSON de actualizaciones **accesibles desde internet** usando:
- **Caddy en Docker** (sirve archivos estáticos en LAN, puertos 18080/18443)
- **Tailscale Funnel** (expone puerto 18080 a internet con HTTPS válido gratis)

> **Ya tienes Tailscale** corriendo para el ERP (`mmg-erp-nas.taila3320d.ts.net`). Reutilizamos la misma infraestructura **sin colisiones de puertos**.

---

## ⚠️ Evitando conflictos con servicios existentes (ERP)

| Servicio | Puertos NAS (host) | Acceso | Nota |
|----------|-------------------|--------|------|
| **ERP nginx** | 8080, **8443**, 8081, **8444** | `https://mmg-erp-nas.taila3320d.ts.net` (MagicDNS, tailnet) | Puertos 8443/8444 = HTTPS prod/test |
| **ERP DB (Funnel)** | 5432 (via `tailscale funnel`) | `tcp://mmg-erp-nas.taila3320d.ts.net:5432` | Solo tailnet |
| **Examen Conciencia (Caddy)** | **18080**, **18443** | `https://plex-router.taila3320d.ts.net` (Funnel, internet) | **Sin colisión** |
| **Examen Conciencia (Funnel)** | 18080 → internet | `https://plex-router.taila3320d.ts.net` | Puerto 18080 funneleado en dispositivo `plex-router` |

> **Clave:** Caddy usa **18080/18443** (no 8080/8443). Funnel expone **18080** en dispositivo `plex-router`. Nombres MagicDNS distintos (`plex-router` vs `mmg-erp-nas`). Funnel en 18080 vs ERP DB funnel en 5432.

---

## Requisitos previos
- NAS accesible por SSH con la key del ERP: `~/.ssh/mmg_nas_ed25519`
- Usuario: `MEMG`, IP: `192.168.1.26`
- Docker instalado en el NAS (UGOS Pro lo trae)
- **Tailscale instalado y autenticado** en el NAS (App Center → Tailscale)

---

## Paso 1: Configurar el NAS (una sola vez)

Desde tu **PC Windows** (Git Bash / WSL / terminal Linux):

```bash
# 1. Copia el script al NAS y ejecútalo
scp -i ~/.ssh/mmg_nas_ed25519 nas-setup.sh MEMG@192.168.1.26:/tmp/
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "bash /tmp/nas-setup.sh"
```

**Qué hace el script:**
- Crea `/volume1/docker/examen-conciencia/` (carpeta persistente en disco)
- Crea `docker-compose.yml` para Caddy en `/volume1/docker/examen-conciencia-compose.yml`
- Levanta contenedor `examen-conciencia-web` (puerto **18080 HTTP**, **18443 HTTPS** internos)
- Sirve archivos estáticos con `file_server browse`
- Rate-limit 10 req/s en descargas `.apk`
- Persistencia de certificados Caddy en `/volume1/docker/examen-conciencia/caddy/`

> **NOTA:** El script **NO activa Tailscale Funnel** automáticamente (requiere dispositivo `plex-router` y flag `--bg`). Ver Paso 1.5.

---

## Paso 1.5: Activar Tailscale Funnel (manual, una vez)

El Funnel debe activarse en el dispositivo **`plex-router`** (subnet router), no en el host. Ejecuta:

```bash
# Desde tu PC
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "
  docker exec plex-router tailscale --socket=/tmp/tailscaled.sock serve reset &&
  sleep 2 &&
  docker exec plex-router tailscale --socket=/tmp/tailscaled.sock serve --bg --https=18443 http://127.0.0.1:18080 &&
  sleep 2 &&
  docker exec plex-router tailscale --socket=/tmp/tailscaled.sock funnel --bg 18080
"
```

**Verifica:**
```bash
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "docker exec plex-router tailscale --socket=/tmp/tailscaled.sock funnel status"
```
Debe mostrar:
```
# Funnel on:
#     - https://plex-router.taila3320d.ts.net

https://plex-router.taila3320d.ts.net:18443 (tailnet only)
|-- / proxy http://127.0.0.1:18080

https://plex-router.taila3320d.ts.net (Funnel on)
|-- / proxy http://127.0.0.1:18080
```

**URLs públicas resultantes:**
- **Público (internet):** `https://plex-router.taila3320d.ts.net/` (Funnel, HTTPS válido Let's Encrypt)
- **Tailnet:** `https://plex-router.taila3320d.ts.net:18443/` (solo tailnet)

---

## Paso 2: Verificar que funciona

```bash
# Desde tu PC (LAN)
curl http://192.168.1.26:18080/
# Debe listar el directorio (vacío al principio)

# Desde INTERNET (cualquier red, móvil con datos, etc.)
curl https://plex-router.taila3320d.ts.net/
# Debe listar el directorio (HTTPS válido, cert Let's Encrypt)
```

---

## Paso 3: Publicar primera versión (v1.0.0)

### Opción A: Script Bash (Git Bash / WSL / Linux)
```bash
cd "C:/Users/mesau/proyectos/APK Examen de Concienca"

# Asegúrate de tener el APK firmado
./build-and-sign.bat

# Publicar v1.0.0 (usa URL pública Tailscale)
./publish-apk.sh 1 1.0.0 "$(cat update.json | jq -r .changelog)" false
```

### Opción B: Script Windows (PowerShell / CMD)
```cmd
cd "C:\Users\mesau\proyectos\APK Examen de Concienca"
build-and-sign.bat
publish-apk.bat 1 1.0.0 "- Versión inicial\n- Examen guiado..." false
```

**Qué hace publish-apk:**
1. Sube `app-release-signed.apk` → NAS como `app-v1.apk`
2. Genera `update.json` con URL pública: `https://plex-router.taila3320d.ts.net/app-v1.apk`
3. Verifica listando archivos y mostrando el JSON

---

## Paso 4: Configurar la app (móvil usuario)

1. **Descarga APK desde cualquier red** (WiFi casa, datos móviles, trabajo):
   `https://plex-router.taila3320d.ts.net/app-v1.apk`
2. Abre la app → Configuración → **"Actualizaciones desde tu NAS"**
3. Pega la URL del JSON público:
   `https://plex-router.taila3320d.ts.net/update.json`
4. Botón **"Verificar Actualizaciones"** → debe decir "No hay actualizaciones" (ya estás en v1)

---

## Paso 5: Publicar actualizaciones futuras

```bash
# 1. Sube versionCode en android/app/build.gradle (ej: 2)
# 2. Sube versionName (ej: 1.1.0)
# 3. Build + firma
./build-and-sign.bat

# 4. Publica (URL pública automática)
./publish-apk.sh 2 1.1.0 "- Fix examen niños\n- Nueva oración del día" false
```

**Usuarios reciben desde cualquier red:**
- Auto-check diario (1×/día al abrir app)
- Badge en Configuración si hay update
- Changelog visible → "Descargar e Instalar" → DownloadManager → Instalador nativo
- **Datos se conservan** (misma firma + `allowBackup=true`)

---

## Estructura final en el NAS

```
/volume1/docker/examen-conciencia/
├── app-v1.apk          ← v1.0.0
├── app-v2.apk          ← v1.1.0
├── app-v3.apk          ← v1.2.0
└── update.json         ← Apunta a URLs públicas Tailscale
```

**URLs públicas:**
- APK: `https://plex-router.taila3320d.ts.net/app-v1.apk`
- JSON: `https://plex-router.taila3320d.ts.net/update.json`

---

## Seguridad y mantenimiento

| Aspecto | Configuración |
|---------|---------------|
| **Red** | **Internet completo** via Tailscale Funnel (HTTPS válido) |
| **HTTPS** | Let's Encrypt automático (Tailscale Funnel) |
| **Permisos** | Carpeta `:ro` (read-only) en contenedor Caddy |
| **Rate-limit** | 10 req/s por IP en descargas `.apk` (configurable) |
| **Limpieza** | Borra `app-vX.apk` viejos manualmente si quieres ahorrar espacio |
| **Logs** | `docker logs examen-conciencia-web` + `tailscale funnel status` |
| **Reinicio** | `docker compose -f /volume1/docker/examen-conciencia-compose.yml restart` |
| **Actualizar Caddy** | `docker compose -f ... pull && docker compose -f ... up -d` |
| **Funnel status** | `tailscale funnel status` / reactivar con comandos del Paso 1.5 |

---

## Troubleshooting

| Síntoma | Solución |
|---------|----------|
| `curl` LAN da 404 / connection refused | `docker ps` → verifica `examen-conciencia-web` está `Up`. `docker logs examen-conciencia-web` |
| `curl` público (Funnel) falla | `tailscale funnel status` → verifica activo. Re-ejecutar comandos del Paso 1.5 |
| APK no descarga / 403 | Verifica archivo en `/volume1/docker/examen-conciencia/` y permisos 644 |
| Funnel "access denied" | NAS debe estar autenticado en Tailscale (App Center → Tailscale → conectado) |
| Rate limit muy agresivo | Edita `docker-compose.yml` → cambia `10r/s` → `docker compose up -d` |
| Puerto 18080 ocupado | Cambia `PORT_HTTP` en `nas-setup.sh` y vuelve a ejecutar |
| Tailnet domain cambió | Ejecuta `tailscale status --json | jq -r '.Self.DNSName'` y actualiza `TAILNET_DOMAIN` en scripts |

---

## Comandos útiles en el NAS (via SSH)

```bash
# Ver estado Caddy + Funnel
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "docker ps --filter name=examen-conciencia-web && docker exec plex-router tailscale --socket=/tmp/tailscaled.sock funnel status"

# Ver logs Caddy
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "docker logs --tail 50 examen-conciencia-web"

# Ver logs Tailscale
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "journalctl -u tailscaled --tail 20"

# Reiniciar Caddy
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "cd /volume1/docker && docker compose -f examen-conciencia-compose.yml restart"

# Reactivar Funnel (si se cayó)
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "
  docker exec plex-router tailscale --socket=/tmp/tailscaled.sock serve reset &&
  sleep 2 &&
  docker exec plex-router tailscale --socket=/tmp/tailscaled.sock serve --bg --https=18443 http://127.0.0.1:18080 &&
  sleep 2 &&
  docker exec plex-router tailscale --socket=/tmp/tailscaled.sock funnel --bg 18080
"

# Ver archivos servidos
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "ls -lh /volume1/docker/examen-conciencia/"

# Ver tailnet domain actual
ssh -i ~/.ssh/mmg_nas_ed25519 MEMG@192.168.1.26 "tailscale status --json | jq -r '.Self.DNSName'"
```

---

## Archivos en este repo

| Archivo | Uso |
|---------|-----|
| `nas-setup.sh` | **Ejecutar 1 vez en NAS** (configura Caddy + Docker en puertos 18080/18443) |
| `publish-apk.sh` | **Ejecutar en PC** (Linux/Git Bash/WSL) para subir versiones |
| `publish-apk.bat` | **Ejecutar en PC** (Windows CMD/PowerShell) para subir versiones |
| `update.json` | Template v1.0.0 (URL pública Tailscale) |
| `build-and-sign.bat` | Compila y firma APK en Windows |
| `android/examen-conciencia.keystore` | **Keystore de firma** (¡RESPALDA EN 2 SITIOS!) |

---

## ⚠️ Recordatorios críticos

> **1. El keystore NUNCA sube al NAS.** Solo el APK firmado y el JSON.
> Respalda `android/examen-conciencia.keystore` y sus passwords en 2 sitios seguros.
> Si lo pierdes → usuarios deben desinstalar para actualizar.

> **2. Tailscale Funnel gratis tiene límites:**
> - 100 GB/mes transferencia (suficiente para miles de APKs de 18 MB)
> - 100 conexiones concurrentes
> - Si necesitas más → Tailscale Pro ($6/mes) o Cloudflare Tunnel

> **3. Si el tailnet domain cambia** (raro, pero pasa):
> ```bash
> # En el NAS:
> tailscale status --json | jq -r '.Self.DNSName'
> # Actualiza TAILNET_DOMAIN en publish-apk.sh/.bat y vuelve a publicar
> ```

> **4. UGOS Cloud / Compartir archivos de UGOS NO se usa.** Todo va por Tailscale Funnel + Caddy Docker.

> **5. Cero colisión con ERP:** Puertos 18080/18443 vs 8080/8443/8444. Nombres MagicDNS distintos. Funnel en 18080 vs ERP DB funnel en 5432.