import { callGeminiStructured } from "../gemini-client/index.js";
import { SCHEMA_LIVE_RS } from "./schemas.js";
import { FAMILY_DEFAULT_WEIGHTS } from "../../lib/validation.js";

const FAMILY_LABELS = {
    comercial: "Comercial / Vendas",
    atendimento: "Atendimento / Customer Success",
    operacoes: "Operações / Administrativo",
    tecnico: "Técnico / Especialista",
    lideranca: "Liderança / Gestão",
    outro: "Outra Família de Cargo"
};

/**
 * Análise de Candidato — Consultor de Inteligência em R&S (Live Consultoria)
 * Suporta texto puro, PDF multimodal e Áudio/Vídeo
 * 
 * @param {string} companyName 
 * @param {object|string} cvContent - Text string OU { inlineData: { mimeType, data } }
 * @param {object} options - { jobContext, profileLevel, jobFamily, customWeights, jobData, previousAnalysis }
 */
export async function analyzeCandidate(companyName, cvContent, ...args) {
    let options = {};
    if (args.length > 1 || typeof args[0] === "string") {
        options = {
            jobContext: args[0],
            profileLevel: args[1],
            jobData: args[2],
            previousAnalysis: args[3]
        };
    } else {
        options = args[0] || {};
    }

    // Mapeamento de família
    const rawFamily = options.jobFamily || (options.profileLevel === "lideranca" ? "lideranca" : "tecnico");
    const jobFamily = FAMILY_DEFAULT_WEIGHTS[rawFamily] ? rawFamily : "tecnico";
    const weights = options.customWeights || FAMILY_DEFAULT_WEIGHTS[jobFamily];

    if (!cvContent) throw new Error("Conteúdo para análise não fornecido");

    const systemPrompt = getSystemPrompt(companyName, jobFamily, weights, options);

    let userContent;
    if (cvContent?.inlineData) {
        userContent = [
            { inlineData: cvContent.inlineData },
            { text: buildUserPrompt(companyName, "ANALISE O ARQUIVO ANEXO ACIMA", jobFamily, weights, options) }
        ];
    } else if (cvContent?.type === "url") {
        userContent = [
            { fileData: { fileUri: cvContent.url, mimeType: cvContent.mimeType } },
            { text: buildUserPrompt(companyName, "ANALISE O ARQUIVO REMOTO", jobFamily, weights, options) }
        ];
    } else {
        userContent = buildUserPrompt(companyName, cvContent, jobFamily, weights, options);
    }

    const rawResult = await callGeminiStructured({
        systemPrompt,
        userContent,
        schema: SCHEMA_LIVE_RS,
        config: {
            temperature: 0.1, // Temperatura baixa para análise científica e auditável
            maxOutputTokens: 4096,
            thinkingConfig: {
                thinkingBudget: 0
            }
        }
    });

    // Enriquecimento e compatibilidade com componentes existentes
    return enrichAnalysisResult(rawResult, jobFamily, weights);
}

function getSystemPrompt(companyName, jobFamily, weights, options = {}) {
    const familyName = FAMILY_LABELS[jobFamily] || "Técnico/Especialista";

    return `SYSTEM PROMPT — Consultor de Inteligência em R&S (Live Consultoria)

0. BLOCO DE CONFIGURAÇÃO DO CLIENTE
- Cliente: ${companyName}
- Família de vaga padrão deste engajamento: ${familyName}
- Pesos do scorecard: Comportamental ${weights.comportamental}% / Técnica ${weights.tecnica}% / Prática ${weights.pratica}% / Alinhamento ${weights.alinhamento}%

1. IDENTIDADE E MISSÃO
Você é o Consultor Sênior de R&S da Live Consultoria, atuando em nome do cliente ${companyName}.
Sua missão é tornar a contratação científica, auditável e livre de viés:
- **Auditável:** toda nota precisa ser rastreável a uma evidência literal ou marcada explicitamente como inferência. Nunca apresente um número sem mostrar de onde veio.
- **Livre de viés:** toda conclusão se apoia em evidência relevante para a vaga — NUNCA em idade, gênero, aparência, estado civil ou origem. Se o material contiver dados sensíveis, ignore-os para a nota e registre em pontos de atenção.
- **Sóbrio, mas honesto:** pareceres conclusivos (RECOMENDADO / RECOMENDADO COM RESSALVAS / NÃO RECOMENDADO). "Dado insuficiente" é uma resposta válida — nunca infle confiança que a evidência não sustenta.

2. MODO 2 — MOTOR DE ANÁLISE DE CANDIDATOS
3.1 Gate check contra a vaga
Antes de pontuar qualquer coisa, confira os Requisitos Obrigatórios (eliminatórios) da vaga.
Se o candidato NÃO atende a um obrigatório, o gate_check.status DEVE ser "REPROVADO" e o motivo deve ser citado no início do parecer, independentemente do score final. Nota alta em outro critério NÃO compensa reprovação no Gate.

3.2 Dicionário de competências e pesos:
Família atual: ${familyName}
Pesos mandatários:
- Comportamental: ${weights.comportamental}%
- Técnica: ${weights.tecnica}%
- Prática / Testes: ${weights.pratica}%
- Alinhamento: ${weights.alinhamento}%
Nota de 1 a 5 para cada critério.

3.3 Regra de evidência:
- Evidência explícita no material -> cite o trecho ou o fato concreto no campo correspondente.
- Inferência razoável sem citação -> marque tipo_evidencia como 'inferencia' e indique o que faltaria confirmar.
- Sem dado suficiente -> NÃO estime nota; liste o item em 'informacoes_faltantes'.

3.4 Metodologias obrigatórias:
- **STAR:** Verifique Situação, Tarefa, Ação (o que ELE fez — cuidado com 'nós') e Resultado (número/métrica tangível).
- **SWOT:** Forças, Fraquezas (sem complacência), Oportunidades e Ameaças (riscos de turnover, conflito, desmotivação).
- **Temperamento:** Avalie heurística qualitativa (Colérico, Sanguíneo, Melancólico, Fleumático) identificando fit e riscos de atrito.

3.5 Cálculo do score (Auditável):
Fórmula obrigatória: (nota_comp × ${weights.comportamental}%) + (nota_tec × ${weights.tecnica}%) + (nota_prat × ${weights.pratica}%) + (nota_alin × ${weights.alinhamento}%) = SCORE FINAL.
Exiba a conta detalhada no campo formula_calculo.`;
}

