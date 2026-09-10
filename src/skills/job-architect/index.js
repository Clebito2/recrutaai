/**
 * Job Architect Skill — Modo 1 (Live Consultoria)
 * Elabora o descritivo de vaga e o roteiro estruturado de entrevista socrática
 */

import { callGemini, removeEmojis } from '../gemini-client/index.js';

export const SYSTEM_PROMPT_JOB = `Você é o Consultor Sênior de R&S da Live Consultoria.
Sua missão é elaborar descritivos de vaga de alto calibre seguindo a metodologia de funil da Live, adaptada à família de vaga e à empresa cliente indicada.

DIRETRIZES MANDATÓRIAS DE FORMATAÇÃO E SOBRIEDADE:
- NUNCA utilize asteriscos duplos (**) para negrito. Escreva os títulos das seções em CAIXA ALTA, precedidos e seguidos de quebras de linha duplas.
- O anúncio DEVE ter quebras de linha claras e parágrafos bem espaçados, utilizando traço (- ) para itens de lista.
- NUNCA invente nomes como "Empresa Teste". Use RIGOROSAMENTE o nome exato da EMPRESA CLIENTE fornecido nos dados.
- PROIBIDO iniciar com saudações informais ou perguntas motivacionais (Ex: "Olá, Conectado(a)!", "Cansado de apenas executar?", "Sonha em liderar...").
- PROIBIDO qualquer emoji no corpo do anúncio.
- PROIBIDOS títulos como 'Ninja', 'Jedi', 'Rockstar' ou clichês vazios ('vestir a camisa', 'empresa líder', 'somos movidos pela inovação').
- Inicie DIRETAMENTE pelo Título da Posição e pela descrição institucional da EMPRESA CLIENTE.

ESTRUTURA FIXA DA REDAÇÃO (SEPARAR CADA SEÇÃO COM QUEBRAS DE LINHA DUPLAS):

TÍTULO DA VAGA: [Cargo]

SOBRE A [NOME EXATO DA EMPRESA CLIENTE]
[Parágrafo institucional aprofundado e sóbrio sobre a empresa, destacando segmento, autoridade, diferenciais de mercado e momento atual com base nas informações fornecidas. Nunca utilize clichês vazios como 'empresa líder inovadora'.]

RESPONSABILIDADES E ATRIBUIÇÕES
- [Atribuição concreta baseada na rotina informada, iniciada com verbo de ação no infinitivo]
- [Atribuição concreta baseada na rotina informada, iniciada com verbo de ação no infinitivo]
- [Atribuição concreta baseada na rotina informada, iniciada com verbo de ação no infinitivo]
- [Atribuição concreta baseada na rotina informada, iniciada com verbo de ação no infinitivo]

REQUISITOS COMPORTAMENTAIS
- [Soft skill 1 alinhada ao arquétipo]
- [Soft skill 2 alinhada ao arquétipo]

REQUISITOS TÉCNICOS OBRIGATÓRIOS (GATE CHECK ELIMINATÓRIO)
- [Requisito eliminatório 1]
- [Requisito eliminatório 2]

DIFERENCIAIS DESEJÁVEIS
- [Requisito desejável 1]
- [Requisito desejável 2]

O QUE OFERECEMOS
- Remuneração: [Faixa Salarial / OTE]
- Modelo de Trabalho: [Modelo]
- Benefícios: [Benefícios]

COMPROMISSO COM A DIVERSIDADE
[Fechamento profissional e inclusivo]`;

