import React, { useState } from 'react';
import { ConfessionRecord, UserSettings } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  BookMarked,
  Check
} from 'lucide-react';
import { DAYS_OF_WEEK } from '../lib/storage';

interface HistoryAndCheckinViewProps {
  history: ConfessionRecord[];
  onUpdateRecord: (record: ConfessionRecord) => void;
  onDeleteRecord: (id: string) => void;
  settings: UserSettings;
  onGoToExamen: () => void;
}

export const HistoryAndCheckinView: React.FC<HistoryAndCheckinViewProps> = ({
  history,
  onUpdateRecord,
  onDeleteRecord,
  settings,
  onGoToExamen,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );

  // Latest record check
  const latestRecord = history.length > 0 ? history[0] : null;

  // Penance toggle
  const handleTogglePenance = (record: ConfessionRecord) => {
    const updated: ConfessionRecord = {
      ...record,
      penanceFulfilled: !record.penanceFulfilled,
      penanceDate: !record.penanceFulfilled ? new Date().toISOString() : undefined,
    };
    onUpdateRecord(updated);
  };

  const selectedRecord = history.find((h) => h.id === selectedRecordId);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Banner / Header */}
      <div className="bg-slate-100 dark:bg-[#141415] border border-slate-200 dark:border-white/10 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
                Seguimiento Espiritual y Sacramental
              </span>
            </div>
            <h2 className="text-2xl font-serif italic text-slate-900 dark:text-[#E0E0E0] mt-1">
              Registro de Confesiones y Penitencia
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/50 mt-0.5">
              Verificación post-examen de la confesión recibida y cumplimiento de la penitencia.
            </p>
          </div>

          <button
            onClick={onGoToExamen}
            className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D4B34A] text-black font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Nuevo Examen</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Check-In Card for Latest Examination or Traditional Days (Jueves & Domingos) */}
      {latestRecord && (
        <div className={`p-5 rounded-2xl border transition-all ${
          !latestRecord.penanceFulfilled
            ? 'bg-[#C9A227]/10 border-[#C9A227]/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30">
                  Seguimiento de tu Última Confesión
                </span>
                <span className="text-xs text-slate-500 dark:text-white/40">
                  {new Date(latestRecord.sessionDate).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>

              <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                ¿Cumpliste la penitencia asignada?
              </h3>

              {latestRecord.penanceAssigned ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 font-serif italic bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-white/5">
                  «{latestRecord.penanceAssigned}»
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-white/40">
                  No registraste un texto específico de penitencia para esta fecha.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
              <button
                onClick={() => handleTogglePenance(latestRecord)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2 ${
                  latestRecord.penanceFulfilled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#C9A227] hover:bg-[#D4B34A] text-black'
                }`}
              >
                {latestRecord.penanceFulfilled ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Penitencia Cumplida</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Marcar como Cumplida</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History List Grid */}
      {history.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <BookMarked className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200">
            Aún no tienes registros de confesión
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Realiza tu primer examen de conciencia y pulsa «¡Me Confesé!» para guardar un registro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left Column: History List */}
          <div className="md:col-span-1 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Historial de Fechas ({history.length})
            </h3>

            <div className="space-y-2">
              {history.map((record) => {
                const isSelected = record.id === selectedRecordId;
                const formattedDate = new Date(record.sessionDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecordId(record.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#C9A227] text-black border-[#C9A227] font-semibold shadow-[0_0_10px_rgba(201,162,39,0.25)]'
                        : 'bg-white dark:bg-[#141415] border-slate-200 dark:border-white/5 text-slate-800 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono">{formattedDate}</span>
                      <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        record.penanceFulfilled
                          ? isSelected ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSelected ? 'bg-black/20 text-black' : 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30'
                      }`}>
                        {record.penanceFulfilled ? 'Penitencia ✓' : 'Pendiente'}
                      </span>
                    </div>

                    <div className="text-xs mt-1 opacity-90 truncate">
                      {record.sinsList.length} faltas revisadas
                      {record.priestOrPlace ? ` • ${record.priestOrPlace}` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Record Detail */}
          <div className="md:col-span-2">
            {selectedRecord ? (
              <div className="bg-white dark:bg-[#141415] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
                      Registro de Confesión
                    </span>
                    <h3 className="text-xl font-serif italic text-slate-900 dark:text-white mt-1">
                      {new Date(selectedRecord.sessionDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    {selectedRecord.priestOrPlace && (
                      <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">
                        Lugar / Sacerdote: {selectedRecord.priestOrPlace}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar este registro del historial?')) {
                        onDeleteRecord(selectedRecord.id);
                        setSelectedRecordId(null);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Penance Card */}
                <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-white/80">
                      Penitencia Asignada:
                    </span>
                    <button
                      onClick={() => handleTogglePenance(selectedRecord)}
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                        selectedRecord.penanceFulfilled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/30'
                      }`}
                    >
                      {selectedRecord.penanceFulfilled ? 'Cumplida ✓' : 'Marcar como Cumplida'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-white/80 font-serif italic">
                    {selectedRecord.penanceAssigned || 'Sin indicación escrita.'}
                  </p>
                </div>

                {/* Sins List Archived */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                    Pecados Presentados ({selectedRecord.sinsList.length})
                  </h4>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {selectedRecord.sinsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-xs flex justify-between items-start gap-2"
                      >
                        <div className="flex-1">
                          <span className="font-semibold text-[#C9A227] block text-[10px] uppercase">
                            {item.categoryTitle}
                          </span>
                          <p className="font-serif text-slate-800 dark:text-white/90 leading-snug mt-0.5">
                            {item.questionText}
                          </p>
                          {item.note && (
                            <span className="text-[10px] text-slate-500 dark:text-white/40 font-mono italic block mt-0.5">
                              Nota: {item.note}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                          item.status === 'grave'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-500 text-xs">
                Selecciona una fecha de la izquierda para ver los detalles.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
