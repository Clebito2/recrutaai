# Recruit-AI

> **Humanidade Sintética** — Sistema de Recrutamento e Seleção de Alta Performance

Uma plataforma SaaS de curadoria de talentos que combina inteligência artificial com metodologias científicas de R&S.

---

## Visão Geral

O Recruit-AI é uma ferramenta de recrutamento inteligente que automatiza:
- **Arquitetura de Vagas** (Mode 1): Geração de anúncios estratégicos sem viés
- **Análise de Perfil** (Mode 2): Processamento de CVs/Transcrições com metodologia STAR e Matriz SWOT

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15 (App Router) |
| Estilização | CSS Variables + Glassmorphism |
| Autenticação | Firebase Auth (Email/Google) |
| Banco de Dados | Firebase Firestore |
| IA | Google Gemini API |
| Hospedagem | Netlify |

---

## Design System: "Humanidade Sintética"

Estética **Neo-Clean** com foco em alto contraste e redução de fadiga visual.

### Paleta de Cores
- **Canvas**: `#05050A` (Obsidian Deep)
- **Ação Primária**: `#4F46E5` (Electric Indigo)
- **Ação Secundária**: `#00F0FF` (Neon Teal)
- **Accent**: `#8B5CF6` (Violet)

### Tipografia
- **UI**: Plus Jakarta Sans
- **Narrativa**: Merriweather (humanização de nomes e resumos)

### Layout
- Dashboard: Bento Grid Assimétrico
- Pipeline: Kanban "Líquido" com Glassmorphism

---

## Modelo de Negócio

| Plano | Preço | Limites |
|-------|-------|---------|
| Trial | Grátis (7 dias) | 1 vaga, 2 análises de CV |
| Essencial | R$ 99/mês | 4 vagas, 20 análises de CV |
| Elite | R$ 249/mês | Ilimitado + Dashboard Analytics |

---

## Estrutura do Projeto

```
recruit-ai/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout com AuthProvider
│   │   ├── page.js            # Landing page (Bento Grid)
│   │   ├── login/page.js      # Autenticação
│   │   ├── onboarding/page.js # Setup da empresa
│   │   └── dashboard/
│   │       ├── layout.js      # Dashboard layout protegido
│   │       ├── page.js        # Visão geral (Bento)
│   │       └── jobs/new/page.js # Formulário diagnóstico
│   ├── components/
│   │   └── common/
│   │       ├── GlassCard.js
│   │       └── SubscriptionGuard.js
│   ├── context/
│   │   └── AuthContext.js     # Firebase Auth wrapper
│   ├── hooks/
│   │   └── useSubscription.js # Lógica de trial e limites
│   ├── lib/
│   │   └── firebase.js        # Configuração Firebase
│   └── services/
│       └── aiService.js       # Integração com LLM
├── firestore.rules            # Regras de segurança
├── .env.local.example         # Template de variáveis
└── README.md
```

---

## Configuração

### 1. Variáveis de Ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

GEMINI_API_KEY=sua_chave_gemini
```

### 2. Firebase Console

1. Ative **Authentication** > Email/Senha e Google
2. Crie o banco **Firestore Database**
3. Deploy das regras: `firebase deploy --only firestore:rules`

### 3. Executar Localmente

```bash
npm install
npm run dev -- -p 3001
```

---

## Funcionalidades Implementadas

- [x] Landing Page com Bento Grid
- [x] Sistema de Autenticação (Email + Google OAuth)
- [x] Onboarding com identificação corporativa
- [x] Dashboard com layout modular
- [x] Lógica de Trial (7 dias) e Tiers
- [x] Formulário diagnóstico para vagas (4 etapas)
- [x] Geração de anúncio com IA (Gemini)
- [x] Listagem de vagas criadas
- [x] Análise de CV/Transcrição com STAR/SWOT
- [x] Scorecard de competências automático
- [x] Relatório Elite HTML com export PDF
- [x] SubscriptionGuard para bloqueio de limites
- [x] Firestore Security Rules

---

## Pendências (TODO)

### Alta Prioridade
- [ ] Integração completa do AI Service com Gemini API
- [ ] Geração de texto do anúncio via IA (Mode 1)
- [ ] Tela de listagem de vagas criadas
- [ ] Upload e processamento de CV (Mode 2)
- [ ] Análise STAR/SWOT automatizada
- [ ] Geração do relatório HTML Elite

### Média Prioridade
- [ ] Página de Pricing/Upgrade
- [ ] Integração com gateway de pagamento
- [ ] Notificações de limite (email/push)
- [ ] Dashboard Analytics (Tier 2)

### Baixa Prioridade
- [ ] Processamento em lote de CVs
- [ ] Exportação de relatórios em PDF
- [ ] Integração com ATS externos
- [ ] Modo offline/PWA

---

## Licença

Proprietário — Live Consultoria Empresarial
