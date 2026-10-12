const CACHE_NAME = 'examen-conciencia-v27-icon';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app-icon.svg',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png'
];

let reminderSettings = null;

// Install Event: precache core assets and skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn('Precache notice for asset:', asset, err);
          });
        })
      );
    })
  );
});

// Activate Event: purge stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Purging old service worker cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Schedule future notifications using Web Notification Triggers (TimestampTrigger)
 * if supported natively by Android Chrome.
 */
async function scheduleNativeNotificationTriggers(settings) {
  if (!settings || !('showNotification' in self.registration)) return;

  try {
    // Check if TimestampTrigger is supported
    const hasTriggerSupport = 'showTrigger' in Notification.prototype || typeof TimestampTrigger !== 'undefined';

    if (hasTriggerSupport && typeof TimestampTrigger !== 'undefined') {
      const [hours, minutes] = (settings.dailyExamTime || '21:00').split(':').map(Number);

      // Schedule next 7 days of daily exam notifications natively in Android OS
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + dayOffset);
        triggerDate.setHours(hours, minutes, 0, 0);

        // If time has already passed today, skip to tomorrow
        if (triggerDate.getTime() <= Date.now()) continue;

        const dateStr = triggerDate.toISOString().split('T')[0];

        await self.registration.showNotification('🕯️ Momento de tu Examen Nocturno', {
          body: 'Tómate 2 minutos de calma para revisar las faltas del día y guardarlas para tu confesión.',
          icon: '/icon-192.png',
          badge: '/favicon-32x32.png',
          vibrate: [200, 100, 200],
          tag: `daily-exam-${dateStr}`,
          showTrigger: new TimestampTrigger(triggerDate.getTime()),
          data: { url: '/', date: dateStr }
        });
      }

      // Schedule next weekly confession notification
      if (settings.confessionEnabled) {
        const targetDay = settings.confessionDay ?? 0; // 0 = Sunday
        const confessionDate = new Date();
        let daysUntilConfession = (targetDay - confessionDate.getDay() + 7) % 7;
        if (daysUntilConfession === 0 && confessionDate.getHours() >= 9) {
          daysUntilConfession = 7;
        }
        confessionDate.setDate(confessionDate.getDate() + daysUntilConfession);
        confessionDate.setHours(9, 0, 0, 0);

        const dateStr = confessionDate.toISOString().split('T')[0];

        await self.registration.showNotification('✝️ Recordatorio: Día de Confesión', {
          body: 'Hoy es tu día sugerido para acudir al sacerdote. Tienes tus faltas preparadas en la aplicación.',
          icon: '/icon-192.png',
          badge: '/favicon-32x32.png',
          vibrate: [300, 100, 300],
          tag: `confession-${dateStr}`,
          showTrigger: new TimestampTrigger(confessionDate.getTime()),
          data: { url: '/', date: dateStr }
        });
      }

      console.log('[SW] Successfully registered native TimestampTrigger alarms in Android OS!');
    }
  } catch (err) {
    console.warn('[SW] TimestampTrigger native scheduling notice:', err);
  }
}

// Listen to messages from the React app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_REMINDERS') {
    reminderSettings = event.data.settings;
    console.log('[SW] Reminders schedule received:', reminderSettings);
    scheduleNativeNotificationTriggers(reminderSettings);
  } else if (event.data.type === 'TRIGGER_TEST_NOTIFICATION') {
    self.registration.showNotification('🔔 Examen de Conciencia (Prueba)', {
      body: 'Notificación nativa confirmada en tu dispositivo.',
      icon: '/icon-192.png',
      badge: '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      data: { url: '/' }
    });
  }
});

// PeriodicSync Event (Fired by Android OS in background if PeriodicSync permission registered)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-exam-sync' || event.tag === 'confession-sync') {
    event.waitUntil(checkScheduledRemindersNow());
  }
});

// Immediate check function
async function checkScheduledRemindersNow() {
  if (!reminderSettings) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const currentDay = now.getDay();

  if (reminderSettings.dailyExamEnabled) {
    const targetTime = reminderSettings.dailyExamTime || '21:00';
    if (currentTimeStr >= targetTime && reminderSettings.lastDailyExamDate !== todayStr) {
      await self.registration.showNotification('🕯️ Momento de tu Examen Nocturno', {
        body: 'Tómate 2 minutos de calma para revisar las faltas del día y guardarlas para tu confesión.',
        icon: '/icon-192.png',
        badge: '/favicon-32x32.png',
        vibrate: [200, 100, 200],
        tag: `daily-exam-${todayStr}`,
        data: { url: '/' }
      });
    }
  }

  if (reminderSettings.confessionEnabled) {
    const targetDay = reminderSettings.confessionDay ?? 0;
    if (currentDay === targetDay && reminderSettings.lastConfessionDate !== todayStr) {
      await self.registration.showNotification('✝️ Recordatorio: Día de Confesión', {
        body: 'Hoy es tu día sugerido para acudir al sacerdote. Tienes tus faltas preparadas en la aplicación.',
        icon: '/icon-192.png',
        badge: '/favicon-32x32.png',
        vibrate: [300, 100, 300],
        tag: `confession-${todayStr}`,
        data: { url: '/' }
      });
    }
  }
}

// Notification Click Event: Open or focus PWA
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Check reminders periodically while SW thread is active
setInterval(checkScheduledRemindersNow, 60000);

// Fetch Event: Network-First strategy to ensure fresh app code is always delivered
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip caching for backend API endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-First strategy: always fetch fresh from network, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});
