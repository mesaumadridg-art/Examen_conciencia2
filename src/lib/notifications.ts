import { UserSettings } from '../types';

export interface NotificationStatusInfo {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerActive: boolean;
  error?: string;
}

/**
 * Checks system notification capabilities and permission status.
 */
export function checkNotificationStatus(): NotificationStatusInfo {
  if (!('Notification' in window)) {
    return {
      supported: false,
      permission: 'unsupported',
      serviceWorkerActive: false,
      error: 'Tu navegador no soporta Notificaciones Web.',
    };
  }

  const swActive = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  return {
    supported: true,
    permission: Notification.permission,
    serviceWorkerActive: swActive,
  };
}

/**
 * Requests Notification permission from the browser/OS.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Las notificaciones no son soportadas en este dispositivo.');
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted' && 'serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    if (reg) {
      console.log('ServiceWorker ready for background notifications.');
    }
  }
  return permission;
}

/**
 * Sends a message to the Service Worker to update scheduled reminders or trigger test notifications.
 */
export async function syncRemindersWithServiceWorker(settings: UserSettings): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_REMINDERS',
        settings: {
          dailyExamEnabled: settings.dailyExamReminderEnabled ?? settings.reminderEnabled,
          dailyExamTime: settings.dailyExamReminderTime || settings.reminderTime || '21:00',
          confessionEnabled: settings.confessionReminderEnabled ?? true,
          confessionFrequency: settings.confessionReminderFrequency || 'weekly',
          confessionDay: settings.confessionReminderDay ?? settings.reminderDay ?? 0,
          lastDailyExamDate: settings.lastDailyExamDate,
          lastConfessionDate: settings.lastConfessionDate,
        },
      });

      // Try registering PeriodicSync if supported by Android Chrome
      if ('periodicSync' in registration) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodicSync = (registration as any).periodicSync;
          const status = await navigator.permissions.query({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: 'periodic-background-sync' as any,
          });
          if (status.state === 'granted') {
            await periodicSync.register('daily-exam-sync', {
              minInterval: 12 * 60 * 60 * 1000, // Every 12 hours
            });
            await periodicSync.register('confession-sync', {
              minInterval: 24 * 60 * 60 * 1000, // Every 24 hours
            });
          }
        } catch (psErr) {
          console.warn('PeriodicSync registration notice:', psErr);
        }
      }

      return true;
    }
  } catch (err) {
    console.warn('Error syncing reminders with Service Worker:', err);
  }
  return false;
}

/**
 * Creates a Google Calendar URL for a daily recurring reminder event at user's preferred time.
 */
export function openGoogleCalendarDailyReminder(timeStr = '21:00'): void {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  if (startDate.getTime() <= Date.now()) {
    startDate.setDate(startDate.getDate() + 1);
  }

  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 mins duration

  const formatCalTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const title = encodeURIComponent('🕯️ Examen de Conciencia Nocturno');
  const details = encodeURIComponent('Tómate 2 minutos de calma para revisar las faltas del día en la app Examen de Conciencia.');
  const dates = `${formatCalTime(startDate)}/${formatCalTime(endDate)}`;
  const recur = encodeURIComponent('RRULE:FREQ=DAILY');

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}&recur=${recur}`;
  window.open(url, '_blank');
}

/**
 * Creates a Google Calendar URL for a periodic confession reminder event (weekly, biweekly, monthly).
 */
export function openGoogleCalendarConfessionReminder(
  frequency: 'weekly' | 'biweekly' | 'monthly' = 'weekly',
  dayOfWeek: number = 0,
  timeStr: string = '18:00'
): void {
  const [hours, minutes] = (timeStr || '18:00').split(':').map(Number);
  const now = new Date();
  const startDate = new Date();

  // Calculate days until target day of week (0 = Sunday, 1 = Monday, etc.)
  let daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
  startDate.setDate(now.getDate() + daysUntilTarget);
  startDate.setHours(hours, minutes, 0, 0);

  if (startDate.getTime() <= now.getTime()) {
    startDate.setDate(startDate.getDate() + 7);
  }

  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 mins

  const formatCalTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const freqLabel = frequency === 'weekly' ? 'Semanal' : frequency === 'biweekly' ? 'Quincenal' : 'Mensual';
  const title = encodeURIComponent(`✝️ Recordatorio: Día de Confesión (${freqLabel})`);
  const details = encodeURIComponent('Día programado para acudir al sacerdote o templo. Revisa tu resumen de faltas acumuladas en la app Examen de Conciencia.');
  const dates = `${formatCalTime(startDate)}/${formatCalTime(endDate)}`;

  let rrule = 'RRULE:FREQ=WEEKLY';
  if (frequency === 'biweekly') {
    rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2';
  } else if (frequency === 'monthly') {
    rrule = 'RRULE:FREQ=MONTHLY';
  }

  const recur = encodeURIComponent(rrule);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}&recur=${recur}`;
  window.open(url, '_blank');
}

