import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, ALL_QUESTIONS, filterQuestionsByPersonalization } from '../data/questionsData';
import { AnswerStatus, ExaminationSession, ProfileMode, UserAnswer, UserPersonalization } from '../types';
import { PersonalizationWizardModal, DEFAULT_PERSONALIZATION } from './PersonalizationWizardModal';
import { getDefectoDominante } from '../lib/capitalInference';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Cross,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  Scale,
  MessageSquare,
  Briefcase,
  Target,
  HandHeart,
  FileEdit,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  Sparkle,
  BookOpen,
  Check,
  ListFilter,
  Layers,
  FileText,
  HelpCircle
} from 'lucide-react';

const CAPITAL_SIN_VIRTUES: Record<string, { virtue: string; advice: string }> = {
  Soberbia: {
    virtue: 'Humildad y Sinceridad',
    advice: 'Practica el examen particular diario, busca la discreción en tus buenas obras y aprende a recibir correcciones con gratitud.',
  },
  Avaricia: {
    virtue: 'Generosidad y Desprendimiento',
    advice: 'Da limosna oculta con alegría, desprende cosas materiales que acumulas e invierte tiempo en ayudar al prójimo.',
  },
  Lujuria: {
    virtue: 'Castidad y Custodia de los Sentidos',
    advice: 'Protege tu mirada y memoria, evita las ocasiones próximas de pecado en internet/redes y acude frecuentemente a la Eucaristía.',
  },
  Ira: {
    virtue: 'Paciencia y Mansedumbre',
    advice: 'Tómate 10 segundos antes de responder con ira, encomienda a quienes te molestan en la oración y pide perdón de inmediato.',
  },
  Gula: {
    virtue: 'Templanza y Sobriedad',
    advice: 'Ofrece pequeñas mortificaciones discretas en la comida y bebida, y cultiva el dominio propio en el uso de pantallas.',
  },
  Envidia: {
    virtue: 'Caridad y Benevolencia',
    advice: 'Felicita sinceramente a los demás por sus éxitos y da gracias a Dios por los talentos que ha repartido a tu alrededor.',
  },
  Pereza: {
    virtue: 'Diligencia y Fervor Espiritual',
    advice: 'Comienza el día con puntualidad, cumple tu deber de estado sin retrasos y pon horarios fijos a tu oración personal.',
  },
};

interface ExaminationViewProps {
  session: ExaminationSession;
  onUpdateAnswer: (questionId: string, status: AnswerStatus, note?: string) => void;
  onResetSession: () => void;
  onGoToSummary: () => void;
  profile: ProfileMode;
  onChangeProfile: (p: ProfileMode) => void;
  personalization?: UserPersonalization;
  onSavePersonalization?: (p: UserPersonalization) => void;
  onOpenWizardModal?: () => void;
  onOpenHelpModal?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Cross,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  Scale,
  MessageSquareCheck: MessageSquare,
  MessageSquare,
  Briefcase,
  Target,
  HandHeart,
};

