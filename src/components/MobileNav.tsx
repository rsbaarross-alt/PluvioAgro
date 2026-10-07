import React, { useState } from 'react';
import { NavTab } from './Navbar';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  LayoutDashboard,
  CloudRain,
  Building2,
  History,
  MoreHorizontal,
  FileSpreadsheet,
  MapPin,
  CalendarRange,
  Settings,
  User as UserIcon,
  Download,
  LogOut,
  Sun,
  Moon,
  X,
  ChevronRight,
  Share,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenRainModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: User;
  onLogout: () => void;
}

export const MobileNav: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenRainModal,
  onOpenAuthModal,
  currentUser,
  onLogout,
}) => {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setShowMoreSheet(false);
  };

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (isInstallable) {
      await install();
      setShowMoreSheet(false);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General tip for Chromium/desktop or browsers without beforeinstallprompt
      alert('Para instalar o PluvioAgro, abra o menu do seu navegador (três pontinhos) e toque em "Instalar aplicativo" ou "Adicionar à tela inicial".');
    }
  };

  // Check if current tab is one of the secondary items in "Mais"
  const isSecondaryActive = ['reports', 'points', 'harvests', 'settings'].includes(currentTab);

  return (
    <>
      {/* ========================================================= */}
      {/* iOS INSTALLATION GUIDE DIALOG                             */}
      {/* ========================================================= */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 lg:hidden">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#143D2B] text-white flex items-center justify-center">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instalar PluvioAgro</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Instruções para iPhone / iPad</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-[#143D2B] text-white font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    Toque no botão Compartilhar <Share className="w-3.5 h-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Localizado na barra de ferramentas inferior do Safari.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-[#143D2B] text-white font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Selecione "Adicionar à Tela de Início"</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Role o menu para baixo até encontrar a opção com ícone quadrado (+).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-[#143D2B] text-white font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Confirme em "Adicionar"</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">O PluvioAgro abrirá como app em tela cheia sem barras de navegador.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#143D2B] hover:bg-[#0F2D1F] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* "MAIS" NATIVE-LIKE BOTTOM ACTION SHEET                    */}
      {/* ========================================================= */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150">
          {/* Backdrop click to dismiss */}
          <div
            className="flex-1"
            onClick={() => setShowMoreSheet(false)}
            aria-hidden="true"
          />

          {/* Action Sheet Container */}
          <div className="w-full bg-white dark:bg-[#121820] rounded-t-2xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 pb-safe space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-2" />

            {/* Header: User Profile Badge & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#143D2B] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-slate-900 dark:text-white text-sm truncate">
                    {currentUser.name}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email || 'Conta Agrícola Ativa'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowMoreSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PWA Install Banner (When not already installed in standalone mode) */}
            {!isInstalled && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#143D2B] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-[#143D2B] dark:text-emerald-300 block truncate">
                      Instalar PluvioAgro
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block truncate">
                      Acesso rápido na tela inicial sem navegador
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 rounded-lg bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-[11px] font-bold shadow-xs shrink-0 cursor-pointer transition-colors"
                >
                  Instalar
                </button>
              </div>
            )}

            {isInstalled && (
              <div className="px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Aplicativo PWA instalado e operando em modo nativo</span>
              </div>
            )}

            {/* Secondary Modules Grid */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Módulos e Recursos
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Relatórios */}
                <button
                  type="button"
                  onClick={() => handleTabClick('reports')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    currentTab === 'reports'
                      ? 'bg-[#143D2B] text-white border-[#143D2B] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <FileSpreadsheet className={`w-4 h-4 shrink-0 ${currentTab === 'reports' ? 'text-white' : 'text-[#143D2B] dark:text-emerald-400'}`} />
                  <span className="truncate">Relatórios</span>
                </button>

                {/* Talhões / Pontos */}
                <button
                  type="button"
                  onClick={() => handleTabClick('points')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    currentTab === 'points'
                      ? 'bg-[#143D2B] text-white border-[#143D2B] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 ${currentTab === 'points' ? 'text-white' : 'text-[#143D2B] dark:text-emerald-400'}`} />
                  <span className="truncate">Talhões e Pontos</span>
                </button>

                {/* Safras */}
                <button
                  type="button"
                  onClick={() => handleTabClick('harvests')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    currentTab === 'harvests'
                      ? 'bg-[#143D2B] text-white border-[#143D2B] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <CalendarRange className={`w-4 h-4 shrink-0 ${currentTab === 'harvests' ? 'text-white' : 'text-[#143D2B] dark:text-emerald-400'}`} />
                  <span className="truncate">Safras / Ciclos</span>
                </button>

                {/* Configurações */}
                <button
                  type="button"
                  onClick={() => handleTabClick('settings')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    currentTab === 'settings'
                      ? 'bg-[#143D2B] text-white border-[#143D2B] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <Settings className={`w-4 h-4 shrink-0 ${currentTab === 'settings' ? 'text-white' : 'text-[#143D2B] dark:text-emerald-400'}`} />
                  <span className="truncate">Configurações</span>
                </button>
              </div>
            </div>

            {/* Account & Settings Options List */}
            <div className="space-y-1.5 pt-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Conta e Sistema
              </span>

              {/* Perfil & Usuários */}
              <button
                type="button"
                onClick={() => {
                  setShowMoreSheet(false);
                  onOpenAuthModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <div className="text-left">
                    <span className="font-semibold block">Perfil e Usuários</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Gerenciar equipe e dados da conta</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Alternar Modo Escuro / Claro */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                  <div className="text-left">
                    <span className="font-semibold block">Tema da Interface</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {isDarkMode ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500">Alternar</span>
              </button>

              {/* Sair do Sistema */}
              <button
                type="button"
                onClick={() => {
                  setShowMoreSheet(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 hover:bg-red-100/70 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="font-bold">Sair do PluvioAgro</span>
                </div>
                <span className="text-[11px] text-red-500">Desconectar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PERSISTENT MOBILE BOTTOM NAVIGATION BAR                   */}
      {/* ========================================================= */}
      {/* Visible only on mobile/tablet viewport (lg:hidden) */}
      <nav
        aria-label="Navegação Principal do Aplicativo"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#121820]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 lg:hidden px-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)] transition-colors duration-150 print:hidden"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {/* 1. Início (Dashboard) */}
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer relative ${
              currentTab === 'dashboard'
                ? 'text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {currentTab === 'dashboard' && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[#143D2B] dark:bg-emerald-400" />
            )}
            <div className={`p-1 rounded-lg ${currentTab === 'dashboard' ? 'bg-[#143D2B]/10 dark:bg-emerald-950/50' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Início</span>
          </button>

          {/* 2. Chuvas (Quick Rain Recording Action) */}
          <button
            type="button"
            onClick={onOpenRainModal}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <CloudRain className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold mt-0.5 text-[#143D2B] dark:text-emerald-400 tracking-tight">
              Chuvas
            </span>
          </button>

          {/* 3. Fazendas */}
          <button
            type="button"
            onClick={() => handleTabClick('farms')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer relative ${
              currentTab === 'farms'
                ? 'text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {currentTab === 'farms' && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[#143D2B] dark:bg-emerald-400" />
            )}
            <div className={`p-1 rounded-lg ${currentTab === 'farms' ? 'bg-[#143D2B]/10 dark:bg-emerald-950/50' : ''}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Fazendas</span>
          </button>

          {/* 4. Histórico */}
          <button
            type="button"
            onClick={() => handleTabClick('history')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer relative ${
              currentTab === 'history'
                ? 'text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {currentTab === 'history' && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[#143D2B] dark:bg-emerald-400" />
            )}
            <div className={`p-1 rounded-lg ${currentTab === 'history' ? 'bg-[#143D2B]/10 dark:bg-emerald-950/50' : ''}`}>
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Histórico</span>
          </button>

          {/* 5. Mais */}
          <button
            type="button"
            onClick={() => setShowMoreSheet(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer relative ${
              isSecondaryActive || showMoreSheet
                ? 'text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {(isSecondaryActive || showMoreSheet) && (
              <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[#143D2B] dark:bg-emerald-400" />
            )}
            <div className={`p-1 rounded-lg ${isSecondaryActive || showMoreSheet ? 'bg-[#143D2B]/10 dark:bg-emerald-950/50' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
