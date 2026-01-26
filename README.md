# RecruitAI - Plataforma de Recrutamento Inteligente

Sistema de recrutamento e seleção com IA generativa para criação de vagas, análise de candidatos e geração de relatórios executivos.

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19
- **Backend**: Next.js API Routes
- **Banco de Dados**: Firebase Firestore
- **Autenticação**: Firebase Auth (Email/Senha + Google)
- **IA**: Google Gemini 2.0 Flash
- **Deploy**: Netlify

## Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Gemini AI (server-side only - não expor no cliente)
GEMINI_API_KEY=sua_chave_gemini
```

### 2. Firebase Setup

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto ou use um existente
3. Ative **Authentication** com providers Email/Senha e Google
4. Crie um banco **Firestore Database** em modo test
5. Em Authentication → Settings → Authorized domains, adicione seu domínio Netlify

### 3. Gemini API Key

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crie uma API Key
3. Adicione ao `.env.local` como `GEMINI_API_KEY`

> **Nota**: O sistema possui tratamento de erro automático para chaves inválidas (Erro 400), exibindo mensagens amigáveis na interface.

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-candidate/    # API de análise de candidatos
│   │   ├── generate-job/         # API de geração de vagas
│   │   └── generate-report/      # API de relatórios HTML/PDF
│   ├── dashboard/
│   │   ├── candidates/           # Página de análise de talentos
│   │   ├── jobs/                 # Página de vagas
│   │   └── settings/             # Configurações
│   ├── login/                    # Autenticação
│   └── onboarding/               # Configuração inicial
├── components/
├── context/                      # AuthContext
├── hooks/                        # useSubscription
├── lib/                          # Firebase config
└── services/
    └── aiService.js              # Prompts e integração Gemini
```

## Funcionalidades

### Modo 1: Arquiteto de Vagas
- **Arquétipo Mental Unificado**: Seleção integrada de perfil (Hunter/Farmer/Técnico/Liderança)
- Driver motivacional (Financeiro/Competição/Propósito)
- Geração automática de texto persuasivo sem emojis
- UI Polida: Botões Outlined e alto contraste (Humanidade Sintética V2)

### Modo 2: Analista de Perfil (Protocolo Elite V6.0)
- Upload de CV (.txt, .pdf, .doc, .docx)
- Transcrição de entrevistas
- Análise STAR diferenciada por perfil
- Scorecard com competências específicas:
  - **Técnico**: Domínio Hard Skills, Resolução Problemas, Qualidade Entrega, Profundidade Técnica
  - **Liderança**: Tomada Decisão, Gestão Conflitos, Mentoria/Delegar, Visão Estratégica
- Identificação de temperamento
- Red Flags para perfis de liderança (centralização)
- Geração de relatório HTML exportável

## Deploy no Netlify

1. Push do código para GitHub
2. Conecte o repositório no Netlify
3. Configure as variáveis de ambiente no Netlify:
   - Todas as `NEXT_PUBLIC_FIREBASE_*`
   - `GEMINI_API_KEY`
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Adicione o domínio do Netlify no Firebase Auth → Authorized domains

## Protocolo Elite V6.0

### Diferenciação Técnico vs Liderança

| Aspecto | Perfil Técnico | Perfil Liderança |
|---------|----------------|------------------|
| Foco STAR | Eficiência individual | Resultados de equipe |
| Verbos | Executar, Analisar, Solucionar | Disseminar, Treinar, Planejar |
| Temperamentos ideais | Melancólico, Fleumático | Colérico, Sanguíneo |
| Red Flags | - | "Eu fiz" sem mencionar equipe |

### Competências Avaliadas

**Técnico:**
1. Domínio de Hard Skills
2. Resolução de Problemas
3. Qualidade de Entrega
4. Profundidade Técnica

**Liderança:**
1. Tomada de Decisão
2. Gestão de Conflitos
3. Mentoria/Delegar
4. Visão Estratégica

## Suporte

Para dúvidas ou problemas, abra uma Issue no repositório ou envie email para suporte.

---

© 2026 RecruitAI. Todos os direitos reservados.
