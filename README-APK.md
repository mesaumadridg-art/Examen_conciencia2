# Examen de Conciencia - Android APK con Actualizaciones desde NAS

Esta es la versión Android (APK) de la aplicación **Examen de Conciencia y Guía de Confesión**, envuelta con **Capacitor** para mantener todas las funcionalidades PWA (Service Worker, notificaciones nativas, offline) y añadir **actualizaciones automáticas desde tu NAS (Opción 2)**.

---

## 📱 Características de la App

- **Examen guiado** por perfiles: Niños, Jóvenes, Adultos, Examen Particular
- **Personalización detallada**: Género, estado civil, edad, deberes de estado
- **Resumen para confesión** con formato de acusación directa
- **Historial y estadísticas** de confesiones
- **Recordatorios nativos Android** (Service Worker + TimestampTrigger)
- **Integración con Calendario** (Google Calendar + archivos .ics)
- **Backup/restauración JSON** (100% local, privado)
- **Modo privado** para confesionario (difuminado por defecto)
- **IA espiritual** (backend Gemini API opcional)
- **PWA completo** con Service Worker offline
- **Actualizaciones desde NAS** (Opción 2: checker nativo + descarga APK)

---

## 🛠 Requisitos para Compilar

- **Node.js 18+** y **npm**
- **Java JDK 17+** (para Gradle y keytool)
- **Android SDK** (API 34/35) - via Android Studio o command line tools
- **Gradle** (incluido via wrapper `./gradlew`)

---

## 🚀 Pasos para Generar el APK

### 1. Instalar dependencias
```bash
cd Examen_conciencia2
npm install
```

### 2. Generar keystore de firma (SOLO LA PRIMERA VEZ)
```bash
cd android
chmod +x generate-keystore.sh
./generate-keystore.sh
```
Esto crea `examen-conciencia.keystore` y te da las contraseñas.

### 3. Configurar keystore.properties
```bash
cp keystore.properties.example keystore.properties
# Edita keystore.properties con tus contraseñas reales
```

### 4. Build del APK
```bash
# Opción A: Script automático (recomendado)
cd ..
chmod +x build-apk.sh
./build-apk.sh

# Opción B: Manual
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

### 5. APK generado
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔄 Configurar Actualizaciones desde NAS (Opción 2)

### 1. Preparar tu NAS
Crea una carpeta accesible por HTTP/HTTPS (ej. `examen-conciencia/`) y pon ahí:
- `update.json` (ver formato abajo)
- Los APKs firmados: `app-v1.apk`, `app-v2.apk`, etc.

### 2. Formato `update.json`
```json
{
  "versionCode": 2,
  "versionName": "1.1.0",
  "url": "http://192.168.1.100/examen-conciencia/app-v2.apk",
  "changelog": "- Corrección en examen de niños\n- Nueva oración para confesión\n- Mejora en notificaciones",
  "force": false
}
```

**Campos:**
- `versionCode`: Entero incremental (1, 2, 3...) - **DEBE SUBIR SIEMPRE**
- `versionName`: String semántico ("1.0.0", "1.1.0", "2.0.0")
- `url`: URL directa al APK en tu NAS (HTTP o HTTPS)
- `changelog`: Texto con saltos de línea `\n`
- `force`: `true` = actualización obligatoria (no se puede omitir)

### 3. Servir desde NAS
- **HTTP en LAN**: Funciona directo (configurado `usesCleartextTraffic=true`)
- **HTTPS recomendado**: Si tienes certificado (Let's Encrypt, self-signed con CA propia)
- **Ejemplo Nginx**:
```nginx
location /examen-conciencia/ {
    alias /mnt/datos/examen-conciencia/;
    autoindex off;
    add_header Access-Control-Allow-Origin *;
}
```

### 4. Configurar en la App
1. Abre la app → **Configuración** (⚙️)
2. Baja a **"Actualizaciones desde tu NAS"**
3. Pega la URL de tu `update.json` (ej: `http://192.168.1.100/examen-conciencia/update.json`)
4. Pulsa **"Verificar Actualizaciones"**

