import React, { useState } from 'react';
import { ProfileMode, UserSettings } from '../types';
import { DAYS_OF_WEEK, exportAllDataJSON, importAllDataJSON } from '../lib/storage';
import { 
  requestNotificationPermission as reqPermission, 
  sendTestNotification,
  openGoogleCalendarDailyReminder,
  openGoogleCalendarConfessionReminder,
  downloadDailyICSFile,
  downloadConfessionICSFile
} from '../lib/notifications';
import { AppIcon } from './AppIcon';
import { CustomDatePicker } from './CustomDatePicker';
import { 
  Bell, 
  Moon, 
  Sun, 
  User, 
  Lock, 
  ShieldCheck, 
  X, 
  Check, 
  Clock, 
  RotateCcw,
  Sparkles,
  Calendar,
  Download,
  Upload,
  Database,
  HardDrive,
  Smartphone,
  ExternalLink,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClose?: () => void;
  canInstallPWA?: boolean;
  onInstallPWA?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  canInstallPWA,
  onInstallPWA,
}) => {
  const [notificationTestStatus, setNotificationTestStatus] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const handleExportBackup = () => {
    try {
      const jsonStr = exportAllDataJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `examen_confesion_respaldo_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMessage('Copia de seguridad descargada correctamente.');
    } catch (e) {
      console.error(e);
      setBackupMessage('Error al exportar los datos.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = importAllDataJSON(content);
        if (ok) {
          setBackupMessage('¡Datos restaurados con éxito! Actualizando...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setBackupMessage('El archivo seleccionado no es una copia de seguridad válida.');
        }
      }
    };
    reader.readAsText(file);
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await reqPermission();
      if (permission === 'granted') {
        onUpdateSettings({ notificationsAllowed: true, reminderEnabled: true, dailyExamReminderEnabled: true });
        setNotificationTestStatus('¡Permiso concedido! Las notificaciones nativas están activadas.');
        await sendTestNotification();
      } else {
        onUpdateSettings({ notificationsAllowed: false });
        setNotificationTestStatus('Permiso de notificaciones denegado en el sistema.');
      }
    } catch (e) {
      console.error(e);
      setNotificationTestStatus('Error al solicitar permiso de notificación.');
    }
  };

  const triggerTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      setNotificationTestStatus('¡Notificación nativa de prueba enviada a tu dispositivo!');
    } else {
      setNotificationTestStatus('No se pudo enviar la notificación. Verifica que los permisos estén concedidos.');
    }
  };

  return (
    <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 max-w-xl w-full min-w-0 mx-auto space-y-5 shadow-2xl text-slate-900 dark:text-white my-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 sm:pb-4 min-w-0 gap-2">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-serif italic text-slate-900 dark:text-[#E0E0E0] truncate">Configuración de la App</h2>
          <p className="text-xs text-slate-500 dark:text-white/40 truncate">
            Recordatorios de examen de conciencia, perfil y privacidad.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 1. Schedule & Reminders (Two Distinct Reminders) */}
      <div className="space-y-4">
        
        {/* A. RECORDATORIO 1: EXAMEN DE CONCIENCIA DIARIO */}
        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-[#C9A227]" />
              <span className="uppercase tracking-wider font-bold">1. Recordatorio: Examen de Conciencia Diario</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dailyExamReminderEnabled ?? settings.reminderEnabled}
                onChange={(e) => onUpdateSettings({ 
                  dailyExamReminderEnabled: e.target.checked,
                  reminderEnabled: e.target.checked 
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-white/60 leading-relaxed">
            Te recuerda cada noche realizar una pausa breve (2 minutos) para revisar las faltas del día y acumularlas vivas hasta el día de tu confesión.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
                Hora del examen nocturno:
              </label>
              <input
                type="time"
                value={settings.dailyExamReminderTime || settings.reminderTime || '21:00'}
                onChange={(e) => onUpdateSettings({ 
                  dailyExamReminderTime: e.target.value,
                  reminderTime: e.target.value 
                })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="flex items-center text-[11px] text-[#C9A227] bg-[#C9A227]/10 p-2.5 rounded-xl border border-[#C9A227]/20">
              <span>✓ Las faltas marcadas noche a noche no se borran; se van acumulando solas hasta que recibas el sacramento.</span>
            </div>
          </div>
        </div>

        {/* B. RECORDATORIO 2: CONFESIÓN SACRAMENTAL */}
        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs sm:text-sm">
              <Bell className="w-4 h-4 text-[#C9A227]" />
              <span className="uppercase tracking-wider font-bold">2. Recordatorio: Ir a Confesarse</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.confessionReminderEnabled ?? true}
                onChange={(e) => onUpdateSettings({ confessionReminderEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-white/60 leading-relaxed">
            Aviso periódico para acudir al templo o sacerdote con tu lista acumulada de faltas para recibir la absolución.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
                Frecuencia de Confesión:
              </label>
              <select
                value={settings.confessionReminderFrequency || 'monthly'}
                onChange={(e) => onUpdateSettings({ 
                  confessionReminderFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' 
                })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal (Cada 15 días)</option>
                <option value="monthly">Mensual (Recomendado)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
                Día habitual:
              </label>
              <select
                value={settings.confessionReminderDay ?? settings.reminderDay ?? 0}
                onChange={(e) => onUpdateSettings({ 
                  confessionReminderDay: parseInt(e.target.value, 10),
                  reminderDay: parseInt(e.target.value, 10) 
                })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
              >
                {DAYS_OF_WEEK.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day} {idx === 0 || idx === 4 ? '(Común)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
                Hora del aviso:
              </label>
              <input
                type="time"
                value={settings.confessionReminderTime || '18:00'}
                onChange={(e) => onUpdateSettings({ confessionReminderTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
              />
            </div>
          </div>

          {/* Direct Calendar Export for Confession */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap gap-2 items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-white/60">
              📅 Alarma de Confesión en Calendario ({settings.confessionReminderFrequency === 'weekly' ? 'Semanal' : settings.confessionReminderFrequency === 'biweekly' ? 'Quincenal' : 'Mensual'}):
            </span>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => openGoogleCalendarConfessionReminder(
                  settings.confessionReminderFrequency || 'monthly',
                  settings.confessionReminderDay ?? settings.reminderDay ?? 0,
                  settings.confessionReminderTime || '18:00'
                )}
                className="py-1.5 px-2.5 rounded-xl bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Google Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => downloadConfessionICSFile(
                  settings.confessionReminderFrequency || 'monthly',
                  settings.confessionReminderDay ?? settings.reminderDay ?? 0,
                  settings.confessionReminderTime || '18:00'
                )}
                className="py-1.5 px-2.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white/80 font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>.ics</span>
              </button>
            </div>
          </div>
        </div>

        {/* C. REGISTRO DE FECHAS: ÚLTIMO EXAMEN DE CONCIENCIA Y ÚLTIMA CONFESIÓN */}
        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-[#C9A227]" />
            <span className="uppercase tracking-wider font-bold">Fechas Clave: Examen de Conciencia y Confesión</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-white/60 leading-relaxed">
            Puedes ajustar estas fechas tocando sobre ellas para abrir el calendario visual interactivo en formato regional (Día/Mes/Año) o ingresando los números directamente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Selector de Última Fecha de Examen de Conciencia */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200/80 dark:border-white/5 space-y-2">
              <CustomDatePicker
                label="Última fecha de examen de conciencia:"
                helperText="Fecha de tu último examen diario (acumula tus faltas hasta la confesión)."
                value={settings.lastDailyExamDate || ''}
                onChange={(newDate) => onUpdateSettings({ lastDailyExamDate: newDate })}
                quickPresets={[
                  { label: 'Hoy', daysAgo: 0 },
                  { label: 'Ayer', daysAgo: 1 },
                  { label: 'Hace 2 días', daysAgo: 2 },
                  { label: 'Hace 1 sem.', daysAgo: 7 },
                ]}
                allowClear
              />
            </div>

            {/* 2. Selector de Última Fecha de Confesión Sacramental */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200/80 dark:border-white/5 space-y-2">
              <CustomDatePicker
                label="Fecha de tu última confesión sacramental:"
                helperText="Fecha de tu última absolución sacerdotal (reinicia el ciclo penitencial)."
                value={settings.lastConfessionDate || ''}
                onChange={(newDate) => onUpdateSettings({ lastConfessionDate: newDate })}
                quickPresets={[
                  { label: 'Hoy', daysAgo: 0 },
                  { label: 'Hace 1 sem.', daysAgo: 7 },
                  { label: 'Hace 2 sem.', daysAgo: 14 },
                  { label: 'Hace 1 mes', daysAgo: 30 },
                  { label: 'Hace 3 meses', daysAgo: 90 },
                ]}
                allowClear
              />
            </div>
          </div>
        </div>

        {/* Toggle Notification Permission & Diagnostic Guide */}
        <div className="pt-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-black/20 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
            <div className="text-xs">
              <span className="font-semibold block text-slate-800 dark:text-white/90">
                Notificaciones del Sistema (Service Worker)
              </span>
              <span className="text-slate-500 dark:text-white/40">
                {settings.notificationsAllowed ? 'Permiso concedido' : 'Desactivadas o pendientes'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Activar / Probar Permiso</span>
              </button>
              <button
                onClick={triggerTestNotification}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
              >
                🔔 Probar Notificación Nativa
              </button>
            </div>
          </div>

          {notificationTestStatus && (
            <p className="text-[11px] font-medium text-[#C9A227] italic bg-[#C9A227]/10 p-2 rounded-xl border border-[#C9A227]/20">
              {notificationTestStatus}
            </p>
          )}

          {/* Guía para asegurar avisos y recordatorios en segundo plano */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>¿Cómo asegurar que recibas los avisos y notificaciones en tu dispositivo?</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-white/70 leading-relaxed">
              En muchos dispositivos móviles, el sistema operativo suspende o congela temporalmente los procesos en segundo plano de los navegadores web para ahorrar batería. Para asegurar el funcionamiento puntual de tus recordatorios:
            </p>
            <ol className="text-[11px] text-slate-600 dark:text-white/80 space-y-1.5 list-decimal pl-4 font-sans">
              <li>
                <strong>Paso 1 (Permiso de Notificaciones):</strong> En tu dispositivo: <em>Ajustes → Aplicaciones → Navegador (o la aplicación instalada) → Notificaciones → Permitir</em>.
              </li>
              <li>
                <strong>Paso 2 (Optimización de batería):</strong> En tu dispositivo: <em>Ajustes → Aplicaciones → Batería → Selecciona "Sin restricciones" o desactiva el ahorro de energía para la app</em>.
              </li>
            </ol>

            {/* Infallible Calendar Integration */}
            <div className="pt-2 border-t border-amber-500/20 space-y-3">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                ⭐ Solución 100% Infalible y Garantizada (Tus 2 alarmas en Calendario):
              </p>
              <p className="text-[11px] text-slate-600 dark:text-white/80 leading-relaxed">
                Agrega ambas alarmas recurrentes a tu aplicación habitual de <strong>Google Calendar o al calendario nativo de tu teléfono</strong>. Esto garantizará que tu dispositivo haga sonar el aviso sin depender de si la app está abierta o en segundo plano:
              </p>

              <div className="space-y-2 pt-1">
                {/* 1. Daily Exam Calendar Card */}
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/40 border border-amber-500/20 space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs font-bold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      🕯️ 1. Examen Nocturno Diario
                    </span>
                    <span className="text-[10px] font-normal text-slate-500 dark:text-white/60">
                      Diario a las {settings.dailyExamReminderTime || settings.reminderTime || '21:00'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => openGoogleCalendarDailyReminder(settings.dailyExamReminderTime || settings.reminderTime || '21:00')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Google Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadDailyICSFile(settings.dailyExamReminderTime || settings.reminderTime || '21:00')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Descargar .ics</span>
                    </button>
                  </div>
                </div>

                {/* 2. Periodic Confession Calendar Card */}
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/40 border border-amber-500/20 space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs font-bold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      ✝️ 2. Recordatorio de Confesión Sacramental
                    </span>
                    <span className="text-[10px] font-normal text-slate-500 dark:text-white/60">
                      {settings.confessionReminderFrequency === 'weekly' ? 'Semanal' : settings.confessionReminderFrequency === 'biweekly' ? 'Quincenal' : 'Mensual'} - {DAYS_OF_WEEK[settings.confessionReminderDay ?? settings.reminderDay ?? 0]} a las {settings.confessionReminderTime || '18:00'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => openGoogleCalendarConfessionReminder(
                        settings.confessionReminderFrequency || 'monthly',
                        settings.confessionReminderDay ?? settings.reminderDay ?? 0,
                        settings.confessionReminderTime || '18:00'
                      )}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Google Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadConfessionICSFile(
                        settings.confessionReminderFrequency || 'monthly',
                        settings.confessionReminderDay ?? settings.reminderDay ?? 0,
                        settings.confessionReminderTime || '18:00'
                      )}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Descargar .ics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Theme & Personalization */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Personalización del Usuario (Sexo, Edad, Estado)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
              Sexo / Género:
            </label>
            <select
              value={settings.personalization?.gender || 'male'}
              onChange={(e) => onUpdateSettings({
                personalization: {
                  ...settings.personalization,
                  gender: e.target.value as any,
                  profileMode: settings.activeProfile,
                  civilStatus: settings.personalization?.civilStatus || 'single',
                  hasChildren: settings.personalization?.hasChildren || false,
                  isWorking: settings.personalization?.isWorking ?? true,
                  hasEmployees: settings.personalization?.hasEmployees || false,
                  isStudent: settings.personalization?.isStudent || false,
                }
              })}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
            >
              <option value="male">Varón</option>
              <option value="female">Hembra / Mujer</option>
            </select>
          </div>

          {/* Profile / Age Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
              Etapa de Vida / Edad:
            </label>
            <select
              value={settings.activeProfile}
              onChange={(e) => {
                const newProfile = e.target.value as ProfileMode;
                onUpdateSettings({ 
                  activeProfile: newProfile,
                  personalization: {
                    ...settings.personalization,
                    gender: settings.personalization?.gender || 'male',
                    profileMode: newProfile,
                    civilStatus: settings.personalization?.civilStatus || 'single',
                    hasChildren: settings.personalization?.hasChildren || false,
                    isWorking: settings.personalization?.isWorking ?? true,
                    hasEmployees: settings.personalization?.hasEmployees || false,
                    isStudent: settings.personalization?.isStudent || false,
                  }
                });
              }}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
            >
              <option value="adults">Adulto (+18 años) • Completo</option>
              <option value="youth">Joven (12-18 años)</option>
              <option value="kids">Niño (&lt;12 años)</option>
              <option value="particular">Examen Particular</option>
            </select>
          </div>

          {/* Civil Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
              Estado Civil / Vocación:
            </label>
            <select
              value={settings.personalization?.civilStatus || 'single'}
              onChange={(e) => onUpdateSettings({
                personalization: {
                  ...settings.personalization,
                  gender: settings.personalization?.gender || 'male',
                  profileMode: settings.activeProfile,
                  civilStatus: e.target.value as any,
                  hasChildren: settings.personalization?.hasChildren || false,
                  isWorking: settings.personalization?.isWorking ?? true,
                  hasEmployees: settings.personalization?.hasEmployees || false,
                  isStudent: settings.personalization?.isStudent || false,
                }
              })}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:border-[#C9A227]"
            >
              <option value="single">Soltero/a</option>
              <option value="married">Casado/a (Matrimonio)</option>
              <option value="divorced">Divorciado/a</option>
              <option value="widowed">Viudo/a</option>
              <option value="religious">Sacerdote / Consagrado</option>
            </select>
          </div>
        </div>

        {/* Checkboxes for duties */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.personalization?.hasChildren || false}
              onChange={(e) => onUpdateSettings({
                personalization: {
                  ...settings.personalization,
                  gender: settings.personalization?.gender || 'male',
                  profileMode: settings.activeProfile,
                  civilStatus: settings.personalization?.civilStatus || 'single',
                  hasChildren: e.target.checked,
                  isWorking: settings.personalization?.isWorking ?? true,
                  hasEmployees: settings.personalization?.hasEmployees || false,
                  isStudent: settings.personalization?.isStudent || false,
                }
              })}
              className="w-3.5 h-3.5 text-[#C9A227] accent-[#C9A227]"
            />
            <span>Con Hijos</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.personalization?.isWorking ?? true}
              onChange={(e) => onUpdateSettings({
                personalization: {
                  ...settings.personalization,
                  gender: settings.personalization?.gender || 'male',
                  profileMode: settings.activeProfile,
                  civilStatus: settings.personalization?.civilStatus || 'single',
                  hasChildren: settings.personalization?.hasChildren || false,
                  isWorking: e.target.checked,
                  hasEmployees: settings.personalization?.hasEmployees || false,
                  isStudent: settings.personalization?.isStudent || false,
                }
              })}
              className="w-3.5 h-3.5 text-[#C9A227] accent-[#C9A227]"
            />
            <span>Trabajador</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.personalization?.hasEmployees || false}
              onChange={(e) => onUpdateSettings({
                personalization: {
                  ...settings.personalization,
                  gender: settings.personalization?.gender || 'male',
                  profileMode: settings.activeProfile,
                  civilStatus: settings.personalization?.civilStatus || 'single',
                  hasChildren: settings.personalization?.hasChildren || false,
                  isWorking: settings.personalization?.isWorking ?? true,
                  hasEmployees: e.target.checked,
                  isStudent: settings.personalization?.isStudent || false,
                }
              })}
              className="w-3.5 h-3.5 text-[#C9A227] accent-[#C9A227]"
            />
            <span>Empleador</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.personalization?.isStudent || false}
              onChange={(e) => onUpdateSettings({
                personalization: {
                  ...settings.personalization,
                  gender: settings.personalization?.gender || 'male',
                  profileMode: settings.activeProfile,
                  civilStatus: settings.personalization?.civilStatus || 'single',
                  hasChildren: settings.personalization?.hasChildren || false,
                  isWorking: settings.personalization?.isWorking ?? true,
                  hasEmployees: settings.personalization?.hasEmployees || false,
                  isStudent: e.target.checked,
                }
              })}
              className="w-3.5 h-3.5 text-[#C9A227] accent-[#C9A227]"
            />
            <span>Estudiante</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
            Tema Visual:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                settings.theme === 'dark'
                  ? 'bg-[#C9A227] text-black font-semibold border-[#C9A227]'
                  : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Oscuro</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                settings.theme === 'light'
                  ? 'bg-[#C9A227] text-black font-semibold border-[#C9A227]'
                  : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Claro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Instalación PWA en Dispositivos Móviles */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <Smartphone className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Instalación en tu Dispositivo</span>
        </div>

        <div className="p-3.5 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-2xl space-y-2.5">
          <p className="text-xs text-slate-800 dark:text-white/90 leading-relaxed">
            📲 <strong>Instalar como Aplicación en Pantalla de Inicio:</strong>
          </p>

          {canInstallPWA && onInstallPWA ? (
            <button
              onClick={onInstallPWA}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>¡Instalar Aplicación Ahora en tu Dispositivo!</span>
            </button>
          ) : (
            <p className="text-[11px] text-slate-600 dark:text-white/70 leading-relaxed">
              Si tu navegador te muestra <em>"Crear acceso directo"</em> o <em>"Añadir a pantalla de inicio"</em> en lugar de un botón directo de instalación, sigue estos sencillos pasos:
            </p>
          )}

          <ul className="text-[11px] text-slate-600 dark:text-white/70 space-y-1.5 list-disc pl-4">
            <li>
              <strong>En el navegador móvil:</strong> Abre el menú de opciones (los 3 puntos ⋮ o el botón compartir) y selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.
            </li>
            <li>
              Al instalar la aplicación, aparecerá en tu cajón de aplicaciones con el ícono vectorial sagrado de alta definición y funcionará completamente sin conexión (100% offline).
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Ícono Oficial de la Aplicación */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Ícono Oficial de la Aplicación</span>
        </div>

        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
          <AppIcon size="lg" className="shadow-md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Cruz, Sagrado Corazón y Espíritu Santo
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-white/60 leading-snug mt-0.5">
              Diseño sacro distintivo en oro litúrgico y púrpura real, optimizado para la pantalla de inicio, accesos directos y PWA instalada.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Discretion */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold block text-slate-800 dark:text-white/90">
              Modo Privado para el Sacerdote (Difuminado por defecto)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-white/40">
              Oculta las letras de tus faltas en la pantalla hasta que las toques voluntariamente.
            </span>
          </div>

          <input
            type="checkbox"
            checked={settings.privacyMode}
            onChange={(e) => onUpdateSettings({ privacyMode: e.target.checked })}
            className="w-4 h-4 text-[#C9A227] accent-[#C9A227] rounded focus:ring-[#C9A227]"
          />
        </div>
      </div>

      {/* 4. Local Storage & Offline Privacy Guarantee */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <HardDrive className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Almacenamiento Local Privado</span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
          <p className="text-xs text-slate-700 dark:text-white/80 leading-relaxed">
            🔒 <strong>100% Local y Privado:</strong> Todos tus datos (exámenes acumulados, historial de confesiones y configuraciones) se guardan directamente en el almacenamiento persistente de tu dispositivo (localStorage). <strong>No se envían a servidores ni se pierden al reiniciar.</strong>
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExportBackup}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Exportar Copia de Seguridad</span>
            </button>

            <label className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Restaurar Copia</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {backupMessage && (
            <p className="text-[11px] font-semibold text-[#C9A227] pt-1 italic">
              {backupMessage}
            </p>
          )}
        </div>
      </div>

      {onClose && (
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-md transition-colors"
          >
            Guardar y Cerrar
          </button>
        </div>
      )}
    </div>
  );
};
