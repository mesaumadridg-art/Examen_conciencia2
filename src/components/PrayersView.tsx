import React, { useState, useMemo } from 'react';
import { PRAYERS, PrayerItem } from '../data/prayersData';
import { 
  BookOpen, 
  Flame, 
  Search, 
  Copy, 
  Check, 
  ScrollText, 
  ShieldCheck, 
  HeartHandshake,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  FileText
} from 'lucide-react';

type PrayerCategoryFilter = 'todas' | 'espiritu' | 'examen' | 'confesion' | 'gracias';

export const PrayersView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PrayerCategoryFilter>('espiritu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPrayer, setModalPrayer] = useState<PrayerItem | null>(null);

  // Filtered prayers based on category and search query
  const filteredPrayers = useMemo(() => {
    return PRAYERS.filter((p) => {
      // Category match
      let matchesCategory = true;
      if (activeCategory === 'espiritu') {
        matchesCategory = !!p.isHolySpirit;
      } else if (activeCategory === 'examen') {
        matchesCategory = p.moment === 'antes-examen';
      } else if (activeCategory === 'confesion') {
        matchesCategory = p.moment === 'antes-confesion';
      } else if (activeCategory === 'gracias') {
        matchesCategory = p.moment === 'despues-confesion';
      }

      // Search match
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.author && p.author.toLowerCase().includes(q)) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  const handleCopyPrayer = (prayer: PrayerItem) => {
    const content = `${prayer.title}\n${prayer.author ? prayer.author + '\n' : ''}\n${prayer.text}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceBadge = (sourceType?: PrayerItem['sourceType']) => {
    switch (sourceType) {
      case 'patristica':
        return { label: 'Patrística', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'magisterio':
        return { label: 'Magisterio', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'doctores':
        return { label: 'Doctor de la Iglesia', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'liturgica':
        return { label: 'Litúrgica', className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Tradicional', className: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' };
    }
  };

  // Modal content render
  const ModalContent = () => {
    if (!modalPrayer) return null;
    const p = modalPrayer;
    const badge = getSourceBadge(p.sourceType);
    const fontSizeClass = fontSize === 'normal' ? 'text-sm sm:text-base' : fontSize === 'large' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#141415] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full border ${badge.className}`}>
                  {badge.label}
                </span>
                {p.isHolySpirit && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Flame className="w-3 h-3" />
                    <span>Invocación al Espíritu Santo</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-serif italic text-slate-900 dark:text-[#C9A227]">
                {p.title}
              </h3>
              {p.author && (
                <p className="text-xs font-bold text-slate-700 dark:text-white/80 mt-1">
                  {p.author}
                </p>
              )}
              {p.subtitle && (
                <p className="text-xs text-slate-500 dark:text-white/50 italic font-serif mt-1">
                  {p.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={() => { setIsModalOpen(false); setModalPrayer(null); }}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Font Size Controls */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="text-xs font-semibold text-slate-600 dark:text-white/60">Tamaño:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-black/40 p-1 rounded-lg text-xs border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2.5 py-1 rounded ${fontSize === 'normal' ? 'bg-[#C9A227] text-black font-semibold' : 'text-slate-500 dark:text-white/40'}`}
                  title="Tamaño normal"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2.5 py-1 rounded ${fontSize === 'large' ? 'bg-[#C9A227] text-black font-semibold' : 'text-slate-500 dark:text-white/40'}`}
                  title="Tamaño grande"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2.5 py-1 rounded ${fontSize === 'xlarge' ? 'bg-[#C9A227] text-black font-semibold' : 'text-slate-500 dark:text-white/40'}`}
                  title="Tamaño extra grande"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-bold">+</span>
                </button>
              </div>
              <button
                onClick={() => handleCopyPrayer(p)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-colors"
                title="Copiar texto de la oración"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Prayer Full Text */}
            <div className={`font-serif italic text-slate-800 dark:text-white/90 whitespace-pre-line leading-relaxed ${fontSize === 'normal' ? 'text-sm sm:text-base' : fontSize === 'large' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
              {p.text}
            </div>

            {/* Optional Latin Text */}
            {p.latinText && (
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A227] block">
                  Texto en Latín
                </span>
                <p className="text-xs text-slate-600 dark:text-white/60 font-serif italic">
                  {p.latinText}
                </p>
              </div>
            )}

            {/* Optional Doctrinal Notes */}
            {p.notes && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-white/60 leading-relaxed font-sans">
                <strong className="text-slate-800 dark:text-white/80">Nota histórica y pastoral: </strong>
                {p.notes}
              </div>
            )}
          </div>

          {/* Modal Footer - Close button */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={() => { setIsModalOpen(false); setModalPrayer(null); }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-100 dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C9A227]" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
            Tesoro Litúrgico y Devocional
          </span>
        </div>
        <h2 className="text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0] mt-1">
          Devocionario Católico
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-white/50 mt-0.5 max-w-3xl leading-relaxed">
          Oraciones patrísticas, litúrgicas y del Magisterio de la Iglesia para implorar el auxilio del Espíritu Santo, iluminar la conciencia y realizar una confesión santa.
        </p>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveCategory('espiritu')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
            activeCategory === 'espiritu'
              ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.3)] font-bold'
              : 'bg-white dark:bg-[#141415] text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/5 hover:border-[#C9A227]/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
          <span>Auxilio del Espíritu Santo</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
            {PRAYERS.filter((p) => p.isHolySpirit).length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('todas')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap border ${
            activeCategory === 'todas'
              ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.3)] font-bold'
              : 'bg-white dark:bg-[#141415] text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/5 hover:border-[#C9A227]/40'
          }`}
        >
          <span>Todas ({PRAYERS.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('examen')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
            activeCategory === 'examen'
              ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.3)] font-bold'
              : 'bg-white dark:bg-[#141415] text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/5 hover:border-[#C9A227]/40'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>Antes del Examen</span>
        </button>

        <button
          onClick={() => setActiveCategory('confesion')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
            activeCategory === 'confesion'
              ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.3)] font-bold'
              : 'bg-white dark:bg-[#141415] text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/5 hover:border-[#C9A227]/40'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Actos de Contrición</span>
        </button>

        <button
          onClick={() => setActiveCategory('gracias')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
            activeCategory === 'gracias'
              ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.3)] font-bold'
              : 'bg-white dark:bg-[#141415] text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/5 hover:border-[#C9A227]/40'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Acción de Gracias</span>
        </button>
      </div>

      {/* Prayer List Full Width */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por santo, título o palabra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#141415] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#C9A227] transition-all"
          />
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
          {filteredPrayers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-white/40 italic bg-white dark:bg-[#141415] rounded-xl border border-dashed border-slate-300 dark:border-white/10">
              No se encontraron oraciones con ese criterio de búsqueda.
            </div>
          ) : (
            filteredPrayers.map((p) => {
              const badge = getSourceBadge(p.sourceType);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setModalPrayer(p);
                    setIsModalOpen(true);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                    'bg-white dark:bg-[#141415] border-slate-200 dark:border-white/5 text-slate-800 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.label}
                    </span>
                    {p.isHolySpirit && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 dark:text-amber-400">
                        <Flame className="w-3 h-3" />
                        <span>Espíritu Santo</span>
                      </span>
                    )}
                  </div>

                  <div className="font-serif font-bold text-sm leading-snug">
                    {p.title}
                  </div>

                  {p.author && (
                    <div className="text-[11px] font-sans mt-0.5 text-[#C9A227]">
                      {p.author}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {ModalContent()}
    </div>
  );
};