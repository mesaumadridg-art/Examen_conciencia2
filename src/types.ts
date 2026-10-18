export type ProfileMode = 'adults' | 'youth' | 'kids' | 'particular';

export type Gender = 'male' | 'female';
export type CivilStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'religious';

export type AgeGroup = 'kids' | 'youth' | 'young_adult' | 'adult' | 'senior';
export type ConfessionFrequency = 'weekly' | 'monthly' | 'occasional' | 'long_time';

export interface UserPersonalization {
  gender: Gender;
  profileMode: ProfileMode; // 'kids' | 'youth' | 'adults'
  ageGroup?: AgeGroup;
  civilStatus: CivilStatus;
  confessionFrequency?: ConfessionFrequency;
  hasChildren: boolean;
  isWorking: boolean;
  hasEmployees: boolean;
  isStudent: boolean;
  hasPartner?: boolean; // ¿Tiene novio/a o pareja estable?
  lastConfessionDate?: string; // YYYY-MM-DD or ISO string of user's last confession
}

export type AnswerStatus = 'none' | 'leve' | 'grave';

export interface QuestionItem {
  id: string;
  categoryId: string;
  text: string;
  sinStatement?: string; // Direct accusation format for confession (e.g. "Falta de respeto o impaciencia con mi cónyuge")
  detail?: string;
  biblicalRef?: string;
  profileModes: ProfileMode[];
  capitalSinCategory?: 'Soberbia' | 'Avaricia' | 'Lujuria' | 'Ira' | 'Gula' | 'Envidia' | 'Pereza';
  // Personalization fields
  genderTarget?: 'all' | 'male' | 'female';
  civilStatusTarget?: CivilStatus[];
  requiresChildren?: boolean;
  requiresWorking?: boolean;
  requiresEmployees?: boolean;
  requiresStudent?: boolean;
  requiresPartner?: boolean;
}

export interface QuestionCategory {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  mandamentNumber?: number;
}

export interface UserAnswer {
  questionId: string;
  status: AnswerStatus;
  note?: string;
  count?: number;
  timestamp: number;
  questionText?: string;
  categoryTitle?: string;
}

export interface DailyExamPass {
  id: string;
  date: string;
  answers: Record<string, UserAnswer>;
}

export interface ExaminationSession {
  id: string;
  startDate: string; // ISO string
  updatedAt: string;
  profile: ProfileMode;
  answers: Record<string, UserAnswer>;
  dailyPasses?: DailyExamPass[];
  isCompleted: boolean;
  notes?: string;
  startedAccumulationDate?: string; // ISO string when current accumulation cycle started
  dailyLogs?: Record<string, { date: string; answeredCount: number; sinsFound: number }>;
}

export interface ConfessedSin {
  questionId: string;
  questionText: string;
  originalQuestion?: string;
  categoryTitle: string;
  status: AnswerStatus;
  note?: string;
  capitalSinCategory?: string;
}

export interface ConfessionRecord {
  id: string;
  sessionDate: string;
  confessionDate?: string;
  priestOrPlace?: string;
  sinsList: ConfessedSin[];
  status: 'prepared' | 'confessed';
  penanceAssigned?: string;
  penanceFulfilled: boolean;
  penanceDate?: string;
  dominantDefectFocus?: string;
  personalNotes?: string;
}

export interface UserSettings {
  // Recordatorio 1: Examen de Conciencia Diario
  dailyExamReminderEnabled?: boolean;
  dailyExamReminderTime?: string; // "21:00"

  // Recordatorio 2: Confesión Sacramental
  confessionReminderEnabled?: boolean;
  confessionReminderDay?: number; // 0 = Sunday, 1 = Monday, 4 = Thursday, etc.
  confessionReminderTime?: string; // "18:00"
  confessionReminderFrequency?: 'weekly' | 'biweekly' | 'monthly';

  // Legacy fields preserved for compatibility
  reminderDay: number;
  reminderTime: string;
  reminderFrequency: 'daily' | 'weekly';
  reminderEnabled: boolean;

  theme: 'dark' | 'light' | 'system';
  fontSize?: 'small' | 'normal' | 'large' | 'xlarge';
  activeProfile: ProfileMode;
  personalization?: UserPersonalization;
  dominantDefect?: string;
  privacyMode: boolean; // Blur/Hide list by default in confessional mode
  pinCode?: string;
  notificationsAllowed: boolean;
  hasCompletedOnboarding?: boolean;
  preferredPrayerId?: string;
  selectedIconId?: string;
  lastConfessionCheckPrompt?: string;
  lastDailyExamDate?: string; // YYYY-MM-DD
  lastConfessionDate?: string; // YYYY-MM-DD or ISO string
}

export interface SpiritualGuidanceRequest {
  topic: string;
  sinsSummary: string;
  userQuestion: string;
}

export interface SpiritualGuidanceResponse {
  guidance: string;
  error?: string;
}
