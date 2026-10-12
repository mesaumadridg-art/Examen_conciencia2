import { ConfessionRecord, ExaminationSession, ProfileMode, UserSettings } from '../types';

const SETTINGS_KEY = 'examen_confesion_settings_v1';
const CURRENT_SESSION_KEY = 'examen_confesion_session_v1';
const HISTORY_KEY = 'examen_confesion_history_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyExamReminderEnabled: true,
  dailyExamReminderTime: '21:00',
  confessionReminderEnabled: true,
  confessionReminderDay: 0, // Domingo
  confessionReminderTime: '18:00',
  confessionReminderFrequency: 'monthly',
  
  reminderDay: 0, // Domingo
  reminderTime: '21:00',
  reminderFrequency: 'daily',
  reminderEnabled: true,
  theme: 'dark',
  activeProfile: 'adults',
  privacyMode: false,
  notificationsAllowed: false,
  selectedIconId: 'icon_3',
};

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}

export function getStoredSession(profile: ProfileMode): ExaminationSession {
  try {
    const raw = localStorage.getItem(`${CURRENT_SESSION_KEY}_${profile}`);
    if (raw) {
      const parsed: ExaminationSession = JSON.parse(raw);
      if (!parsed.startedAccumulationDate) {
        parsed.startedAccumulationDate = parsed.startDate || new Date().toISOString();
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading session from localStorage', e);
  }

  // Create new session if none exists
  const now = new Date().toISOString();
  const newSession: ExaminationSession = {
    id: `session_${Date.now()}`,
    startDate: now,
    updatedAt: now,
    startedAccumulationDate: now,
    profile,
    answers: {},
    isCompleted: false,
  };
  saveStoredSession(newSession);
  return newSession;
}

export function saveStoredSession(session: ExaminationSession): void {
  try {
    session.updatedAt = new Date().toISOString();
    localStorage.setItem(`${CURRENT_SESSION_KEY}_${session.profile}`, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session to localStorage', e);
  }
}

export function clearStoredSession(profile: ProfileMode): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    localStorage.removeItem(`${CURRENT_SESSION_KEY}_${profile}`);
    localStorage.removeItem(`${CURRENT_SESSION_KEY}_adults`);
    localStorage.removeItem(`${CURRENT_SESSION_KEY}_youth`);
    localStorage.removeItem(`${CURRENT_SESSION_KEY}_kids`);
  } catch (e) {
    console.error('Error clearing session', e);
  }
}

export function getConfessionHistory(): ConfessionRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading history', e);
    return [];
  }
}

export function saveConfessionRecord(record: ConfessionRecord): void {
  try {
    const history = getConfessionHistory();
    const existingIndex = history.findIndex((h) => h.id === record.id);
    if (existingIndex >= 0) {
      history[existingIndex] = record;
    } else {
      history.unshift(record);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving confession record', e);
  }
}

export function deleteConfessionRecord(id: string): void {
  try {
    const history = getConfessionHistory();
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting confession record', e);
  }
}

export function exportAllDataJSON(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: getStoredSettings(),
    history: getConfessionHistory(),
    sessions: {
      adults: getStoredSession('adults'),
      youth: getStoredSession('youth'),
      kids: getStoredSession('kids'),
      particular: getStoredSession('particular'),
    }
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return false;

    if (parsed.settings) {
      saveStoredSettings(parsed.settings);
    }
    if (Array.isArray(parsed.history)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(parsed.history));
    }
    if (parsed.sessions && typeof parsed.sessions === 'object') {
      if (parsed.sessions.adults) saveStoredSession(parsed.sessions.adults);
      if (parsed.sessions.youth) saveStoredSession(parsed.sessions.youth);
      if (parsed.sessions.kids) saveStoredSession(parsed.sessions.kids);
      if (parsed.sessions.particular) saveStoredSession(parsed.sessions.particular);
    }
    return true;
  } catch (e) {
    console.error('Error importing backup JSON:', e);
    return false;
  }
}

export const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