export const SYSTEM_PROMPT_INTERVIEW = `Você é o Consultor Sênior de R&S da Live Consultoria, especialista em Entrevistas Comportamentais Socráticas.
Sua missão é gerar um Roteiro de Entrevista Estruturada para que o gestor ou consultor conduza um processo seletivo científico, profundo e auditável.

ESTRUTURA OBRIGATÓRIA DO ROTEIRO:
- **Visão Geral e Arquétipo:** Perfil ideal, motivador-chave e lentes de temperamento recomendadas.
- **Bloco 1 — Abertura e Apresentação (5 min):** Roteiro de fala do entrevistador e pergunta de aquecimento.
- **Bloco 2 — Trajetória e Densidade Profissional (10 min):** Perguntas sobre histórico, ferramentas e complexidade real.
- **Bloco 3 — Competências Comportamentais com STAR (20 min):** Para cada competência da família de vaga, apresentar:
  - Pergunta situacional profunda.
  - Tabela S-T-A-R com o que observar.
  - Red Flags (sinais de alerta / respostas vagas) e Green Flags (respostas com evidência concreta).
- **Bloco 4 — Simulação Prática / Role Play (15 min):** 
  - Cena A e Cena B com scripts para o entrevistador simular um caso real (cliente difícil, objeção, crise ou reconciliação).
  - Teste de Coachability: Instrução para dar um feedback pontual ao candidato e pedir para repetir, avaliando absorção imediata.
- **Bloco 5 — Valores, Fit Cultural e Perguntas do Candidato (10 min).**
- **Scorecard Pós-Entrevista:** Tabela com os 4 pilares (Comportamental, Técnica, Prática, Alinhamento), pesos percentuais e fórmula de cálculo auditável.`;

export const ARCHETYPE_MAP = {
    comercial: {
        hunter: "Hunter (prospecção ativa, abertura de mercado, perfil agressivo)",
        farmer: "Farmer (relacionamento, gestão de carteira, retenção e expansão)",
        closer: "Closer / Negociação (fechamento de contas e vendas complexas)",
        sdr: "SDR / BDR (prospecção e qualificação de leads)",
        consultivo: "Vendas Consultivas / Key Account Manager",
        outro: "Outro Arquétipo Comercial (Personalizado)"
    },
    atendimento: {
        suporte: "Suporte Técnico / Resolução de Incidentes & Help Desk",
        cs: "Customer Success / Adoção, Retenção e Expansão de Clientes",
        ouvidoria: "Ouvidoria / Gestão de Crise e Retenção Crítica",
        outro: "Outro Arquétipo de Atendimento (Personalizado)"
    },
    operacoes: {
        padrao: "Manter Padrão & Confiabilidade (foco em processos, compliance e qualidade)",
        melhoria: "Melhoria Contínua (foco em otimização, eliminação de gargalos e inovação)",
        logistica: "Logística & Supply Chain (planejamento e distribuição)",
        financeiro_op: "Operações Financeiras / Controladoria & Backoffice",
        outro: "Outro Arquétipo de Operações (Personalizado)"
    },
    tecnico: {
        profundidade: "Profundidade / Especialista (domínio técnico cirúrgico em stack/área específica)",
        generalista: "Generalista / Fullstack (versatilidade, visão sistêmica e adaptação rápida)",
        arquitetura: "Arquitetura & Engenharia de Soluções",
        outro: "Outro Arquétipo Técnico (Personalizado)"
    },
    lideranca: {
        execucao: "Execução & Comando (foco em entrega de curto/médio prazo e rotinas)",
        estrategico: "Visão Estratégica (foco em médio/longo prazo, cultura e escala)",
        mentor: "Liderança Desenvolvedora / Mentoria e Gestão de Pessoas",
        outro: "Outro Arquétipo de Liderança (Personalizado)"
    },
    outro: {
        geral: "Perfil Operacional / Execução Estruturada",
        analitico: "Perfil Analítico / Planejamento & Qualidade",
        criativo: "Perfil Criativo / Inovação & Comunicação",
        administrativo: "Perfil Administrativo / Suporte & Organização",
        custom: "Outro Arquétipo Personalizado"
    }
};

export const MOTIVATOR_MAP = {
    financeiro: "Ambição Financeira / Comissão (foco em metas, ganhos variáveis e recompensa por entrega)",
    desafio: "Desafio / Competição (superação de benchmarks, reconhecimento e liderança de mercado)",
    estabilidade: "Estabilidade / Carreira (segurança, solidez, progressão estruturada e processos claros)",
    proposito: "Propósito / Impacto (alinhamento a valores, transformação de clientes e colaboração)",
    crescimento: "Aprendizado Acelerado & Autonomia (ambiente dinâmico e desenvolvimento contínuo)",
    outro: "Outro Motivador Específico"
};

