import React, { useMemo } from 'react';
import { ConfessionRecord, UserSettings } from '../types';
import { ALL_QUESTIONS, CATEGORIES } from '../data/questionsData';
import { getAccumulatedStats } from '../lib/storage';
import { getTopCapitales, getDefectoDominante, inferirCapitalesDesdeRespuestas, inferirCapitalesDesdeCategorias, getDefectoDominanteDesdeCategorias, CapitalScore } from '../lib/capitalInference';
import {
  BarChart3,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  CalendarDays,
  Flame,
  Leaf,
  Shield,
  Heart,
  Hammer,
  Eye,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

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
  const accumulatedStats = getAccumulatedStats();

  // Inferir capitales directamente desde conteo por categoría (sin dummy answers)
  const inferredCapitalScores: CapitalScore[] = useMemo(() => {
    return inferirCapitalesDesdeCategorias(
      accumulatedStats.faltasPorCategoria,
      accumulatedStats.faltasPorCapital
    );
  }, [accumulatedStats]);

  const dominantDefectFound = useMemo(() => {
    return getDefectoDominanteDesdeCategorias(
      accumulatedStats.faltasPorCategoria,
      accumulatedStats.faltasPorCapital
    );
  }, [accumulatedStats]);

  const virtInfo = dominantDefectFound ? CAPITAL_SIN_VIRTUES[dominantDefectFound.capital] : CAPITAL_SIN_VIRTUES['Soberbia'];

  // Data para el gráfico de barras de pecados capitales (acumulados)
  const capitalBarChartData = useMemo(() => {
    const labels = inferredCapitalScores.map(c => c.capital);
    const data = inferredCapitalScores.map(c => c.score);
    return {
      labels,
      datasets: [
        {
          label: 'Faltas Acumuladas',
          data,
          backgroundColor: labels.map(label => label === dominantDefectFound?.capital ? 'rgba(201, 162, 39, 0.7)' : 'rgba(75, 192, 192, 0.5)'),
          borderColor: labels.map(label => label === dominantDefectFound?.capital ? 'rgba(201, 162, 39, 1)' : 'rgba(75, 192, 192, 1)'),
          borderWidth: 1,
        },
      ],
    };
  }, [inferredCapitalScores, dominantDefectFound]);

  // Data para el gráfico de barras de faltas por categoría (acumulados)
  const categoryBarChartData = useMemo(() => {
    const sortedCategories = Object.entries(accumulatedStats.faltasPorCategoria)
      .sort(([, countA], [, countB]) => countB - countA);
    const labels = sortedCategories.map(([catId,]) => CATEGORIES.find(c => c.id === catId)?.title || catId);
    const data = sortedCategories.map(([, count]) => count);
    return {
      labels,
      datasets: [
        {
          label: 'Faltas por Mandamiento/Categoría',
          data,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [accumulatedStats.faltasPorCategoria]);

    // Heatmap Semanal: últimos 12 semanas × 7 días
    const weeklyHeatmapData = useMemo(() => {
      const weeks: string[] = [];
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 7);
        const year = d.getFullYear();
        const week = Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
        weeks.push(`${year}-W${week.toString().padStart(2, '0')}`);
      }

      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const cells: { week: string; day: number; count: number }[] = [];

      weeks.forEach(week => {
        const weekData = accumulatedStats.heatmapSemanal[week] || {};
        let total = 0;
        Object.values(weekData).forEach(c => total += c);
        days.forEach((day, dayIdx) => {
          const dayCount = total > 0 ? Math.round(total / 7) : 0;
          cells.push({ week, day: dayIdx, count: dayCount });
        });
      });

      return { weeks, days, cells };
    }, [accumulatedStats.heatmapSemanal]);

    // Tendencia Diaria: últimos 30 días
    const dailyTrendChartData = useMemo(() => {
      const labels: string[] = [];
      const data: number[] = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
        data.push(accumulatedStats.tendenciaDiaria[dayStr] || 0);
      }
      return {
        labels,
        datasets: [{
          label: 'Faltas por día',
          data,
        }],
      };
    }, [accumulatedStats.tendenciaDiaria]);

    // Top 5 preguntas recurrentes (ahora de accumulatedStats o history)
  const frequentQuestions = useMemo(() => {
    // Usar history para las preguntas recurrentes específicas (acumulatedStats solo cuenta por cat)
    const questionCounts: Record<string, { text: string; count: number; category: string }> = {};

    history.forEach((record) => {
      record.sinsList.forEach((sin) => {
        if (!questionCounts[sin.questionId]) {
          questionCounts[sin.questionId] = {
            text: sin.questionText,
            count: 0,
            category: sin.categoryTitle || 'General',
          };
        }
        questionCounts[sin.questionId].count += 1;
      });
    });
    return Object.values(questionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [history]);

  const totalConfessions = history.length;
  const fulfilledPenances = history.filter((h) => h.penanceFulfilled).length;
  const penanceRate = history.length > 0 ? Math.round((fulfilledPenances / history.length) * 100) : 0;

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
            Defecto Dominante Identificado: <span className="text-[#C9A227] not-italic font-semibold">{dominantDefectFound?.capital || 'Ninguno (aún)'}</span>
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
            Faltas Acumuladas (Exámenes)
          </span>
          <p className="text-2xl font-serif italic text-[#C9A227] mt-1">
            {Object.values(accumulatedStats.faltasPorCategoria).reduce((acc, count) => acc + count, 0)} identificadas
          </p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capital Sins Distribution (Bar Chart) */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
            Distribución por 7 Pecados Capitales
          </h3>
          {inferredCapitalScores.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-white/40 italic py-6 text-center">
              A medida que marques faltas en tus exámenes, aparecerá la distribución de los pecados capitales.
            </p>
          ) : (
            <Bar data={capitalBarChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              indexAxis: 'y',
            }} />
          )}
        </div>

        {/* Faltas por Mandamiento/Categoría (Bar Chart) */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
            Faltas por Mandamiento / Categoría
          </h3>
          {Object.keys(accumulatedStats.faltasPorCategoria).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-white/40 italic py-6 text-center">
              Realiza tu examen de conciencia para ver tus faltas distribuidas por cada mandamiento o área de la vida.
            </p>
          ) : (
            <Bar data={categoryBarChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              indexAxis: 'y',
            }} />
          )}
        </div>

        {/* Top 5 Recurring Questions (from history for now) */}
        <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 md:col-span-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
            Pecados Recurrentes (Top 5 en Confesiones)
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

        {/* Heatmap Semanal (CSS Grid Real) */}
                <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 md:col-span-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
                    Frecuencia Semanal de Faltas (Heatmap)
                  </h3>
                  {weeklyHeatmapData.cells.every(c => c.count === 0) ? (
                    <p className="text-xs text-slate-500 dark:text-white/40 italic py-6 text-center">
                      Realiza exámenes de conciencia para ver tu mapa de calor semanal.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-13 gap-1 min-w-max">
                        {/* Header: empty + days */}
                        <div className="text-xs font-semibold text-slate-500 dark:text-white/40 text-center py-1 px-2"></div>
                        {weeklyHeatmapData.days.map(day => (
                          <div key={day} className="text-xs font-semibold text-slate-500 dark:text-white/40 text-center py-1 px-2">
                            {day}
                          </div>
                        ))}
                        {/* Weeks rows */}
                        {weeklyHeatmapData.weeks.map((week, weekIdx) => (
                          <React.Fragment key={week}>
                            <div className="text-[9px] text-slate-500 dark:text-white/40 text-right py-1 px-2 pr-4 align-middle">
                              {week}
                            </div>
                            {weeklyHeatmapData.days.map((day, dayIdx) => {
                              const cell = weeklyHeatmapData.cells.find(c => c.week === week && c.day === dayIdx);
                              const count = cell?.count || 0;
                              const intensity = count > 0 ? Math.min(count / 5, 1) : 0;
                              const bgColor = intensity > 0
                                ? `rgba(201, 162, 39, ${0.15 + intensity * 0.7})`
                                : 'rgba(255,255,255,0.03)';
                              const borderColor = intensity > 0 ? 'rgba(201, 162, 39, 0.3)' : 'rgba(255,255,255,0.05)';
                              return (
                                <div
                                  key={dayIdx}
                                  className="aspect-square rounded-sm border transition-colors"
                                  style={{ backgroundColor: bgColor, borderColor }}
                                  title={`${day} semana ${week}: ${count} faltas`}
                                />
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Legend */}
                  <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-white/40">
                    <span>Menos</span>
                    <div className="flex gap-1">
                      {[0, 0.25, 0.5, 0.75, 1].map((int, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-sm border"
                          style={{ backgroundColor: `rgba(201, 162, 39, ${0.15 + int * 0.7})`, borderColor: int > 0 ? 'rgba(201, 162, 39, 0.3)' : 'rgba(255,255,255,0.05)' }}
                        />
                      ))}
                    </div>
                    <span>Más</span>
                  </div>
                </div>

                {/* Tendencia Diaria */}
                <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 md:col-span-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] border-b border-slate-100 dark:border-white/5 pb-2">
                    Tendencia Diaria de Faltas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/40 italic py-1 text-center">
                    Total de faltas registradas cada día durante las últimas semanas.
                  </p>
                  <div className="h-48">
                    <Line data={dailyTrendChartData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        x: { ticks: { color: '#A1A1AA' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#A1A1AA' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
                      },
                      elements: {
                        line: { tension: 0.3, borderColor: '#C9A227', borderWidth: 2, fill: true, backgroundColor: 'rgba(201, 162, 39, 0.2)' },
                        point: { radius: 3, backgroundColor: '#C9A227', borderColor: '#fff', borderWidth: 1 }
                      }
                    }} />
                  </div>
                </div>

              </div>
            </div>
  );
};