# PluvioAgro 🌧️🌱
> **SaaS & PWA Profissional para Gestão e Monitoramento Pluviométrico no Agronegócio**

O **PluvioAgro** é uma plataforma moderna e completa desenvolvida para produtores rurais, agrônomos, gerentes de fazendas e empresas agrícolas acompanharem, consolidarem e analisarem o índice de chuvas com precisão profissional em suas propriedades e talhões.

---

## 🌟 Principais Recursos

- **Painel Analítico em Tempo Real**:
  - Indicadores automáticos: Chuva de Hoje, Acumulado do Mês, Acumulado da Safra Ativa e Contagem de Dias Chuvosos.
  - Registro em destaque da última chuva ocorrida (data, hora, ponto de medição e observações de campo).
  - Tabela consolidada de resumo por propriedade com médias e somatórios.

- **Gráficos Interativos com Suporte Tátil**:
  - Visualização dinâmica em **Barras** ou **Linhas** contínuas.
  - Filtros rápidos por período: **15 Dias**, **30 Dias** e **Meses da Safra**.
  - Linhas-guia, marcação de milímetros sobre os pontos e tooltips informativos adaptados para toque em telas móveis.

- **Gestão Completa de Propriedades e Talhões**:
  - Cadastro de múltiplas fazendas com localização, área total e descrição.
  - Gestão de talhões, subdivisões e pluviômetros de sede, com área em hectares (ha) e códigos de identificação.

- **Ciclos Agrícolas e Gestão de Safras**:
  - Definição de safras vigentes (ex: Safra 2026/2027) com período de início e término.
  - Ativação de safra principal para cálculo e consolidação automática de métricas.

- **Histórico e Lançamentos Ágeis**:
  - Lançamento rápido de chuvas em menos de 10 segundos, com data, horário, volume (mm), talhão e anotações.
  - Filtros avançados por fazenda, talhão, período de datas e safra.
  - Edição e exclusão segura com recálculo instantâneo de totais.

- **Relatórios Corporativos e Exportação**:
  - Geração de relatórios executivos em **PDF Corporativo**, diagramados em alta resolução com dados da empresa e tabelas consolidadas.
  - Exportação direta para planilhas em formato **CSV**.

- **Experiência Mobile Nativa e Progressive Web App (PWA)**:
  - **Barra de Navegação Inferior Fixa**: Navegação limpa com os 5 acessos principais (*Início*, *Chuvas*, *Fazendas*, *Histórico* e menu *Mais* com *Relatórios*, *Talhões*, *Safras*, *Configurações* e *Perfil*).
  - **Adaptação para Desktop**: Sidebar lateral profissional retrátil para telas grandes e notebooks.
  - **Execução Standalone**: Funciona em tela cheia como aplicativo nativo após instalado, sem barras de navegador.
  - **Fluxo Real de Instalação**: Prompt nativo no Android/Chrome e guia ilustrado passo a passo no iOS Safari.
  - Suporte a áreas seguras do dispositivo (`safe-area-inset-bottom` / notch).

- **Persistência de Dados Local e Offline**:
  - Banco de dados local baseado em **IndexedDB** com fallback automático em **localStorage**, garantindo funcionamento no campo mesmo em áreas sem conexão contínua.