/**
 * Validação de dados de entrada do diagnóstico de vaga
 */
export function validateInput(data) {
    if (!data) throw new Error("Dados do diagnóstico não fornecidos");
    if (!data.title || data.title.trim().length < 2) throw new Error("Título da vaga obrigatório");
}

/**
 * Monta o prompt do usuário para geração do anúncio
 */
export function buildJobPrompt(companyName, data) {
    const targetCompany = data.companyName || companyName || "Empresa Contratante";
    const family = (data.family === "outro" && data.customFamilyDetail)
        ? `OUTRO (${data.customFamilyDetail})`
        : (data.family || data.profileType || "tecnico").toUpperCase();

    const rawArchetype = ARCHETYPE_MAP[data.family]?.[data.archetype] || data.archetype || "Perfil alinhado ao segmento";
    const archetypeDesc = ((data.archetype === "outro" || data.archetype === "custom") && data.customArchetypeDetail)
        ? `${rawArchetype} — Detalhe: ${data.customArchetypeDetail}`
        : rawArchetype;

    const motivatorDesc = (data.motivator === "outro" && data.customMotivatorDetail)
        ? `Outro Motivador: ${data.customMotivatorDetail}`
        : (MOTIVATOR_MAP[data.motivator] || data.motivator || "Crescimento profissional e impacto");

    return `EMPRESA CLIENTE (CONTRATANTE): ${targetCompany}
(ATENÇÃO: Utilize impreterivelmente o nome "${targetCompany}" como a empresa contratante na seção "Sobre a Empresa" e ao longo de todo o texto. Não utilize "Empresa Teste" nem qualquer outro nome fictício).

CONTEXTO E INFORMAÇÕES SOBRE A EMPRESA (SEGMENTO, MOMENTO, CULTURA E DIFERENCIAIS):
${data.companyDescription?.trim() || "Empresa com atuação consolidada em seu setor, focada em qualidade, diferenciação e crescimento sustentável."}

TÍTULO DA VAGA: ${data.title}
FAMÍLIA DA VAGA: ${family}
ARQUÉTIPO DE ATUAÇÃO: ${archetypeDesc}
MOTIVADOR PRINCIPAL: ${motivatorDesc}

PRINCIPAIS ATRIBUIÇÕES E RESPONSABILIDADES DO DIA A DIA (ROTINA E ENTREGAS REAIS):
${data.responsibilities?.trim() || "Execução e acompanhamento das rotinas e projetos prioritários da função, garantindo qualidade e cumprimento de metas."}

MODELO DE TRABALHO: ${data.workModel || "A combinar"}
FAIXA SALARIAL / REMUNERAÇÃO: ${data.salary || "Compatível com o mercado"}
BENEFÍCIOS: ${data.benefits || "Pacote padrão corporativo"}

REQUISITOS TÉCNICOS OBRIGATÓRIOS (CRITÉRIOS ELIMINATÓRIOS):
${data.mustHaves || "Experiência sólida na área"}

REQUISITOS DESEJÁVEIS (DIFERENCIAIS):
${data.niceToHaves || "Certificações e experiências adicionais"}

DIRETRIZ DE REDAÇÃO ESPECÍFICA:
Aprofunde as seções 'SOBRE A EMPRESA' e 'RESPONSABILIDADES E ATRIBUIÇÕES' utilizando fielmente os detalhes concretos acima, garantindo um anúncio atraente, autêntico e 100% livre de clichês ou generalismos. Redija o anúncio oficial da vaga seguindo estritamente a estrutura de 7 tópicos da Seção 2 do Padrão Live, mantendo sobriedade radical e sem emojis.`;
}

/**
 * Monta o prompt para o Roteiro Estruturado de Entrevista
 */
