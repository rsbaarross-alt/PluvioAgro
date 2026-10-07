import React from 'react';
import { NavTab } from './Navbar';
import {
  CloudRain,
  Building2,
  MapPin,
  CalendarRange,
  History,
  FileSpreadsheet,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'farms', label: 'Fazendas', icon: Building2 },
    { id: 'points', label: 'Talhões e Pontos', icon: MapPin },
    { id: 'harvests', label: 'Safras', icon: CalendarRange },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Sidebar Container - Desktop/Notebook ONLY (hidden lg:flex) */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-white dark:bg-[#121820] border-r border-slate-200/90 dark:border-slate-800 transition-all duration-200 ease-in-out shrink-0 select-none print:hidden ${
          isCollapsed ? 'lg:w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header with Brand */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200/90 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-[#143D2B] flex items-center justify-center text-white shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden whitespace-nowrap">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Pluvio<span className="text-[#143D2B] dark:text-emerald-400">Agro</span>
                </span>
                <span className="text-[10px] uppercase font-medium text-slate-400 dark:text-slate-400 block -mt-0.5 tracking-wider">
                  Gestão Agrícola
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors lg:hidden"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List - Independent vertical scroll if needed */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentTab === id;

            return (
              <React.Fragment key={id}>
                {id === 'settings' && (
                  <div className="pt-2 my-2 border-t border-slate-200 dark:border-slate-800" />
                )}
                <button
                  onClick={() => handleItemClick(id)}
                  title={isCollapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? 'bg-[#143D2B] text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-[#1a2330]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{label}</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Footer / Collapse Toggle (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between p-2.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isCollapsed && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium px-2">
              Recolher Menu
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className={`p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
