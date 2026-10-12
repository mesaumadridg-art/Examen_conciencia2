import React, { useState } from 'react';
import { PRAYERS } from '../data/prayersData';
import { 
  BookOpen, 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle, 
  Cross, 
  Volume2, 
  Type, 
  AlertCircle 
} from 'lucide-react';

export const PrayersAndGuidanceView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'prayers' | 'guidance'>('prayers');
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>('espiritu-santo');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // AI Guidance state
  const [topic, setTopic] = useState<string>('Ira y Paciencia en la Familia');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [guidanceResponse, setGuidanceResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPrayer = PRAYERS.find((p) => p.id === selectedPrayerId) || PRAYERS[0];

  const handleRequestGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/spiritual-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          sinsSummary: topic,
          userQuestion: userQuestion || 'Dame un consejo espiritual y práctico para combatir este defecto y cultivar la virtud contraria.',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al comunicarse con la guía espiritual');
      }

      setGuidanceResponse(data.guidance);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al obtener la orientación espiritual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-100 dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C9A227]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
                Acompañamiento e Introspección
              </span>
            </div>
            <h2 className="text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0] mt-1">
              Devocionario y Consejero Espiritual
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/50 mt-0.5">
              Oraciones tradicionales para la confesión y orientación con inteligencia espiritual católica.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-black/60 p-1 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('prayers')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'prayers'
                  ? 'bg-[#C9A227] text-black font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-white/60 hover:text-white'
              }`}
            >
              Oraciones
            </button>
            <button
              onClick={() => setActiveSubTab('guidance')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeSubTab === 'guidance'
                  ? 'bg-[#C9A227] text-black font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Orientación IA</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'prayers' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Prayer Selector */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227] px-1">
              Oraciones del Sacramental
            </h3>

            <div className="space-y-1.5">
              {PRAYERS.map((p) => {
                const isSelected = p.id === selectedPrayerId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPrayerId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-serif transition-all ${
                      isSelected
                        ? 'bg-[#C9A227] text-black border-[#C9A227] font-semibold shadow-[0_0_10px_rgba(201,162,39,0.25)]'
                        : 'bg-white dark:bg-[#141415] border-slate-200 dark:border-white/5 text-slate-800 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{p.title}</div>
                    {p.author && (
                      <div className={`text-[10px] ${isSelected ? 'text-slate-900 font-sans' : 'text-[#C9A227] font-sans'}`}>
                        {p.author}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Prayer Text Display */}
          <div className="md:col-span-2 bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-lg font-serif italic text-[#C9A227]">
                  {selectedPrayer.title}
                </h3>
                {selectedPrayer.author && (
                  <p className="text-xs font-bold text-slate-700 dark:text-white/70">
                    {selectedPrayer.author}
                  </p>
                )}
                {selectedPrayer.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-white/50 italic font-serif">
                    {selectedPrayer.subtitle}
                  </p>
                )}
              </div>

              {/* Font Size Adjuster */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-lg text-xs border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-[#C9A227] text-black font-semibold' : 'text-slate-500 dark:text-white/40'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-0.5 rounded ${fontSize === 'large' ? 'bg-[#C9A227] text-black font-semibold' : 'text-slate-500 dark:text-white/40'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-0.5 rounded ${fontSize === 'xlarge' ? 'bg-[#C9A227] text-black font-semibold' : 'text-slate-500 dark:text-white/40'}`}
                >
                  A++
                </button>
              </div>
            </div>

            <div
              className={`font-serif italic text-slate-800 dark:text-white/90 whitespace-pre-line leading-relaxed ${
                fontSize === 'normal'
                  ? 'text-sm sm:text-base'
                  : fontSize === 'large'
                  ? 'text-base sm:text-lg'
                  : 'text-lg sm:text-xl'
              }`}
            >
              {selectedPrayer.text}
            </div>
          </div>
        </div>
      ) : (
        /* AI Spiritual Guidance Sub-tab */
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#C9A227]">
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
              <h3 className="text-base font-serif italic text-white">
                Consulta de Orientación Ascética y Virtudes
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-white/60">
              Obtén un consejo espiritual personalizado basado en la tradición de los santos para vencer un pecado o defecto dominante específico.
            </p>

            <form onSubmit={handleRequestGuidance} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
                  Pecado Capital o Área de Lucha:
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="Ira y Impaciencia en la Familia">Ira, Mal Genio e Impaciencia</option>
                  <option value="Soberbia, Orgullo y Resentimiento">Soberbia, Orgullo y Autosuficiencia</option>
                  <option value="Pereza, Acedía y Tibieza en la Oración">Pereza y Tibieza Espiritual</option>
                  <option value="Lujuria, Pensamientos Impuros y Redes">Lujuria y Pureza de Corazón</option>
                  <option value="Avaricia, Gastos y Desprendimiento">Avaricia y Apego Material</option>
                  <option value="Envidia, Celos y Comparación">Envidia y Tristeza por el Bien Ajeno</option>
                  <option value="Gula, Excesos y Sobriedad">Gula y Falta de Templanza</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1">
                  Inquietud o pregunta específica (Opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. ¿Cómo puedo reaccionar con mansedumbre cuando me provocan en el trabajo?"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando reflexión espiritual...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Solicitar Consejo Espiritual</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Response Display */}
          {guidanceResponse && (
            <div className="bg-[#C9A227]/10 border border-[#C9A227]/30 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#C9A227] border-b border-[#C9A227]/20 pb-2">
                <Cross className="w-5 h-5 text-[#C9A227]" />
                <h4 className="font-serif italic text-base text-white">
                  Orientación Espiritual y Meditación
                </h4>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 dark:text-white/90 font-serif leading-relaxed whitespace-pre-line">
                {guidanceResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
