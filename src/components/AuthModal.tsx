import React, { useState, useEffect } from 'react';
import { User, UserRole, CompanyProfile } from '../types';
import { storage } from '../services/storage';
import { Shield, Download, Upload, Check, X, AlertCircle, Building2, User as UserIcon, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onDataImported: () => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onDataImported,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'profile' | 'backup'>('company');

  // User states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState<UserRole>(currentUser.role);

  // Company states
  const [company, setCompany] = useState<CompanyProfile>(() => storage.getCompany());
  const [companyName, setCompanyName] = useState('');
  const [companyDocument, setCompanyDocument] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | undefined>('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setRole(currentUser.role);

      const comp = storage.getCompany();
      setCompany(comp);
      setCompanyName(comp.name || '');
      setCompanyDocument(comp.document || '');
      setCompanyAddress(comp.address || '');
      setCompanyPhone(comp.phone || '');
      setCompanyEmail(comp.email || '');
      setCompanyLogoUrl(comp.logoUrl || '');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    setError(null);
    try {
      const updated: User = {
        ...currentUser,
        name: name.trim(),
        email: email.trim(),
        role,
      };
      await storage.saveUser(updated);
      onUpdateUser(updated);
      setMessage('Perfil atualizado com sucesso.');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError('Erro ao salvar usuário.');
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('A Razão Social ou Nome da Empresa é obrigatório.');
      return;
    }
    setError(null);
    try {
      const updatedComp = storage.saveCompany({
        name: companyName.trim(),
        document: companyDocument.trim(),
        address: companyAddress.trim(),
        phone: companyPhone.trim(),
        email: companyEmail.trim(),
        logoUrl: companyLogoUrl || undefined,
      });
      setCompany(updatedComp);
      setMessage('Identidade da empresa salva! Os relatórios em PDF utilizarão estes dados.');
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setError('Erro ao salvar dados da empresa.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem (PNG ou JPEG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A logo deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCompanyLogoUrl(result);
      setMessage('Logo carregada. Clique em "Salvar Dados da Empresa" para confirmar.');
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCompanyLogoUrl('');
  };

  const handleExportBackup = async () => {
    try {
      const json = await storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_pluvioagro_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setMessage('Arquivo de backup exportado.');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError('Falha ao exportar backup.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const success = await storage.importBackup(content);
        if (success) {
          setMessage('Dados restaurados com sucesso.');
          onDataImported();
          setTimeout(() => {
            setMessage(null);
            onClose();
          }, 1500);
        } else {
          setError('Arquivo de backup inválido.');
        }
      } catch {
        setError('Erro ao processar arquivo.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3">
      <div className="bg-white dark:bg-[#121820] w-full max-w-lg rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#143D2B] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-200" />
            <h2 className="text-sm font-semibold">Configurações do Sistema</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 pt-2 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'company'
                ? 'border-[#143D2B] text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Dados da Empresa (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#143D2B] text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Perfil do Usuário</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-[#143D2B] text-[#143D2B] dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup e Dados</span>
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {message && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: COMPANY / ISSUER PROFILE (USED IN PDFS) */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Estes dados e o logotipo são utilizados automaticamente no <strong>cabeçalho oficial de todos os relatórios em PDF</strong> emitidos pelo sistema.
                </p>
              </div>

              {/* Logo Upload Box */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Logotipo da Empresa
                </label>
                <div className="flex items-center gap-3 p-2.5 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                  {companyLogoUrl ? (
                    <div className="w-14 h-14 rounded border border-slate-300 dark:border-slate-600 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={companyLogoUrl}
                        alt="Logo da Empresa"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-xs font-medium cursor-pointer transition-colors">
                        <span>{companyLogoUrl ? 'Alterar Logo' : 'Enviar Imagem'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {companyLogoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Remover logotipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Formatos recomendados: PNG ou JPEG com fundo transparente.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Razão Social / Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Agropecuária São Paulo Ltda"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    CNPJ ou CPF
                  </label>
                  <input
                    type="text"
                    value={companyDocument}
                    onChange={(e) => setCompanyDocument(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Endereço / Município - UF
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Ex: Rodovia BR-163, Km 740 - Sorriso, MT"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="contato@empresa.agr.br"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-xs font-medium rounded-md transition-colors"
                >
                  Salvar Dados da Empresa
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: USER PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Pessoal
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Função na Propriedade
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                >
                  <option value="proprietario" className="dark:bg-slate-800 dark:text-white">Produtor / Proprietário</option>
                  <option value="gerente" className="dark:bg-slate-800 dark:text-white">Gerente Agrícola / Agrônomo</option>
                  <option value="operador" className="dark:bg-slate-800 dark:text-white">Operador de Campo</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {onLogout ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-medium rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                  >
                    Sair da Conta (Logout)
                  </button>
                ) : <div />}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-xs font-medium rounded-md transition-colors"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP AND DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                  Backup e Exportação
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  Exporte todos os seus dados e configurações em arquivo JSON para cópia de segurança.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Backup</span>
                  </button>

                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-md transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{importing ? 'Importando...' : 'Restaurar'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      disabled={importing}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                  Dados de Demonstração
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  Registros temporários para testes (Fazenda São Paulo).
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await storage.removeDemoData();
                      onDataImported();
                      setMessage('Dados de demonstração removidos.');
                      setTimeout(() => setMessage(null), 3000);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-md transition-colors flex-1 text-center"
                  >
                    Remover Dados Fictícios
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await storage.ensureDemoDataLoaded();
                      onDataImported();
                      setMessage('Dados de demonstração recarregados.');
                      setTimeout(() => setMessage(null), 3000);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-[#143D2B] dark:text-emerald-400 hover:text-[#0F2D1F] dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-md transition-colors flex-1 text-center"
                  >
                    Recarregar Dados
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
