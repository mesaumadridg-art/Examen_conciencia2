import React, { useState } from 'react';
import { CATEGORIES, ALL_QUESTIONS, PRAYERS, getQuestionById, getSinStatement } from '../data/questionsData';
import { AnswerStatus, ConfessedSin, ExaminationSession, UserAnswer, UserSettings } from '../types';
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Printer, 
  Copy, 
  Check, 
  Lock, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  FileText,
  RotateCcw,
  ListFilter,
  FileEdit,
  Save,
  MessageSquare
} from 'lucide-react';

interface ConfessionSummaryViewProps {
  session: ExaminationSession;
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  onConfirmConfession: (notes?: string, priest?: string) => void;
  onBackToExamen: () => void;
  onResetSession?: () => void;
  onUpdateAnswer?: (questionId: string, status: AnswerStatus, note?: string, questionText?: string, categoryTitle?: string) => void;
}

export const ConfessionSummaryView: React.FC<ConfessionSummaryViewProps> = ({
  session,
  settings,
  onUpdateSettings,
  onConfirmConfession,
  onBackToExamen,
  onResetSession,
  onUpdateAnswer,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPrayer, setShowPrayer] = useState(true);
  const [priestName, setPriestName] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [displayFormat, setDisplayFormat] = useState<'statement' | 'question'>('statement');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  const isPrivacyActive = settings.privacyMode;

  const accumulationStartDate = session.startedAccumulationDate 
    ? new Date(session.startedAccumulationDate) 
    : new Date(session.startDate);
  const formattedAccumulationDate = accumulationStartDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const daysAccumulated = Math.max(
    1,
    Math.floor((Date.now() - accumulationStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  // Gather all marked items
  const sinsList: ConfessedSin[] = Object.entries(session.answers)
    .filter(([_, ans]) => (ans as UserAnswer).status === 'leve' || (ans as UserAnswer).status === 'grave')
    .map(([qId, ans]) => {
      const uAns = ans as UserAnswer;
      const q = getQuestionById(qId);
      const cat = CATEGORIES.find((c) => c.id === q?.categoryId);
      const statement = getSinStatement(q, uAns.questionText);
      return {
        questionId: qId,
        questionText: statement,
        originalQuestion: q?.text || uAns.questionText || '',
        categoryTitle: cat?.title || uAns.categoryTitle || 'General',
        status: uAns.status,
        note: uAns.note,
        capitalSinCategory: q?.capitalSinCategory,
      };
    });

  // Group by Category
  const groupedSins = sinsList.reduce<Record<string, ConfessedSin[]>>((acc, sin) => {
    if (!acc[sin.categoryTitle]) acc[sin.categoryTitle] = [];
    acc[sin.categoryTitle].push(sin);
    return acc;
  }, {});

  const actoContricion = PRAYERS.find((p) => p.id === 'acto-contricion');

  const handleCopyText = () => {
    const textLines = [
      '--- LISTA DE PECADOS PARA EL SACRAMENTO DE LA CONFESIÓN ---',
      `Fecha de preparación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
      ...Object.entries(groupedSins).flatMap(([category, items]) => [
        `[ ${category.toUpperCase()} ]`,
        ...items.map(
          (item) =>
            `- ${item.status === 'grave' ? '(Grave/Frecuente) ' : ''}${displayFormat === 'statement' ? item.questionText : item.originalQuestion}${
              item.note ? ` (Nota: ${item.note})` : ''
            }`
        ),
        '',
      ]),
      '--- ACTO DE CONTRICIÓN ---',
      actoContricion?.text || '',
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePrivacy = () => {
    onUpdateSettings({ privacyMode: !isPrivacyActive });
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-slate-100 dark:bg-[#141415] dark:border-white/10 p-5 sm:p-6 rounded-2xl border shadow-md relative print:bg-white print:text-black print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
                Guía de Confesión
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Acumulado en {daysAccumulated} {daysAccumulated === 1 ? 'día' : 'días'} (Desde el {formattedAccumulationDate})
              </span>
            </div>
            <h2 className="text-2xl font-serif italic mt-1 text-white">
              Lista de Pecados a Confesar
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-white/50 print:text-slate-600 mt-1">
              Pecados redactados como acusaciones claras y directas para declarar serenamente ante el sacerdote.
            </p>
          </div>

          {/* Action Buttons: Privacy Toggle, Copy, Print */}
          <div className="flex items-center gap-2 print:hidden self-end sm:self-auto flex-wrap">
            <button
              onClick={togglePrivacy}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPrivacyActive
                  ? 'bg-[#C9A227] text-black font-bold'
                  : 'bg-slate-800 dark:bg-black/40 hover:bg-slate-700 dark:hover:bg-white/5 text-slate-200 dark:text-white/70 border border-slate-700 dark:border-white/10'
              }`}
              title="Modo Privado (Ocultar texto hasta tocar)"
            >
              {isPrivacyActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isPrivacyActive ? 'Privado' : 'Ocultar'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="p-2.5 rounded-xl bg-slate-800 dark:bg-black/40 hover:bg-slate-700 dark:hover:bg-white/5 text-slate-200 dark:text-white/70 border border-slate-700 dark:border-white/10 transition-colors"
              title="Copiar lista de pecados"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-slate-800 dark:bg-black/40 hover:bg-slate-700 dark:hover:bg-white/5 text-slate-200 dark:text-white/70 border border-slate-700 dark:border-white/10 transition-colors"
              title="Imprimir o guardar PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {onResetSession && (
              <button
                onClick={() => {
                  if (window.confirm('¿Deseas reiniciar y borrar todas las marcas del examen actual para empezar desde cero?')) {
                    onResetSession();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Borrar todas las respuestas de este examen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reiniciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Display Format Mode Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-800 dark:border-white/10 flex items-center justify-between gap-3 text-xs flex-wrap print:hidden">
          <span className="text-slate-400 dark:text-white/40 flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-[#C9A227]" />
            Modo de presentación:
          </span>
          <div className="flex items-center gap-1 bg-slate-950/60 dark:bg-black/60 p-1 rounded-xl border border-slate-800 dark:border-white/10">
            <button
              onClick={() => setDisplayFormat('statement')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                displayFormat === 'statement'
                  ? 'bg-[#C9A227] text-black font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pecados / Acusaciones
            </button>
            <button
              onClick={() => setDisplayFormat('question')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                displayFormat === 'question'
                  ? 'bg-[#C9A227] text-black font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Preguntas Completas
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Banner Notice if Active */}
      {isPrivacyActive && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>El texto de tus faltas está protegido visualmente. Toca sobre las tarjetas para revelar.</span>
          </div>
          <button
            onClick={togglePrivacy}
            className="text-xs font-bold underline hover:text-amber-600"
          >
            Desactivar
          </button>
        </div>
      )}

      {/* List Content */}
      {sinsList.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-lg font-serif font-semibold text-slate-800 dark:text-slate-100">
            No has marcado ninguna falta
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Regresa al Examen de Conciencia para revisar tranquilamente cada mandamiento.
          </p>
          <button
            onClick={onBackToExamen}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold text-xs shadow-sm hover:bg-amber-700 transition-colors"
          >
            Volver al Examen
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedSins).map(([category, items]) => (
            <div
              key={category}
              className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm relative"
            >
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] pb-2 border-b border-slate-100 dark:border-white/5 mb-3">
                {category} ({items.length})
              </h3>

              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li
                    key={item.questionId}
                    className={`p-3.5 rounded-xl border text-sm transition-all ${
                      item.status === 'grave'
                        ? 'bg-red-500/10 dark:bg-red-950/20 border-red-500/40 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-900 dark:text-white/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {item.status === 'grave' ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                              Grave / Frecuente
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30">
                              Leve
                            </span>
                          )}

                          {item.capitalSinCategory && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {item.capitalSinCategory}
                            </span>
                          )}
                        </div>

                        <p
                          className={`font-serif leading-relaxed transition-all ${
                            isPrivacyActive
                              ? 'blur-sm select-none hover:blur-none hover:select-text cursor-pointer'
                              : ''
                          }`}
                        >
                          {displayFormat === 'statement' ? item.questionText : item.originalQuestion}
                        </p>

                        {/* Render Note or Note Editor */}
                        {editingNoteId === item.questionId ? (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                            <label className="block text-[11px] font-semibold text-[#C9A227] flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Nota o detalle para esta falta:</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                placeholder="Ej. 3 veces esta semana, en la oficina..."
                                className="flex-1 px-3 py-1.5 rounded-xl border text-xs bg-slate-100 dark:bg-black/40 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (onUpdateAnswer) {
                                    onUpdateAnswer(
                                      item.questionId,
                                      item.status,
                                      editingNoteText.trim() || undefined,
                                      item.questionText,
                                      item.categoryTitle
                                    );
                                  }
                                  setEditingNoteId(null);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs flex items-center gap-1 shadow-xs"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Guardar</span>
                              </button>
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white/70"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                            {item.note ? (
                              <div className="flex items-center gap-2 flex-1">
                                <p className="text-xs text-[#C9A227] font-mono bg-[#C9A227]/10 px-3 py-1.5 rounded-xl border border-[#C9A227]/30 flex-1">
                                  <strong>Nota:</strong> {item.note}
                                </p>
                                {onUpdateAnswer && (
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(item.questionId);
                                      setEditingNoteText(item.note || '');
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors"
                                    title="Editar nota"
                                  >
                                    <FileEdit className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              onUpdateAnswer && (
                                <button
                                  onClick={() => {
                                    setEditingNoteId(item.questionId);
                                    setEditingNoteText('');
                                  }}
                                  className="text-[11px] text-[#C9A227] hover:underline flex items-center gap-1 opacity-80 hover:opacity-100"
                                >
                                  <FileEdit className="w-3 h-3" />
                                  <span>+ Agregar nota o frecuencia</span>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Acto de Contrición Card */}
          {actoContricion && (
            <div className="bg-[#141415] border border-[#C9A227]/30 rounded-2xl p-5 shadow-lg relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-[#C9A227] text-black text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(201,162,39,0.3)]">
                Oración del Penitente
              </span>

              <button
                onClick={() => setShowPrayer(!showPrayer)}
                className="w-full flex items-center justify-between text-left font-serif italic text-[#C9A227] text-base mt-1"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C9A227]" />
                  <span>{actoContricion.title}</span>
                </div>
                {showPrayer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showPrayer && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs sm:text-sm text-white/80 whitespace-pre-line leading-relaxed font-serif italic">
                  {actoContricion.text}
                </div>
              )}
            </div>
          )}

          {/* Action to Mark as Confessed */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/5 print:hidden">
            <button
              onClick={onBackToExamen}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white/80 font-medium"
            >
              ← Volver a modificar el examen
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-[0_0_12px_rgba(201,162,39,0.25)] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>¡Me Confesé! Registrar y Continuar</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Penance Prompt Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#C9A227]">
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
              <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                ¡Gloria a Dios por tu Confesión!
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
              Has recibido el perdón divino y la gracia del sacramento. Guarda un registro de esta confesión y el compromiso con tu penitencia.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-white/80 mb-1">
                  Sacerdote o Templo (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Parroquia San José, P. Mateo"
                  value={priestName}
                  onChange={(e) => setPriestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-white/80 mb-1">
                  Penitencia e indicación del sacerdote:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Rezar 3 Avemarías y hacer un acto de caridad en familia..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onConfirmConfession(resolutionNote, priestName);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-md transition-colors"
              >
                Guardar Confesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
