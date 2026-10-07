import React, { useState } from 'react';
import { User, CompanyProfile } from '../types';
import { storage } from '../services/storage';
import { OFFICIAL_SP_LOGO_SVG } from '../assets/companyLogo';
import { useTheme } from '../context/ThemeContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  X,
  CloudRain,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onLoginSuccess: (user: User) => void;
  company: CompanyProfile;
  onBackToLanding?: () => void;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess, company, onBackToLanding }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals for "Esqueci minha senha" and "Criar conta"
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Criar Conta states
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);
  const [newUserRole, setNewUserRole] = useState<'proprietario' | 'gerente' | 'operador'>('gerente');
  const [createAccountError, setCreateAccountError] = useState<string | null>(null);
  const [createAccountSuccess, setCreateAccountSuccess] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Fallback image handling
  const [imgSrc, setImgSrc] = useState(
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85'
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Por favor, informe seu e-mail corporativo.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Formato de e-mail inválido. Utilize o padrão usuario@empresa.com.br.');
      return;
    }

    setIsSubmitting(true);

    // Look for existing registered user or generate session
    setTimeout(() => {
      const storedUser = storage.getCurrentUser();
      let matchedName = storedUser.name || 'Usuário Agrícola';
      let matchedRole: 'proprietario' | 'gerente' | 'operador' = storedUser.role || 'proprietario';

      if (trimmedEmail.toLowerCase().includes('geren')) {
        matchedRole = 'gerente';
        matchedName = 'Gerente Agronômico';
      } else if (trimmedEmail.toLowerCase().includes('campo') || trimmedEmail.toLowerCase().includes('operad')) {
        matchedRole = 'operador';
        matchedName = 'Operador de Campo';
      } else if (trimmedEmail.toLowerCase().includes('produtor') || trimmedEmail.toLowerCase().includes('admin')) {
        matchedRole = 'proprietario';
        matchedName = 'Produtor Rural';
      }

      const authenticatedUser: User = {
        id: storedUser.id || `user-${Date.now().toString(36)}`,
        name: matchedName,
        email: trimmedEmail.toLowerCase(),
        role: matchedRole,
        createdAt: storedUser.createdAt || new Date().toISOString(),
      };

      storage.setCurrentUser(authenticatedUser);
      storage.setAuthenticated(true);
      setIsSubmitting(false);
      onLoginSuccess(authenticatedUser);
    }, 400);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setIsForgotPasswordOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  const handleOpenCreateAccount = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserConfirmPassword('');
    setShowNewPassword(false);
    setShowNewConfirmPassword(false);
    setNewUserRole('gerente');
    setCreateAccountError(null);
    setCreateAccountSuccess(false);
    setIsCreateAccountOpen(true);
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAccountError(null);

    const name = newUserName.trim();
    const cleanEmail = newUserEmail.trim().toLowerCase();

    // 1. Validar Nome
    if (!name || name.length < 3) {
      setCreateAccountError('Informe seu nome completo (mínimo de 3 caracteres).');
      return;
    }

    // 2. Validar E-mail
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setCreateAccountError('Informe um e-mail válido no formato usuario@empresa.com.br.');
      return;
    }

    // 3. Validar Senha
    if (!newUserPassword) {
      setCreateAccountError('Por favor, informe uma senha de acesso.');
      return;
    }

    if (newUserPassword.length < 6) {
      setCreateAccountError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    // 4. Validar Confirmação de Senha
    if (newUserPassword !== newUserConfirmPassword) {
      setCreateAccountError('As senhas não coincidem. Verifique a confirmação digitada.');
      return;
    }

    setIsCreatingAccount(true);

    try {
      const newUser: User = {
        id: `user-${Date.now().toString(36)}`,
        name,
        email: cleanEmail,
        role: newUserRole,
        createdAt: new Date().toISOString(),
      };

      await storage.saveUser(newUser);
      storage.setCurrentUser(newUser);
      storage.setAuthenticated(true);
      setCreateAccountSuccess(true);

      setTimeout(() => {
        setIsCreatingAccount(false);
        setIsCreateAccountOpen(false);
        onLoginSuccess(newUser);
      }, 1200);
    } catch (err) {
      console.error(err);
      setCreateAccountError('Erro ao cadastrar conta. Tente novamente.');
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* ========================================================================= */}
      {/* LADO ESQUERDO — EXPERIÊNCIA VISUAL AGRÍCOLA (50% no Desktop)              */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-between overflow-hidden select-none shrink-0 min-h-[340px] sm:min-h-[440px] lg:min-h-screen lg:self-stretch">
        {/* Real photographic agricultural image with proportional cover framing */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src={imgSrc}
            alt="Lavoura e Gestão Pluviométrica Agrícola"
            referrerPolicy="no-referrer"
            onError={() =>
              setImgSrc(
                'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=2000&q=85'
              )
            }
            className="w-full h-full object-cover object-[center_38%] sm:object-[center_35%] lg:object-[center_40%] filter brightness-[0.92] contrast-[1.05]"
          />

          {/* Discreet gradient overlay for legibility and visual elegance */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/30 lg:bg-gradient-to-r lg:from-slate-950/80 lg:via-slate-950/45 lg:to-transparent" />
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12 flex flex-col justify-between flex-1 h-full text-white">
          {/* Top Brand Tag */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#143D2B] border border-emerald-500/30 flex items-center justify-center text-white shadow-md">
              <CloudRain className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block leading-tight text-white drop-shadow-xs">
                PluvioAgro
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-300 block">
                Monitoramento Pluviométrico
              </span>
            </div>
          </div>

          {/* Bottom Tagline & Value Proposition */}
          <div className="space-y-3 max-w-lg mt-auto pt-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tecnologia & Gestão Pluviométrica no Campo</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug drop-shadow-sm">
              Gestão Pluviométrica de Precisão para o Agronegócio
            </h2>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed drop-shadow-xs hidden sm:block">
              Monitore a distribuição de chuvas por talhão, avalie índices pluviométricos históricos e tome decisões agronômicas orientadas por dados confiáveis na sua propriedade.
            </p>

            {/* Quick Benefits Pills */}
            <div className="pt-2 hidden lg:flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-slate-200 border border-white/10">
                <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
                Registros Diários por Ponto
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-slate-200 border border-white/10">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Ciclos e Safras Consolidadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LADO DIREITO — FORMULÁRIO DE LOGIN LIMPO E PROFISSIONAL (50% no Desktop)  */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white dark:bg-[#121820] p-6 sm:p-10 lg:p-14 overflow-y-auto min-h-screen">
        {/* Top Bar with Theme Toggle and Back Button */}
        <div className="w-full flex items-center justify-between pb-4 sm:pb-0">
          {onBackToLanding ? (
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#143D2B] dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </button>
          ) : (
            <div className="sm:hidden flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Acesso Corporativo
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] transition-colors shadow-2xs cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

        {/* Center Container for Login Form */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6 py-4">
          {/* Company Branding & Original Logo */}
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center overflow-hidden bg-white shadow-2xs">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name || 'Logotipo da Empresa'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: OFFICIAL_SP_LOGO_SVG }}
                />
              )}
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block">
                {company.name || 'Agropecuária São Paulo'}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Entrar no Sistema
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Insira suas credenciais institucionais para acessar o painel
              </p>
            </div>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com.br"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#143D2B] dark:focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#143D2B] dark:focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded w-4 h-4 accent-[#143D2B] text-[#143D2B] focus:ring-[#143D2B] dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                />
                <span>Lembrar de mim</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs font-semibold text-[#143D2B] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Não possui credenciais ativas?{' '}
              <button
                type="button"
                onClick={handleOpenCreateAccount}
                className="font-bold text-[#143D2B] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center sm:text-left text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>PluvioAgro • Sistema Corporativo</span>
          <span>Armazenamento Local Seguro</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ESQUECI MINHA SENHA                                                */}
      {/* ========================================================================= */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121820] w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recuperação de Senha
              </h3>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instruções de redefinição enviadas para o e-mail informado!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Informe o e-mail cadastrado na empresa para receber as instruções de recuperação.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#143D2B] hover:bg-[#0F2D1F] text-white shadow-2xs cursor-pointer"
                  >
                    Enviar Instruções
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR CONTA                                                        */}
      {/* ========================================================================= */}
      {isCreateAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121820] w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Criar Conta de Acesso
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Informe seus dados para cadastrar seu acesso ao sistema
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAccountOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {createAccountError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{createAccountError}</span>
              </div>
            )}

            {/* Success State */}
            {createAccountSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-md flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Conta criada com sucesso!</span>
                  <span className="opacity-90">Acessando o sistema com suas novas credenciais...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5">
                {/* Nome Completo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#143D2B]"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail Corporativo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="carlos@empresa.com.br"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#143D2B]"
                  />
                </div>

                {/* Função / Cargo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Função no Sistema <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500"
                  >
                    <option value="operador" className="dark:bg-slate-800 dark:text-white">Operador de Campo (Lançamento e Coleta de Chuvas)</option>
                    <option value="gerente" className="dark:bg-slate-800 dark:text-white">Gerente Agronômico (Gestão de Fazendas, Talhões e Relatórios)</option>
                    <option value="proprietario" className="dark:bg-slate-800 dark:text-white">Produtor / Proprietário (Acesso Administrativo Completo)</option>
                  </select>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Senha de Acesso <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full text-xs pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#143D2B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title={showNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewConfirmPassword ? 'text' : 'password'}
                      required
                      value={newUserConfirmPassword}
                      onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                      placeholder="Digite a mesma senha novamente"
                      className="w-full text-xs pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#143D2B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title={showNewConfirmPassword ? 'Ocultar confirmação' : 'Exibir confirmação'}
                    >
                      {showNewConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateAccountOpen(false)}
                    className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingAccount}
                    className="px-4 py-2 rounded-md text-xs font-bold bg-[#143D2B] hover:bg-[#0F2D1F] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreatingAccount ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Cadastrando...</span>
                      </>
                    ) : (
                      <span>Criar Conta</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
