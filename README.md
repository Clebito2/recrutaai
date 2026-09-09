# Consultor de Inteligência em R&S — Live Consultoria
> **Produto Oficial de Recrutamento & Seleção com Inteligência Artificial do Ecossistema Live**

---

## 📌 Visão Geral do Produto

O **Consultor de Inteligência em R&S** é uma plataforma corporativa completa desenvolvida para transformar a forma como empresas contratam talentos. O sistema opera em dois modos integrados:

1. **Modo 1 (Arquiteto de Vagas):** Criação de anúncios sóbrios, sem clichês tóxicos, com separação explícita de requisitos *Obrigatórios (Eliminatórios)* vs *Desejáveis*, além da geração instantânea do **Roteiro Socrático de Entrevista** com simulação prática (Role Play Cenários A/B) e teste de *Coachability*.
2. **Modo 2 (Analista de Candidatos):** Triagem automatizada com barreira de **Gate Check eliminatório**, cálculo auditável de notas em **4 Pilares Ponderados** (Comportamental, Técnica, Prática e Alinhamento), **STAR quantitativo**, **Matriz SWOT** e análise de temperamentos.
3. **Protocolo Elite:** Geração de parecer executivo visual em HTML estilizado com o padrão estético da Live Consultoria (`#06192a` / `#00e800`) e exportação direta para apresentação à diretoria e clientes.
4. **Matriz de Decisão:** Comparador multi-candidatos no dashboard para rankear e decidir contratações em minutos.

---

## 📁 Estrutura de Pastas & Documentação

```
d:\Automacao\Consultoria\clientes\ecossistema-live\produtos\recrutamento-selecao-ia\
├── MANUAL_WEB_DESIGNER_IA.md        <-- Guia completo de UI/UX, fluxos e textos na tela
├── DEPLOY_NETLIFY_FIREBASE.md       <-- Guia de infraestrutura, coleções Firestore e Netlify
├── netlify.toml                     <-- Configuração oficial de deploy no Netlify
├── firestore.rules                  <-- Regras de segurança prontas para o Cloud Firestore
├── .env.example                     <-- Modelo de variáveis de ambiente
├── src/                             <-- Código-fonte do Next.js (App Router)
│   ├── app/                         <-- Páginas do Dashboard, Vagas e Candidatos
│   ├── components/                  <-- Componentes UI (GlassCard, StatCard, etc.)
│   ├── context/                     <-- Contexto de Autenticação Firebase
│   ├── lib/                         <-- Validações Zod e regras das 6 Famílias
│   ├── services/                    <-- Serviços de IA e Geração de Relatórios
│   └── skills/                      <-- Motores de Job Architect, CV Analyst e Protocolo Elite
└── package.json                     <-- Dependências do projeto
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Serverless:** Next.js (App Router, Tailwind CSS, Lucide React).
- **Hospedagem & Deploy:** [Netlify](https://www.netlify.com/) via plugin `@netlify/plugin-nextjs`.
- **Autenticação:** [Google Firebase Authentication](https://firebase.google.com/) (Email/Senha e Google Sign-In).
- **Banco de Dados:** [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (Multi-tenant isolado por usuário).
- **Inteligência Artificial:** Google Gemini API (modelos Flash com Structured Output).

---

## 📖 Como Começar

1. **Para Designers e Desenvolvedores de Interface:**
   - Leia o [MANUAL_WEB_DESIGNER_IA.md](file:///d:/Automacao/Consultoria/clientes/ecossistema-live/produtos/recrutamento-selecao-ia/MANUAL_WEB_DESIGNER_IA.md) para entender a paleta de cores, os passos do usuário e os componentes de tela.

2. **Para Engenheiros de DevOps e Infraestrutura:**
   - Siga as instruções do [DEPLOY_NETLIFY_FIREBASE.md](file:///d:/Automacao/Consultoria/clientes/ecossistema-live/produtos/recrutamento-selecao-ia/DEPLOY_NETLIFY_FIREBASE.md) para configurar o Firebase Console, aplicar as `firestore.rules` e publicar no Netlify.
