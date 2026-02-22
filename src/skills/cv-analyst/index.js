import { callGeminiStructured } from "../gemini-client";
import { SCHEMA_TECNICO, SCHEMA_LIDERANCA } from "./schemas";

/**
 * Perform candidate analysis using Protocolo Elite V6.0
 * Supports text, PDF (multimodal) and Audio (multimodal)
 * 
 * @param {string} companyName 
 * @param {object|string} cvContent - Text string OR { inlineData: { mimeType, data } }
 * @param {object} options - { jobContext, profileLevel, jobData, previousAnalysis }
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

    const { profileLevel = "tecnico" } = options;
    if (!cvContent) throw new Error("Conteúdo para análise não fornecido");

    const systemPrompt = getSystemPrompt(profileLevel, options);
    const schema = profileLevel === "lideranca" ? SCHEMA_LIDERANCA : SCHEMA_TECNICO;

    let userContent;
    if (cvContent?.inlineData) {
        // Optimized multimodal structure: File FIRST, then textual instructions
        userContent = [
            { inlineData: cvContent.inlineData },
            { text: buildUserPrompt(companyName, "ANALISE O ARQUIVO ANEXO ACIMA", options) }
        ];
    } else if (cvContent?.type === "url") {
        userContent = [
            { fileData: { fileUri: cvContent.url, mimeType: cvContent.mimeType } },
            { text: buildUserPrompt(companyName, "ANALISE O ARQUIVO REMOTO", options) }
        ];
    } else {
        userContent = buildUserPrompt(companyName, cvContent, options);
    }

    return await callGeminiStructured({
        systemPrompt,
        userContent,
        schema,
        config: {
            temperature: 0.1, // Lower temperature for more objective analysis
            maxOutputTokens: 8192
        }
    });
}

function getSystemPrompt(profileLevel, options = {}) {
    const isAdherenceCheck = !!options.jobData;
    const profileName = profileLevel === "lideranca" ? "LIDERANÇA E GESTÃO" : "TÉCNICO / ESPECIALISTA";

    let prompt = `VOCÊ É UM RECRUTADOR TECH ELITE (NÍVEL STAFF) - PROTOCOLO V6.0.
Sua missão é realizar uma análise cirúrgica, imparcial e extremamente crítica de currículos ou transcrições.

### DIRETRIZES DE OURO:
1. NÃO SEJA CONDIVENTE: Identifique lacunas reais. Se o candidato não souber X, diga claramente.
2. MÉTODO STAR: Extraia evidências reais de Situação, Tarefa, Ação e Resultado.
3. SWOT ANALÍTICO: Identifique Forças, Fraquezas, Oportunidades e Ameaças.
4. SCORECARD: Avalie de 1 a 5 com base em evidências, não em promessas.

PERFIL ALVO: ${profileName}
`;

    if (profileLevel === "lideranca") {
        prompt += `\nFOCO ADICIONAL: Avalie capacidade de tomada de decisão sob pressão, gestão de conflitos, mentoria de times e visão estratégica de negócio.`;
    } else {
        prompt += `\nFOCO ADICIONAL: Avalie profundidade arquitetural, domínio de hardskills, qualidade de código/entrega e capacidade de resolução de problemas complexos.`;
    }

    if (isAdherenceCheck) {
        prompt += `\n\n### VERIFICAÇÃO DE ADERÊNCIA:
Compare o candidato estritamente com os requisitos da vaga fornecidos. Calcule o score de 0 a 100 com base no match real de habilidades e cultura.`;
    }

    return prompt;
}

export function buildUserPrompt(companyName, cvContent, options = {}) {
    const { jobContext = "", profileLevel = "tecnico", jobData = null, previousAnalysis = null } = options;
    const baseContext = buildBaseContext(companyName, jobContext, profileLevel, jobData, previousAnalysis);

    return `${baseContext}\n\n## CONTEÚDO PARA ANÁLISE:\n${typeof cvContent === "string" ? cvContent : "Conteúdo multimodal anexado"}`;
}

function buildBaseContext(companyName, jobContext, profileLevel, jobData, previousAnalysis) {
    const profileName = profileLevel === "lideranca" ? "Liderança/Gestão" : "Técnico/Especialista";
    let context = `EMPRESA: ${companyName}\nPERFIL SOLICITADO: ${profileName}\n`;

    if (jobData) {
        context += `\n### VAGA DE REFERÊNCIA (CALCULAR ADERÊNCIA)
Título: ${jobData.title}
Requisitos: ${jobData.requirements || "Não informados"}
Responsabilidades: ${jobData.responsibilities || "Não informadas"}
`;
    } else if (jobContext) {
        context += `\nCONTEXTO ADICIONAL: ${jobContext}\n`;
    }

    if (previousAnalysis) {
        context += `\n### HISTÓRICO DO CANDIDATO (CONTEXTO)
Houve uma análise prévia. Use-a apenas para comparar evolução ou evitar repetições, mas Priorize os novos dados fornecidos.
Histórico: ${JSON.stringify(previousAnalysis)}
`;
    }

    return context;
}

