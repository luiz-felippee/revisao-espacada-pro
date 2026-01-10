# Study Panel PRO 📚

> Painel de Estudos Profissional com Sistema de Repetição Espaçada, Pomodoro e Gamificação

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.87-3ecf8e)](https://supabase.com/)

## 🚀 Sobre o Projeto

**Study Panel PRO** é uma aplicação web moderna e completa para gerenciamento de estudos, com foco em produtividade e retenção de conhecimento através de técnicas científicas comprovadas.

### ✨ Principais Funcionalidades

- 🧠 **Sistema de Repetição Espaçada (SRS)** - Baseado no algoritmo SM-2
- ⏱️ **Pomodoro Integrado** - Cronômetro flutuante e arrastável
- 🎮 **Gamificação Completa** - XP, níveis, conquistas e streaks
- 📅 **Calendário Inteligente** - Visualização de tarefas, metas e revisões
- 🎯 **Gestão de Metas e Projetos** - Com checklist e progresso
- 📕 **Temas e Subtemas** - Organize seu conteúdo de estudo
- ☁️ **Offline-First** - Funciona sem internet com sincronização automática
- 🎨 **UI Moderna** - Design responsivo com Dark Mode
- 📱 **PWA** - Instalável como aplicativo

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Supabase (para backend)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/study-panel.git
cd study-panel
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Configure o banco de dados**

Execute as migrações do Supabase:

```bash
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Compila para produção
npm run preview          # Preview do build de produção

# Testes
npm run test             # Executa testes
npm run test:ui          # Interface de testes
npm run test:coverage    # Cobertura de testes

# Database
npm run db:start         # Inicia Supabase local
npm run db:stop          # Para Supabase local
npm run db:reset         # Reseta banco de dados
npm run db:push          # Aplica migrações
npm run db:diff          # Gera diff de migrações
npm run db:migration     # Cria nova migração

# Linting
npm run lint             # Executa ESLint
```

## 📁 Estrutura do Projeto

```
study-panel/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── ui/         # Componentes de interface
│   │   ├── forms/      # Formulários
│   │   └── layout/     # Componentes de layout
│   ├── context/        # React Contexts
│   ├── features/       # Features organizadas por domínio
│   │   ├── calendar/   # Calendário
│   │   ├── dashboard/  # Dashboard principal
│   │   ├── goals/      # Sistema de metas
│   │   ├── pomodoro/   # Timer Pomodoro
│   │   ├── themes/     # Temas de estudo
│   │   └── ...
│   ├── hooks/          # Custom React Hooks
│   ├── lib/            # Bibliotecas e configurações
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços (API, Sync, etc)
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilitários
│   └── main.tsx        # Entry point
├── supabase/           # Migrações e configurações do Supabase
├── package.json
└── vite.config.ts
```

## 🔧 Tecnologias Principais

### Core
- **React 19.2** - Library UI
- **TypeScript 5.9** - Tipagem estática
- **Vite 7** - Build tool
- **React Router 7** - Roteamento

### Backend
- **Supabase** - Backend as a Service (PostgreSQL, Auth, Storage)

### UI/UX
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Lucide React** - Ícones

### Estado e Dados
- **Context API** - Gerenciamento de estado
- **date-fns** - Manipulação de datas
- **Zod** - Validação de schemas

### Performance
- **React Window** - Virtualização de listas
- **Terser** - Minificação

### Testes
- **Vitest** - Framework de testes
- **Testing Library** - Testes de componentes

## 🗄️ Configuração do Supabase

### Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e ANON KEY

### Estrutura do Banco

O banco possui as seguintes tabelas principais:

- `profiles` - Perfis de usuários
- `themes` - Temas de estudo
- `subthemes` - Subtemas (com sistema SRS)
- `tasks` - Tarefas
- `goals` - Metas e hábitos

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado para garantir que usuários só acessem seus próprios dados.

## 🎮 Como Usar

### 1. Criar um Tema de Estudo
1. Vá para a aba "Temas"
2. Clique em "Novo Tema"
3. Preencha título, ícone, cor e categoria
4. Adicione subtemas com o conteúdo

### 2. Agendar Revisões
- O sistema automaticamente agenda revisões com base no algoritmo SRS
- Confira na aba "Calendário" ou em "Missões de Hoje"

### 3. Usar o Pomodoro
1. Clique no botão flutuante no canto inferior direito
2. Configure o tempo de foco
3. O widget pode ser arrastado pela tela
4. Clique uma vez para pausar/resumir
5. Clique duas vezes para expandir

### 4. Acompanhar Progresso
- Dashboard mostra XP, nível, streak e conquistas
- Gráfico de consistência exibe sua dedicação
- Calendário mostra todas as atividades agendadas

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Modo watch
npm run test -- --watch

# Com interface
npm run test:ui

# Cobertura
npm run test:coverage
```

## 📝 Contribuindo

Contribuições são fundamentais para a evolução deste projeto! Por favor, leia nosso [Guia de Contribuição](./CONTRIBUTING.md) para detalhes sobre nosso processo de desenvolvimento, padrões de codificação e como submeter Pull Requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seuusuario](https://github.com/seuusuario)

## 🙏 Agradecimentos

- Algoritmo SM-2 para SRS
- Técnica Pomodoro
- Comunidade React e Supabase

---

**Feito com ❤️ e muita ☕**
