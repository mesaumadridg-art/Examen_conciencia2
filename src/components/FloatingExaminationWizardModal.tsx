import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, ALL_QUESTIONS, filterQuestionsByPersonalization } from '../data/questionsData';
import { AnswerStatus, ExaminationSession, UserAnswer, UserPersonalization } from '../types';
import { DEFAULT_PERSONALIZATION } from './PersonalizationWizardModal';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Sparkle, 
  Check, 
  Cross, 
  HeartHandshake, 
  ShieldAlert, 
  Sparkles, 
  Scale, 
  MessageSquare, 
  Briefcase, 
  Target, 
  HandHeart,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';

interface FloatingExaminationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ExaminationSession;
  onUpdateAnswer: (questionId: string, status: AnswerStatus, note?: string) => void;
  onGoToSummary: () => void;
  personalization?: UserPersonalization;
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

export const FloatingExaminationWizardModal: React.FC<FloatingExaminationWizardModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateAnswer,
  onGoToSummary,
  personalization = DEFAULT_PERSONALIZATION,
  onOpenHelpModal,
}) => {
  const [currentWizardIndex, setCurrentWizardIndex] = useState<number>(0);
  const [noteInput, setNoteInput] = useState<string>('');
  const [pendingWarning, setPendingWarning] = useState<boolean>(false);

  // Filtered questions based on state of life personalization
  const personalizedQuestions = useMemo(() => {
    return filterQuestionsByPersonalization(ALL_QUESTIONS, personalization);
  }, [personalization]);

  // Categories present in filtered list
  const availableCategories = useMemo(() => {
    const categoryIds = new Set(personalizedQuestions.map((q) => q.categoryId));
    return CATEGORIES.filter((c) => categoryIds.has(c.id));
  }, [personalizedQuestions]);

  // Ensure index stays in bounds
  useEffect(() => {
    if (currentWizardIndex >= personalizedQuestions.length) {
      setCurrentWizardIndex(Math.max(0, personalizedQuestions.length - 1));
    }
  }, [personalizedQuestions, currentWizardIndex]);

  // Current question & answer
    const currentQuestion = personalizedQuestions.length > 0
      ? (personalizedQuestions[currentWizardIndex] || personalizedQuestions[0])
      : undefined;
    const currentQuestionAnswer = currentQuestion ? session.answers[currentQuestion.id] : undefined;
  const isCurrentAnswered = Boolean(currentQuestionAnswer && currentQuestionAnswer.status);

  // Sync note input when wizard question changes
  useEffect(() => {
    if (currentQuestionAnswer?.note) {
      setNoteInput(currentQuestionAnswer.note);
    } else {
      setNoteInput('');
    }
    setPendingWarning(false);
  }, [currentQuestion?.id, currentQuestionAnswer?.note]);

  if (!isOpen || !currentQuestion) return null;

  const currentCategory = CATEGORIES.find((c) => c.id === currentQuestion.categoryId);
  const totalQuestionsCount = personalizedQuestions.length;

  const handleAnswerAndNext = (status: AnswerStatus) => {
    setPendingWarning(false);
    const qCat = CATEGORIES.find((c) => c.id === currentQuestion.categoryId);
    onUpdateAnswer(
      currentQuestion.id, 
      status, 
      noteInput.trim() || undefined, 
      currentQuestion.text, 
      qCat?.title
    );
    if (currentWizardIndex < personalizedQuestions.length - 1) {
      setCurrentWizardIndex((prev) => prev + 1);
    }
  };

  const handleJumpToCategory = (catId: string) => {
    const idx = personalizedQuestions.findIndex((q) => q.categoryId === catId);
    if (idx !== -1) {
      setCurrentWizardIndex(idx);
    }
  };

  const CategoryIcon = currentCategory?.iconName && ICON_MAP[currentCategory.iconName]
    ? ICON_MAP[currentCategory.iconName]
    : Cross;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-2 sm:p-4 flex min-h-full items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full min-w-0 p-4 sm:p-6 shadow-2xl space-y-4 my-auto text-slate-900 dark:text-white relative overflow-x-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Sparkle className="w-3 h-3 text-[#C9A227]" />
              Examen Guiado
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-white/40">
              {currentWizardIndex + 1} / {totalQuestionsCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Cerrar examen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category / Area Banner */}
        <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0">
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#C9A227] block truncate">
                Área Actual: {currentCategory?.title}
              </span>
              <span className="text-xs text-slate-600 dark:text-white/60 block font-medium truncate">
                {currentCategory?.subtitle}
              </span>
            </div>
          </div>

          {/* Jump to Area Dropdown */}
          <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto shrink-0">
            <span className="text-slate-400 dark:text-white/40 hidden sm:inline">Cambiar Área:</span>
            <select
              value={currentCategory?.id || ''}
              onChange={(e) => handleJumpToCategory(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#C9A227]"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-2.5 py-1 min-w-0">
          <h3 className="text-base sm:text-xl font-serif leading-relaxed text-slate-900 dark:text-[#F0F0F0] font-medium break-words">
            {currentQuestion.text}
          </h3>

          {currentQuestion.detail && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-white/60 leading-relaxed flex items-start gap-2 break-words min-w-0">
              <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
              <span>{currentQuestion.detail}</span>
            </div>
          )}

          {currentQuestion.capitalSinCategory && (
            <span className="inline-block text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              Pecado Capital: {currentQuestion.capitalSinCategory}
            </span>
          )}
        </div>

        {/* Detail Note Field */}
        <div className="space-y-1 min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-white/60">
            Anotación personal opcional:
          </label>
          <input
            type="text"
            placeholder="Añade un detalle o frecuencia..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
          />
        </div>

        {/* Answer status instruction / warning */}
        {pendingWarning && !isCurrentAnswered && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="font-semibold">Debes contestar esta pregunta (Sin Falta, Falta Leve o Falta Grave) para poder avanzar.</span>
          </div>
        )}

        {/* 3 Answer Buttons */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-white/60 gap-1.5">
            <div className="flex items-center gap-2">
              <span>Elige tu respuesta obligatoria:</span>
              {onOpenHelpModal && (
                <button
                  type="button"
                  onClick={onOpenHelpModal}
                  className="text-[#C9A227] hover:underline flex items-center gap-1 text-[10px] font-normal"
                  title="¿Dudas sobre pecado leve o grave? Consulta el Catecismo"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>¿Leve o Grave?</span>
                </button>
              )}
            </div>
            {isCurrentAnswered ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Contestada
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Pendiente por contestar</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-1 min-w-0">
          {/* 🟢 Sin Falta */}
          <button
            type="button"
            onClick={() => handleAnswerAndNext('none')}
            className={`p-2 sm:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 text-center min-w-0 ${
              currentQuestionAnswer?.status === 'none'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold shadow-md'
                : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:bg-emerald-500/10 hover:border-emerald-500/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[11px] sm:text-xs block truncate">Sin Falta</span>
              <span className="text-[9px] sm:text-[10px] opacity-75 block truncate">No he pecado</span>
            </div>
          </button>

          {/* 🟡 Falta Leve */}
          <button
            type="button"
            onClick={() => handleAnswerAndNext('leve')}
            className={`p-2 sm:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 text-center min-w-0 ${
              currentQuestionAnswer?.status === 'leve'
                ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-md'
                : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:bg-amber-500/10 hover:border-amber-500/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[11px] sm:text-xs block truncate">Falta Leve</span>
              <span className="text-[9px] sm:text-[10px] opacity-75 block truncate">Venial</span>
            </div>
          </button>

          {/* 🔴 Falta Grave */}
          <button
            type="button"
            onClick={() => handleAnswerAndNext('grave')}
            className={`p-2 sm:p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 text-center min-w-0 ${
              currentQuestionAnswer?.status === 'grave'
                ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-md'
                : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:bg-rose-500/10 hover:border-rose-500/40'
            }`}
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[11px] sm:text-xs block truncate">Falta Grave</span>
              <span className="text-[9px] sm:text-[10px] opacity-75 block truncate">Mortal</span>
            </div>
          </button>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs min-w-0 gap-2">
          <button
            type="button"
            onClick={() => {
              setPendingWarning(false);
              setCurrentWizardIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentWizardIndex === 0}
            className="px-2.5 sm:px-3.5 py-2 rounded-xl text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 font-semibold flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {currentWizardIndex === totalQuestionsCount - 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (!isCurrentAnswered) {
                    setPendingWarning(true);
                    return;
                  }
                  onClose();
                  onGoToSummary();
                }}
                disabled={!isCurrentAnswered}
                className="px-3.5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs shadow-md flex items-center gap-1 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Ver Confesión</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isCurrentAnswered) {
                    setPendingWarning(true);
                    return;
                  }
                  setPendingWarning(false);
                  setCurrentWizardIndex((prev) => Math.min(totalQuestionsCount - 1, prev + 1));
                }}
                disabled={!isCurrentAnswered}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors flex items-center gap-1"
                title={!isCurrentAnswered ? 'Selecciona una respuesta (Sin Falta, Leve o Grave) para avanzar' : 'Siguiente pregunta'}
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
