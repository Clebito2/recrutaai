import { callGeminiStructured, uploadFileToGemini } from "../gemini-client";

const SCHEMA_TECNICO = {
    type: "object",
    properties: {
        nome: { type: "string" },
        resumo: { type: "string" },
        scorecard: {
            type: "object",
            properties: {
                dominio_hardskills: { type: "number" },
                resolucao_problemas: { type: "number" },
                qualidade_entrega: { type: "number" },
                profundidade_tecnica: { type: "number" }
            },
            required: ["dominio_hardskills", "resolucao_problemas", "qualidade_entrega", "profundidade_tecnica"]
        },
        recomendacao: { type: "string" },
        justificativa: { type: "string" },
        temperamento: { type: "string" }
    },
    required: ["nome", "resumo", "scorecard", "recomendacao", "justificativa", "temperamento"]
};

const SCHEMA_LIDERANCA = {
    type: "object",
    properties: {
        nome: { type: "string" },
        resumo: { type: "string" },
        scorecard: {
            type: "object",
            properties: {
                tomada_decisao: { type: "number" },
                gestao_conflitos: { type: "number" },
                mentoria_delegacao: { type: "number" },
                visao_estrategica: { type: "number" }
            },
            required: ["tomada_decisao", "gestao_conflitos", "mentoria_delegacao", "visao_estrategica"]
        },
        recomendacao: { type: "string" },
        justificativa: { type: "string" },
        temperamento: { type: "string" }
    },
    required: ["nome", "resumo", "scorecard", "recomendacao", "justificativa", "temperamento"]
};

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
    if (!cvContent) throw new Error("Conteúdo do CV não fornecido");

    const systemPrompt = getSystemPrompt(profileLevel);
    const schema = profileLevel === "lideranca" ? SCHEMA_LIDERANCA : SCHEMA_TECNICO;

    let userContent;
    if (cvContent?.type === "url") {
        userContent = [
            { fileData: { fileUri: cvContent.url, mimeType: cvContent.mimeType } },
            { text: buildUserPrompt(companyName, "Arquivo anexo via File API", options) }
        ];
    } else if (cvContent?.inlineData) {
        userContent = [
            { inlineData: cvContent.inlineData },
            { text: buildUserPrompt(companyName, "Conteúdo do CV anexado", options) }
        ];
    } else {
        userContent = buildUserPrompt(companyName, cvContent, options);
    }

    return await callGeminiStructured({
        systemPrompt,
        userContent,
        schema,
        config: {
            temperature: 0.2,
            maxOutputTokens: 8192
        }
    });
}

export function buildUserPrompt(companyName, cvContent, options = {}) {
    const { jobContext = "", profileLevel = "tecnico", jobData = null, previousAnalysis = null } = options;
    const baseContext = buildBaseContext(companyName, jobContext, profileLevel, jobData, previousAnalysis);
    
    return `${baseContext}\n\n## CONTEÚDO DO CV/ENTREVISTA PARA ANÁLISE:\n${typeof cvContent === "string" ? cvContent : "Ver anexo multimodal"}`;
}

function buildBaseContext(companyName, jobContext, profileLevel, jobData, previousAnalysis) {
    const profileName = profileLevel === "lideranca" ? "Liderança/Gestão" : "Técnico/Especialista";
    let context = `Empresa: ${companyName}\nPerfil Buscado: ${profileName}\n`;

    if (jobData) {
        context += `\n## VAGA DE REFERÊNCIA\nTítulo: ${jobData.title}\nModelo: ${jobData.workModel || "Não especificado"}\nRequisitos: ${jobData.requirements || "Não especificados"}\n\nIMPORTANTE: Avalie a aderência do candidato a esta vaga e calcule o score de 0-100 no campo correct adherence.\n`;
    } else if (jobContext) {
        context += `\nContexto da Vaga: ${jobContext}\n`;
    }

    if (previousAnalysis) {
        context += `\n## ANÁLISE PRÉVIA DISPONÍVEL\nO candidato já teve seu currículo analisado anteriormente. Use as informações abaixo como contexto adicional, mas foque a nova análise nos novos dados fornecidos (ex: transcrição de entrevista).\n\nAnálise Anterior: ${JSON.stringify(previousAnalysis)}\n`;
    }

    return context;
}

function getSystemPrompt(profileLevel) {
    const basePrompt = `Você é um Recrutador Tech Especialista (Nível Staff) utilizando o Protocolo Elite V6.0 da Recruit-AI.
    Sua missão é realizar uma análise profunda, crítica e imparcial.\n\n`;
    
    if (profileLevel === "lideranca") {
        return basePrompt + `FOCO: Liderança, Visão Estratégica e Gestão. Analise capacidade de tomada de decisão, mentoria e resolução de conflitos.`;
    }
    
    return basePrompt + `FOCO: Competência Técnica, Qualidade de Entrega e Hard Skills. Analise profundidade tecnológica e resolução de problemas complexos.`;
}
