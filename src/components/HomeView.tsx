import React, { useState, useMemo, useEffect } from 'react';
import { ExaminationSession, ConfessionRecord, UserPersonalization, ProfileMode, UserSettings } from '../types';
import { DEFAULT_PERSONALIZATION } from './PersonalizationWizardModal';
import { PRAYERS, PrayerItem } from '../data/prayersData';
import { 
  Sparkles, 
  Sparkle, 
  Cross, 
  Calendar, 
  HeartHandshake, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  SlidersHorizontal, 
  Play, 
  BookOpen, 
  Check, 
  ScrollText, 
  ChevronRight,
  Flame,
  User,
  Heart,
  Briefcase,
  Shuffle,
  X,
  List,
  HelpCircle
} from 'lucide-react';

interface HomeViewProps {
  session: ExaminationSession;
  history: ConfessionRecord[];
  personalization?: UserPersonalization;
  profile: ProfileMode;
  settings?: UserSettings;
  onUpdateSettings?: (newSettings: Partial<UserSettings>) => void;
  onOpenWizardModal: () => void;
  onGoToTab: (tab: string) => void;
  onOpenPersonalization: () => void;
  onOpenHelpModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  session,
  history = [],
  personalization = DEFAULT_PERSONALIZATION,
  profile,
  settings,
  onUpdateSettings,
  onOpenWizardModal,
  onGoToTab,
  onOpenPersonalization,
  onOpenHelpModal,
}) => {
  const [isPrayerSelectorOpen, setIsPrayerSelectorOpen] = useState<boolean>(false);

  // All preparation prayers for examination
  const prepPrayers = useMemo(() => {
    return PRAYERS.filter((p) => p.moment === 'antes-examen');
  }, []);

  // Currently selected or randomized active prayer
    const [activePrayer, setActivePrayer] = useState<PrayerItem>(() => {
      if (settings?.preferredPrayerId) {
        const saved = prepPrayers.find((p) => p.id === settings.preferredPrayerId);
        if (saved) return saved;
      }
      // Random selection on initial load
      if (prepPrayers.length === 0) {
        // Fallback prayer if none available
        return {
          id: 'fallback',
          title: 'Oración preparatoria',
          subtitle: 'Invocación al Espíritu Santo',
          moment: 'antes-examen',
          text: 'Ven, Espíritu Santo, ilumina mi mente y mi corazón para conocernos y arrepentirnos de nuestros pecados.',
        } as PrayerItem;
      }
      const randomIndex = Math.floor(Math.random() * prepPrayers.length);
      return prepPrayers[randomIndex] || prepPrayers[0];
    });

  // Sync active prayer if preferredPrayerId changes
  useEffect(() => {
    if (settings?.preferredPrayerId) {
      const saved = prepPrayers.find((p) => p.id === settings.preferredPrayerId);
      if (saved) {
        setActivePrayer(saved);
      }
    }
  }, [settings?.preferredPrayerId, prepPrayers]);

  // Handler to pick a specific prayer
  const handleSelectPrayer = (prayer: PrayerItem) => {
    setActivePrayer(prayer);
    setIsPrayerSelectorOpen(false);
    if (onUpdateSettings) {
      onUpdateSettings({ preferredPrayerId: prayer.id });
    }
  };

  // Handler to shuffle to a random prayer
    const handleRandomizePrayer = () => {
      if (prepPrayers.length === 0) return;
      const remainingPrayers = prepPrayers.filter((p) => p.id !== activePrayer.id);
      if (remainingPrayers.length === 0) return;
      const randomIndex = Math.floor(Math.random() * remainingPrayers.length);
      const newRandom = remainingPrayers[randomIndex] || prepPrayers[0];
      setActivePrayer(newRandom);
      if (onUpdateSettings) {
        onUpdateSettings({ preferredPrayerId: newRandom.id });
      }
    };

  // Calculate stats for last confession
    const lastRecord = history.length > 0 ? history[0] : undefined;
    const effectiveLastConfessionDateStr =
    lastRecord?.confessionDate || 
    settings?.lastConfessionDate || 
    personalization?.lastConfessionDate;

  const effectiveLastConfessionDate = effectiveLastConfessionDateStr 
    ? new Date(effectiveLastConfessionDateStr) 
    : null;

  const daysSinceLastConfession = effectiveLastConfessionDate 
    ? Math.max(0, Math.floor((Date.now() - effectiveLastConfessionDate.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Answers count in current session
  const markedSinsInCurrentSession = Object.keys(session.answers).filter(
    (qId) => session.answers[qId]?.status === 'leve' || session.answers[qId]?.status === 'grave'
  ).length;

  // Unfulfilled penance check
  const pendingPenanceRecord = history.find((h) => h.penanceAssigned && !h.penanceFulfilled);

  // Daily exam check
  const todayStr = new Date().toISOString().split('T')[0];
  const hasDoneExamToday = settings?.lastDailyExamDate === todayStr;

  // Accumulation days calculation
  const accumulationStartDate = session.startedAccumulationDate 
    ? new Date(session.startedAccumulationDate) 
    : new Date(session.startDate);
  const daysAccumulating = Math.max(
    1,
    Math.floor((Date.now() - accumulationStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. HERO BANNER & INVOCACIÓN CON SELECCIÓN ALEATORIA/PREFERIDA */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-[#C9A227]/15 dark:via-black/40 dark:to-[#141415] border border-amber-500/30 dark:border-[#C9A227]/30 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Flame className="w-48 h-48 text-[#C9A227]" />
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A227] bg-[#C9A227]/20 border border-[#C9A227]/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#C9A227]" />
                Preparación Espiritual para el Examen
              </span>
              <span className="text-xs text-slate-600 dark:text-white/60 font-medium">
                • Invocación para pedir luz y contrición antes de examinarte
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif italic text-slate-900 dark:text-[#E0E0E0] font-medium leading-tight">
            Pide el auxilio de la Gracia Divina
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-white/70 leading-relaxed max-w-2xl">
            Antes de comenzar tu examen, colócate con humildad en la presencia de Dios. Pídele luz para reconocer tus pecados, dolor de corazón por haberle ofendido y propósito firme de enmienda.
          </p>
        </div>

        {/* Dynamic / Random Preparation Prayer Card */}
        <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md border border-amber-500/20 dark:border-[#C9A227]/30 rounded-2xl p-5 space-y-3 relative z-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-500/10 dark:border-white/5 pb-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-[#C9A227]">
                <Sparkles className="w-4 h-4 text-[#C9A227] shrink-0" />
                <h4 className="font-serif italic font-semibold text-sm">
                  {activePrayer.title}
                </h4>
              </div>
              {activePrayer.author && (
                <p className="text-[11px] font-sans font-bold text-[#C9A227]/90 pl-6">
                  {activePrayer.author}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleRandomizePrayer}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#C9A227] border border-[#C9A227]/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Cargar otra oración al azar"
              >
                <Shuffle className="w-3 h-3" />
                <span>Azar</span>
              </button>

              <button
                onClick={() => setIsPrayerSelectorOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#D4B34A] text-black text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                title="Cambiar oración de preparación"
              >
                <BookOpen className="w-3 h-3" />
                <span>Seleccionar Oración</span>
              </button>

            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 dark:text-white/90 font-serif italic leading-relaxed whitespace-pre-line">
            "{activePrayer.text}"
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-white/50 italic text-[11px]">
              {activePrayer.subtitle}
            </span>
            <button
              onClick={() => onGoToTab('oraciones')}
              className="font-bold text-[#C9A227] hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Devocionario Completo</span>
            </button>
          </div>
        </div>

        {/* DIRECT START EXAMEN BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <button
            onClick={onOpenWizardModal}
            className="w-full px-8 py-4 rounded-2xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.01] group cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black group-hover:translate-x-0.5 transition-transform" />
            <span className="tracking-wide">Iniciar examen de conciencia</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PRAYER SELECTION MODAL */}
      {isPrayerSelectorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs p-3 sm:p-5 flex min-h-full items-center justify-center">
          <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-900 dark:text-[#C9A227]">
                <BookOpen className="w-5 h-5 text-[#C9A227]" />
                <h3 className="text-lg font-serif italic font-semibold">
                  Selecciona tu Oración de Preparación
                </h3>
              </div>
              <button
                onClick={() => setIsPrayerSelectorOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-xs">
              <p className="text-slate-700 dark:text-white/80 leading-relaxed">
                Elige la oración de la Iglesia o la patrística que más conmueva tu corazón para preparar tu examen:
              </p>
              <button
                onClick={() => {
                  handleRandomizePrayer();
                  setIsPrayerSelectorOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#C9A227] text-black font-bold flex items-center gap-1.5 shrink-0 hover:bg-[#D4B34A] transition-colors ml-2"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Elegir al Azar</span>
              </button>
            </div>

            {/* List of 11 Preparation Prayers */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {prepPrayers.map((prayer) => {
                const isSelected = activePrayer.id === prayer.id;
                return (
                  <button
                    key={prayer.id}
                    onClick={() => handleSelectPrayer(prayer)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-[#C9A227]/15 border-[#C9A227] shadow-md ring-1 ring-[#C9A227]'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {prayer.title}
                        {isSelected && (
                          <span className="text-[10px] font-sans font-bold bg-[#C9A227] text-black px-2 py-0.5 rounded-full">
                            Seleccionada
                          </span>
                        )}
                      </h4>
                      {prayer.author && (
                        <span className="text-xs font-semibold text-[#C9A227]">
                          {prayer.author}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-white/50 font-sans">
                      {prayer.subtitle}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-white/80 font-serif italic line-clamp-2 pt-1 border-t border-slate-200/50 dark:border-white/5">
                      "{prayer.text}"
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setIsPrayerSelectorOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
