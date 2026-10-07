import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Farm, Harvest, MeasurementPoint, RainRecord, User } from './types';
import { storage } from './services/storage';
import { Navbar, NavTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { FarmsManager } from './components/FarmsManager';
import { PointsManager } from './components/PointsManager';
import { HarvestsManager } from './components/HarvestsManager';
import { HistoryView } from './components/HistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { LandingPage } from './components/LandingPage';
import { RainModal } from './components/RainModal';
import { AuthModal } from './components/AuthModal';
import { Check, AlertCircle, Info, CloudRain } from 'lucide-react';
import { CompanyProfile } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storage.isAuthenticated());
  const [authPage, setAuthPage] = useState<'landing' | 'login'>('landing');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [records, setRecords] = useState<RainRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [company, setCompany] = useState<CompanyProfile>(() => storage.getCompany());

  // Ref for scrolling the main content independently
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pluvioagro_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('pluvioagro_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation contexts
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [historyFarmFilter, setHistoryFarmFilter] = useState<string>('all');
  const [pointsFarmFilter, setPointsFarmFilter] = useState<string>('all');

  // Modals
  const [isRainModalOpen, setIsRainModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RainRecord | null>(null);
  const [modalDefaultFarmId, setModalDefaultFarmId] = useState<string | undefined>(undefined);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load initial data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [loadedFarms, loadedPoints, loadedHarvests, loadedRecords] = await Promise.all([
        storage.getFarms(),
        storage.getPoints(),
        storage.getHarvests(),
        storage.getRecords(),
      ]);
      setFarms(loadedFarms);
      setPoints(loadedPoints);
      setHarvests(loadedHarvests);
      setRecords(loadedRecords);
      setCurrentUser(storage.getCurrentUser());
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast('Erro ao carregar dados do banco local.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const activeHarvest = harvests.find(h => h.isActive);

  /* RECORD ACTIONS */
  const handleSaveRainRecord = async (recordData: Partial<RainRecord> & { farmId: string; date: string; amountMm: number }) => {
    const isNew = !recordData.id;
    const saved = await storage.saveRecord(recordData);
    setRecords(prev => {
      const index = prev.findIndex(r => r.id === saved.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = saved;
        return updated;
      }
      return [saved, ...prev];
    });

    showToast(isNew ? `Chuva de ${saved.amountMm} mm registrada!` : 'Registro de chuva atualizado!');
  };

  const handleDeleteRainRecord = async (recordId: string) => {
    await storage.deleteRecord(recordId);
    setRecords(prev => prev.filter(r => r.id !== recordId));
    showToast('Registro de chuva excluído.');
  };

  const handleOpenNewRainModal = (farmId?: string) => {
    setEditingRecord(null);
    setModalDefaultFarmId(farmId);
    setIsRainModalOpen(true);
  };

  const handleEditRecord = (record: RainRecord) => {
    setEditingRecord(record);
    setIsRainModalOpen(true);
  };

  /* FARM ACTIONS */
  const handleSaveFarm = async (farmData: Partial<Farm> & { name: string }) => {
    const isNew = !farmData.id;
    const saved = await storage.saveFarm(farmData);
    setFarms(prev => {
      const idx = prev.findIndex(f => f.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });

    showToast(isNew ? `Fazenda "${saved.name}" cadastrada!` : 'Dados da fazenda atualizados!');
  };

  const handleDeleteFarm = async (farmId: string) => {
    await storage.deleteFarm(farmId);
    setFarms(prev => prev.filter(f => f.id !== farmId));
    setPoints(prev => prev.filter(p => p.farmId !== farmId));
    setRecords(prev => prev.filter(r => r.farmId !== farmId));
    if (selectedFarmId === farmId) setSelectedFarmId('all');
    showToast('Fazenda e registros vinculados excluídos.');
  };

  /* POINT ACTIONS */
  const handleSavePoint = async (pointData: Partial<MeasurementPoint> & { name: string; farmId: string }) => {
    const isNew = !pointData.id;
    const saved = await storage.savePoint(pointData);
    setPoints(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });

    showToast(isNew ? `Ponto "${saved.name}" cadastrado!` : 'Ponto de medição atualizado!');
  };

  const handleDeletePoint = async (pointId: string) => {
    await storage.deletePoint(pointId);
    setPoints(prev => prev.filter(p => p.id !== pointId));
    setRecords(prev => prev.filter(r => r.pointId !== pointId));
    showToast('Ponto de medição removido.');
  };

  /* HARVEST ACTIONS */
  const handleSaveHarvest = async (harvestData: Partial<Harvest> & { name: string; startDate: string; endDate: string }) => {
    const saved = await storage.saveHarvest(harvestData);
    setHarvests(prev => {
      let updated = prev.map(h => {
        if (saved.isActive && h.id !== saved.id) return { ...h, isActive: false };
        if (h.id === saved.id) return saved;
        return h;
      });
      if (!prev.some(h => h.id === saved.id)) {
        if (saved.isActive) {
          updated = updated.map(h => ({ ...h, isActive: false }));
        }
        updated.push(saved);
      }
      return updated;
    });

    showToast(`Safra "${saved.name}" configurada!`);
  };

  const handleSetActiveHarvest = async (harvestId: string) => {
    const updated = await storage.setActiveHarvest(harvestId);
    setHarvests(updated);
    showToast('Safra ativa atualizada para o painel principal.');
  };

  const handleDeleteHarvest = async (harvestId: string) => {
    await storage.deleteHarvest(harvestId);
    setHarvests(prev => prev.filter(h => h.id !== harvestId));
    showToast('Safra removida.');
  };

  /* TAB NAVIGATION HELPERS */
  const handleNavigateToHistory = (farmId?: string) => {
    if (farmId) setHistoryFarmFilter(farmId);
    handleTabChange('history');
  };

  const handleNavigateToPoints = (farmId?: string) => {
    if (farmId) setPointsFarmFilter(farmId);
    handleTabChange('points');
  };

  const handleLogout = () => {
    storage.logout();
    setIsAuthenticated(false);
    setAuthPage('landing');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // If not authenticated, the public entry flow is LandingPage -> LoginView
  if (!isAuthenticated) {
    return (
      <>
        {toast && (
          <div className="fixed top-4 right-4 z-50 transition-all transform ease-out duration-200">
            <div
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md shadow-md border text-xs font-medium ${
                toast.type === 'success'
                  ? 'bg-[#143D2B] text-white border-[#0F2D1F]'
                  : toast.type === 'error'
                  ? 'bg-red-800 text-white border-red-700'
                  : 'bg-slate-800 text-white border-slate-700'
              }`}
            >
              {toast.type === 'success' && <Check className="w-3.5 h-3.5 text-slate-200" />}
              {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-slate-200" />}
              {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-slate-200" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {authPage === 'landing' ? (
          <LandingPage onNavigateToLogin={() => setAuthPage('login')} />
        ) : (
          <LoginView
            company={company}
            onBackToLanding={() => setAuthPage('landing')}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthenticated(true);
              setCurrentTab('dashboard');
              showToast(`Bem-vindo ao sistema, ${user.name}!`, 'success');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden bg-[#F1F4F8] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-150 print:h-auto print:overflow-visible print:bg-white print:text-slate-900">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 transition-all transform ease-out duration-200 print:hidden">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md shadow-md border text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-[#143D2B] text-white border-[#0F2D1F]'
                : toast.type === 'error'
                ? 'bg-red-800 text-white border-red-700'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-3.5 h-3.5 text-slate-200" />}
            {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-slate-200" />}
            {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-slate-200" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Corporate Left Sidebar - Permanently fixed at 100% viewport height */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Scroll View - ONLY this right pane scrolls vertically */}
      <div
        ref={mainContentRef}
        className="flex-1 flex flex-col min-w-0 h-screen h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#F1F4F8] dark:bg-[#0b0f17] print:h-auto print:overflow-visible print:block"
      >
        {/* Sticky Top Header / Topbar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleTabChange}
          activeHarvest={activeHarvest}
          currentUser={currentUser}
          onOpenRainModal={() => handleOpenNewRainModal(selectedFarmId !== 'all' ? selectedFarmId : undefined)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area - Occupies 100% remaining width */}
        <main className="flex-1 w-full px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-28 sm:pb-32 lg:pb-12 print:p-0 print:m-0 print:w-full print:block">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <CloudRain className="w-8 h-8 text-[#143D2B] animate-pulse" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Carregando dados...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  farms={farms}
                  points={points}
                  harvests={harvests}
                  records={records}
                  activeHarvest={activeHarvest}
                  selectedFarmId={selectedFarmId}
                  onSelectFarm={setSelectedFarmId}
                  onOpenNewRainModal={handleOpenNewRainModal}
                  onNavigateToHistory={handleNavigateToHistory}
                  onNavigateToFarms={() => handleTabChange('farms')}
                />
              )}

              {currentTab === 'farms' && (
                <FarmsManager
                  farms={farms}
                  points={points}
                  records={records}
                  activeHarvest={activeHarvest}
                  onSaveFarm={handleSaveFarm}
                  onDeleteFarm={handleDeleteFarm}
                  onOpenNewRainModal={handleOpenNewRainModal}
                  onNavigateToPoints={handleNavigateToPoints}
                />
              )}

              {currentTab === 'points' && (
                <PointsManager
                  farms={farms}
                  points={points}
                  records={records}
                  selectedFarmIdFilter={pointsFarmFilter}
                  onSavePoint={handleSavePoint}
                  onDeletePoint={handleDeletePoint}
                  onOpenNewRainModal={handleOpenNewRainModal}
                />
              )}

              {currentTab === 'harvests' && (
                <HarvestsManager
                  harvests={harvests}
                  records={records}
                  onSaveHarvest={handleSaveHarvest}
                  onSetActiveHarvest={handleSetActiveHarvest}
                  onDeleteHarvest={handleDeleteHarvest}
                />
              )}

              {currentTab === 'history' && (
                <HistoryView
                  farms={farms}
                  points={points}
                  harvests={harvests}
                  records={records}
                  initialFarmId={historyFarmFilter}
                  onEditRecord={handleEditRecord}
                  onDeleteRecord={handleDeleteRainRecord}
                  onOpenNewRainModal={handleOpenNewRainModal}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  farms={farms}
                  points={points}
                  harvests={harvests}
                  records={records}
                  activeHarvest={activeHarvest}
                  company={company}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  onCompanyUpdated={(updated) => {
                    setCompany(updated);
                    showToast('Dados da empresa atualizados com sucesso!', 'success');
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Quick Rain Entry Modal */}
      <RainModal
        isOpen={isRainModalOpen}
        onClose={() => {
          setIsRainModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRainRecord}
        onDelete={handleDeleteRainRecord}
        farms={farms}
        points={points}
        editingRecord={editingRecord}
        defaultFarmId={modalDefaultFarmId}
      />

      {/* Auth / Backup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
        onDataImported={loadAllData}
        onLogout={handleLogout}
      />

      {/* Mobile/PWA Native-Style Bottom Navigation Bar (lg:hidden) */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        onOpenRainModal={() => handleOpenNewRainModal(selectedFarmId !== 'all' ? selectedFarmId : undefined)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
