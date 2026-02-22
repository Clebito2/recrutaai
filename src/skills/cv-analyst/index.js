import { callGeminiStructured } from "../gemini-client/index.js";
import { SCHEMA_TECNICO, SCHEMA_LIDERANCA } from "./schemas.js";

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
Sua missão é realizar uma análise cirúrgica, imparcial e extremamente crítica.

### CRITICAL THINKING FRAMEWORK:
1. **DIFERENCIAÇÃO DE FONTE**:
   - SE for CURRÍCULO: Procure por inconsistências em datas, tecnologias que não 'batem' e senioridade inflada.
   - SE for ENTREVISTA: Analise a 'vibe', objetividade vs. prolixidade (enrolação), e a profundidade de cada exemplo dado. Identifique contradições com o que foi alegado no CV.
2. **MÉTODO STAR RIGOROSO**: Se o candidato diz que 'melhorou o processo', mas não diz 'X para Y % em Z meses', o score de resultado deve ser baixo.
3. **SWOT SEM COMPLACÊNCIA**: Identifique fraquezas reais que podem custar caro para a empresa.
4. **INTEGRIDADE DE DADOS**: O campo 'consistencia_dados' avalia se o discurso é coerente ou se há 'venda' excessiva.

PERFIL ALVO: ${profileName}
`;

    if (profileLevel === "lideranca") {
        prompt += `\nFOCO ADICIONAL: Avalie capacidade de tomada de decisão, gestão de conflitos, mentoria de times e visão estratégica. Em entrevistas, procure por humildade vs. arrogância.`;
    } else {
        prompt += `\nFOCO ADICIONAL: Avalie profundidade técnica real, domínio de hardskills, qualidade de entrega e capacidade de resolver problemas complexos.`;
    }

    if (isAdherenceCheck) {
        prompt += `\n\n### VERIFICAÇÃO DE ADERÊNCIA:
Compare o candidato estritamente com os requisitos da vaga. Calcule o score de 0 a 100 com base no match real.`;
    }

    return prompt;
}

export function buildUserPrompt(companyName, cvContent, options = {}) {
    const { jobContext = "", profileLevel = "tecnico", jobData = null, previousAnalysis = null } = options;
    const isInterview = typeof cvContent === "string" && (cvContent.includes("Entrevistador") || cvContent.includes("Candidato") || cvContent.length > 5000);

    const baseContext = buildBaseContext(companyName, jobContext, profileLevel, jobData, previousAnalysis, isInterview);

    return `${baseContext}\n\n## CONTEÚDO PARA ANÁLISE (${isInterview ? "TRANSCRIÇÃO DE ENTREVISTA" : "CURRÍCULO/PERFIL"}):\n${typeof cvContent === "string" ? cvContent : "Conteúdo multimodal anexado"}`;
}

function buildBaseContext(companyName, jobContext, profileLevel, jobData, previousAnalysis, isInterview) {
    const profileName = profileLevel === "lideranca" ? "Liderança/Gestão" : "Técnico/Especialista";
    let context = `EMPRESA: ${companyName}\nPERFIL SOLICITADO: ${profileName}\nMODO: ${isInterview ? "ANÁLISE DE ENTREVISTA (FOCO EM COMPORTAMENTO E CONSISTÊNCIA)" : "ANÁLISE DE CURRÍCULO (FOCO EM COMPETÊNCIAS E TRAJETÓRIA)"}\n`;

    if (jobData) {
        context += `\n### VAGA DE REFERÊNCIA
Título: ${jobData.title}
Requisitos: ${jobData.requirements || "Não informados"}
Responsabilidades: ${jobData.responsibilities || "Não informadas"}
`;
    } else if (jobContext) {
        context += `\nCONTEXTO ADICIONAL: ${jobContext}\n`;
    }

    if (previousAnalysis) {
        context += `\n### HISTÓRICO DO CANDIDATO
Use o histórico para validar a consistência do discurso atual.
Histórico: ${JSON.stringify(previousAnalysis)}
`;
    }

    return context;
}

