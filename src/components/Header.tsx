import React from 'react';
import { Cross, Moon, Sun, Settings, ScrollText, CheckSquare, BarChart3, BookOpen, ShieldCheck, Home, Sparkles, HelpCircle } from 'lucide-react';
import { UserSettings } from '../types';
import { AppIcon } from './AppIcon';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  unconfessedCount: number;
  openSettingsModal: () => void;
  openWizardModal?: () => void;
  openHelpModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  unconfessedCount,
  openSettingsModal,
  openWizardModal,
  openHelpModal,
}) => {
  const isDark = settings.theme === 'dark';

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
          {/* Brand Logo & Name (Flexible and non-overflowing) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => setActiveTab('inicio')}>
            <AppIcon iconId={settings?.selectedIconId} size="md" className="shrink-0 transition-transform hover:scale-105" />
            <div className="min-w-0 truncate">
              <h1 className="text-base sm:text-lg md:text-xl font-serif italic tracking-wide text-slate-900 dark:text-[#C9A227] leading-tight truncate">
                Examen de Conciencia
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 font-sans hidden sm:block truncate">
                Guía para la Purificación Espiritual
              </p>
            </div>
          </div>

          {/* Quick Actions (Theme, Settings & Question Mark) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {openWizardModal && (
              <button
                onClick={openWizardModal}
                className="hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs items-center gap-1.5 shrink-0 transition-all"
                title="Abrir Examen de Conciencia en Ventana Flotante"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Examen Flotante</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#C9A227]" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Botón de Configuración */}
            <button
              onClick={openSettingsModal}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shrink-0"
              title="Configuración de recordatorios y perfil"
              aria-label="Configuración"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Solo el botón de interrogación al par del botón de configuración */}
            <button
              onClick={openHelpModal}
              className="p-1.5 sm:p-2 rounded-xl text-[#C9A227] hover:bg-[#C9A227]/20 bg-[#C9A227]/10 border border-[#C9A227]/30 transition-all flex items-center justify-center shrink-0 active:scale-95"
              title="Guía Doctrinal del Catecismo"
              aria-label="Guía doctrinal"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-start sm:justify-center gap-1.5 mt-2.5 sm:mt-3 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
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

