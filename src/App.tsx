import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ExaminationView } from './components/ExaminationView';
import { ConfessionSummaryView } from './components/ConfessionSummaryView';
import { HistoryAndCheckinView } from './components/HistoryAndCheckinView';
import { StatsView } from './components/StatsView';
import { PrayersView } from './components/PrayersView';
import { SettingsView } from './components/SettingsView';
import { PersonalizationWizardModal, DEFAULT_PERSONALIZATION } from './components/PersonalizationWizardModal';
import { FloatingExaminationWizardModal } from './components/FloatingExaminationWizardModal';
import { HelpCatechismModal } from './components/HelpCatechismModal';
import { App as CapacitorApp } from '@capacitor/app';
import { 
  AnswerStatus, 
  ConfessedSin, 
  ConfessionRecord, 
  ExaminationSession, 
  ProfileMode, 
  UserAnswer,
  UserSettings,
  UserPersonalization
} from './types';
import { 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredSession, 
  saveStoredSession, 
  clearStoredSession, 
  getConfessionHistory, 
  saveConfessionRecord, 
  deleteConfessionRecord, 
  DAYS_OF_WEEK,
  updateAccumulatedStats
} from './lib/storage';
import { syncRemindersWithServiceWorker, scheduleAllReminders } from './lib/notifications';
import { updateService } from './services/updateService';
import { ALL_QUESTIONS, CATEGORIES, getQuestionById } from './data/questionsData';
import { Bell, Sparkles, X, Cross, Smartphone, HelpCircle } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings);
  const [activeProfile, setActiveProfile] = useState<ProfileMode>(settings.activeProfile || 'adults');
  const [session, setSession] = useState<ExaminationSession>(() => {
    return getStoredSession(settings.activeProfile || 'adults');
  });
  const [history, setHistory] = useState<ConfessionRecord[]>(getConfessionHistory);
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [dismissReminderBanner, setDismissReminderBanner] = useState<boolean>(false);
  
  // Floating Examination Wizard Modal state
  const [isWizardModalOpen, setIsWizardModalOpen] = useState<boolean>(false);

  // Help & Catechism modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // First use onboarding modal state (True if not completed onboarding yet)
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState<boolean>(
    !settings.hasCompletedOnboarding
  );

  // PWA Installation state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
    const canInstallPWA = !!deferredPrompt;

  // Auto-update check on start (once per day)
    useEffect(() => {
      const checkUpdates = async () => {
        try {
          const result = await updateService.autoCheckOnStart();
          if (result?.hasUpdate && result.info) {
            console.log('[UpdateChecker] Nueva versión disponible:', result.info.serverVersionName);
          }
        } catch (error) {
          console.warn('[UpdateChecker] Auto-check falló:', error);
        }
      };
      // Defer to after first render to ensure bridge is ready
      const timer = setTimeout(checkUpdates, 0);
      return () => clearTimeout(timer);
    }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult?.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Android back button handler
    useEffect(() => {
      const handleBackButton = () => {
        try {
          // Close modals first (settings, help, wizard, personalization, confession summary)
          if (isSettingsOpen) {
            setIsSettingsOpen(false);
            return;
          }
          if (isHelpModalOpen) {
            setIsHelpModalOpen(false);
            return;
          }
          if (isWizardModalOpen) {
            setIsWizardModalOpen(false);
            return;
          }
          if (isPersonalizationOpen) {
            setIsPersonalizationOpen(false);
            return;
          }

          // Navigate back to home tab if not on home
          if (activeTab !== 'inicio') {
            setActiveTab('inicio');
            return;
          }

          // Exit app if on home tab
          CapacitorApp.exitApp();
        } catch (e) {
          console.warn('[BackButton] Error:', e);
        }
      };

      let listener: { remove: () => void } | null = null;
      const setupListener = async () => {
        try {
          listener = await CapacitorApp.addListener('backButton', handleBackButton);
        } catch (e) {
          console.warn('[BackButton] Listener setup failed:', e);
        }
      };
      const timer = setTimeout(setupListener, 0);
      return () => {
        clearTimeout(timer);
        listener?.remove();
      };
    }, [isSettingsOpen, isHelpModalOpen, isWizardModalOpen, isPersonalizationOpen, activeTab]);

  // Apply Theme (Dark/Light mode)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply Font Size scaling
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');
    const size = settings.fontSize || 'normal';
    root.classList.add(`font-size-${size}`);
  }, [settings.fontSize]);

  // Sync Reminders with Native LocalNotifications & Service Worker
    useEffect(() => {
      const syncReminders = async () => {
        try {
          await scheduleAllReminders(settings);
          await syncRemindersWithServiceWorker(settings);
        } catch (e) {
          console.warn('[Reminders] Sync falló:', e);
        }
      };
      const timer = setTimeout(syncReminders, 0);
      return () => clearTimeout(timer);
    }, [settings]);

  // Update stored settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Switch Profile mode
  const handleChangeProfile = (p: ProfileMode) => {
    setActiveProfile(p);
    handleUpdateSettings({ activeProfile: p });
    setSession(getStoredSession(p));
  };

  // Update Question Answer in current session (Accumulates across daily exams until confession)
  const handleUpdateAnswer = (
    questionId: string, 
    status: AnswerStatus, 
    note?: string,
    questionText?: string,
    categoryTitle?: string
  ) => {
    const q = getQuestionById(questionId);
    const cat = CATEGORIES.find((c) => c.id === q?.categoryId);
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedAnswers = {
      ...session.answers,
      [questionId]: {
        questionId,
        status,
        note,
        timestamp: Date.now(),
        questionText: questionText || q?.text,
        categoryTitle: categoryTitle || cat?.title,
      },
    };

    const updatedSession: ExaminationSession = {
      ...session,
      startedAccumulationDate: session.startedAccumulationDate || new Date().toISOString(),
      answers: updatedAnswers,
    };

    setSession(updatedSession);
    saveStoredSession(updatedSession);

    // 🔑 ACUMULAR ESTADÍSTICAS PERSISTENTES (cada examen, no solo confesión)
    if (q && (status === 'leve' || status === 'grave')) {
      updateAccumulatedStats(
        questionId,
        status,
        q.categoryId,
        q.capitalSinCategory
      );
    }

    // Record last daily examination date
    if (settings.lastDailyExamDate !== todayStr) {
      handleUpdateSettings({ lastDailyExamDate: todayStr });
    }
  };

  // Reset current examination session (Call after confession or explicit clear)
  const handleResetSession = () => {
    clearStoredSession(activeProfile);
    const newSession = getStoredSession(activeProfile);
    newSession.startedAccumulationDate = new Date().toISOString();
    saveStoredSession(newSession);
    setSession(newSession);
  };

  // Confirm confession & save record to history
  const handleConfirmConfession = (penanceText?: string, priestName?: string) => {
    // Gather sins list
    const sinsList: ConfessedSin[] = Object.entries(session.answers)
      .filter(([_, ans]) => (ans as UserAnswer).status === 'leve' || (ans as UserAnswer).status === 'grave')
      .map(([qId, ans]) => {
        const uAns = ans as UserAnswer;
        const q = getQuestionById(qId);
        const cat = CATEGORIES.find((c) => c.id === q?.categoryId);
        return {
          questionId: qId,
          questionText: q?.text || uAns.questionText || 'Falta señalada en el examen',
          categoryTitle: cat?.title || uAns.categoryTitle || 'General',
          status: uAns.status,
          note: uAns.note,
          capitalSinCategory: q?.capitalSinCategory,
        };
      });

    const record: ConfessionRecord = {
      id: `confession_${Date.now()}`,
      sessionDate: session.startDate,
      confessionDate: new Date().toISOString(),
      priestOrPlace: priestName || undefined,
      sinsList,
      status: 'confessed',
      penanceAssigned: penanceText || undefined,
      penanceFulfilled: false,
    };

    saveConfessionRecord(record);
    setHistory(getConfessionHistory());

    // Update settings with last confession date
    const todayISO = new Date().toISOString();
    handleUpdateSettings({ lastConfessionDate: todayISO });

    // Reset current session after confession
    handleResetSession();
    setActiveTab('historial');
  };

  const handleUpdateRecord = (record: ConfessionRecord) => {
    saveConfessionRecord(record);
    setHistory(getConfessionHistory());
  };

  const handleDeleteRecord = (id: string) => {
    deleteConfessionRecord(id);
    setHistory(getConfessionHistory());
  };

  // Count unconfessed/marked sins in current session
  const unconfessedCount = useMemo(() => {
    return Object.values(session.answers).filter(
      (a) => (a as UserAnswer).status === 'leve' || (a as UserAnswer).status === 'grave'
    ).length;
  }, [session.answers]);

  // Check if today is the designated weekly reminder day (0=Sunday, 4=Thursday, etc.)
    // Calculate days since last confession
    const lastRecord = history.length > 0 ? history[0] : undefined;
    const effectiveLastConfessionDateStr =
    lastRecord?.confessionDate ||
    settings?.lastConfessionDate ||
    settings?.personalization?.lastConfessionDate;

  const effectiveLastConfessionDate = effectiveLastConfessionDateStr
    ? new Date(effectiveLastConfessionDateStr)
    : null;

  const daysSinceLastConfession = effectiveLastConfessionDate
    ? Math.max(0, Math.floor((Date.now() - effectiveLastConfessionDate.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const todayDay = new Date().getDay();
  const isReminderDay = todayDay === settings.reminderDay;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-[#E0E0E0] transition-colors duration-200 font-sans flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        unconfessedCount={unconfessedCount}
        openSettingsModal={() => setIsSettingsOpen(true)}
        openHelpModal={() => setIsHelpModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 pb-12">
        {/* Weekly Day Reminder Alert Banner with unconfessed count and days since last confession */}
        {isReminderDay && !dismissReminderBanner && (
          <div className="mb-5 bg-gradient-to-r from-amber-500/15 via-[#C9A227]/10 to-transparent border border-[#C9A227]/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs sm:text-sm text-slate-900 dark:text-[#E0E0E0] shadow-[0_0_20px_rgba(201,162,39,0.12)]">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#C9A227]/25 text-[#C9A227] shrink-0 mt-0.5 sm:mt-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    Recordatorio Semanal
                  </span>
                  {daysSinceLastConfession !== null && (
                                        <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-0.5 rounded-md border border-[#C9A227]/20">
                                          {daysSinceLastConfession} día{daysSinceLastConfession !== 1 ? 's' : ''} desde la última confesión
                                        </span>
                                      )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed max-w-3xl">
                  Hoy es el día designado para tu recordatorio semanal de confesión. 
                  {unconfessedCount > 0 
                    ? `Tienes ${unconfessedCount} falta${unconfessedCount !== 1 ? 's' : ''} marcada${unconfessedCount !== 1 ? 's' : ''} en tu examen actual.`
                    : 'No tienes faltas marcadas en tu examen actual. Considera hacer un examen de conciencia.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissReminderBanner(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
              aria-label="Descartar recordatorio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Home View */}
                {activeTab === 'inicio' && (
                  <HomeView 
                    session={session}
                    history={history}
                    profile={activeProfile}
                    personalization={settings.personalization}
                    settings={settings} 
                    onUpdateSettings={handleUpdateSettings}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenWizardModal={() => setIsWizardModalOpen(true)}
                    onGoToTab={(tab) => setActiveTab(tab)}
                    onOpenPersonalization={() => setIsPersonalizationOpen(true)}
                    onOpenHelpModal={() => setIsHelpModalOpen(true)}
                  />
                )}

        {/* Examination View */}
        {activeTab === 'examen' && (
          <ExaminationView
            session={session}
            onUpdateAnswer={handleUpdateAnswer}
            onResetSession={handleResetSession}
            onGoToSummary={() => setActiveTab('resumen')}
            profile={activeProfile}
            onChangeProfile={handleChangeProfile}
            personalization={settings.personalization}
            onSavePersonalization={handleUpdateSettings}
            onOpenWizardModal={() => setIsWizardModalOpen(true)}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
                    settings={settings}
          />
        )}

        {/* Confession Summary View */}
                {activeTab === 'resumen' && (
                  <ConfessionSummaryView
                    session={session}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onUpdateAnswer={handleUpdateAnswer}
                    onResetSession={handleResetSession}
                    onConfirmConfession={handleConfirmConfession}
                    onBackToExamen={() => setActiveTab('examen')}
                    profile={activeProfile}
                  />
                )}

        {/* History & Check-in View */}
        {activeTab === 'historial' && (
          <HistoryAndCheckinView
            history={history}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateSettings={handleUpdateSettings}
            settings={settings}
          />
        )}

        {/* Stats View */}
        {activeTab === 'stats' && (
          <StatsView
            history={history}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* Prayers View */}
        {activeTab === 'oraciones' && (
          <PrayersView />
        )}

        {/* Settings Modal */}
                {isSettingsOpen && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-2 sm:p-4 flex min-h-full items-end sm:items-center justify-center">
                    <SettingsView
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                      onClose={() => setIsSettingsOpen(false)}
                      canInstallPWA={canInstallPWA}
                      onInstallPWA={handleInstallPWA}
                    />
                  </div>
                )}

        {/* Floating Examination Wizard Modal */}
        {isWizardModalOpen && (
          <FloatingExaminationWizardModal
            isOpen={isWizardModalOpen}
            onClose={() => setIsWizardModalOpen(false)}
            onGoToSummary={() => {
              setIsWizardModalOpen(false);
              setActiveTab('resumen');
            }}
            session={session}
            onUpdateAnswer={handleUpdateAnswer}
            onResetSession={handleResetSession}
            profile={activeProfile}
            onChangeProfile={handleChangeProfile}
            personalization={settings.personalization}
            onSavePersonalization={handleUpdateSettings}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
            settings={settings}
          />
        )}

        {/* Personalization Wizard Modal */}
                {isPersonalizationOpen && (
                  <PersonalizationWizardModal
                    isOpen={isPersonalizationOpen}
                    initialData={{
                      ...DEFAULT_PERSONALIZATION,
                      ...settings.personalization,
                      profileMode: activeProfile,
                    }}
                    onSave={(data) => {
                      setIsPersonalizationOpen(false);
                      handleChangeProfile(data.profileMode);
                      handleUpdateSettings(data);
                    }}
                    onClose={() => setIsPersonalizationOpen(false)}
                  />
                )}

        {/* Help & Catechism Modal */}
        {isHelpModalOpen && (
          <HelpCatechismModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            activeProfile={activeProfile}
          />
        )}

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
            <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#C9A227]" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Instalar App</span>
                </div>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-white/80 mb-4">
                Instala Examen de Conciencia en tu pantalla de inicio para acceso rápido y funcionamiento offline completo.
              </p>
              <button
                onClick={handleInstallPWA}
                className="w-full py-2.5 px-4 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Instalar Ahora</span>
              </button>
            </div>
          </div>
        )}

        {/* Reminder Banner Dismiss */}
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.register('/sw.js').then(reg => reg.update()).catch(() => {});
                      }
                    `
                  }}
                >
                </script>
              </main>
            </div>
          );
        }