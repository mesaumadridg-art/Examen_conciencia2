import React, { useMemo } from 'react';
import { ConfessionRecord, UserSettings } from '../types';
import { QUESTIONS, CATEGORIES } from '../data/questionsData';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle 
} from 'lucide-react';

interface StatsViewProps {
  history: ConfessionRecord[];
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
}

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

export const StatsView: React.FC<StatsViewProps> = ({
  history,
  settings,
  onUpdateSettings,
}) => {
  // Compute frequent sins and capital sin counts
  const { capitalSinCounts, frequentQuestions, totalConfessions, penanceRate } = useMemo(() => {
    const capitalCounts: Record<string, number> = {
      Soberbia: 0,
      Avaricia: 0,
      Lujuria: 0,
      Ira: 0,
      Gula: 0,
      Envidia: 0,
      Pereza: 0,
    };

    const questionCounts: Record<string, { text: string; count: number; category: string }> = {};

    history.forEach((record) => {
      record.sinsList.forEach((sin) => {
        // Question frequency
        if (!questionCounts[sin.questionId]) {
          questionCounts[sin.questionId] = {
            text: sin.questionText,
            count: 0,
            category: sin.categoryTitle,
          };
        }
        questionCounts[sin.questionId].count += 1;

        // Capital sin count
        if (sin.capitalSinCategory && capitalCounts[sin.capitalSinCategory] !== undefined) {
          capitalCounts[sin.capitalSinCategory] += 1;
        }
      });
    });

    const frequentList = Object.values(questionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const fulfilledPenances = history.filter((h) => h.penanceFulfilled).length;
    const penancePercentage = history.length > 0 ? Math.round((fulfilledPenances / history.length) * 100) : 0;

    return {
      capitalSinCounts: capitalCounts,
      frequentQuestions: frequentList,
      totalConfessions: history.length,
      penanceRate: penancePercentage,
    };
  }, [history]);

  // Identify dominant defect based on counts
  const dominantDefectFound = useMemo(() => {
    let max = 0;
    let defect = 'Soberbia';
    Object.entries(capitalSinCounts).forEach(([capital, count]) => {
      const numCount = count as number;
      if (numCount > max) {
        max = numCount;
        defect = capital;
      }
    });
    return max > 0 ? defect : settings.dominantDefect || 'Soberbia';
  }, [capitalSinCounts, settings.dominantDefect]);

  const virtInfo = CAPITAL_SIN_VIRTUES[dominantDefectFound] || CAPITAL_SIN_VIRTUES['Soberbia'];

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-100 dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#C9A227]" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
            Análisis Espiritual Personal
          </span>
        </div>
        <h2 className="text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0] mt-1">
          Estadísticas y Defecto Dominante
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-white/50 mt-0.5">
          Identifica tus tendencias recurrentes para dirigir tu lucha ascética y adquirir virtudes.
        </p>
      </div>

      {/* Dominant Defect Focus Card */}
      <div className="bg-[#141415] border border-[#C9A227]/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative">
        <span className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#C9A227] text-black text-[9px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(201,162,39,0.3)]">
          Combate Espiritual Principal
        </span>

        <div className="flex items-center gap-2.5 text-[#C9A227] pt-1">
          <Target className="w-5 h-5 text-[#C9A227]" />
          <h3 className="text-lg font-serif italic text-white">
            Defecto Dominante Identificado: <span className="text-[#C9A227] not-italic font-semibold">{dominantDefectFound}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white/80 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227] block mb-1">
              Virtud Específica a Cultivar:
            </span>
            <p className="text-sm font-serif font-semibold text-slate-900 dark:text-white">
              {virtInfo.virtue}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227] block mb-1">
              Consejo de Ascética Particular:
            </span>
            <p className="text-xs text-slate-700 dark:text-white/80 leading-relaxed font-serif italic">
              «{virtInfo.advice}»
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/5 p-4 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-white/40 font-medium">
            Confesiones Registradas
          </span>
          <p className="text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0] mt-1">
            {totalConfessions} {totalConfessions === 1 ? 'sesión' : 'sesiones'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/5 p-4 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-white/40 font-medium">
            Cumplimiento de Penitencia
          </span>
          <p className="text-2xl font-serif italic text-emerald-400 mt-1">
            {penanceRate}%
          </p>
        </div>

        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/5 p-4 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-white/40 font-medium">
            Faltas Más Recurrentes
          </span>
          <p className="text-2xl font-serif italic text-[#C9A227] mt-1">
            {frequentQuestions.length} identificadas
          </p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capital Sins Distribution */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
            Desglose por 7 Pecados Capitales
          </h3>

          <div className="space-y-3">
            {Object.entries(capitalSinCounts).map(([capital, count]) => {
              const numCount = count as number;
              const countsArray = Object.values(capitalSinCounts) as number[];
              const maxCount = Math.max(...countsArray, 1);
              const percentage = Math.round((numCount / maxCount) * 100);

              return (
                <div key={capital} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-white/80">{capital}</span>
                    <span className="text-[#C9A227] font-semibold">{count} faltas</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        capital === dominantDefectFound ? 'bg-[#C9A227] shadow-[0_0_8px_rgba(201,162,39,0.4)]' : 'bg-slate-400 dark:bg-white/20'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Recurring Questions */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
            Pecados Recurrentes (Top 5)
          </h3>

          {frequentQuestions.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-white/40 italic py-6 text-center">
              A medida que realices y guardes exámenes de conciencia, aparecerá el listado de tus faltas más frecuentes.
            </p>
          ) : (
            <ul className="space-y-3">
              {frequentQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl border bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#C9A227] text-[10px] uppercase tracking-wider">
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30 font-semibold text-[10px]">
                      {q.count} {q.count === 1 ? 'vez' : 'veces'}
                    </span>
                  </div>
                  <p className="font-serif text-slate-800 dark:text-white/90 leading-snug">
                    {q.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
