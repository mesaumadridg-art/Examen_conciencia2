import React, { useState, useEffect } from 'react';
import { ProfileMode, UserSettings } from '../types';
import { DAYS_OF_WEEK } from '../lib/storage';
import { 
  requestNotificationPermission as reqPermission, 
  sendTestNotification
} from '../lib/notifications';
import { CustomDatePicker } from './CustomDatePicker';
import { updateService, type UpdateInfo } from '../services/updateService';
import {
  Bell,
  Moon,
  Sun,
  X,
  Clock,
  RotateCcw,
  Sparkles,
  Calendar,
  Download,
  Smartphone,
  AlertTriangle
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClose?: () => void;
  canInstallPWA?: boolean;
  onInstallPWA?: () => void;
}

// Hardcoded update URL
const UPDATE_JSON_URL = 'https://raw.githubusercontent.com/mesaumadridg-art/Examen_conciencia2/main/update.json';

function format12HourTime(time24?: string): string {
  if (!time24) return '--:--';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  canInstallPWA,
  onInstallPWA,
}) => {
  const [notificationTestStatus, setNotificationTestStatus] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');

  const handleRequestPermission = async () => {
    try {
      const perm = await reqPermission();
      if (perm === 'granted') {
        onUpdateSettings({ notificationsAllowed: true });
        setNotificationTestStatus('Permiso concedido exitosamente.');
      } else {
        onUpdateSettings({ notificationsAllowed: false });
        setNotificationTestStatus('Permiso denegado por el sistema.');
      }
    } catch (e: any) {
      setNotificationTestStatus(`Error: ${e?.message || 'No se pudo obtener permiso'}`);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      setNotificationTestStatus('Notificación de prueba enviada.');
    } catch (e: any) {
      setNotificationTestStatus(`Error: ${e?.message || 'Fallo al enviar prueba'}`);
    }
  };

  // Get app version from Capacitor (dynamic import to avoid web build issues)
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const info = await App.getInfo();
        setAppVersion(`v${info.version} (build ${info.build})`);
      } catch (e) {
        console.log('App version not available (web)', e);
        // Fallback: hardcoded version for web
        setAppVersion('v1.2.9 (build 22)');
      }
    };
    fetchVersion();
  }, []);

  // Update checker state
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const result = await updateService.checkForUpdate(false, false);
      if (result.hasUpdate && result.info) {
        setUpdateInfo(result.info);
        setUpdateSuccess('Nueva versión encontrada');
      } else if (result.info?.skipped) {
        setUpdateError('Esta versión fue omitida. Usa "Forzar Comprobación" para volver a verla.');
      } else {
        setUpdateInfo(null);
        setUpdateSuccess('No hay actualizaciones disponibles');
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleForceCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const result = await updateService.checkForUpdate(true, false);
      if (result.hasUpdate && result.info) {
        setUpdateInfo(result.info);
        setUpdateSuccess('Nueva versión encontrada (forzada)');
      } else {
        setUpdateInfo(null);
        setUpdateSuccess('No hay actualizaciones disponibles');
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleDownloadAndInstall = async (apkUrl: string) => {
    setDownloadingUpdate(true);
    try {
      await updateService.downloadAndInstall(apkUrl);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Error descargando');
    } finally {
      setDownloadingUpdate(false);
    }
  };

  const handleSkipVersion = async (versionCode: number) => {
    await updateService.skipVersion(versionCode);
    setUpdateInfo(null);
    setUpdateSuccess('Versión omitida');
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
          {appVersion && (
            <p className="text-[10px] font-mono text-[#C9A227]/80 mt-1">{appVersion}</p>
          )}
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
            <input
              type="checkbox"
              checked={settings.dailyExamReminderEnabled}
              onChange={(e) => onUpdateSettings({ dailyExamReminderEnabled: e.target.checked })}
              className="w-4 h-4 text-[#C9A227] accent-[#C9A227] rounded focus:ring-[#C9A227]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/70">Hora</label>
              <div className="relative group">
                <div
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement;
                    try { input?.showPicker(); } catch { input?.focus(); }
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 group-hover:border-[#C9A227] dark:group-hover:border-[#C9A227] transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#C9A227]/15 text-[#C9A227] group-hover:bg-[#C9A227] group-hover:text-black transition-colors shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-slate-900 dark:text-white text-base font-bold">
                        {format12HourTime(settings.dailyExamReminderTime)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#C9A227]">Cambiar</span>
                </div>
                <input
                  type="time"
                  value={settings.dailyExamReminderTime}
                  onChange={(e) => onUpdateSettings({ dailyExamReminderTime: e.target.value })}
                  onClick={(e) => {
                    try { e.currentTarget.showPicker(); } catch {}
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  style={{ colorScheme: 'light dark', accentColor: '#C9A227' }}
                  title="Toca para seleccionar hora"
                />
              </div>
            </div>
          </div>
        </div>

        {/* B. RECORDATORIO 2: CONFESIÓN SACRAMENTAL */}
        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-[#C9A227]" />
              <span className="uppercase tracking-wider font-bold">2. Aviso: Confesión Sacramental</span>
            </div>
            <input
              type="checkbox"
              checked={settings.confessionReminderEnabled}
              onChange={(e) => onUpdateSettings({ confessionReminderEnabled: e.target.checked })}
              className="w-4 h-4 text-[#C9A227] accent-[#C9A227] rounded focus:ring-[#C9A227]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/70">Día de la semana</label>
              <select
                value={settings.confessionReminderDay}
                onChange={(e) => onUpdateSettings({ confessionReminderDay: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
              >
                {DAYS_OF_WEEK.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/70">Hora</label>
              <div className="relative group">
                <div
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement;
                    try { input?.showPicker(); } catch { input?.focus(); }
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 group-hover:border-[#C9A227] dark:group-hover:border-[#C9A227] transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#C9A227]/15 text-[#C9A227] group-hover:bg-[#C9A227] group-hover:text-black transition-colors shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-slate-900 dark:text-white text-base font-bold">
                        {format12HourTime(settings.confessionReminderTime)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#C9A227]">Cambiar</span>
                </div>
                <input
                  type="time"
                  value={settings.confessionReminderTime}
                  onChange={(e) => onUpdateSettings({ confessionReminderTime: e.target.value })}
                  onClick={(e) => {
                    try { e.currentTarget.showPicker(); } catch {}
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  style={{ colorScheme: 'light dark', accentColor: '#C9A227' }}
                  title="Toca para seleccionar hora"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/70">Frecuencia</label>
            <select
              value={settings.confessionReminderFrequency}
              onChange={(e) => onUpdateSettings({ confessionReminderFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
              className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
            >
              <option value="weekly">Cada semana</option>
              <option value="biweekly">Cada 2 semanas</option>
              <option value="monthly">Cada mes</option>
            </select>
          </div>
        </div>

        {/* C. FECHAS CLAVE */}
        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-[#C9A227]" />
            <span className="uppercase tracking-wider font-bold">Fechas Clave para Confesión</span>
          </div>
          <CustomDatePicker
            selectedDates={settings.keyConfessionDates}
            onDateChange={(dates) => onUpdateSettings({ keyConfessionDates: dates })}
            maxDates={3}
          />
        </div>

        {/* D. PERMISO DE NOTIFICACIONES */}
        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs sm:text-sm">
              <Bell className="w-4 h-4 text-[#C9A227]" />
              <span className="uppercase tracking-wider font-bold">Permiso de Notificaciones del Sistema</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              settings.notificationsAllowed
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {settings.notificationsAllowed ? 'Activas' : 'Pendientes'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
            Permite que la app te envíe recordatorios diarios para tu examen de conciencia y avisos para tus confesiones programadas.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-3.5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Solicitar Permisos de Notificaciones</span>
            </button>
            <button
              type="button"
              onClick={handleTestNotification}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Enviar Notificación de Prueba</span>
            </button>
          </div>
          {notificationTestStatus && (
            <p className="text-[11px] font-medium text-[#C9A227] italic pt-1">
              {notificationTestStatus}
            </p>
          )}
        </div>
      </div>

      {/* 2. Theme & Personalization */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Personalización del Usuario (Sexo, Edad, Estado)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/80">Sexo</label>
            <select
              value={settings.personalization?.gender}
              onChange={(e) => onUpdateSettings({
                personalization: { ...settings.personalization, gender: e.target.value as 'male' | 'female' }
              })}
              className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
            >
              <option value="male">Varón</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/80">Edad</label>
            <select
              value={settings.personalization?.ageGroup}
              onChange={(e) => onUpdateSettings({
                personalization: { ...settings.personalization, ageGroup: e.target.value as 'kids' | 'youth' | 'young_adult' | 'adult' | 'senior' }
              })}
              className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
            >
              <option value="kids">Niño (12 a)</option>
              <option value="youth">Joven (13-17 a)</option>
              <option value="young_adult">Joven Adulto (18-30 a)</option>
              <option value="adult">Adulto (31-59 a)</option>
              <option value="senior">Mayor (60+ a)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/80">Estado Civil</label>
            <select
              value={settings.personalization?.civilStatus}
              onChange={(e) => onUpdateSettings({
                personalization: { ...settings.personalization, civilStatus: e.target.value as 'single' | 'married' | 'divorced' | 'widowed' | 'religious' }
              })}
              className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
            >
              <option value="single">Soltero/a</option>
              <option value="married">Casado/a</option>
              <option value="divorced">Divorciado/a</option>
              <option value="widowed">Viudo/a</option>
              <option value="religious">Sacerdote / Consagrado</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/80">¿Tiene novio/a o pareja estable?</label>
            <select
              value={settings.personalization?.hasPartner ? 'true' : 'false'}
              onChange={(e) => onUpdateSettings({
                personalization: { ...settings.personalization, hasPartner: e.target.value === 'true' }
              })}
              className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-white/80">Responsabilidades</label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.personalization?.hasChildren}
                  onChange={(e) => onUpdateSettings({
                    personalization: { ...settings.personalization, hasChildren: e.target.checked }
                  })}
                  className="w-4 h-4 text-[#C9A227] accent-[#C9A227]"
                />
                <span className="text-[11px] text-slate-800 dark:text-white">Con Hijos</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.personalization?.isWorking}
                  onChange={(e) => onUpdateSettings({
                    personalization: { ...settings.personalization, isWorking: e.target.checked }
                  })}
                  className="w-4 h-4 text-[#C9A227] accent-[#C9A227]"
                />
                <span className="text-[11px] text-slate-800 dark:text-white">Trabajador</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.personalization?.hasEmployees}
                  onChange={(e) => onUpdateSettings({
                    personalization: { ...settings.personalization, hasEmployees: e.target.checked }
                  })}
                  className="w-4 h-4 text-[#C9A227] accent-[#C9A227]"
                />
                <span className="text-[11px] text-slate-800 dark:text-white">Empleador</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.personalization?.isStudent}
                onChange={(e) => onUpdateSettings({
                  personalization: { ...settings.personalization, isStudent: e.target.checked }
                })}
                className="w-3.5 h-3.5 text-[#C9A227] accent-[#C9A227]"
              />
              <span className="text-[11px] text-slate-800 dark:text-white">Estudiante</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Theme & Visual Preferences */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <Moon className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Tema Visual</span>
        </div>
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

      {/* 5. Actualizaciones de la Aplicación */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
          <RotateCcw className="w-4 h-4 text-[#C9A227]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Actualizaciones</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
            className="flex-1 py-2 px-3 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Comprobando...' : 'Verificar Actualizaciones'}</span>
          </button>

          <button
            onClick={handleForceCheckUpdate}
            disabled={checkingUpdate}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Forzar Comprobación</span>
          </button>
        </div>

        {updateInfo && (
          <div className={`p-3 rounded-xl border ${updateInfo.force ? 'bg-red-500/10 border-red-500/30' : 'bg-[#C9A227]/10 border-[#C9A227]/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs">
                {updateInfo.force ? '⚠️ Actualización OBLIGATORIA' : '✨ Nueva versión disponible'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-white/50">
                v{updateInfo.serverVersionName} (build {updateInfo.serverVersionCode})
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-white/80 mb-2">
              Versión actual: v{updateInfo.currentVersionName} (build {updateInfo.currentVersionCode})
            </p>
            {updateInfo.changelog && (
              <div className="text-[11px] text-slate-600 dark:text-white/70 mb-2 whitespace-pre-line">
                {updateInfo.changelog}
              </div>
            )}
            <button
              onClick={() => handleDownloadAndInstall(updateInfo.apkUrl)}
              disabled={downloadingUpdate}
              className="w-full py-2 px-3 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingUpdate ? 'Descargando...' : 'Descargar e Instalar'}</span>
            </button>
            {!updateInfo.force && (
              <button
                onClick={() => handleSkipVersion(updateInfo.serverVersionCode)}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-medium text-xs hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
              >
                Omitir esta versión
              </button>
            )}
          </div>
        )}

        {updateError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
              Error: {updateError}
            </p>
          </div>
        )}

        {updateSuccess && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-[11px] text-green-700 dark:text-green-300 font-medium">
              {updateSuccess}
            </p>
          </div>
        )}

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