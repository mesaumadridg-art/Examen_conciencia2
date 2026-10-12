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
  history,
  personalization = DEFAULT_PERSONALIZATION,
  profile,
  settings,
  onUpdateSettings,
  onOpenWizardModal,
  onGoToTab,
  onOpenPersonalization,
  onOpenHelpModal,
}) => {
  const [showFullPrayer, setShowFullPrayer] = useState<boolean>(false);
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
    const remainingPrayers = prepPrayers.filter((p) => p.id !== activePrayer.id);
    const randomIndex = Math.floor(Math.random() * remainingPrayers.length);
    const newRandom = remainingPrayers[randomIndex] || prepPrayers[0];
    setActivePrayer(newRandom);
    if (onUpdateSettings) {
      onUpdateSettings({ preferredPrayerId: newRandom.id });
    }
  };

  // Calculate stats for last confession
  const lastRecord = history[0];
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

              <button
                onClick={() => setShowFullPrayer(!showFullPrayer)}
                className="text-xs font-bold text-[#C9A227] hover:underline flex items-center gap-1 ml-1"
              >
                <span>{showFullPrayer ? 'Ocultar' : 'Ver Completa'}</span>
              </button>
            </div>
          </div>

          <p className={`text-xs sm:text-sm text-slate-800 dark:text-white/90 font-serif italic leading-relaxed whitespace-pre-line ${!showFullPrayer ? 'line-clamp-4' : ''}`}>
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

      {/* 2. DUAL CARDS: REMINDER STATUS & SACRAMENTAL PENANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD A: Recordatorio Diario y Examen Acumulativo */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-serif italic font-semibold text-base text-slate-900 dark:text-white">
                  Examen Diario Acumulativo
                </h3>
              </div>

              {hasDoneExamToday ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Realizado hoy
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Pendiente hoy
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
              Tus exámenes de conciencia diarios se acumulan día a día en una sola lista para tu próxima confesión sacramental.
            </p>

            {/* Current Session Accumulation Indicator */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-white/70">Días acumulando faltas:</span>
                <span className="font-bold text-slate-900 dark:text-[#C9A227]">
                  {daysAccumulating} {daysAccumulating === 1 ? 'día' : 'días'} acumulados
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-slate-600 dark:text-white/70">Faltas acumuladas a confesar:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {markedSinsInCurrentSession} {markedSinsInCurrentSession === 1 ? 'falta' : 'faltas'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            {markedSinsInCurrentSession > 0 ? (
              <button
                onClick={() => onGoToTab('resumen')}
                className="font-bold text-[#C9A227] hover:underline flex items-center gap-1"
              >
                <span>Ver Faltas para Confesar ({markedSinsInCurrentSession})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-slate-500 dark:text-white/40">
                Sin faltas acumuladas aún
              </span>
            )}

            <button
              onClick={onOpenWizardModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] text-black font-bold hover:bg-[#D4B34A] transition-colors flex items-center gap-1.5"
            >
              <span>Examen Flotante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD B: Recordatorio del Sacramento y Penitencia */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-serif italic font-semibold text-base text-slate-900 dark:text-white">
                  Sacramento y Penitencia
                </h3>
              </div>

              {pendingPenanceRecord ? (
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Penitencia Pendiente
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-600 dark:text-white/60 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full">
                  Cumplido
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
              Tras recibir la absolución del sacerdote, la penitencia asignada debe cumplirse prontamente como signo de reparación de amor a Dios.
            </p>

            {/* Pending Penance Warning or Last Confession Info */}
            {pendingPenanceRecord ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-xs">
                <span className="font-bold text-rose-700 dark:text-rose-300 block">
                  Penitencia por cumplir:
                </span>
                <p className="text-rose-800 dark:text-rose-200 italic font-serif">
                  "{pendingPenanceRecord.penanceAssigned}"
                </p>
              </div>
            ) : daysSinceLastConfession !== null ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-1 text-xs text-slate-700 dark:text-white/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-white/60">Última confesión:</span>
                  <span className="font-bold text-[#C9A227]">
                    {effectiveLastConfessionDate ? effectiveLastConfessionDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-white/60">Tiempo desde tu última absolución:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Hace {daysSinceLastConfession} {daysSinceLastConfession === 1 ? 'día' : 'días'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-white/50 italic">
                Sin fecha de última confesión registrada. Puedes ingresarla en Ajustes o al personalizar tu perfil.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <button
              onClick={() => onGoToTab('historial')}
              className="font-bold text-[#C9A227] hover:underline flex items-center gap-1"
            >
              <span>Ver Registro de Confesiones y Penitencias</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* BANNER GUÍA DOCTRINAL: CATECISMO DE LA IGLESIA CATÓLICA */}
      {onOpenHelpModal && (
        <div className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/70 dark:from-[#191815] dark:via-[#141415] dark:to-[#191815] border border-[#C9A227]/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A227] block">
                Catecismo de la Iglesia Católica
              </span>
              <h4 className="text-sm sm:text-base font-serif italic font-bold text-slate-900 dark:text-[#F3E5AB] leading-snug">
                Guía Doctrinal: Pecado Leve vs. Grave y Reconciliación
              </h4>
              <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-1 mt-0.5">
                Aprende qué es el pecado, las 3 condiciones de gravedad y vive el sacramento como encuentro con Jesús.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenHelpModal}
            className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Consultar Guía</span>
          </button>
        </div>
      )}

      {/* 3. PERFIL Y PERSONALIZACIÓN DE ESTADO DE VIDA */}
      <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#C9A227] block">
              Configuración de Estado de Vida y Perfil
            </span>
            <h3 className="text-base font-serif italic text-slate-900 dark:text-[#E0E0E0] font-semibold mt-0.5">
              Tu Perfil Espiritual Configurado
            </h3>
          </div>

          <button
            onClick={onOpenPersonalization}
            className="px-4 py-2 rounded-xl bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Modificar Sexo, Edad y Estado</span>
          </button>
        </div>

        {/* Active Personalization Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 dark:text-white/40 font-semibold uppercase block">
              Sexo / Género
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-xs block">
              {personalization.gender === 'male' ? 'Varón' : 'Hembra / Mujer'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 dark:text-white/40 font-semibold uppercase block">
              Etapa de Vida
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-xs block">
              {profile === 'adults' ? 'Adulto (+18 años)' : profile === 'youth' ? 'Joven (12-18 años)' : profile === 'kids' ? 'Niño (<12 años)' : 'Examen Particular'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 dark:text-white/40 font-semibold uppercase block">
              Estado Civil
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-xs block capitalize">
              {personalization.civilStatus === 'married' ? 'Casado/a' : 
               personalization.civilStatus === 'single' ? 'Soltero/a' : 
               personalization.civilStatus === 'religious' ? 'Sacerdote / Consagrado' : 
               personalization.civilStatus === 'divorced' ? 'Divorciado/a' : 'Viudo/a'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 dark:text-white/40 font-semibold uppercase block">
              Deberes de Estado
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-xs block">
              {personalization.hasChildren ? 'Con Hijos • ' : ''}
              {personalization.isWorking ? 'Trabajador' : 'Estudiante / Otro'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
