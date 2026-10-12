import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ExaminationView } from './components/ExaminationView';
import { ConfessionSummaryView } from './components/ConfessionSummaryView';
import { HistoryAndCheckinView } from './components/HistoryAndCheckinView';
import { StatsView } from './components/StatsView';
import { PrayersView } from './components/PrayersView';
import { SettingsView } from './components/SettingsView';
import { PersonalizationWizardModal } from './components/PersonalizationWizardModal';
import { FloatingExaminationWizardModal } from './components/FloatingExaminationWizardModal';
import { HelpCatechismModal } from './components/HelpCatechismModal';
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
  DAYS_OF_WEEK 
} from './lib/storage';
import { syncRemindersWithServiceWorker } from './lib/notifications';
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

  // Auto-update check on start (once per day)
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const result = await updateService.autoCheckOnStart();
        if (result?.hasUpdate && result.info) {
          // La notificación se mostrará en SettingsView cuando el usuario la abra
          console.log('[UpdateChecker] Nueva versión disponible:', result.info.serverVersionName);
        }
      } catch (error) {
        console.warn('[UpdateChecker] Auto-check falló:', error);
      }
    };
    checkUpdates();
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

  // Sync Reminders with Service Worker
  useEffect(() => {
    syncRemindersWithServiceWorker(settings);
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
  const lastRecord = history[0];
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
                  <span className="font-bold text-[#C9A227] text-sm sm:text-base">
                    ¡Hoy es {DAYS_OF_WEEK[todayDay]}, tu día habitual para confesar!
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-white/80">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                    Faltas pendientes de confesar:{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {unconfessedCount} {unconfessedCount === 1 ? 'falta' : 'faltas'}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Última confesión:{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {daysSinceLastConfession !== null
                        ? `hace ${daysSinceLastConfession} ${daysSinceLastConfession === 1 ? 'día' : 'días'}`
                        : 'sin fecha registrada'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0 w-full sm:w-auto justify-end">
              {unconfessedCount > 0 && (
                <button
                  onClick={() => setActiveTab('resumen')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs transition-colors shadow-xs"
                >
                  Ir a Confesión ({unconfessedCount})
                </button>
              )}
              <button
                onClick={() => setDismissReminderBanner(true)}
                className="p-1.5 hover:bg-[#C9A227]/20 text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white rounded-lg transition-colors"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'inicio' && (
          <HomeView
            session={session}
            history={history}
            personalization={settings.personalization}
            profile={activeProfile}
            settings={settings}
            onOpenWizardModal={() => setIsWizardModalOpen(true)}
            onGoToTab={(tab) => setActiveTab(tab)}
            onOpenPersonalization={() => setIsPersonalizationOpen(true)}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
          />
        )}

        {activeTab === 'examen' && (
          <ExaminationView
            session={session}
            onUpdateAnswer={handleUpdateAnswer}
            onResetSession={handleResetSession}
            onGoToSummary={() => setActiveTab('resumen')}
            profile={activeProfile}
            onChangeProfile={handleChangeProfile}
            personalization={settings.personalization}
            onSavePersonalization={(p) => {
              handleUpdateSettings({ personalization: p, hasCompletedOnboarding: true });
            }}
            onOpenWizardModal={() => setIsWizardModalOpen(true)}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
          />
        )}

        {activeTab === 'resumen' && (
          <ConfessionSummaryView
            session={session}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onConfirmConfession={handleConfirmConfession}
            onBackToExamen={() => setActiveTab('examen')}
            onResetSession={handleResetSession}
            onUpdateAnswer={handleUpdateAnswer}
          />
        )}

        {activeTab === 'historial' && (
          <HistoryAndCheckinView
            history={history}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            settings={settings}
            onGoToExamen={() => setActiveTab('examen')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            history={history}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'oraciones' && <PrayersView />}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 flex min-h-full items-end sm:items-center justify-center">
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setIsSettingsOpen(false)}
            canInstallPWA={!!deferredPrompt}
            onInstallPWA={handleInstallPWA}
          />
        </div>
      )}

      {/* Floating PWA Install Toast Banner for Android/Desktop */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#141415] text-white border border-[#C9A227]/50 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#C9A227]/20 text-[#C9A227] shrink-0">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#C9A227] truncate">¡Instalar Aplicación en tu Dispositivo!</h4>
              <p className="text-[11px] text-white/70 line-clamp-2">
                Añade la app a tu pantalla de inicio con acceso rápido, ícono sagrado y funcionamiento 100% sin conexión.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallPWA}
              className="px-3.5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-md transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1.5 text-white/40 hover:text-white rounded-lg transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* First Use Onboarding & Profile Customization Modal */}
      <PersonalizationWizardModal
        isOpen={isPersonalizationOpen}
        onClose={() => {
          setIsPersonalizationOpen(false);
          handleUpdateSettings({ hasCompletedOnboarding: true });
        }}
        initialData={settings.personalization}
        onSave={(p) => {
          handleUpdateSettings({
            personalization: p,
            activeProfile: p.profileMode,
            hasCompletedOnboarding: true,
            ...(p.lastConfessionDate ? { lastConfessionDate: p.lastConfessionDate } : {}),
          });
          setActiveProfile(p.profileMode);
          setIsPersonalizationOpen(false);
        }}
      />

      {/* Floating Examination Wizard Modal */}
      <FloatingExaminationWizardModal
        isOpen={isWizardModalOpen}
        onClose={() => setIsWizardModalOpen(false)}
        session={session}
        onUpdateAnswer={handleUpdateAnswer}
        onGoToSummary={() => setActiveTab('resumen')}
        personalization={settings.personalization}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />

      {/* Help & Catechism Modal */}
      <HelpCatechismModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-6 text-center text-xs text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-[#0D0D0E] mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-serif italic text-slate-800 dark:text-[#C9A227] font-medium">
            <Cross className="w-3.5 h-3.5 text-amber-600 dark:text-[#C9A227]" />
            <span>Examen de Conciencia y Guía de Confesión</span>
          </div>
          <p className="text-[11px]">
            Privacidad total en tu dispositivo • Fiel al Catecismo de la Iglesia Católica
          </p>
        </div>
      </footer>
    </div>
  );
}
