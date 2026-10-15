import { ConfessionRecord, ExaminationSession, ProfileMode, UserSettings } from '../types';

const SETTINGS_KEY = 'examen_confesion_settings_v1';
const CURRENT_SESSION_KEY = 'examen_confesion_session_v1';
const HISTORY_KEY = 'examen_confesion_history_v1';
const ACCUMULATED_STATS_KEY = 'examen_confesion_accumulated_stats_v1';

// Claves legacy (v1.2.9 y anteriores)
const LEGACY_SESSION_PREFIX = 'examen_conciencia_session_';
const LEGACY_HISTORY_KEY = 'examen_conciencia_history';
const LEGACY_SETTINGS_KEY = 'examen_conciencia_settings';
const LEGACY_STATS_KEY = 'examen_conciencia_accumulated_stats';

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
// Migración de claves legacy (v1.2.9 y anteriores) -> nuevas claves v1
function migrateLegacyKeys(): void {
  try {
    // Migrar settings
    const legacySettings = localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (legacySettings && !localStorage.getItem(SETTINGS_KEY)) {
      localStorage.setItem(SETTINGS_KEY, legacySettings);
      console.log('[Storage] Migrated legacy settings');
    }

    // Migrar history
    const legacyHistory = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (legacyHistory && !localStorage.getItem(HISTORY_KEY)) {
      localStorage.setItem(HISTORY_KEY, legacyHistory);
      console.log('[Storage] Migrated legacy history');
    }

    // Migrar sessions por profile
    const profiles: ProfileMode[] = ['adults', 'youth', 'kids', 'particular'];
    for (const profile of profiles) {
      const legacySessionKey = `${LEGACY_SESSION_PREFIX}${profile}`;
      const legacySession = localStorage.getItem(legacySessionKey);
      const newSessionKey = `${CURRENT_SESSION_KEY}_${profile}`;
      if (legacySession && !localStorage.getItem(newSessionKey)) {
        localStorage.setItem(newSessionKey, legacySession);
        console.log(`[Storage] Migrated legacy session for ${profile}`);
      }
    }

    // Migrar accumulated stats
    const legacyStats = localStorage.getItem(LEGACY_STATS_KEY);
    if (legacyStats && !localStorage.getItem(ACCUMULATED_STATS_KEY)) {
      localStorage.setItem(ACCUMULATED_STATS_KEY, legacyStats);
      console.log('[Storage] Migrated legacy accumulated stats');
    }
  } catch (e) {
    console.error('[Storage] Legacy migration error:', e);
  }
}

