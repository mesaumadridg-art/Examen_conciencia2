import React, { useState, useMemo } from 'react';
import { UserPersonalization, Gender, CivilStatus, ProfileMode, AgeGroup, ConfessionFrequency } from '../types';
import { ALL_QUESTIONS, filterQuestionsByPersonalization } from '../data/questionsData';
import { CustomDatePicker } from './CustomDatePicker';
import { Sparkles, UserCheck, Heart, Briefcase, Users, GraduationCap, X, CheckCircle2, Sliders, Calendar, ShieldCheck, User } from 'lucide-react';

interface PersonalizationWizardModalProps {
  isOpen: boolean;
  initialData?: UserPersonalization;
  onSave: (data: UserPersonalization) => void;
  onClose: () => void;
}

export const DEFAULT_PERSONALIZATION: UserPersonalization = {
  gender: 'male',
  profileMode: 'adults',
  ageGroup: 'adult',
  civilStatus: 'single',
  confessionFrequency: 'monthly',
  hasChildren: false,
  isWorking: true,
  hasEmployees: false,
  isStudent: false,
  hasPartner: false,
};

export const PersonalizationWizardModal: React.FC<PersonalizationWizardModalProps> = ({
  isOpen,
  initialData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserPersonalization>(
    initialData || DEFAULT_PERSONALIZATION
  );

  // Live filtered question count preview
  const liveFilteredQuestions = useMemo(() => {
    return filterQuestionsByPersonalization(ALL_QUESTIONS, formData);
  }, [formData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-2 sm:p-4 flex min-h-full items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full min-w-0 p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 my-auto text-slate-900 dark:text-white overflow-x-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3 sm:pb-4 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227] shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-[#C9A227] break-words">
                Personalización Espiritual Personalizada
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0] leading-snug break-words">
              Configuración de Estado de Vida y Perfil
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed break-words">
              Responde estas preguntas breves para acoplar el examen de conciencia a tus obligaciones reales, tu edad, tu sexo y tu vocación específica.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 min-w-0">
          
          {/* 1. Sexo / Género */}
          <div className="space-y-2 min-w-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white/90 uppercase tracking-wider">
              <User className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>1. Sexo / Género:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
              {[
                { id: 'male', label: 'Varón', desc: 'Ajusta reflexiones específicas y deberes masculinos.' },
                { id: 'female', label: 'Hembra / Mujer', desc: 'Ajusta reflexiones específicas y deberes femeninos.' },
              ].map((g) => {
                const isSelected = formData.gender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g.id as Gender })}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all min-w-0 w-full ${
                      isSelected
                        ? 'bg-[#C9A227]/15 border-[#C9A227] text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold block truncate">{g.label}</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-white/40 block mt-0.5 break-words leading-tight">{g.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Edad y Etapa de Vida */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 min-w-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white/90 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>2. Edad y Nivel del Examen:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 min-w-0">
              {[
                { 
                  id: 'kids', 
                  ageGroup: 'kids' as AgeGroup,
                  label: 'Niños (<12 años)', 
                  desc: 'Lenguaje cercano sobre obediencia, familia, mentiras y primeros deberes.' 
                },
                { 
                  id: 'youth', 
                  ageGroup: 'youth' as AgeGroup,
                  label: 'Jóvenes (12-18 años)', 
                  desc: 'Afectividad, estudios, relación con padres, redes sociales y amistades.' 
                },
                { 
                  id: 'adults', 
                  ageGroup: 'adult' as AgeGroup,
                  label: 'Adultos (+18 años)', 
                  desc: 'Examen completo y exhaustivo: fe, familia, trabajo, justicia y pureza.' 
                },
              ].map((item) => {
                const isSelected = formData.profileMode === item.id;
                const modeQuestions = filterQuestionsByPersonalization(ALL_QUESTIONS, {
                  ...formData,
                  profileMode: item.id as ProfileMode,
                });
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      profileMode: item.id as ProfileMode,
                      ageGroup: item.ageGroup,
                    })}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-w-0 w-full ${
                      isSelected
                        ? 'bg-[#C9A227]/15 border-[#C9A227] text-slate-900 dark:text-white shadow-[0_0_12px_rgba(201,162,39,0.2)]'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm block break-words">{item.label}</span>
                      <span className="text-[10px] sm:text-[11px] text-[#C9A227] font-semibold block mt-0.5">
                        {modeQuestions.length} preguntas aplicables
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-white/50 mt-1.5 leading-relaxed break-words">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Estado Civil / Vocación */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 min-w-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white/90 uppercase tracking-wider">
              <Heart className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>3. Estado Civil y Vocación:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 min-w-0">
              {[
                { id: 'single', label: 'Soltero/a', desc: 'Castidad, discernimiento y deberes personales.' },
                { id: 'married', label: 'Casado/a (Matrimonio)', desc: 'Fidelidad conyugal y santificación del hogar.' },
                { id: 'divorced', label: 'Divorciado/a o Separado/a', desc: 'Cuidado de hijos y reconciliación interior.' },
                { id: 'widowed', label: 'Viudo/a', desc: 'Oración y aceptación cristiana de la pérdida.' },
                { id: 'religious', label: 'Sacerdote / Consagrado/a', desc: 'Fidelidad a los votos, celibato y ministerio.' },
              ].map((st) => {
                const isSelected = formData.civilStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, civilStatus: st.id as CivilStatus })}
                    className={`p-3 rounded-xl border text-left transition-all min-w-0 w-full ${
                      isSelected
                        ? 'bg-[#C9A227] text-black font-bold border-[#C9A227] shadow-xs'
                        : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold block break-words">{st.label}</span>
                    <span className={`text-[10px] block mt-0.5 break-words ${isSelected ? 'text-black/80' : 'text-slate-500 dark:text-white/40'}`}>
                      {st.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Deberes de Estado y Situación Personal */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 min-w-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white/90 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>4. Deberes de Estado y Situación Laboral/Familiar:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
              {/* Children */}
              <label className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-0">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold block text-slate-800 dark:text-white/90 break-words">
                    ¿Tiene hijos a su cargo?
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-white/40 block break-words mt-0.5">
                    Incluye preguntas sobre su educación cristiana y ejemplo.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hasChildren}
                  onChange={(e) => setFormData({ ...formData, hasChildren: e.target.checked })}
                  className="w-4.5 h-4.5 text-[#C9A227] accent-[#C9A227] rounded shrink-0 ml-1"
                />
              </label>

              {/* Working */}
              <label className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-0">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold block text-slate-800 dark:text-white/90 break-words">
                    ¿Trabaja / Empleado activo?
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-white/40 block break-words mt-0.5">
                    Incluye honestidad laboral, horario y justicia en el trabajo.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isWorking}
                  onChange={(e) => setFormData({ ...formData, isWorking: e.target.checked })}
                  className="w-4.5 h-4.5 text-[#C9A227] accent-[#C9A227] rounded shrink-0 ml-1"
                />
              </label>

              {/* Employees */}
              <label className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-0">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold block text-slate-800 dark:text-white/90 break-words">
                    ¿Tiene empleados o personal a su cargo?
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-white/40 block break-words mt-0.5">
                    Incluye pago justo de salarios y trato con dignidad.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hasEmployees}
                  onChange={(e) => setFormData({ ...formData, hasEmployees: e.target.checked })}
                  className="w-4.5 h-4.5 text-[#C9A227] accent-[#C9A227] rounded shrink-0 ml-1"
                />
              </label>

              {/* Student */}
              <label className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-0">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold block text-slate-800 dark:text-white/90 break-words">
                    ¿Es estudiante actualmente?
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-white/40 block break-words mt-0.5">
                    Incluye honestidad en exámenes, estudio y obediencia a profesores.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isStudent}
                  onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
                  className="w-4.5 h-4.5 text-[#C9A227] accent-[#C9A227] rounded shrink-0 ml-1"
                />
              </label>

              {/* Has Partner / Dating */}
              <label className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-0 sm:col-span-2">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold block text-slate-800 dark:text-white/90 break-words flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#C9A227] inline" />
                    ¿Tiene novio/a o pareja afectiva estable (Noviazgo)?
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-white/40 block break-words mt-0.5">
                    Activa preguntas de castidad, respeto mutuo, apoyo espiritual y metas cristianas en el noviazgo.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!formData.hasPartner}
                  onChange={(e) => setFormData({ ...formData, hasPartner: e.target.checked })}
                  className="w-4.5 h-4.5 text-[#C9A227] accent-[#C9A227] rounded shrink-0 ml-1"
                />
              </label>
            </div>
          </div>

          {/* 5. ¿Cuándo fue tu última confesión? */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 min-w-0">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white/90 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>5. ¿Cuándo fue tu última confesión sacramental?</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-white/50">
              Esta fecha permite a la app calcular el período de acumulación de faltas y avisarte cuando se aproxime tu próximo momento de recibir la reconciliación.
            </p>

            <div className="pt-1">
              <CustomDatePicker
                value={formData.lastConfessionDate || ''}
                onChange={(newDate) => setFormData({ ...formData, lastConfessionDate: newDate })}
                quickPresets={[
                  { label: 'Hoy', daysAgo: 0 },
                  { label: 'Hace 1 semana', daysAgo: 7 },
                  { label: 'Hace 2 semanas', daysAgo: 14 },
                  { label: 'Hace 1 mes', daysAgo: 30 },
                  { label: 'Hace 3 meses', daysAgo: 90 },
                ]}
                allowClear
              />
            </div>
          </div>

          {/* Live Preview Summary Bar */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-white min-w-0">
              <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block text-[#C9A227] truncate">
                  Examen Generado: {liveFilteredQuestions.length} Preguntas Relevantes
                </span>
                <span className="text-[11px] opacity-80 block truncate">
                  {formData.gender === 'male' ? 'Varón' : 'Hembra'} • {formData.profileMode === 'adults' ? 'Adulto' : formData.profileMode === 'youth' ? 'Joven' : 'Niño'} • {formData.civilStatus}
                  {formData.hasChildren ? ' • Con Hijos' : ''}
                  {formData.isWorking ? ' • Trabajador' : ''}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Aplicar Examen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