- **Identidade Visual Premium**:
  - Paleta institucional em verde escuro corporativo (`#143D2B`), tipografia limpa e excelente contraste.
  - Suporte completo a **Modo Claro (Light Mode)** e **Modo Escuro (Dark Mode)** com alternância instantânea.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **PWA & Service Worker**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Exportação de Documentos**: [jsPDF](https://github.com/parallax/jsPDF) e [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Servidor Opcional**: [Express](https://expressjs.com/) (Node.js)

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- **Node.js**: versão 18.x, 20.x ou superior ([Download Node.js](https://nodejs.org/))
- **npm** (incluso com o Node.js) ou **pnpm** / **yarn** / **bun**
- **Git** instalado ([Download Git](https://git-scm.com/))

---

## 🚀 Instalação e Execução

### 1. Clonar o Repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO_GITHUB>
cd pluvioagro
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Abra o arquivo `.env` gerado e ajuste as configurações caso necessário:
```env
PORT=3000
VITE_APP_URL="http://localhost:3000"
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```

Acesse a aplicação no navegador em:  
👉 **http://localhost:3000**

---

## 📦 Scripts Disponíveis no Projeto

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento local na porta 3000 |
| `npm run build` | Compila e otimiza a aplicação para produção (gera diretório `dist/`) |
| `npm run preview` | Pré-visualiza localmente o build de produção gerado |
| `npm run start` | Executa o servidor de produção com suporte a host público |
| `npm run lint` | Executa a verificação estática de tipos TypeScript |
| `npm run clean` | Limpa diretórios temporários de compilação (`dist`, `dev-dist`) |

---

## 📁 Estrutura de Pastas

```text
pluvioagro/
├── public/                 # Assets públicos, ícones PWA e logotipo SVG
│   ├── pwa-192x192.png     # Ícone PWA padrão (192px)
│   ├── pwa-512x512.png     # Ícone PWA alta resolução (512px)
│   ├── pwa-maskable-512x512.png # Ícone PWA adaptativo com margem segura Android
│   ├── apple-touch-icon.png# Ícone compatível com iOS Safari
│   └── logo.svg            # Logotipo vetorial PluvioAgro
├── src/
│   ├── assets/             # Constantes visuais e ativos da marca
│   ├── components/         # Componentes modulares da interface
│   │   ├── Dashboard.tsx          # Painel principal com KPIs e tabelas
│   │   ├── PrecipitationChart.tsx # Gráfico de chuvas com barras e linhas
│   │   ├── FarmsManager.tsx       # Módulo de gestão de fazendas
│   │   ├── PointsManager.tsx      # Módulo de talhões e pontos de medição
│   │   ├── HarvestsManager.tsx    # Módulo de safras e ciclos agrícolas
│   │   ├── HistoryView.tsx        # Histórico cronológico e filtros
│   │   ├── ReportsView.tsx        # Emissão de relatórios e exportações
│   │   ├── SettingsView.tsx       # Configurações cadastrais da propriedade
│   │   ├── RainModal.tsx          # Modal ergonômico de lançamento de chuvas
│   │   ├── MobileNav.tsx          # Barra de navegação inferior nativa e menu Mais
│   │   ├── Navbar.tsx             # Cabeçalho superior compacto e responsivo
│   │   ├── Sidebar.tsx            # Navegação lateral recolhível para Desktop
│   │   ├── CustomSelect.tsx       # Seletor customizado acessível
│   │   ├── LandingPage.tsx        # Apresentação institucional
│   │   ├── LoginView.tsx          # Tela de autenticação e perfis
│   │   └── AuthModal.tsx          # Modal de conta, backup e troca de usuário
│   ├── context/            # Contextos React (ThemeContext para Dark/Light mode)
│   ├── hooks/              # Custom hooks (ex: usePWAInstall)
│   ├── services/           # Camada de dados e armazenamento (IndexedDB / LocalStorage)
│   ├── types/              # Definições de tipos e interfaces TypeScript
│   ├── utils/              # Formatadores de dados e gerador de PDF
│   ├── App.tsx             # Componente raiz com roteamento e estados globais
│   ├── main.tsx            # Ponto de entrada React
│   └── index.css           # Estilos globais e utilitários Tailwind CSS
├── .env.example            # Modelo seguro de variáveis de ambiente
├── .gitignore              # Regras de exclusão para versionamento no Git
├── index.html              # HTML base com meta tags PWA e viewport móvel
├── package.json            # Metadados e dependências do projeto
├── tsconfig.json           # Configuração de compilação TypeScript
└── vite.config.ts          # Configuração Vite com plugins Tailwind e PWA
```

---

## 🔒 Segurança e Boas Práticas

- **Sem Credenciais no Código**: Nenhuma senha, token ou chave privada deve ser enviada para o controle de versão.
- **Proteção no `.gitignore`**: Arquivos `.env*`, pastas de compilação (`dist`, `dev-dist`), `node_modules` e caches estão devidamente bloqueados.
- **Arquitetura Client-Side Segura**: As credenciais e dados locais dos operadores ficam isolados no armazenamento do próprio navegador.

---

## 📤 Publicação no GitHub (Passo a Passo)

Caso este projeto ainda não possua o Git inicializado, execute os comandos abaixo no terminal dentro da pasta raiz:

```bash
# 1. Inicializar o repositório Git local
git init

# 2. Adicionar todos os arquivos rastreáveis
git add .

# 3. Criar o commit inicial
git commit -m "feat: initial commit - PluvioAgro SaaS/PWA"

# 4. Definir a branch principal como main
git branch -M main

# 5. Conectar ao repositório remoto no GitHub
# Substitua a URL abaixo pela URL real do seu repositório no GitHub
git remote add origin https://github.com/<SEU_USUARIO_OU_ORGANIZACAO>/<NOME_DO_REPOSITORIO>.git

# 6. Enviar os arquivos para o GitHub
git push -u origin main
```

---

## 📄 Licença

Este projeto é um software proprietário comercial. Todos os direitos reservados.