// Ejecutar migración al cargar el módulo
migrateLegacyKeys();

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
      // Si la sesión nueva está vacía (solo answers {}), intentar migrar legacy
      const hasAnswers = parsed.answers && Object.keys(parsed.answers).length > 0;
      if (!hasAnswers) {
        const legacySessionKey = `${LEGACY_SESSION_PREFIX}${profile}`;
        const legacySession = localStorage.getItem(legacySessionKey);
        if (legacySession) {
          try {
            const legacyParsed: ExaminationSession = JSON.parse(legacySession);
            const legacyHasAnswers = legacyParsed.answers && Object.keys(legacyParsed.answers).length > 0;
            if (legacyHasAnswers) {
              console.log(`[Storage] Merging legacy session data for ${profile}`);
              // Preservar campos nuevos, usar answers/historial de legacy
              const merged: ExaminationSession = {
                ...parsed,
                ...legacyParsed,
                id: parsed.id, // mantener ID nuevo
                startedAccumulationDate: parsed.startedAccumulationDate || legacyParsed.startedAccumulationDate || legacyParsed.startDate,
              };
              saveStoredSession(merged);
              return merged;
            }
          } catch (e) {
            console.error('[Storage] Error parsing legacy session', e);
          }
        }
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

// ==================== ESTADÍSTICAS ACUMULADAS (persisten entre exámenes) ====================

export interface AccumulatedStats {
  // Conteo total de faltas por categoría (mandamiento)
  faltasPorCategoria: Record<string, number>;
  // Conteo total de faltas por pecado capital (inferido + explícito)
  faltasPorCapital: Record<string, number>;
  // Historial semanal para heatmap: YYYY-WW -> { categoria: count }
  heatmapSemanal: Record<string, Record<string, number>>;
  // Historial diario para tendencia: YYYY-MM-DD -> total faltas
  tendenciaDiaria: Record<string, number>;
  // Última actualización
  updatedAt: string;
  // Versión del esquema
  version: number;
}

const DEFAULT_ACCUMULATED_STATS: AccumulatedStats = {
  faltasPorCategoria: {},
  faltasPorCapital: {},
  heatmapSemanal: {},
  tendenciaDiaria: {},
  updatedAt: new Date().toISOString(),
  version: 1,
};

export function getAccumulatedStats(): AccumulatedStats {
  try {
    const raw = localStorage.getItem(ACCUMULATED_STATS_KEY);
    if (!raw) return DEFAULT_ACCUMULATED_STATS;
    const parsed = JSON.parse(raw);
    // Migración si falta algún campo
    return {
      ...DEFAULT_ACCUMULATED_STATS,
      ...parsed,
      faltasPorCategoria: parsed.faltasPorCategoria || {},
      faltasPorCapital: parsed.faltasPorCapital || {},
      heatmapSemanal: parsed.heatmapSemanal || {},
      tendenciaDiaria: parsed.tendenciaDiaria || {},
    };
  } catch (e) {
    console.error('Error reading accumulated stats', e);
    return DEFAULT_ACCUMULATED_STATS;
  }
}

export function saveAccumulatedStats(stats: AccumulatedStats): void {
  try {
    stats.updatedAt = new Date().toISOString();
    localStorage.setItem(ACCUMULATED_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving accumulated stats', e);
  }
}

/**
 * Actualiza las estadísticas acumuladas con una nueva falta marcada
 */
export function updateAccumulatedStats(
  questionId: string,
  status: 'leve' | 'grave' | 'none',
  categoryId: string,
  capitalSinCategory?: string,
  questions?: import('../types').QuestionItem[]
): void {
  if (status === 'none') return; // Solo acumular faltas reales
  
  const stats = getAccumulatedStats();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const weekStr = getWeekString(now); // YYYY-WW
  
  // 1. Categoría (mandamiento)
  stats.faltasPorCategoria[categoryId] = (stats.faltasPorCategoria[categoryId] || 0) + 1;
  
  // 2. Capital explícito (si la pregunta lo tiene)
  if (capitalSinCategory) {
    stats.faltasPorCapital[capitalSinCategory] = (stats.faltasPorCapital[capitalSinCategory] || 0) + 1;
  }
  
  // 3. Heatmap semanal por categoría
  if (!stats.heatmapSemanal[weekStr]) {
    stats.heatmapSemanal[weekStr] = {};
  }
  stats.heatmapSemanal[weekStr][categoryId] = (stats.heatmapSemanal[weekStr][categoryId] || 0) + 1;
  
  // 4. Tendencia diaria (total faltas ese día)
  stats.tendenciaDiaria[todayStr] = (stats.tendenciaDiaria[todayStr] || 0) + 1;
  
  // 5. Inferir capitales desde categorías (para stats completas sin capital explícito)
  // Se hace en StatsView usando capitalInference, aquí solo guardamos lo directo
  
  saveAccumulatedStats(stats);
}

/**
 * Obtiene string de semana ISO: YYYY-WW
 */
function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

/**
 * Limpia estadísticas acumuladas (útil para testing o reset manual)
 */
export function clearAccumulatedStats(): void {
  try {
    localStorage.removeItem(ACCUMULATED_STATS_KEY);
  } catch (e) {
    console.error('Error clearing accumulated stats', e);
  }
}