export const ExaminationView: React.FC<ExaminationViewProps> = ({
  session,
  onUpdateAnswer,
  onResetSession,
  onGoToSummary,
  profile,
  onChangeProfile,
  personalization = DEFAULT_PERSONALIZATION,
  onSavePersonalization,
  onOpenWizardModal,
  onOpenHelpModal,
}) => {
  const [viewMode, setViewMode] = useState<'wizard' | 'list'>('wizard');
  const [currentWizardIndex, setCurrentWizardIndex] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('dios');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'marked' | 'unanswered'>('all');
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [pendingWarning, setPendingWarning] = useState<boolean>(false);

  // Effective personalization object merging active profile mode
  const currentPersonalization: UserPersonalization = useMemo(() => {
    return {
      ...personalization,
      profileMode: profile,
    };
  }, [personalization, profile]);

  // Filter questions based on personalization parameters
  const personalizedQuestions = useMemo(() => {
    return filterQuestionsByPersonalization(ALL_QUESTIONS, currentPersonalization);
  }, [currentPersonalization]);

  // Categories present in filtered question set
  const availableCategories = useMemo(() => {
    const categoryIds = new Set(personalizedQuestions.map((q) => q.categoryId));
    return CATEGORIES.filter((c) => categoryIds.has(c.id));
  }, [personalizedQuestions]);

  // Make sure wizard index is within bounds when list length changes
  useEffect(() => {
    if (currentWizardIndex >= personalizedQuestions.length) {
      setCurrentWizardIndex(Math.max(0, personalizedQuestions.length - 1));
    }
  }, [personalizedQuestions, currentWizardIndex]);

  // Current question in wizard mode
    const currentQuestion = personalizedQuestions.length > 0
      ? (personalizedQuestions[currentWizardIndex] || personalizedQuestions[0])
      : undefined;
    const currentQuestionAnswer = currentQuestion ? session.answers[currentQuestion.id] : undefined;
  const isCurrentAnswered = Boolean(currentQuestionAnswer && currentQuestionAnswer.status);

  // Sync note input when current wizard question changes
  useEffect(() => {
    if (currentQuestionAnswer?.note) {
      setNoteInput(currentQuestionAnswer.note);
    } else {
      setNoteInput('');
    }
    setPendingWarning(false);
  }, [currentQuestion?.id, currentQuestionAnswer?.note]);

  // List mode filtered questions
  const displayedListQuestions = useMemo(() => {
    return personalizedQuestions.filter((q) => {
      if (!searchQuery && q.categoryId !== selectedCategoryId) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesDetail = q.detail?.toLowerCase().includes(query);
        if (!matchesText && !matchesDetail) return false;
      }
      const answer = session.answers[q.id];
      const status = answer?.status || 'none';
      if (filterMode === 'marked' && status === 'none') return false;
      if (filterMode === 'unanswered' && status !== 'none') return false;
      return true;
    });
  }, [personalizedQuestions, selectedCategoryId, searchQuery, filterMode, session.answers]);

  // Statistics
  const totalQuestionsCount = personalizedQuestions.length;
  const answeredCount = Object.keys(session.answers).filter((qId) => {
    return personalizedQuestions.some((q) => q.id === qId) && session.answers[qId]?.status;
  }).length;

  const markedSinsCount = Object.keys(session.answers).filter((qId) => {
    return personalizedQuestions.some((q) => q.id === qId) && (session.answers[qId]?.status === 'leve' || session.answers[qId]?.status === 'grave');
  }).length;

  const progressPercent = totalQuestionsCount > 0 ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0;

    // Dominant Defect (Real-time during examination)
    const dominantDefect = useMemo(() => {
      return getDefectoDominante(session.answers as any, ALL_QUESTIONS);
    }, [session.answers]);

    const virtInfo = dominantDefect ? CAPITAL_SIN_VIRTUES[dominantDefect.capital] : CAPITAL_SIN_VIRTUES['Soberbia'];

    // Wizard navigation handlers
  const handleAnswerAndNext = (status: AnswerStatus) => {
    if (!currentQuestion) return;
    setPendingWarning(false);
    const cat = CATEGORIES.find((c) => c.id === currentQuestion.categoryId);
    onUpdateAnswer(
      currentQuestion.id, 
      status, 
      noteInput.trim() || undefined, 
      currentQuestion.text, 
      cat?.title
    );
    
    if (currentWizardIndex < personalizedQuestions.length - 1) {
      setCurrentWizardIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    setPendingWarning(false);
    if (currentWizardIndex > 0) {
      setCurrentWizardIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (!isCurrentAnswered) {
      setPendingWarning(true);
      return;
    }
    setPendingWarning(false);
    if (currentWizardIndex < personalizedQuestions.length - 1) {
      setCurrentWizardIndex((prev) => prev + 1);
    }
  };

  const handleJumpToCategory = (catId: string) => {
    const idx = personalizedQuestions.findIndex((q) => q.categoryId === catId);
    if (idx !== -1) {
      setCurrentWizardIndex(idx);
      setSelectedCategoryId(catId);
    }
  };

  const currentCategory = CATEGORIES.find((c) => c.id === currentQuestion?.categoryId);

  return (
    <div className="space-y-6 pb-24">
      {/* Personalization Modal */}
      <PersonalizationWizardModal
        isOpen={isPersonalizationOpen}
        initialData={currentPersonalization}
        onSave={(data) => {
          setIsPersonalizationOpen(false);
          onChangeProfile(data.profileMode);
          if (onSavePersonalization) {
            onSavePersonalization(data);
          }
        }}
        onClose={() => setIsPersonalizationOpen(false)}
      />

      {/* Top Banner: Profile, Diagnostic & Global Progress */}
      <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-[#C9A227]" />
                Examen Personalizado de Conciencia
              </span>
              <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-0.5 rounded-md border border-[#C9A227]/20">
                {totalQuestionsCount} Preguntas Seleccionadas
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0]">
              Examen de Conciencia según tu Estado de Vida
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed max-w-3xl">
              Preguntas filtradas específicamente para tu edad, sexo, vocación y responsabilidades cotidianas para una confesión profunda y sincera.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">

            {onOpenWizardModal && (
              <button
                onClick={onOpenWizardModal}
                className="px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                title="Abrir el examen interactivo en ventana modal flotante"
              >
                <Sparkle className="w-4 h-4 fill-black text-black" />
                <span>Abrir Ventana Flotante Modal</span>
              </button>
            )}

            <button
              onClick={() => setIsPersonalizationOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C9A227]" />
              <span>Personalizar Perfil</span>
            </button>

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs font-medium">
              <button
                onClick={() => setViewMode('wizard')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'wizard'
                    ? 'bg-[#C9A227] text-black font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Paso a Paso (Wizard)</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-[#C9A227] text-black font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Lista Completa</span>
              </button>
            </div>
          </div>
                  </div>

                  {/* Dominant Defect Banner (Real-time during examination) */}
                  <div className="bg-[#141415] border border-[#C9A227]/30 rounded-2xl p-4 shadow-lg relative">
                    <span className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#C9A227] text-black text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(201,162,39,0.3)]">
                      Defecto Dominante Actual
                    </span>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-[#C9A227]" />
                        <div>
                          <p className="text-xs font-semibold text-[#C9A227] uppercase tracking-wider">
                            Tu talón de Aquiles en este examen:
                          </p>
                          <p className="text-lg font-serif italic text-white">
                                                      <span className="text-[#C9A227] not-italic font-semibold">{dominantDefect?.capital || 'Sin faltas marcadas aún'}</span>
                                                    </p>
                        </div>
                      </div>

                      <div className="bg-white/80 dark:bg-black/30 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 shrink-0">
                        <p className="text-xs font-serif text-slate-700 dark:text-white/80 leading-snug italic">
                          «{virtInfo.advice}»
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Active Profile Chips Badge Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-white/80 shrink-0">
              Perfil Configurado:
            </span>

            {/* Sex Chip */}
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-semibold text-slate-800 dark:text-white flex items-center gap-1">
              👤 Sexo: <strong>{currentPersonalization.gender === 'male' ? 'Varón' : 'Hembra'}</strong>
            </span>

            {/* Age / Stage Chip */}
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-semibold text-slate-800 dark:text-white flex items-center gap-1">
              🎂 Etapa: <strong>{profile === 'adults' ? 'Adulto (+18 años)' : profile === 'youth' ? 'Joven (12-18 años)' : profile === 'kids' ? 'Niño (<12 años)' : 'Examen Particular'}</strong>
            </span>

            {/* Civil Status Chip */}
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-semibold text-slate-800 dark:text-white flex items-center gap-1">
              💍 Estado: <strong>
                {currentPersonalization.civilStatus === 'married' ? 'Casado/a' : 
                 currentPersonalization.civilStatus === 'single' ? 'Soltero/a' : 
                 currentPersonalization.civilStatus === 'religious' ? 'Sacerdote / Consagrado' : 
                 currentPersonalization.civilStatus === 'divorced' ? 'Divorciado/a' : 'Viudo/a'}
              </strong>
            </span>

            {/* Duties chips */}
            {currentPersonalization.hasChildren && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold">
                👨‍👩‍👧‍👦 Con Hijos
              </span>
            )}
            {currentPersonalization.isWorking && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 font-semibold">
                💼 Trabajador
              </span>
            )}
            {currentPersonalization.hasEmployees && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-400 font-semibold">
                👔 Empleador
              </span>
            )}
            {currentPersonalization.isStudent && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                🎓 Estudiante
              </span>
            )}
          </div>

          <button
            onClick={() => setIsPersonalizationOpen(true)}
            className="text-xs font-bold text-[#C9A227] hover:underline flex items-center gap-1"
          >
            <span>Cambiar Datos de Perfil</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-white/60">
              Progreso del Examen: <strong className="text-slate-900 dark:text-white">{answeredCount} de {totalQuestionsCount}</strong> respondidas ({progressPercent}%)
            </span>
            <div className="flex items-center gap-3">
              {markedSinsCount > 0 && (
                <span className="text-[#C9A227] font-semibold text-xs bg-[#C9A227]/10 px-2.5 py-0.5 rounded-full">
                  {markedSinsCount} faltas para confesar
                </span>
              )}
              {markedSinsCount > 0 && (
                <button
                  onClick={onGoToSummary}
                  className="text-xs font-bold text-[#C9A227] hover:underline flex items-center gap-1"
                >
                  <span>Ver Resumen</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C9A227]/80 to-[#C9A227] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: STEP-BY-STEP WIZARD (PREGUNTA POR PREGUNTA)    */}
      {/* ======================================================== */}
      {viewMode === 'wizard' && (
        <div className="space-y-6">
          {/* Wizard Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#141415] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-white/80">
                Ir a Categoría:
              </span>
              <select
                value={currentQuestion?.categoryId || ''}
                onChange={(e) => handleJumpToCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#C9A227]"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title} ({cat.subtitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevQuestion}
                disabled={currentWizardIndex === 0}
                className="px-3 py-1.5 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <span className="text-xs font-semibold px-2 text-slate-500 dark:text-white/50">
                {currentWizardIndex + 1} / {totalQuestionsCount}
              </span>

              <button
                onClick={handleNextQuestion}
                disabled={currentWizardIndex === totalQuestionsCount - 1 || !isCurrentAnswered}
                className="px-3 py-1.5 rounded-xl border bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
                title={!isCurrentAnswered ? 'Responde la pregunta actual para continuar' : 'Siguiente pregunta'}
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QUESTION CARD */}
          {currentQuestion && (
            <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden transition-all">
              
              {/* Category Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                    {currentCategory?.iconName && ICON_MAP[currentCategory.iconName] ? (
                      React.createElement(ICON_MAP[currentCategory.iconName], { className: 'w-5 h-5' })
                    ) : (
                      <Cross className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#C9A227] block">
                      {currentCategory?.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-white/40 block">
                      {currentCategory?.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentQuestion.capitalSinCategory && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                      Pecado Capital: {currentQuestion.capitalSinCategory}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-white/30 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                    #{currentWizardIndex + 1}
                  </span>
                </div>
              </div>

              {/* Main Question Text */}
              <div className="space-y-3 py-2">
                <h3 className="text-xl sm:text-2xl font-serif leading-relaxed text-slate-900 dark:text-[#F0F0F0] font-medium">
                  {currentQuestion.text}
                </h3>

                {currentQuestion.detail && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-white/60 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                    <span>{currentQuestion.detail}</span>
                  </div>
                )}
              </div>

              {/* Personal Note Input for current question */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/70">
                  Detalle personal o frecuencia opcional (p. ej. "3 veces", "en el trabajo"):
                </label>
                <input
                  type="text"
                  placeholder="Escribe un detalle para recordar en la confesión..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              {/* Answer status instruction / warning banner */}
              {pendingWarning && !isCurrentAnswered && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5 animate-pulse">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                  <span className="font-semibold">
                    Debes responder esta pregunta seleccionando una opción (Sin Falta, Falta Leve o Falta Grave) antes de poder pasar a la siguiente.
                  </span>
                </div>
              )}

              {/* 3 Main Action Answer Buttons */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-700 dark:text-white/70 gap-2">
                  <div className="flex items-center gap-2">
                    <span>Selecciona tu respuesta obligatoria:</span>
                    {onOpenHelpModal && (
                      <button
                        type="button"
                        onClick={onOpenHelpModal}
                        className="text-[#C9A227] hover:underline flex items-center gap-1 text-[11px] font-normal"
                        title="¿Dudas entre leve y grave? Consulta la regla del Catecismo"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>¿Leve o Grave?</span>
                      </button>
                    )}
                  </div>
                  {isCurrentAnswered ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Pregunta contestada
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">Pendiente por responder</span>
                  )}
                </div>

                <div className="pt-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 🟢 Sin Falta */}
                  <button
                    onClick={() => handleAnswerAndNext('none')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
                      currentQuestionAnswer?.status === 'none'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold shadow-md'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:bg-emerald-500/5 hover:border-emerald-500/40'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <div>
                      <span className="font-semibold text-xs block">Sin Falta</span>
                      <span className="text-[10px] opacity-70 block">No he pecado en esto</span>
                    </div>
                  </button>

                  {/* 🟡 Falta Leve */}
                  <button
                    onClick={() => handleAnswerAndNext('leve')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
                      currentQuestionAnswer?.status === 'leve'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-md'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:bg-amber-500/5 hover:border-amber-500/40'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <div>
                      <span className="font-semibold text-xs block">Falta Leve / Venial</span>
                      <span className="text-[10px] opacity-70 block">Caída ligera o imprudencia</span>
                    </div>
                  </button>

                  {/* 🔴 Falta Grave */}
                  <button
                    onClick={() => handleAnswerAndNext('grave')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
                      currentQuestionAnswer?.status === 'grave'
                        ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-md'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:bg-rose-500/5 hover:border-rose-500/40'
                    }`}
                  >
                    <XCircle className="w-6 h-6 text-rose-500" />
                    <div>
                      <span className="font-semibold text-xs block">Falta Grave / Mortal</span>
                      <span className="text-[10px] opacity-70 block">Pecado directo o frecuente</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Wizard Bottom Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentWizardIndex === 0}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 font-semibold"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-3">
                  {currentWizardIndex === totalQuestionsCount - 1 ? (
                    <button
                      onClick={() => {
                        if (!isCurrentAnswered) {
                          setPendingWarning(true);
                          return;
                        }
                        onGoToSummary();
                      }}
                      disabled={!isCurrentAnswered}
                      className="px-5 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-xs shadow-lg transition-colors flex items-center gap-2"
                      title={!isCurrentAnswered ? 'Responde la pregunta para finalizar' : 'Finalizar examen'}
                    >
                      <Check className="w-4 h-4" />
                      <span>Finalizar y Ver Resumen</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      disabled={!isCurrentAnswered}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors flex items-center gap-2"
                      title={!isCurrentAnswered ? 'Responde la pregunta antes de avanzar' : 'Siguiente pregunta'}
                    >
                      <span>Siguiente Pregunta</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completion Banner if near end or all answered */}
          <div className="p-5 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <FileText className="w-6 h-6 text-[#C9A227] shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">¿Listo para presentar tu confesión al Sacerdote?</h4>
                <p className="text-xs text-slate-600 dark:text-white/60 mt-0.5">
                  Puedes ver en cualquier momento la lista estructurada de las faltas señaladas en tu resumen.
                </p>
              </div>
            </div>

            <button
              onClick={onGoToSummary}
              className="px-5 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-md shrink-0 transition-colors flex items-center gap-2"
            >
              <span>Ver Resumen para el Sacerdote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: CATEGORY LIST VIEW (TODAS LAS PREGUNTAS)         */}
      {/* ======================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar palabras clave en el examen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              {/* Status filter buttons */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs font-medium shrink-0">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-lg ${
                    filterMode === 'all'
                      ? 'bg-[#C9A227] text-black font-semibold'
                      : 'text-slate-600 dark:text-white/50'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterMode('marked')}
                  className={`px-3 py-1.5 rounded-lg ${
                    filterMode === 'marked'
                      ? 'bg-[#C9A227] text-black font-semibold'
                      : 'text-slate-600 dark:text-white/50'
                  }`}
                >
                  Faltas Señaladas
                </button>
                <button
                  onClick={() => setFilterMode('unanswered')}
                  className={`px-3 py-1.5 rounded-lg ${
                    filterMode === 'unanswered'
                      ? 'bg-[#C9A227] text-black font-semibold'
                      : 'text-slate-600 dark:text-white/50'
                  }`}
                >
                  Sin Responder
                </button>
              </div>
            </div>

            {/* Category horizontal scroll tabs */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-xs'
                          : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-100'
                      }`}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* List of Questions */}
          <div className="space-y-3">
            {displayedListQuestions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#141415] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 space-y-2">
                <Info className="w-8 h-8 mx-auto text-[#C9A227]" />
                <p className="text-xs font-medium">No se encontraron preguntas con el filtro actual.</p>
              </div>
            ) : (
              displayedListQuestions.map((q, idx) => {
                const answer = session.answers[q.id];
                const status = answer?.status || 'none';

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#C9A227] font-semibold">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-serif text-slate-900 dark:text-white font-medium leading-relaxed">
                          {q.text}
                        </h4>
                        {q.detail && (
                          <p className="text-xs text-slate-500 dark:text-white/50 leading-relaxed">
                            {q.detail}
                          </p>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(() => {
                          const cat = CATEGORIES.find((c) => c.id === q.categoryId);
                          return (
                            <>
                              <button
                                onClick={() => onUpdateAnswer(q.id, 'none', answer?.note, q.text, cat?.title)}
                                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                                  status === 'none'
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Limpio</span>
                              </button>

                              <button
                                onClick={() => onUpdateAnswer(q.id, 'leve', answer?.note, q.text, cat?.title)}
                                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                                  status === 'leve'
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                                    : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Leve</span>
                              </button>

                              <button
                                onClick={() => onUpdateAnswer(q.id, 'grave', answer?.note, q.text, cat?.title)}
                                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                                  status === 'grave'
                                    ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold'
                                    : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Grave</span>
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Inline Note Input in List Mode */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <FileEdit className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      <input
                        type="text"
                        placeholder="Añadir nota personal o frecuencia (ej. 3 veces)..."
                        value={answer?.note || ''}
                        onChange={(e) => {
                          const cat = CATEGORIES.find((c) => c.id === q.categoryId);
                          onUpdateAnswer(q.id, status, e.target.value.trim() || undefined, q.text, cat?.title);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border text-xs bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
