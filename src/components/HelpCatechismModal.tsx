import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  Cross, 
  HeartHandshake, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Scale, 
  Flame, 
  ShieldCheck, 
  Lightbulb, 
  ExternalLink,
  Info
} from 'lucide-react';

interface HelpCatechismModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: 'que-es-pecado' | 'venial-vs-mortal' | 'gravedad-3-condiciones' | 'sacramento-encuentro';
  isInline?: boolean;
}

type TopicId = 'que-es-pecado' | 'venial-vs-mortal' | 'gravedad-3-condiciones' | 'sacramento-encuentro' | 'preguntas-frecuentes';

interface TopicItem {
  id: TopicId;
  title: string;
  shortTitle: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

const TOPICS: TopicItem[] = [
  {
    id: 'que-es-pecado',
    title: '¿Qué es el Pecado según el Catecismo?',
    shortTitle: 'Qué es el Pecado',
    badge: 'CIC 1849 - 1853',
    icon: ShieldAlert,
    description: 'Definición teológica, ofensa a Dios y ruptura del amor verdadero.',
  },
  {
    id: 'venial-vs-mortal',
    title: 'Pecado Venial y Pecado Mortal',
    shortTitle: 'Venial vs. Mortal',
    badge: 'CIC 1854 - 1863',
    icon: Scale,
    description: 'Diferencias esenciales, efectos en el alma y pérdida o daño de la gracia.',
  },
  {
    id: 'gravedad-3-condiciones',
    title: 'Cómo Determinar la Gravedad (Las 3 Condiciones)',
    shortTitle: 'Evaluar Gravedad',
    badge: 'CIC 1857 - 1860',
    icon: Flame,
    description: 'Materia grave, plena advertencia y deliberado consentimiento.',
  },
  {
    id: 'sacramento-encuentro',
    title: 'La Reconciliación: Encuentro Vivo con Jesús',
    shortTitle: 'Encuentro con Jesús',
    badge: 'CIC 1422, 1440 - 1468',
    icon: HeartHandshake,
    description: 'El confesonario como abrazo de misericordia y los 5 pasos de confesión.',
  },
  {
    id: 'preguntas-frecuentes',
    title: 'Preguntas Frecuentes y Dudas de Conciencia',
    shortTitle: 'Dudas Frecuentes',
    badge: 'Guía Pastoral',
    icon: Lightbulb,
    description: 'Pecados olvidados, vergüenza, sigilo sacramental y comunión.',
  },
];

export const HelpCatechismModal: React.FC<HelpCatechismModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'que-es-pecado',
  isInline = false,
}) => {
  const [activeTopic, setActiveTopic] = useState<TopicId>(initialTopic);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Calculator / Evaluator state for the 3 conditions
  const [evalMateria, setEvalMateria] = useState<boolean | null>(null);
  const [evalAdvertencia, setEvalAdvertencia] = useState<boolean | null>(null);
  const [evalConsentimiento, setEvalConsentimiento] = useState<boolean | null>(null);

  // References to reset scroll position when changing topics
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const outerBackdropRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    if (outerBackdropRef.current) {
      outerBackdropRef.current.scrollTop = 0;
    }
    // Also use requestAnimationFrame in case content height or DOM update is deferred
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (outerBackdropRef.current) {
        outerBackdropRef.current.scrollTop = 0;
      }
    });
  };

  const handleSelectTopic = (topicId: TopicId) => {
    setActiveTopic(topicId);
    scrollToTop();
  };

  useEffect(() => {
    scrollToTop();
  }, [activeTopic]);

  useEffect(() => {
    if (isOpen) {
      if (initialTopic) {
        setActiveTopic(initialTopic);
      }
      scrollToTop();
    }
  }, [isOpen, initialTopic]);

  if (!isOpen && !isInline) return null;

  const content = (
    <div className={`bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-4xl w-full min-w-0 shadow-2xl flex flex-col ${isInline ? 'shadow-none' : 'max-h-[92vh] sm:max-h-[88vh]'} overflow-hidden text-slate-900 dark:text-[#E0E0E0] mx-auto`}>
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-amber-50/30 to-slate-50 dark:from-[#18181B] dark:via-[#1e1c16] dark:to-[#18181B] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A227] px-2 py-0.5 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20">
                  Catecismo de la Iglesia Católica
                </span>
              </div>
              <h2 id="help-modal-title" className="text-base sm:text-lg font-serif italic font-bold text-slate-900 dark:text-[#F3E5AB] leading-snug truncate">
                Ayuda Doctrinal y Guía de Conciencia
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Cerrar ayuda"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector Tabs (Mobile horizontal scroll / Desktop segmented bar) */}
        <div className="px-3 sm:px-5 py-2.5 bg-slate-50 dark:bg-black/30 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#C9A227] text-slate-950 font-bold shadow-[0_2px_10px_rgba(201,162,39,0.3)]'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-[#C9A227]'}`} />
                <span>{topic.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div 
          ref={scrollContainerRef}
          className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed min-w-0"
        >
          
          {/* TOPIC 1: ¿Qué es el Pecado? */}
          {activeTopic === 'que-es-pecado' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#C9A227] pl-4 py-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C9A227] font-bold block">
                  Catecismo de la Iglesia Católica, Numerales 1849 - 1853
                </span>
                <h3 className="text-lg sm:text-xl font-serif italic font-bold text-slate-900 dark:text-white mt-1">
                  1. ¿Qué es el Pecado?
                </h3>
              </div>

              {/* Definición Principal */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-[#1a1915] border border-amber-500/20 text-slate-800 dark:text-amber-100/90 space-y-3 font-serif">
                <p className="text-base sm:text-lg italic text-[#8B6E16] dark:text-[#E8CE7A] leading-relaxed">
                  «El pecado es una falta contra la razón, la verdad, la conciencia recta; es faltar al amor verdadero para con Dios y para con el prójimo, a causa de un apego perverso a ciertos bienes. Hiere la naturaleza del hombre y atenta contra la solidaridad humana. Ha sido definido como "una palabra, un acto o un deseo contrarios a la ley eterna"».
                </p>
                <span className="block text-xs font-sans not-italic text-slate-500 dark:text-white/50 text-right">
                  — San Agustín, Faust. 22, 27; citado en el CIC 1849
                </span>
              </div>

              {/* Puntos Fundamentales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Una Ofensa Directa a Dios (CIC 1850)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70">
                    El pecado se levanta contra el amor infinito que Dios nos tiene y aparta de Él nuestro corazón. Es, como en el primer pecado, una desobediencia, una rebelión contra Dios por el deseo de llegar a ser «como dioses» (Gn 3, 5), pretendiendo conocer y determinar el bien y el mal por nuestra propia cuenta.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Amor a sí mismo hasta el desprecio de Dios</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70">
                    Por esta orgullosa exaltación de sí mismo, el pecado es diametralmente opuesto a la obediencia filial de Jesús, que realizó la salvación (Flp 2, 6-9). Al pecar preferimos un placer fugaz, el egoísmo o una criatura por encima del Creador.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <Flame className="w-4 h-4" />
                    <span>Nace en el Corazón del Hombre (CIC 1853)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70">
                    Jesucristo nos enseñó: <em>«De dentro del corazón de los hombres salen las malas intenciones, las fornicaciones, los robos, los asesinatos, los adulterios... Todas estas maldades salen de dentro y contaminan al hombre»</em> (Mc 7, 21-23). Por eso el examen debe revisar nuestros pensamientos, deseos y actitudes profundas.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Donde abundó el pecado, sobreabundó la gracia</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70">
                    Dios no nos abandona al descubrir nuestra miseria: <em>«Donde abundó el pecado, sobreabundó la gracia»</em> (Rm 5, 20). Reconocer la realidad del pecado no es para caer en la desesperación o el desánimo, sino para abrirnos al abrazo sanador de la infinita Misericordia divina.
                  </p>
                </div>
              </div>

              {/* Botón de navegación rápida al siguiente tema */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSelectTopic('venial-vs-mortal')}
                  className="px-4 py-2.5 rounded-xl bg-[#C9A227]/15 hover:bg-[#C9A227]/25 text-[#C9A227] font-semibold text-xs transition-colors flex items-center gap-2 border border-[#C9A227]/30"
                >
                  <span>Continuar: Pecado Venial vs. Mortal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TOPIC 2: Diferencias entre pecado venial y mortal */}
          {activeTopic === 'venial-vs-mortal' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#C9A227] pl-4 py-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C9A227] font-bold block">
                  Catecismo de la Iglesia Católica, Numerales 1854 - 1864
                </span>
                <h3 className="text-lg sm:text-xl font-serif italic font-bold text-slate-900 dark:text-white mt-1">
                  2. Diferencias entre Pecado Venial y Pecado Mortal
                </h3>
              </div>

              <p className="text-slate-600 dark:text-white/80">
                La Iglesia, siguiendo la enseñanza de San Juan (1 Jn 5, 16-17), distingue claramente la gravedad de los pecados según su repercusión en la vida de la gracia y en la comunión con Dios:
              </p>

              {/* Comparativa Visual de Tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Pecado Venial */}
                <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Falta Leve / Venial (CIC 1862)
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">«Herida del alma»</span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-slate-900 dark:text-amber-100">
                      Debilita la caridad sin destruirla
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                      Se comete un pecado venial cuando no se observa la medida prescrita por la ley moral en materia leve, o cuando se desobedece la ley moral en materia grave pero <strong>sin pleno conocimiento</strong> o <strong>sin entero consentimiento</strong>.
                    </p>

                    <ul className="text-xs space-y-2 text-slate-600 dark:text-white/75 list-disc pl-4">
                      <li><strong>Efecto en la Gracia:</strong> No rompe la alianza con Dios ni arrebata la gracia santificante; deja subsistir la caridad, aunque la entibia.</li>
                      <li><strong>Consecuencia:</strong> Impide el progreso del alma en las virtudes morales y dispone al pecado mortal si se comete habitualmente sin enmienda.</li>
                      <li><strong>Remedio:</strong> Se perdona mediante el arrepentimiento sincero, la oración, obras de caridad y la Santa Eucaristía; no obstante, su confesión sacramental es vivamente recomendada por la Iglesia para sanar y fortalecer el alma.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200/90 font-serif italic">
                    «Mientras vive en la carne, el hombre no puede evitar todos los pecados, al menos los leves. Pero estos pecados que llamamos leves, no los consideres insignificantes... Muchos granos de arena hacen una montaña.» — San Agustín
                  </div>
                </div>

                {/* Pecado Mortal */}
                <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                        Falta Grave / Mortal (CIC 1855)
                      </span>
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-mono">«Muerte espiritual»</span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-slate-900 dark:text-rose-100">
                      Destruye la caridad en el corazón
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                      El pecado mortal destruye la caridad en el corazón del hombre por una infracción grave de la ley de Dios; aparta al hombre de Dios, que es su fin último y su bienaventuranza, prefiriendo un bien inferior.
                    </p>

                    <ul className="text-xs space-y-2 text-slate-600 dark:text-white/75 list-disc pl-4">
                      <li><strong>Efecto en la Gracia:</strong> Causa la pérdida total de la gracia santificante (el alma queda privada del estado de gracia).</li>
                      <li><strong>Consecuencia:</strong> Si no es rescatado por el arrepentimiento y el perdón sacramental, entraña la exclusión del Reino de Dios y la condenación eterna.</li>
                      <li><strong>Remedio indispensable:</strong> Requiere necesariamente la absolución en el <strong>Sacramento de la Reconciliación (Confesión)</strong> antes de poder acercarse a recibir la Sagrada Comunión.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-800 dark:text-rose-200/90 font-serif italic">
                    «El pecado mortal es una posibilidad radical de la libertad humana, como lo es también el amor... Entraña la pérdida de la caridad y la privación de la gracia santificante.» — CIC 1861
                  </div>
                </div>

              </div>

              {/* Tabla Resumen */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Aspecto</th>
                      <th className="p-3 text-amber-700 dark:text-amber-400">Pecado Venial</th>
                      <th className="p-3 text-rose-700 dark:text-rose-400">Pecado Mortal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-600 dark:text-white/75">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-white/90">Caridad y Gracia</td>
                      <td className="p-3">La debilita y entibia, pero permanece la gracia.</td>
                      <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">La destruye y expulsa la gracia santificante.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-white/90">Condiciones</td>
                      <td className="p-3">Materia leve, o falta plena advertencia o consentimiento.</td>
                      <td className="p-3">Las 3 simultáneas: Materia grave + Pleno saber + Pleno querer.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-white/90">¿Impide Comulgar?</td>
                      <td className="p-3">No (pero se debe arrepentir y pedir perdón en el acto penitencial).</td>
                      <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">Sí. Es obligatorio confesarse antes de comulgar.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-white/90">Perdón Ordinario</td>
                      <td className="p-3">Oración, dolor de corazón, penitencia, Misa y Confesión.</td>
                      <td className="p-3">Absolución sacramental en la Santa Confesión.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Botón de navegación al siguiente tema */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSelectTopic('que-es-pecado')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ← Volver a Qué es el Pecado
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTopic('gravedad-3-condiciones')}
                  className="px-4 py-2.5 rounded-xl bg-[#C9A227]/15 hover:bg-[#C9A227]/25 text-[#C9A227] font-semibold text-xs transition-colors flex items-center gap-2 border border-[#C9A227]/30"
                >
                  <span>Continuar: Cómo Determinar la Gravedad</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TOPIC 3: Cómo determinar la gravedad de mis pecados (Las 3 condiciones) */}
          {activeTopic === 'gravedad-3-condiciones' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#C9A227] pl-4 py-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C9A227] font-bold block">
                  Catecismo de la Iglesia Católica, Numeral 1857
                </span>
                <h3 className="text-lg sm:text-xl font-serif italic font-bold text-slate-900 dark:text-white mt-1">
                  3. Cómo Determinar la Gravedad de mis Pecados
                </h3>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                <h4 className="font-serif italic font-bold text-base text-amber-900 dark:text-amber-200">
                  La Regla de Oro del Catecismo (CIC 1857):
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-100/90 mt-1 leading-relaxed">
                  Para que un pecado sea <strong>mortal</strong> se requieren <strong>TRES CONDICIONES AL MISMO TIEMPO</strong>:
                  «Es pecado mortal lo que tiene por objeto una <strong>materia grave</strong> y que, además, es cometido con <strong>pleno conocimiento</strong> y <strong>deliberado consentimiento</strong>».
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-2 font-medium">
                  ⚖️ Si falta cualquiera de estas tres condiciones, el pecado NO es mortal, sino venial.
                </p>
              </div>

              {/* Desglose de las 3 condiciones */}
              <div className="space-y-4">
                
                {/* 1. Materia Grave */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Materia Grave (CIC 1858)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70 pl-8">
                    La materia grave es precisada por los <strong>Diez Mandamientos</strong>, según la respuesta de Jesús al joven rico: <em>«No mates, no cometas adulterio, no robes, no des falso testimonio, no defraudes, honra a tu padre y a tu madre»</em> (Mc 10, 19).
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/60 pl-8">
                    La gravedad de los pecados es mayor o menor: un asesinato es más grave que un robo, y la violencia ejercida contra los padres es más grave que contra un extraño.
                  </p>
                </div>

                {/* 2. Plena Advertencia (Pleno Conocimiento) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Pleno Conocimiento o Plena Advertencia (CIC 1859)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70 pl-8">
                    Supone el conocimiento del carácter pecaminoso del acto, de su oposición a la ley de Dios. Requiere que la persona sea consciente, en el momento de actuar o antes, de que lo que va a hacer está mal a los ojos de Dios.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/60 pl-8">
                    La <em>ignorancia involuntaria</em> puede disminuir o incluso excusar la imputabilidad de una falta grave. Pero nadie puede ignorar los principios morales universales inscritos en la conciencia.
                  </p>
                </div>

                {/* 3. Deliberado Consentimiento */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Deliberado Consentimiento o Plena Libertad (CIC 1859)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70 pl-8">
                    Implica un consentimiento de la voluntad suficientemente deliberado para que sea una <strong>elección personal</strong>. Una mala acción realizada bajo coacción extrema, violencia externa, pánico incontrolable o durante un sueño o confusión mental severa no tiene deliberado consentimiento pleno.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/60 pl-8">
                    Las pasiones desordenadas o el hábito adquirido pueden atenuar el carácter voluntario de la falta, pero no anulan la necesidad de confesarse y poner los medios para combatirlos con la gracia de Dios.
                  </p>
                </div>

              </div>

              {/* Asistente Interactivo: Evaluador Pedagógico de Conciencia */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-amber-50 dark:from-[#17171a] dark:to-[#1a1710] border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#C9A227]" />
                  <h4 className="font-serif italic font-bold text-base text-slate-900 dark:text-[#F3E5AB]">
                    Herramienta Pedagógica: ¿Cómo evaluar una acción personal?
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-white/70">
                  Haz un ejercicio reflexivo respondiendo a estas tres preguntas sobre una falta que te inquieta:
                </p>

                <div className="space-y-3 pt-1">
                  {/* Pregunta 1: Materia */}
                  <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-white block">1. ¿La acción fue en materia grave?</span>
                      <span className="text-[11px] text-slate-500 dark:text-white/50">Infringe de forma directa un mandamiento principal (vida, pureza, justicia, verdad).</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEvalMateria(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          evalMateria === true
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200'
                        }`}
                      >
                        Sí (Grave)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvalMateria(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          evalMateria === false
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200'
                        }`}
                      >
                        No (Leve)
                      </button>
                    </div>
                  </div>

                  {/* Pregunta 2: Advertencia */}
                  <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-white block">2. ¿Tenías pleno conocimiento en ese momento?</span>
                      <span className="text-[11px] text-slate-500 dark:text-white/50">Sabías con claridad que era pecado y ofendía a Dios antes o al realizarlo.</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEvalAdvertencia(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          evalAdvertencia === true
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200'
                        }`}
                      >
                        Sí, lo sabía
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvalAdvertencia(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          evalAdvertencia === false
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200'
                        }`}
                      >
                        Dudaba / No sabía
                      </button>
                    </div>
                  </div>

                  {/* Pregunta 3: Consentimiento */}
                  <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-white block">3. ¿Hubo deliberado consentimiento libre?</span>
                      <span className="text-[11px] text-slate-500 dark:text-white/50">Lo consentiste con tu voluntad y libertad, sin coacción ineludible.</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEvalConsentimiento(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          evalConsentimiento === true
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200'
                        }`}
                      >
                        Sí, consentí
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvalConsentimiento(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          evalConsentimiento === false
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200'
                        }`}
                      >
                        Involuntario / Presionado
                      </button>
                    </div>
                  </div>
                </div>

                {/* Veredicto de la evaluación pedagógica */}
                {evalMateria !== null && evalAdvertencia !== null && evalConsentimiento !== null && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-200 ${
                    evalMateria && evalAdvertencia && evalConsentimiento
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {evalMateria && evalAdvertencia && evalConsentimiento ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          <span>Orientación: Probable Pecado Mortal</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                          <span>Orientación: Pecado Venial (Falta Leve)</span>
                        </>
                      )}
                    </div>
                    {evalMateria && evalAdvertencia && evalConsentimiento ? (
                      <p>
                        Se han cumplido las 3 condiciones exigidas por el Catecismo (CIC 1857). Debes manifestar este pecado con sencillez y contrición al sacerdote en la Confesión sacramental antes de acercarte a recibir la Sagrada Eucaristía.
                      </p>
                    ) : (
                      <p>
                        Al faltar al menos una de las 3 condiciones esenciales (materia grave, pleno conocimiento o consentimiento libre), la falta no reviste carácter mortal, sino venial. Tu alma conserva la gracia santificante; arrepiéntete con amor de corazón e inclúyelo si deseas en tu próxima confesión.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de navegación al siguiente tema */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSelectTopic('venial-vs-mortal')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ← Volver a Venial vs. Mortal
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTopic('sacramento-encuentro')}
                  className="px-4 py-2.5 rounded-xl bg-[#C9A227]/15 hover:bg-[#C9A227]/25 text-[#C9A227] font-semibold text-xs transition-colors flex items-center gap-2 border border-[#C9A227]/30"
                >
                  <span>Continuar: El Sacramento como Encuentro</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TOPIC 4: El Sacramento de la Reconciliación en cuanto a encuentro con Jesús */}
          {activeTopic === 'sacramento-encuentro' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#C9A227] pl-4 py-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C9A227] font-bold block">
                  Catecismo de la Iglesia Católica, Numerales 1422, 1440 - 1468
                </span>
                <h3 className="text-lg sm:text-xl font-serif italic font-bold text-slate-900 dark:text-white mt-1">
                  4. El Sacramento de la Reconciliación: Encuentro Vivo con Jesús
                </h3>
              </div>

              {/* Mensaje Teológico Central */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3 font-serif">
                <p className="text-base sm:text-lg italic text-[#8B6E16] dark:text-[#E8CE7A] leading-relaxed">
                  «Quienes se acercan al sacramento de la penitencia obtienen de la misericordia de Dios el perdón de los pecados cometidos contra Él y, al mismo tiempo, se reconcilian con la Iglesia, a la que ofendieron con sus pecados».
                </p>
                <span className="block text-xs font-sans not-italic text-slate-500 dark:text-white/50 text-right">
                  — Lumen Gentium 11; citado en CIC 1422
                </span>
              </div>

              {/* Por qué es un Encuentro con Jesús */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[#C9A227] font-bold text-sm">
                    <HeartHandshake className="w-4 h-4" />
                    <span>No es un tribunal frío, sino el abrazo del Padre (CIC 1440)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                    Muchas personas temen la confesión creyendo que van a un juicio humano a ser regañadas o avergonzadas. La doctrina de la Iglesia nos revela todo lo contrario: la Confesión es la fiesta de la misericordia, la parábola del Hijo Pródigo hecha presente (Lc 15). El Padre te ve venir de lejos, corre a tu encuentro, te abraza, besa tu rostro y viste tu alma con la túnica blanca de la fiesta celestial.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <Cross className="w-4 h-4" />
                    <span>El Sacerdote actúa «In Persona Christi» (CIC 1465 - 1466)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                    Cuando el sacerdote te escucha, es <strong>Jesús mismo</strong>, Buen Pastor y Médico de las almas, quien te recibe. Jesús no vino para juzgar sino para salvar; busca a la oveja perdida y cura al enfermo. Por la ordenación sacerdotal, el ministro es instrumento vivo del amor redentor de Cristo:
                  </p>
                  <p className="text-xs font-serif italic text-slate-700 dark:text-amber-200/90 pl-3 border-l-2 border-[#C9A227]">
                    «El sacerdote es el signo y el instrumento del amor misericordioso de Dios con el pecador... Debe unirse a la intención y a la caridad de Cristo» (CIC 1465).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Efectos Espirituales y Paz del Alma (CIC 1468)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                    Los frutos de este sacramento son incomparables:
                  </p>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-white/75 list-disc pl-5">
                    <li><strong>Reconciliación con Dios:</strong> Recuperación de la dignidad de hijos de Dios y amistad filial íntima con la Santísima Trinidad.</li>
                    <li><strong>Paz y serenidad de la conciencia:</strong> Liberación del peso de la culpa y profundo consuelo espiritual del corazón.</li>
                    <li><strong>Fuerza espiritual renovada:</strong> Gracia actual específica para no volver a caer en las mismas faltas y perseverar en el bien.</li>
                    <li><strong>Reconciliación con la Iglesia:</strong> Sanación del Cuerpo Místico de Cristo.</li>
                  </ul>
                </div>
              </div>

              {/* Los 5 Pasos para una Buena Confesión */}
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-black/30 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <h4 className="font-serif italic font-bold text-sm text-slate-900 dark:text-[#F3E5AB]">
                    Los 5 Pasos Tradicionales de la Iglesia para una Confesión Fructífera:
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-black font-bold text-[10px] flex items-center justify-center mb-1">1</span>
                    <strong className="text-slate-800 dark:text-white">Examen</strong>
                    <span className="text-[10px] text-slate-500 dark:text-white/50">Recordar con verdad los pecados</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-black font-bold text-[10px] flex items-center justify-center mb-1">2</span>
                    <strong className="text-slate-800 dark:text-white">Dolor</strong>
                    <span className="text-[10px] text-slate-500 dark:text-white/50">Pesar por haber ofendido a Dios</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-black font-bold text-[10px] flex items-center justify-center mb-1">3</span>
                    <strong className="text-slate-800 dark:text-white">Propósito</strong>
                    <span className="text-[10px] text-slate-500 dark:text-white/50">Decisión firme de no pecar más</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-black font-bold text-[10px] flex items-center justify-center mb-1">4</span>
                    <strong className="text-slate-800 dark:text-white">Confesión</strong>
                    <span className="text-[10px] text-slate-500 dark:text-white/50">Decir los pecados al confesor</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-black font-bold text-[10px] flex items-center justify-center mb-1">5</span>
                    <strong className="text-slate-800 dark:text-white">Penitencia</strong>
                    <span className="text-[10px] text-slate-500 dark:text-white/50">Cumplir la oración o acto prescrito</span>
                  </div>
                </div>
              </div>

              {/* Botón de navegación al siguiente tema */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSelectTopic('gravedad-3-condiciones')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ← Volver a Evaluar Gravedad
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTopic('preguntas-frecuentes')}
                  className="px-4 py-2.5 rounded-xl bg-[#C9A227]/15 hover:bg-[#C9A227]/25 text-[#C9A227] font-semibold text-xs transition-colors flex items-center gap-2 border border-[#C9A227]/30"
                >
                  <span>Ver Dudas y Preguntas Frecuentes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TOPIC 5: Dudas y Preguntas Frecuentes Pastorales */}
          {activeTopic === 'preguntas-frecuentes' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#C9A227] pl-4 py-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C9A227] font-bold block">
                  Acompañamiento y Tranquilidad de Conciencia
                </span>
                <h3 className="text-lg sm:text-xl font-serif italic font-bold text-slate-900 dark:text-white mt-1">
                  Dudas Comunes y Preguntas Frecuentes
                </h3>
              </div>

              {/* Buscador de dudas */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en preguntas frecuentes (ej. olvidar pecado, vergüenza, sigilo, comulgar)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:outline-hidden focus:border-[#C9A227]"
                />
              </div>

              {/* Acordeón de FAQs */}
              <div className="space-y-3">
                {[
                  {
                    q: '¿Qué pasa si olvidé confesar un pecado sin querer?',
                    a: 'Si hiciste un examen de conciencia sincero y no ocultaste el pecado deliberadamente, la absolución del sacerdote perdona TODOS tus pecados, incluidos los que involuntariamente olvidaste. Quedas completamente reconciliado y en gracia de Dios. Si más adelante recuerdas que era un pecado mortal, sencillamente lo mencionas en tu próxima confesión con paz y sin angustia (CIC 1456).'
                  },
                  {
                    q: '¿Puede el sacerdote contar a alguien lo que confesé?',
                    a: '¡Bajo ninguna circunstancia! La Iglesia impone el Sigilo Sacramental con carácter absoluto e inviolable. El sacerdote prefiere sufrir la muerte antes que revelar el más mínimo detalle de lo escuchado en confesión (CIC 1467). Puedes abrir tu corazón con absoluta seguridad y reserva.'
                  },
                  {
                    q: 'Siento mucha vergüenza de confesar mis faltas, ¿qué debo hacer?',
                    a: 'La vergüenza es un truco común de la soberbia o del enemigo para mantenernos alejados del perdón. El confesor ha escuchado todas las faltas humanas posibles y no está allí para escandalizarse, sino para maravillarse ante la gracia del arrepentimiento. Además, confesar con humildad lo que cuesta decir sana el alma de raíz y llena el corazón de una paz inmensa.'
                  },
                  {
                    q: '¿Por qué confesarme con un sacerdote en vez de "a solas con Dios"?',
                    a: 'Fue Jesús mismo quien dispuso este camino cuando sopló sobre los Apóstoles y les dijo: «A quienes perdonéis los pecados, les quedan perdonados; a quienes se los retengáis, les quedan retenidos» (Jn 20, 22-23). Además, el pecado hiere no sólo nuestra relación con Dios, sino también con nuestros hermanos y la Iglesia. La mediación sacerdotal nos brinda la certeza audible y sensible: "Yo te absuelvo".'
                  },
                  {
                    q: '¿Puedo comulgar si sólo tengo pecados veniales (leves)?',
                    a: 'Sí. El pecado venial no priva de la gracia santificante ni rompe la comunión con Dios. Puedes recibir la Sagrada Eucaristía, pidiendo perdón con sincero dolor durante el Acto Penitencial al inicio de la Santa Misa («Yo confieso ante Dios todopoderoso...»). De hecho, la Eucaristía misma borra los pecados veniales y fortalece contra el pecado (CIC 1394).'
                  },
                  {
                    q: '¿Qué diferencia hay entre contrición perfecta y atrición?',
                    a: 'La contrición perfecta brota del amor a Dios sobre todas las cosas; perdona los pecados veniales y obtiene también el perdón de los mortales si va unida al firme propósito de recurrir cuanto antes a la confesión sacramental. La atrición (o contrición imperfecta) nace de considerar la fealdad del pecado o el temor a las penas del infierno; es un don de Dios que prepara el camino y basta para recibir la absolución válida en la Confesión (CIC 1452 - 1453).'
                  }
                ]
                  .filter((item) => 
                    !searchQuery || 
                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((faq, idx) => (
                    <details 
                      key={idx} 
                      className="group p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 open:bg-amber-50/50 dark:open:bg-[#191814] open:border-amber-500/30 transition-all"
                    >
                      <summary className="font-bold text-xs text-slate-800 dark:text-white cursor-pointer list-none flex items-center justify-between gap-2">
                        <span>{faq.q}</span>
                        <ChevronRight className="w-4 h-4 text-[#C9A227] transition-transform group-open:rotate-90 shrink-0" />
                      </summary>
                      <p className="text-xs text-slate-600 dark:text-white/75 mt-3 leading-relaxed border-t border-slate-200/60 dark:border-white/5 pt-2">
                        {faq.a}
                      </p>
                    </details>
                  ))}
              </div>

              {/* Botón de volver */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => handleSelectTopic('sacramento-encuentro')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ← Volver a Encuentro con Jesús
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-white/50 shrink-0">
          <div className="flex items-center gap-1.5 font-serif italic text-slate-700 dark:text-amber-200/90 text-[11px] sm:text-xs">
            <Cross className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Fiel a la Doctrina del Catecismo de la Iglesia Católica</span>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15 text-white font-medium text-xs transition-colors text-center"
          >
            {isInline ? 'Volver al Inicio' : 'Entendido / Cerrar Guía'}
          </button>
        </div>

      </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div 
      ref={outerBackdropRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      {content}
    </div>
  );
};