---

## 📦 Flujo de Actualización para Usuarios

1. **Usuario abre la app** → Verifica automáticamente 1 vez/día (silencioso)
2. **Hay versión nueva** → Aparece banner en Configuración con changelog
3. **Usuario pulsa "Descargar e Instalar"** → Descarga via DownloadManager (barra de notificaciones)
4. **Descarga completa** → Se abre instalador nativo Android
5. **Usuario confirma instalación** → App se actualiza **sin perder datos** (misma firma, `allowBackup=true`)

---

## 🔐 Firma y Seguridad

**CRÍTICO: Usa SIEMPRE el mismo keystore**
- Si cambias la firma → Android exige desinstalar e instalar de nuevo (pierde datos)
- Guarda `examen-conciencia.keystore` y contraseñas en lugar seguro
- `versionCode` **siempre incrementa** (1, 2, 3... nunca baja)

---

## 📁 Estructura del Proyecto

```
Examen_conciencia2/
├── src/                    # React/TypeScript PWA
│   ├── components/         # Vistas (SettingsView con update checker)
│   ├── services/
│   │   └── updateService.ts    # Servicio TypeScript para updates
│   ├── plugins/
│   │   └── update-checker/     # Definiciones Capacitor plugin
│   └── lib/               # Notificaciones, storage, datos
├── android/               # Proyecto Capacitor Android
│   ├── app/src/main/java/com/examenconciencia/app/plugins/
│   │   └── UpdateCheckerPlugin.java  # Plugin nativo (Kotlin-like Java)
│   ├── update.json.example         # Ejemplo para NAS
│   ├── keystore.properties.example # Template firma
│   ├── generate-keystore.sh        # Script generar keystore
│   └── build.gradle               # Config signing
├── build-apk.sh           # Script build completo
├── capacitor.config.ts    # Config Capacitor
└── package.json
```

---

## 🐛 Solución de Problemas

### "Unknown sources" al instalar
La app pide permiso automáticamente. Usuario debe ir a Ajustes → Apps → Examen de Conciencia → Permitir instalación de fuentes desconocidas.

### Error de red al verificar updates
- Verifica que el NAS esté accesible desde el móvil (misma WiFi/VPN/Tailscale)
- HTTP en LAN requiere `usesCleartextTraffic=true` (ya configurado)
- HTTPS con certificado self-signed: añade la CA al móvil o usa HTTP en LAN

### APK no instala (firma distinta)
- **NUNCA** regeneres el keystore para updates
- Si perdiste el keystore: usuarios deben desinstalar e instalar nuevo APK (pierden datos)

### Notificaciones no llegan
1. Ajustes → Apps → Examen de Conciencia → Notificaciones → Permitir
2. Ajustes → Batería → Examen de Conciencia → "Sin restricciones"
3. Usa los botones "Google Calendar" / "Descargar .ics" en Configuración como respaldo 100% fiable

---

## 📝 Comandos Útiles

```bash
# Ver versión actual
cd android && ./gradlew printVersion

# Build solo debug (sin firma)
./gradlew assembleDebug

# Limpiar build
./gradlew clean

# Sync Capacitor tras cambios web
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

---

## 📄 Licencia y Créditos

App original: PWA React/TypeScript/Vite/Tailwind
Wrapper Android: Capacitor + Plugin nativo UpdateChecker
Iconos: lucide-react
Notificaciones: Service Worker + TimestampTrigger API (Android 12+)

---

## ✅ Checklist para Release

- [ ] `versionCode` incrementado en `android/app/build.gradle`
- [ ] `versionName` actualizado
- [ ] Keystore disponible y `keystore.properties` configurado
- [ ] `./build-apk.sh` ejecutado sin errores
- [ ] APK probado en dispositivo real (instalar, abrir, verificar updates)
- [ ] APK copiado a NAS en ruta correcta
- [ ] `update.json` actualizado en NAS con nuevo `versionCode`, `versionName`, `url`, `changelog`
- [ ] Verificar que la app detecta la actualización desde Configuración