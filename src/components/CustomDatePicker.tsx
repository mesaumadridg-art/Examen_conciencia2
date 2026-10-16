import React, { useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  X, 
  CalendarDays
} from 'lucide-react';

interface CustomDatePickerProps {
  value?: string; // YYYY-MM-DD or ISO string
  onChange: (dateYMD: string) => void;
  label?: string;
  helperText?: string;
  maxDate?: string; // YYYY-MM-DD
  minDate?: string; // YYYY-MM-DD
  quickPresets?: Array<{ label: string; daysAgo: number }>;
  allowClear?: boolean;
}

// Convert YYYY-MM-DD or ISO string to standard DD/MM/AAAA display
export function formatRegionalDate(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  if (!year || !month || !day) return dateStr;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Parse YYYY-MM-DD string safely into Date object in local time
function parseYMD(ymd?: string): Date | null {
  if (!ymd) return null;
  const clean = ymd.split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
}

// Format local Date into YYYY-MM-DD
export function formatYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format Spanish readable date (e.g. "Viernes, 9 de oct. de 2026")
function formatSpanishFull(dateStr?: string): string {
  const d = parseYMD(dateStr);
  if (!d) return 'Toca para elegir fecha en el calendario nativo';
  return d.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  helperText,
  maxDate = formatYMD(new Date()), // default max is today
  minDate = '2015-01-01',
  quickPresets,
  allowClear = false,
}) => {
  const cleanYMDValue = useMemo(() => {
    return value ? value.split('T')[0] : '';
  }, [value]);

  const formattedDisplay = formatRegionalDate(value);
  const friendlyDisplay = formatSpanishFull(value);

  const handleSelectPreset = (daysAgo: number) => {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    onChange(formatYMD(target));
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-white/80">
          {label}
        </label>
      )}

      {/* Main Bar with fully native interactive date picker */}
      <div className="relative flex items-center gap-2">
        {/* Visual presentation container that also acts as trigger for native date picker */}
        <div className="relative flex-1 group">
          {/* Visible custom styling card */}
          <div className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 group-hover:border-[#C9A227] dark:group-hover:border-[#C9A227] transition-all shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#C9A227]/15 text-[#C9A227] group-hover:bg-[#C9A227] group-hover:text-black transition-colors shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    {formattedDisplay || 'DD / MM / AAAA'}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    Día/Mes/Año
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-white/50 truncate capitalize">
                  {friendlyDisplay}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A227] shrink-0 pl-2">
                          <span className="text-[11px] hidden xs:inline">Cambiar</span>
                          <CalendarDays className="w-4 h-4 text-[#C9A227]" />
                        </div>
                      </div>

          {/* REAL NATIVE INPUT: Stretched over the entire card with opacity-0 so any click/tap on the card opens the native Android/iOS date wheel/dialog directly! */}
          <input
            type="date"
            value={cleanYMDValue}
            max={maxDate}
            min={minDate}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Toca para seleccionar fecha"
          />
        </div>

        {/* Clear Button if value is set */}
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-500 transition-colors shrink-0 flex items-center justify-center cursor-pointer relative z-20"
            title="Borrar fecha"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-white/50">
          {helperText}
        </p>
      )}

      {/* Quick shortcuts presets */}
      {quickPresets && quickPresets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {quickPresets.map((preset) => {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - preset.daysAgo);
            const targetYMD = formatYMD(targetDate);
            const isSelected = cleanYMDValue === targetYMD;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset.daysAgo)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A227] text-black font-bold border-[#C9A227] shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-[#C9A227]/20 hover:border-[#C9A227]/30'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
