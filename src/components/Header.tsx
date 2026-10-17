import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Settings,
  ScrollText,
  CheckSquare,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Home,
  HelpCircle,
  Type,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserSettings } from '../types';
import { AppIcon } from './AppIcon';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  unconfessedCount: number;
  openSettingsModal: () => void;
  openHelpModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  unconfessedCount,
  openSettingsModal,
  openHelpModal,
}) => {
  const [isQuickBarOpen, setIsQuickBarOpen] = useState(false);
  const isDark = settings.theme === 'dark';
  const currentFontSize = settings.fontSize || 'normal';

  const toggleTheme = () => {
    onUpdateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'examen', label: 'Examen', icon: CheckSquare },
    { id: 'resumen', label: 'Confesión', icon: ScrollText, badge: unconfessedCount },
    { id: 'historial', label: 'Registro', icon: ShieldCheck },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'oraciones', label: 'Oraciones', icon: BookOpen },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-200 bg-white/95 dark:bg-[#0A0A0B]/95 border-slate-200 dark:border-white/5 text-slate-800 dark:text-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name (Full space for title, non-overflowing) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer" onClick={() => setActiveTab('inicio')}>
            <AppIcon iconId={settings?.selectedIconId} size="md" className="shrink-0 transition-transform hover:scale-105" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-serif italic tracking-wide text-slate-900 dark:text-[#C9A227] leading-tight truncate font-bold">
                Examen de Conciencia
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 font-sans hidden xs:block truncate">
                Guía para la Purificación Espiritual
              </p>
            </div>
          </div>

          {/* Expand/Collapse Toggle Button for Quick Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsQuickBarOpen(!isQuickBarOpen)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isQuickBarOpen
                  ? 'bg-[#C9A227] text-black border-[#C9A227] font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white border-slate-200 dark:border-white/10'
              }`}
              title={isQuickBarOpen ? 'Ocultar ajustes rápidos' : 'Ajustes rápidos de letra, tema, configuración y ayuda'}
            >
              <Settings className="w-4 h-4 text-[#C9A227] group-hover:rotate-45 transition-transform" />
              <span className="text-[11px] hidden xs:inline">Ajustes Rápidos</span>
              {isQuickBarOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Quick Bar Drawer */}
        {isQuickBarOpen && (
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-100/90 dark:bg-black/60 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            {/* Direct Font Size Shortcut Chips */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-[11px] font-bold text-slate-600 dark:text-white/60 flex items-center gap-1 shrink-0">
                <Type className="w-3.5 h-3.5 text-[#C9A227]" />
                Tamaño Letra:
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                {(['small', 'normal', 'large', 'xlarge'] as const).map((size) => {
                  const labels = { small: '14', normal: '16', large: '18', xlarge: '20' };
                  const isSelected = currentFontSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => onUpdateSettings({ fontSize: size })}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A227] text-black shadow-xs'
                          : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={`Tamaño ${size}`}
                    >
                      {labels[size]}px
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:border-[#C9A227] transition-all flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-[#C9A227]" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isDark ? 'Claro' : 'Oscuro'}</span>
              </button>

              <button
                onClick={openSettingsModal}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:border-[#C9A227] transition-all flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                title="Configuración Completa de la App"
              >
                <Settings className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Ajustes Completos</span>
              </button>

              <button
                onClick={openHelpModal}
                className="px-2.5 py-1.5 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                title="Guía Doctrinal del Catecismo"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ayuda</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-start sm:justify-center gap-1.5 mt-2.5 sm:mt-3 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#C9A227] text-black font-semibold shadow-[0_0_12px_rgba(201,162,39,0.3)]'
                    : 'text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="tracking-wide">{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40'
                  }`}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

