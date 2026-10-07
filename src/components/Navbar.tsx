import React from 'react';
import { Harvest, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  CloudRain,
  Plus,
  CalendarRange,
  Sun,
  Moon,
  Menu,
  LogOut,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'farms' | 'points' | 'harvests' | 'history' | 'reports' | 'settings';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeHarvest?: Harvest;
  currentUser: User;
  onOpenRainModal: () => void;
  onOpenAuthModal: () => void;
  onOpenMobileMenu: () => void;
  onLogout?: () => void;
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Painel Geral',
  farms: 'Propriedades Rurais',
  points: 'Talhões e Pontos de Medição',
  harvests: 'Ciclos Agrícolas e Safras',
  history: 'Histórico de Registros',
  reports: 'Relatórios Consolidados',
  settings: 'Configurações',
};

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  activeHarvest,
  currentUser,
  onOpenRainModal,
  onOpenAuthModal,
  onOpenMobileMenu,
  onLogout,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#121820] border-b border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors duration-150 print:hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile compact brand + screen title, Desktop screen title */}
          <div className="flex items-center gap-3">
            {/* Mobile Compact App Header */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-[#143D2B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CloudRain className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Pluvio<span className="text-[#143D2B] dark:text-emerald-400">Agro</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block -mt-0.5">
                  {TAB_TITLES[currentTab]}
                </span>
              </div>
            </div>

            {/* Desktop Module Title */}
            <div className="hidden lg:block">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {TAB_TITLES[currentTab]}
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Active Harvest Indicator */}
            {activeHarvest && (
              <button
                onClick={() => onSelectTab('harvests')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Safra ativa selecionada"
              >
                <CalendarRange className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{activeHarvest.name}</span>
              </button>
            )}

            {/* THEME TOGGLE BUTTON - Always visible on desktop and mobile */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Conta e opções"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-semibold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[110px]">
                  {currentUser.name}
                </span>
              </div>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sair do sistema"
                className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-2xs cursor-pointer"
                title="Sair do sistema (Ir para tela de Login)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={onOpenRainModal}
              className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Registrar Chuva</span>
              <span className="sm:hidden">Chuva</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
