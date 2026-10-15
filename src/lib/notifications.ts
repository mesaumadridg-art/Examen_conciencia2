import { UserSettings } from '../types';
import { DatetimePicker } from '@capawesome-team/capacitor-datetime-picker';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationStatusInfo {
  supported: boolean;
  permission: 'granted' | 'denied' | 'default' | 'unsupported';
  serviceWorkerActive: boolean;
  error?: string;
}

export interface ReminderSettings {
  dailyExamEnabled: boolean;
  dailyExamTime: string;
  confessionEnabled: boolean;
  confessionFrequency: 'weekly' | 'biweekly' | 'monthly';
  confessionDay: number;
}

/**
 * Requests Notification permission from the native system.
 * Uses Capacitor LocalNotifications plugin.
 */
export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display;
  } catch (e) {
    // Fallback to web API
    if (!('Notification' in window)) {
      throw new Error('Las notificaciones no son soportadas en este dispositivo.');
    }
    return await Notification.requestPermission();
  }
}

/**
 * Sends a message to the Service Worker to update scheduled reminders.
 */
export async function syncRemindersWithServiceWorker(settings: any): Promise<boolean> {
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
    return false;
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
    'PRODID:-//Examen de Conciencia//ES',
    'BEGIN:VEVENT',
    `UID:examen-diario-${Date.now()}@examenconciencia.app`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(new Date(startDate.getTime() + 15 * 60 * 1000))}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:🕯️ Examen de Conciencia Nocturno',
    'DESCRIPTION:Tómate 2 minutos de calma para revisar las faltas del día en la app Examen de Conciencia.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'examen-diario.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads an .ics calendar file for the device's native calendar for Confession reminder.
 */
export function downloadConfessionICSFile(
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
    'PRODID:-//Examen de Conciencia//ES',
    'BEGIN:VEVENT',
    `UID:confesion-${frequency}-${Date.now()}@examenconciencia.app`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(new Date(startDate.getTime() + 30 * 60 * 1000))}`,
    rrule,
    `SUMMARY:✝️ Recordatorio: Día de Confesión`,
    'DESCRIPTION:Día programado para acudir al sacerdote o templo. Revisa tu resumen de faltas acumuladas en la app Examen de Conciencia.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `confesion-${frequency}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Schedules native local notifications for daily exam and confession reminders.
 * Uses Capacitor LocalNotifications plugin.
 */
export async function scheduleAllReminders(settings: UserSettings): Promise<boolean> {
  try {
    // Cancel all existing notifications first
    await LocalNotifications.cancel({ notifications: [
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 999 }
    ] });

    const notifications: any[] = [];

    // Daily exam reminder
    if (settings.dailyExamReminderEnabled ?? settings.reminderEnabled) {
      const time = settings.dailyExamReminderTime || settings.reminderTime || '21:00';
      const [hours, minutes] = time.split(':').map(Number);
      
      const now = new Date();
      const scheduledDate = new Date();
      scheduledDate.setHours(hours, minutes, 0, 0);
      
      // If time already passed today, schedule for tomorrow
      if (scheduledDate.getTime() <= Date.now()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      notifications.push({
        title: '🕯️ Examen de Conciencia Nocturno',
        body: 'Tómate 2 minutos de calma para revisar las faltas del día.',
        id: 1,
        schedule: { at: scheduledDate, repeats: true },
        sound: 'default',
        attachments: undefined,
        actionTypeId: 'OPEN_APP',
        extra: { type: 'daily_exam' },
      });
    }

    // Confession reminder
    if (settings.confessionReminderEnabled ?? true) {
      const time = settings.confessionReminderTime || '18:00';
      const [hours, minutes] = time.split(':').map(Number);
      const frequency = settings.confessionReminderFrequency || 'weekly';
      const day = settings.confessionReminderDay ?? settings.reminderDay ?? 0; // 0 = Sunday

      const now = new Date();
      let daysUntilTarget = (day - now.getDay() + 7) % 7;
      const scheduledDate = new Date();
      scheduledDate.setDate(now.getDate() + daysUntilTarget);
      scheduledDate.setHours(hours, minutes, 0, 0);

      if (scheduledDate.getTime() <= Date.now()) {
        scheduledDate.setDate(scheduledDate.getDate() + 7);
      }

      if (frequency === 'weekly') {
        notifications.push({
          title: '✝️ Recordatorio: Día de Confesión',
          body: 'Día programado para acudir al sacerdote. Revisa tu resumen de faltas.',
          id: 2,
          schedule: { at: scheduledDate, every: 'week' },
          sound: 'default',
          extra: { type: 'confession' },
        });
      } else if (frequency === 'biweekly') {
        notifications.push({
          title: '✝️ Recordatorio: Día de Confesión',
          body: 'Día programado para acudir al sacerdote. Revisa tu resumen de faltas.',
          id: 3,
          schedule: { at: scheduledDate, every: 'week', count: 2 }, // Every 2 weeks
          sound: 'default',
          extra: { type: 'confession' },
        });
      } else if (frequency === 'monthly') {
        notifications.push({
          title: '✝️ Recordatorio: Día de Confesión',
          body: 'Día programado para acudir al sacerdote. Revisa tu resumen de faltas.',
          id: 4,
          schedule: { at: scheduledDate, every: 'month' },
          sound: 'default',
          extra: { type: 'confession' },
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log('Local notifications scheduled:', notifications.length);
    }

    return true;
  } catch (e) {
    console.error('Error scheduling local notifications:', e);
    return false;
  }
}

/**
 * Sends a test notification using native LocalNotifications plugin.
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      throw new Error('Permiso de notificaciones denegado.');
    }

    await LocalNotifications.schedule({
      notifications: [{
        title: '✅ Examen de Conciencia',
        body: 'Las notificaciones nativas funcionan correctamente.',
        id: 999,
        schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
        sound: 'default',
      }]
    });
    return true;
  } catch (e) {
    console.error('Test notification failed:', e);
    return false;
  }
}

/**
 * Checks current notification permission status.
 */
export async function getNotificationStatus(): Promise<NotificationStatusInfo> {
  try {
    const perm = await LocalNotifications.checkPermissions();
    return {
      supported: true,
      permission: perm.display,
      serviceWorkerActive: 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
      error: undefined,
    };
  } catch (e) {
    return {
      supported: false,
      permission: 'unsupported',
      serviceWorkerActive: false,
      error: 'LocalNotifications plugin not available',
    };
  }
}

/**
 * Opens the native date/time picker using Capacitor DateTimePicker plugin.
 * Returns the selected time in HH:mm format, or null if cancelled.
 */
export async function pickTime(currentTime: string = '21:00'): Promise<string | null> {
  try {
    const today = new Date();
    const [hours, minutes] = currentTime.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);
    
    const result = await DatetimePicker.present({
      mode: 'time',
      value: today.toISOString(),
      format: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
      cancelButtonText: 'Cancelar',
      doneButtonText: 'Aceptar',
    });
    const selected = new Date(result.value);
        // Use UTC methods since the picker returns UTC timestamp
        const hour = selected.getUTCHours();
        const minute = selected.getUTCMinutes();
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  } catch (e) {
    if (e instanceof Error && (e.message.includes('canceled') || e.message.includes('dismissed'))) {
      return null;
    }
    console.warn('Native time picker failed:', e);
    return null;
  }
}

export { DatetimePicker };
export { LocalNotifications };