export function buildUserPrompt(companyName, cvContent, jobFamily, weights, options = {}) {
    const { jobContext = "", jobData = null, previousAnalysis = null } = options;
    const isInterview = typeof cvContent === "string" && (
        cvContent.includes("Entrevistador:") || 
        cvContent.includes("Candidato:") || 
        cvContent.includes("Role Play") ||
        cvContent.length > 4000
    );

    let prompt = `EMPRESA CLIENTE: ${companyName}\nFAMÍLIA DA VAGA: ${FAMILY_LABELS[jobFamily] || jobFamily}\n`;
    prompt += `MODO DE ENTRADA: ${isInterview ? "TRANSCRIÇÃO DE ENTREVISTA / ROLE PLAY (Foco em coerência, escuta, STAR e coachability)" : "CURRÍCULO / PERFIL PROFISSIONAL (Foco em trajetória, hardskills e evidências concretas)"}\n\n`;

    if (jobData) {
        prompt += `### VAGA DE REFERÊNCIA (CRITÉRIOS DE CONTRATAÇÃO)\n`;
        prompt += `Título: ${jobData.title || "Vaga"}\n`;
        prompt += `Requisitos Obrigatórios (ELIMINATÓRIOS DO GATE CHECK):\n${jobData.mustHaves || jobData.requirements || "Não especificados explicitamente"}\n\n`;
        prompt += `Diferenciais Desejáveis:\n${jobData.niceToHaves || "Não especificados"}\n\n`;
        if (jobData.responsibilities) prompt += `Responsabilidades Principais:\n${jobData.responsibilities}\n\n`;
    } else if (jobContext) {
        prompt += `CONTEXTO DA VAGA / DIRETRIZES:\n${jobContext}\n\n`;
    }

    if (previousAnalysis) {
        prompt += `### HISTÓRICO DE ANÁLISE PRÉVIA DO CANDIDATO\n${JSON.stringify(previousAnalysis)}\n(Valide consistência entre o discurso anterior e atual)\n\n`;
    }

    prompt += `## CONTEÚDO PARA ANÁLISE:\n${typeof cvContent === "string" ? cvContent : "Arquivo multimodal anexado"}\n\n`;
    prompt += `INSTRUÇÃO DE SAÍDA: Gere a avaliação completa auditável conforme as regras científicas da Seção 3 do Padrão Live.`;

    return prompt;
}

function enrichAnalysisResult(result, jobFamily, weights) {
    if (!result) return result;

    // Cálculo e consistência de score se não calculado perfeitamente
    const compNota = result.scorecard?.comportamental?.nota || 3;
    const tecNota = result.scorecard?.tecnica?.nota || 3;
    const pratNota = result.scorecard?.pratica?.nota || 3;
    const alinNota = result.scorecard?.alinhamento?.nota || 3;

    const final5 = +(
        (compNota * (weights.comportamental / 100)) +
        (tecNota * (weights.tecnica / 100)) +
        (pratNota * (weights.pratica / 100)) +
        (alinNota * (weights.alinhamento / 100))
    ).toFixed(2);

    const final100 = Math.round(final5 * 20);

    // Campos de compatibilidade para a UI legada
    return {
        ...result,
        nota_geral: final5,
        consistencia_dados: result.consistencia_dados || 4,
        perfilNivel: jobFamily === "lideranca" ? "Liderança" : "Técnico",
        scorecard: {
            ...result.scorecard,
            score_final_5: final5,
            score_final_100: final100,
            formula_calculo: result.scorecard?.formula_calculo || 
                `(${compNota} × ${weights.comportamental}%) + (${tecNota} × ${weights.tecnica}%) + (${pratNota} × ${weights.pratica}%) + (${alinNota} × ${weights.alinhamento}%) = ${final5}/5 (${final100}/100)`
        },
        adherence: {
            score: final100,
            gateStatus: result.gate_check?.status || "OK",
            matchedSkills: result.competencias?.filter(c => c.nota >= 3).map(c => c.nome) || [],
            missingSkills: result.informacoes_faltantes || [],
            culturalFit: final100 >= 80 ? "alto" : (final100 >= 60 ? "médio" : "baixo"),
            recommendation: result.recomendacao
        }
    };
}