export function buildInterviewGuidePrompt(companyName, data) {
    const targetCompany = data.companyName || companyName || "Empresa Contratante";
    const family = (data.family === "outro" && data.customFamilyDetail)
        ? `OUTRO (${data.customFamilyDetail})`
        : (data.family || data.profileType || "tecnico").toUpperCase();

    const rawArchetype = ARCHETYPE_MAP[data.family]?.[data.archetype] || data.archetype || "Padrão";
    const archetypeDesc = ((data.archetype === "outro" || data.archetype === "custom") && data.customArchetypeDetail)
        ? `${rawArchetype} — Detalhe: ${data.customArchetypeDetail}`
        : rawArchetype;

    let prompt = `EMPRESA CLIENTE (CONTRATANTE): ${targetCompany}
VAGA: ${data.title} (${family})
ARQUÉTIPO: ${archetypeDesc}
REQUISITOS OBRIGATÓRIOS: ${data.mustHaves || "Não especificados"}
REQUISITOS DESEJÁVEIS: ${data.niceToHaves || "Não especificados"}\n\n`;

    if (data.candidateName || data.candidateAnalysis) {
        prompt += `### CANDIDATO EM AVALIAÇÃO (ROTEIRO SOCRÁTICO PERSONALIZADO):
Nome: ${data.candidateName || "Candidato"}
Score Obtido no CV: ${data.candidateScore || "N/A"}
Pontos Fortes Identificados: ${JSON.stringify(data.candidateAnalysis?.pontos_fortes || [])}
Pontos Fracos / Gaps Detectados: ${JSON.stringify(data.candidateAnalysis?.pontos_fracos || data.candidateAnalysis?.gaps || [])}
Red Flags a Investigar: ${JSON.stringify(data.candidateAnalysis?.red_flags || [])}
Informações Faltantes do CV: ${JSON.stringify(data.candidateAnalysis?.informacoes_faltantes || [])}
Temperamento Avaliado: ${data.candidateAnalysis?.temperamento?.predominante || "Não especificado"}

DIRETRIZ DE PERSONALIZAÇÃO PARA ESTE CANDIDATO:
- Elabore perguntas socráticas focadas cirurgicamente nas lacunas, inconsistências e red flags detectadas no currículo deste candidato.
- No Bloco de Role Play, desenhe uma simulação prática que teste diretamente os pontos de maior risco ou dúvidas levantadas na triagem.
- O Teste de Coachability deve conter um feedback calibrado para o temperamento e nível deste profissional.\n\n`;
    }

    prompt += `Elabore o Guia de Entrevista Socrática completo (Blocos 1 a 5 + Role Play com feedback de Coachability e Scorecard com pesos da família) para apoiar o entrevistador com rigor científico.`;

    return prompt;
}

/**
 * Gera anúncio de vaga (Modo 1)
 */
export async function generateJobAd(companyName, diagnosticData) {
    validateInput(diagnosticData);
    const userPrompt = buildJobPrompt(companyName, diagnosticData);

    const result = await callGemini({
        systemPrompt: SYSTEM_PROMPT_JOB,
        userContent: userPrompt,
        config: {
            temperature: 0.3, // Sobriedade e aderência ao padrão institucional
            maxOutputTokens: 4096
        }
    });

    return removeEmojis(result);
}

/**
 * Gera Roteiro de Entrevista Socrática (com Simulação/Role Play)
 */
export async function generateInterviewGuide(companyName, diagnosticData) {
    validateInput(diagnosticData);
    const userPrompt = buildInterviewGuidePrompt(companyName, diagnosticData);

    const result = await callGemini({
        systemPrompt: SYSTEM_PROMPT_INTERVIEW,
        userContent: userPrompt,
        config: {
            temperature: 0.4,
            maxOutputTokens: 6144
        }
    });

    return removeEmojis(result);
}

// Aliases de compatibilidade para rotas legadas
export const getSystemPrompt = () => SYSTEM_PROMPT_JOB;
export const buildUserPrompt = buildJobPrompt;
export const SYSTEM_PROMPT = SYSTEM_PROMPT_JOB;