/**
 * Downloads an .ics calendar file for the device's native calendar for Daily Examen.
 */
export function downloadDailyICSFile(timeStr = '21:00'): void {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const formatIcsTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ExamenConcienciaApp//NONSGML v1.0//ES',
    'BEGIN:VEVENT',
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(new Date(startDate.getTime() + 15 * 60 * 1000))}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:🕯️ Examen de Conciencia Nocturno',
    'DESCRIPTION:Tómate 2 minutos de calma para revisar las faltas del día en la app Examen de Conciencia.',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Examen de Conciencia Nocturno',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'recordatorio_examen_diario.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads an .ics calendar file for Periodic Confession Reminder.
 */
export function downloadConfessionICSFile(
  frequency: 'weekly' | 'biweekly' | 'monthly' = 'weekly',
  dayOfWeek: number = 0,
  timeStr: string = '18:00'
): void {
  const [hours, minutes] = (timeStr || '18:00').split(':').map(Number);
  const now = new Date();
  const startDate = new Date();

  let daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
  startDate.setDate(now.getDate() + daysUntilTarget);
  startDate.setHours(hours, minutes, 0, 0);

  if (startDate.getTime() <= now.getTime()) {
    startDate.setDate(startDate.getDate() + 7);
  }

  const formatIcsTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  let rrule = 'RRULE:FREQ=WEEKLY';
  if (frequency === 'biweekly') {
    rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2';
  } else if (frequency === 'monthly') {
    rrule = 'RRULE:FREQ=MONTHLY';
  }

  const freqLabel = frequency === 'weekly' ? 'Semanal' : frequency === 'biweekly' ? 'Quincenal' : 'Mensual';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ExamenConcienciaApp//NONSGML v1.0//ES',
    'BEGIN:VEVENT',
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(new Date(startDate.getTime() + 30 * 60 * 1000))}`,
    rrule,
    `SUMMARY:✝️ Recordatorio: Día de Confesión (${freqLabel})`,
    'DESCRIPTION:Día programado para acudir al sacerdote o templo. Revisa tu resumen de faltas acumuladas en la app Examen de Conciencia.',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Confesión Sacramental',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `recordatorio_confesion_${frequency}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers a test system notification via Service Worker (native Android notification).
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    // Try via Service Worker Registration first (native system notification on Android)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification('🔔 Examen de Conciencia (Prueba)', {
          body: '¡Excelente! Las notificaciones nativas de la aplicación están funcionando correctamente en tu dispositivo.',
          icon: '/icon-192.png',
          badge: '/favicon-32x32.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          data: { url: '/' },
        } as unknown as NotificationOptions);
        return true;
      }
    }

    // Fallback to standard Window Notification if SW showNotification fails
    new Notification('🔔 Examen de Conciencia (Prueba)', {
      body: 'Notificación de prueba enviada desde la aplicación.',
      icon: '/icon-192.png',
    });
    return true;
  } catch (e) {
    console.error('Error triggering test notification:', e);
    return false;
  }
}
