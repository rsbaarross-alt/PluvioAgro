import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  CloudRain,
  Building2,
  MapPin,
  CalendarRange,
  History,
  FileSpreadsheet,
  LayoutDashboard,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  Droplets,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  BarChart2,
  Compass,
  User,
  GraduationCap,
} from 'lucide-react';

interface Props {
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigateToLogin }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#143D2B] selection:text-white transition-colors duration-150 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO INSTITUCIONAL                                               */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#121820]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo PluvioAgro */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-md bg-[#143D2B] group-hover:bg-[#0F2D1F] flex items-center justify-center text-white shrink-0 shadow-xs transition-colors">
              <CloudRain className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Pluvio<span className="text-[#143D2B] dark:text-emerald-400">Agro</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block -mt-0.5 tracking-wider">
                Gestão Agrícola
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-[#143D2B] dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('sobre')}
              className="hover:text-[#143D2B] dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection('recursos')}
              className="hover:text-[#143D2B] dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection('visao')}
              className="hover:text-[#143D2B] dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Visão de Precisão
            </button>
          </nav>

          {/* Desktop Right Actions: Dark Mode Toggle & Login CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              className="w-9 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] flex items-center justify-center transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onNavigateToLogin}
              className="flex items-center gap-2 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>Acessar o Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 flex items-center justify-center"
              aria-label="Alternar tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Abrir menu de navegação"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121820] px-4 pt-3 pb-5 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-left py-1.5 hover:text-[#143D2B] dark:hover:text-emerald-400"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('sobre')}
                className="text-left py-1.5 hover:text-[#143D2B] dark:hover:text-emerald-400"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('recursos')}
                className="text-left py-1.5 hover:text-[#143D2B] dark:hover:text-emerald-400"
              >
                Recursos
              </button>
              <button
                onClick={() => scrollToSection('visao')}
                className="text-left py-1.5 hover:text-[#143D2B] dark:hover:text-emerald-400"
              >
                Visão de Precisão
              </button>
            </nav>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onNavigateToLogin}
                className="w-full flex items-center justify-center gap-2 bg-[#143D2B] hover:bg-[#0F2D1F] text-white py-2.5 rounded-md text-xs font-semibold shadow-xs"
              >
                <span>Acessar o Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. PRIMEIRA SEÇÃO — HERO                                                 */}
      {/* ========================================================================= */}
      <section
        id="hero"
        className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200 dark:border-slate-800/80"
      >
        {/* Subtle agricultural background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#143D2B]/10 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Agricultural Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <CloudRain className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PluvioAgro • Agricultura de Precisão & Pluviometria</span>
              </div>

              {/* Suggested Main Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Gestão de Pluviometria de Precisão para o Agronegócio
              </h1>

              {/* Suggested Body Text */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Transforme dados de chuva em informação para uma gestão agrícola mais precisa. Acompanhe precipitações por fazenda e talhão, analise históricos e tenha uma visão centralizada das condições pluviométricas da sua operação.
              </p>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onNavigateToLogin}
                  className="flex items-center justify-center gap-2 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-6 py-3.5 rounded-md text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Acessar o Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('recursos')}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1a2330] px-5 py-3.5 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>Conhecer Recursos</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
                    100%
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Foco no Agro Brasileiro
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#143D2B] dark:text-emerald-400 block">
                    Talhões & Pontos
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Monitoramento Específico
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
                    Exportação PDF
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Relatórios Consolidados
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: High Quality Realistic Agricultural Photo with Live System Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-900">
                {/* Authentic Agricultural Field Photography under rain */}
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85"
                  alt="Pluviometria e lavoura sob chuva no agronegócio"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center filter brightness-95 contrast-105"
                />

                {/* Dark gradient overlay for typography readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Top Badge: Indicador de Campo */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-xs">
                  <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pluviômetros em Operação</span>
                </div>

                {/* Bottom Card Mockup: Real Agricultural Data Showcase */}
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-lg bg-white/95 dark:bg-[#121820]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-lg text-slate-900 dark:text-slate-100">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Monitoramento em Tempo Real
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Safra Atual</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Fazenda São Paulo
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-[#143D2B] dark:text-emerald-400">
                        18 Talhões (2.138 ha)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Fazenda Moitará
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-[#143D2B] dark:text-emerald-400">
                        9 Talhões (1.177 ha)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SEÇÃO — SOBRE (SOBRE O PLUVIOAGRO & SOBRE O FUNDADOR)                  */}
      {/* ========================================================================= */}
      <section
        id="sobre"
        className="py-16 sm:py-24 bg-white dark:bg-[#121820] border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          
          {/* ======================================================================= */}
          {/* CONTEÚDO 1 — SOBRE O PLUVIOAGRO                                         */}
          {/* ======================================================================= */}
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CloudRain className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sobre o PluvioAgro</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Tecnologia e Precisão Pluviométrica a Serviço da Lavoura
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              O <strong className="text-slate-900 dark:text-white font-semibold">PluvioAgro</strong> é uma plataforma desenvolvida para centralizar e organizar as informações pluviométricas das propriedades agrícolas. O sistema permite registrar, acompanhar e analisar a distribuição das chuvas por fazenda e talhão, transformando dados coletados no campo em informações claras para apoiar o acompanhamento e a gestão da operação agrícola.
            </p>

            {/* 4 Pilares Institucionais: Agricultura, Tecnologia, Precisão e Gestão */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block mb-1">
                  Agricultura
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Desenvolvido para a realidade prática do campo brasileiro.
                </span>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block mb-1">
                  Tecnologia
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Plataforma moderna, segura e com acesso imediato.
                </span>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block mb-1">
                  Precisão
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Monitoramento minucioso por talhão e ponto de medição.
                </span>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block mb-1">
                  Gestão
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Dados transformados em inteligência para tomada de decisão.
                </span>
              </div>
            </div>
          </div>

          {/* Divisor Sutil entre as duas áreas */}
          <div className="w-full max-w-5xl mx-auto h-px bg-slate-200 dark:bg-slate-800" />

          {/* ======================================================================= */}
          {/* CONTEÚDO 2 — SOBRE O FUNDADOR (IDEALIZADO POR RODRIGO BARROS)          */}
          {/* ======================================================================= */}
          <div className="max-w-5xl mx-auto bg-slate-50 dark:bg-[#0e141c] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Lado Esquerdo: Conteúdo Humano, Elegante e Institucional */}
              <div className="lg:col-span-7 space-y-4 text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-100/70 dark:bg-emerald-950/70 text-[#143D2B] dark:text-emerald-300 text-xs font-semibold">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sobre o Fundador</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Idealizado por Rodrigo Barros
                </h3>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  Rodrigo Barros é formado em Ciências Contábeis, Processos Gerenciais e Gestão Financeira e atualmente cursa o 7º semestre de Engenharia Agronômica pela Pitágoras Unopar. Com uma trajetória que conecta gestão, finanças, tecnologia e agronegócio, encontrou na rotina do campo a oportunidade de transformar uma necessidade prática em uma solução digital.
                </p>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  Dessa visão nasceu o <strong className="text-slate-900 dark:text-white font-semibold">PluvioAgro</strong>, idealizado para tornar o acompanhamento das chuvas nas propriedades agrícolas mais organizado, acessível e eficiente, aproximando informação e gestão da realidade de quem está no campo.
                </p>

                {/* Badges de Conexão Multidisciplinar */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5 text-[#143D2B] dark:text-emerald-400" />
                    Engenharia Agronômica (7º Semestre)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                    Ciências Contábeis & Finanças
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                    Processos Gerenciais
                  </span>
                </div>
              </div>

              {/* Lado Direito: Espaço Reservado Neutro e Profissional para Foto Oficial */}
              <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
                <div className="w-full max-w-xs aspect-[4/5] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121820] shadow-md p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                  {/* Padrão decorativo sutil de fundo */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#143D2B]/5 via-transparent to-transparent pointer-events-none" />

                  {/* Top Label */}
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    Perfil Profissional
                  </span>

                  {/* Espaço Visual Neutro com Monograma Institucional */}
                  <div className="my-auto space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#143D2B] to-[#0F2D1F] text-white flex items-center justify-center font-bold text-2xl shadow-md mx-auto border-4 border-emerald-50 dark:border-slate-800">
                      RB
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        Rodrigo Barros
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Fundador & Idealizador PluvioAgro
                      </p>
                    </div>
                  </div>

                  {/* Indicador de Espaço Reservado Neutro */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 w-full">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
                      Espaço reservado para fotografia oficial
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================================= */}
          {/* FRASE DE ENCERRAMENTO DISCRETA                                          */}
          {/* ======================================================================= */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm font-medium italic text-slate-500 dark:text-slate-400 tracking-wide">
              “Gestão, tecnologia e agronomia conectadas à realidade do campo.”
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SEÇÃO — PRINCIPAIS RECURSOS                                            */}
      {/* ========================================================================= */}
      <section
        id="recursos"
        className="py-14 sm:py-20 bg-slate-50 dark:bg-[#0b0f17] border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block">
              Funcionalidades Ativas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recursos Construídos para o Campo
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Conheça as ferramentas e telas que já operam no PluvioAgro
            </p>
          </div>

          {/* Grid dos 6 Recursos Existentes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Gestão por Fazenda */}
            <div className="bg-white dark:bg-[#121820] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#143D2B] text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Gestão por Fazenda
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Organização das informações pluviométricas por propriedade rural, permitindo gerenciar fazendas individualmente com seus respectivos totais.
              </p>
            </div>

            {/* 2. Controle por Talhão / Ponto */}
            <div className="bg-white dark:bg-[#121820] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#143D2B] text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Controle por Talhão/Ponto
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Acompanhamento detalhado dos pontos de medição em cada talhão, com códigos específicos (como SP01, M01) e registro de hectares.
              </p>
            </div>

            {/* 3. Registro de Precipitação */}
            <div className="bg-white dark:bg-[#121820] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#143D2B] text-white flex items-center justify-center">
                <CloudRain className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Registro de Precipitação
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Lançamentos de chuva ágeis e práticos com data, horário, fazenda, talhão vinculado, volume em milímetros (mm) e observações de campo.
              </p>
            </div>

            {/* 4. Dashboard Pluviométrico */}
            <div className="bg-white dark:bg-[#121820] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#143D2B] text-white flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Dashboard Pluviométrico
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualização rápida dos principais indicadores: chuva de hoje, acumulado do mês, total da safra ativa e quadro resumido por propriedade.
              </p>
            </div>

            {/* 5. Gráficos e Histórico */}
            <div className="bg-white dark:bg-[#121820] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#143D2B] text-white flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Gráficos e Histórico
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Análise da distribuição das chuvas ao longo do tempo por 15 dias, 30 dias e meses, com alternância instantânea entre gráficos de Barras e Linhas.
              </p>
            </div>

            {/* 6. Relatórios */}
            <div className="bg-white dark:bg-[#121820] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-[#143D2B] text-white flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Relatórios Consolidados
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Consulta analítica dos registros por período e agrupamentos, com geração e download direto de relatórios formatados em PDF e CSV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SEÇÃO — VISÃO DE PRECISÃO                                              */}
      {/* ========================================================================= */}
      <section
        id="visao"
        className="py-14 sm:py-20 bg-white dark:bg-[#121820] border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Photography representation */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80"
                  alt="Acompanhamento técnico da lavoura e índices de chuva"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Precisão Agrícola</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Transformando medições manuais em dados estratégicos para cada talhão da propriedade.
                  </p>
                </div>
              </div>
            </div>

            {/* Explanation & Technical Value */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-5 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#143D2B] dark:text-emerald-400 block">
                Inteligência de Campo
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                Visão de Precisão: Da Gota d'Água à Estratégia de Safra
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Acompanhar a distribuição das chuvas ajuda a transformar simples registros de campo em informações organizadas para o acompanhamento e planejamento da operação agrícola.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#143D2B] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Distribuição Espacial Heterogênea
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Em grandes propriedades, talhões a poucos quilômetros de distância podem registrar volumes pluviométricos completamente diferentes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#143D2B] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Janelas Operacionais Otimizadas
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Saber exatamente o volume acumulado em cada área auxilia no planejamento seguro de pulverizações, plantio e colheita.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#143D2B] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Memória e Comparativo de Ciclos
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Compare o comportamento de chuvas entre safras anteriores e entenda padrões climáticos que afetam a produtividade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CHAMADA FINAL                                                         */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-100 dark:bg-[#0e141c] border-b border-slate-200 dark:border-slate-800 transition-colors relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#143D2B] text-white shadow-md mx-auto">
            <CloudRain className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            Sua gestão pluviométrica começa com informação de qualidade.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralize os dados de chuva das suas fazendas e talhões com a plataforma pensada para a rotina do campo brasileiro.
          </p>

          <div className="pt-2">
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-2 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-7 py-3.5 rounded-md text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>Acessar o Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RODAPÉ INSTITUCIONAL                                                  */}
      {/* ========================================================================= */}
      <footer className="bg-white dark:bg-[#121820] py-10 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#143D2B] flex items-center justify-center text-white shrink-0">
                <CloudRain className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Pluvio<span className="text-[#143D2B] dark:text-emerald-400">Agro</span>
                </span>
                <span className="text-[10px] uppercase font-medium text-slate-400 block -mt-0.5">
                  Gestão Pluviométrica de Precisão
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <button
                onClick={() => scrollToSection('hero')}
                className="hover:text-[#143D2B] dark:hover:text-white transition-colors"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('sobre')}
                className="hover:text-[#143D2B] dark:hover:text-white transition-colors"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('recursos')}
                className="hover:text-[#143D2B] dark:hover:text-white transition-colors"
              >
                Recursos
              </button>
              <button
                onClick={() => scrollToSection('visao')}
                className="hover:text-[#143D2B] dark:hover:text-white transition-colors"
              >
                Visão de Precisão
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-[#143D2B] dark:text-emerald-400 font-bold hover:underline"
              >
                Acessar o Sistema
              </button>
            </div>

            {/* Copyright */}
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} PluvioAgro. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
