import React, { useState, useRef } from 'react';
import { CompanyProfile, User } from '../types';
import { storage } from '../services/storage';
import { OFFICIAL_SP_LOGO_SVG } from '../assets/companyLogo';
import {
  Building2,
  Users,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  Save,
  ImageIcon,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react';

interface Props {
  onCompanyUpdated?: (company: CompanyProfile) => void;
  currentUser: User;
}

type SettingsTab = 'company' | 'users';

const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export const SettingsView: React.FC<Props> = ({ onCompanyUpdated, currentUser }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [company, setCompany] = useState<CompanyProfile>(() => storage.getCompany());
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logoUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Users list for the prepared section
  const [usersList] = useState<User[]>([
    currentUser,
    {
      id: 'user-gerente-demo',
      name: 'Gerente Agronômico',
      email: 'gerencia@fazenda.com.br',
      role: 'gerente',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'user-operador-demo',
      name: 'Operador de Campo (Sede)',
      email: 'campo@fazenda.com.br',
      role: 'operador',
      createdAt: '2026-09-10T10:30:00.000Z',
    },
  ]);

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setCompany(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Formato de imagem inválido. Aceitos: PNG, JPG/JPEG ou WEBP.');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 5MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      setCompany(prev => ({
        ...prev,
        logoUrl: dataUrl,
      }));
      setSaveSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setCompany(prev => ({
      ...prev,
      logoUrl: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSaveSuccess(false);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.name.trim()) {
      setErrorMessage('A Razão Social é obrigatória.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = storage.saveCompany({
        name: company.name.trim(),
        tradeName: company.tradeName?.trim() || undefined,
        document: company.document?.trim() || undefined,
        phone: company.phone?.trim() || undefined,
        email: company.email?.trim() || undefined,
        address: company.address?.trim() || undefined,
        city: company.city?.trim() || undefined,
        state: company.state?.trim() || undefined,
        zipCode: company.zipCode?.trim() || undefined,
        logoUrl: company.logoUrl,
      });

      setCompany(updated);
      setIsSaving(false);
      setSaveSuccess(true);
      if (onCompanyUpdated) {
        onCompanyUpdated(updated);
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Erro ao salvar dados da empresa:', err);
      setIsSaving(false);
      setErrorMessage('Ocorreu um erro ao salvar as alterações.');
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#143D2B] dark:text-emerald-400" />
              <span>Configurações do Sistema</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gerencie a identidade da empresa, logotipo oficial para relatórios e estrutura multiempresa
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                activeTab === 'company'
                  ? 'bg-white dark:bg-[#1a2330] text-[#143D2B] dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1. Empresa</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-[#1a2330] text-[#143D2B] dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Usuários e Permissões</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CADASTRO COMPLETO DA EMPRESA                                       */}
      {/* ========================================================================= */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="space-y-5">
          {/* Notification Messages */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-md flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Dados da empresa e logotipo salvos com sucesso! Os relatórios já estão utilizando as informações atualizadas.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section: Upload do Logotipo */}
          <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
                  <span>Logotipo Oficial da Empresa</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Esta imagem é aplicada diretamente no cabeçalho dos relatórios em PDF, mantendo proporção 100% original.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Preview Box */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0e131a] flex items-center justify-center p-2 overflow-hidden relative group">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Prévia do Logotipo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full p-2 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: OFFICIAL_SP_LOGO_SVG }}
                  />
                )}
              </div>

              {/* Action Controls & Rules */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {logoPreview ? 'Logotipo Personalizado Ativo' : 'Logotipo Padrão da Empresa (Identidade Original)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Formatos aceitos: <strong>PNG, JPG/JPEG e WEBP</strong>. Tamanho máximo: 5MB.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="company-logo-input"
                  />
                  <label
                    htmlFor="company-logo-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] text-white text-xs font-medium rounded-md cursor-pointer transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{logoPreview ? 'Substituir Imagem' : 'Fazer Upload da Logo'}</span>
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 text-xs font-medium rounded-md transition-colors"
                      title="Remover logotipo e voltar ao padrão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover Logo</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-md border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#143D2B] dark:text-emerald-400" />
                    <span>Regra de Fidelidade Visual:</span>
                  </div>
                  <p>
                    O arquivo enviado é armazenado e utilizado como o original, sem filtros, sem reinterpretação gráfica e sem distorção das proporções.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Identificação Jurídica e Comercial */}
          <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
                  <span>Identificação da Empresa</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dados formais utilizados na assinatura e cabeçalho dos documentos emitidos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={company.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Agropecuária São Paulo LTDA"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={company.tradeName || ''}
                  onChange={(e) => handleInputChange('tradeName', e.target.value)}
                  placeholder="Ex: Agropecuária São Paulo"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  value={company.document || ''}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Localização e Endereço */}
          <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
                  <span>Endereço e Localização</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Endereço da sede ou escritório administrativo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço / Logradouro / Rodovia
                </label>
                <input
                  type="text"
                  value={company.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ex: Rodovia BR-163, Km 740, Zona Rural"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={company.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="00000-000"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cidade / Município
                </label>
                <input
                  type="text"
                  value={company.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ex: Sorriso"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado (UF)
                </label>
                <select
                  value={company.state || 'MT'}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                >
                  <option value="">Selecione o estado</option>
                  {BRAZILIAN_STATES.map(({ uf, name }) => (
                    <option key={uf} value={uf} className="dark:bg-slate-800 dark:text-white">
                      {uf} - {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Canais de Contato */}
          <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
                  <span>Canais de Contato</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Informações de contato inseridas no rodapé dos relatórios
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={company.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full text-xs pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md pr-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Oficial
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={company.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@empresa.agr.br"
                    className="w-full text-xs pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md pr-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando Dados...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados da Empresa</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USUÁRIOS E PERMISSÕES (PREPARADO PARA MULTIEMPRESA)                */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* Architecture Banner for Multi-tenant */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#143D2B] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                  Estrutura de Usuários, Acessos e Multiempresa
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Esta arquitetura está preparada para isolar cadastros, fazendas e medições entre múltiplas empresas. Cada usuário terá acesso restrito de acordo com seu perfil atribuído.
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Membros Cadastrados na Empresa
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Usuários com credenciais ativas para a empresa <strong>{company.name || 'Agropecuária'}</strong>
                </p>
              </div>

              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-sm">
                Fase de Preparação
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Nome do Usuário</th>
                    <th className="py-2.5 px-4">E-mail</th>
                    <th className="py-2.5 px-4">Perfil de Acesso</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {user.name}
                        {user.id === currentUser.id && (
                          <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-normal">
                            Você
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            user.role === 'proprietario'
                              ? 'bg-[#143D2B]/10 dark:bg-emerald-950/70 text-[#143D2B] dark:text-emerald-300 border border-[#143D2B]/30 dark:border-emerald-700/50'
                              : user.role === 'gerente'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {user.role === 'proprietario' && 'Proprietário (Admin Geral)'}
                          {user.role === 'gerente' && 'Gerente de Fazenda'}
                          {user.role === 'operador' && 'Operador de Campo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matrix of Roles Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#143D2B] dark:text-emerald-400">
                <Shield className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
                <span>Proprietário</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                Acesso total irrestrito: edição cadastral da empresa, logotipo, exclusão de dados, exportações e controle de safras.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gerente Agronômico</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                Gerenciamento operacional das propriedades, talhões, pontos de chuva e emissão de relatórios consolidados em PDF.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Operador de Campo</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                Lançamento diário de precipitação pluviométrica nos pontos autorizados através de interface simplificada mobile/desktop.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
