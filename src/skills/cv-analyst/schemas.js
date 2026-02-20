/**
 * JSON Schemas for Candidate Analysis
 * Based on Protocolo Elite V6.0
 */

const metaSchemaAttributes = {
    nome: { type: "string", description: "Nome completo do candidato" },
    resumo: { type: "string", description: "Resumo de 2-3 linhas da análise" },
    perfilNivel: { type: "string", enum: ["Técnico", "Liderança"] },
    nota_geral: { type: "number", description: "Score de 1 a 5", minimum: 1, maximum: 5 },
    temperamento: { type: "string", description: "Tipo predominante e breve análise" },
    star_analysis: {
        type: "array",
        items: {
            type: "object",
            properties: {
                situacao: { type: "string" },
                tarefa: { type: "string" },
                acao: { type: "string" },
                resultado: { type: "string" }
            },
            required: ["situacao", "tarefa", "acao", "resultado"]
        }
    },
    swot: {
        type: "object",
        properties: {
            forcas: { type: "array", items: { type: "string" } },
            fraquezas: { type: "array", items: { type: "string" } },
            oportunidades: { type: "array", items: { type: "string" } },
            ameacas: { type: "array", items: { type: "string" } }
        },
        required: ["forcas", "fraquezas", "oportunidades", "ameacas"]
    },
    adherence: {
        type: "object",
        nullable: true,
        properties: {
            score: { type: "number", minimum: 0, maximum: 100 },
            matchedSkills: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            culturalFit: { type: "string", enum: ["alto", "médio", "baixo"] },
            recommendation: { type: "string" }
        },
        required: ["score", "matchedSkills", "missingSkills", "culturalFit", "recommendation"]
    },
    recomendacao: { type: "string", enum: ["Aprovado", "Reprovado", "Aprofundar"] },
    justificativa: { type: "string", description: "Explicação detalhada da recomendação" }
};

export const SCHEMA_TECNICO = {
    type: "object",
    properties: {
        ...metaSchemaAttributes,
        scorecard: {
            type: "object",
            properties: {
                dominio_hardskills: { type: "number", minimum: 1, maximum: 5 },
                resolucao_problemas: { type: "number", minimum: 1, maximum: 5 },
                qualidade_entrega: { type: "number", minimum: 1, maximum: 5 },
                profundidade_tecnica: { type: "number", minimum: 1, maximum: 5 }
            },
            required: ["dominio_hardskills", "resolucao_problemas", "qualidade_entrega", "profundidade_tecnica"]
        }
    },
    required: ["nome", "resumo", "perfilNivel", "scorecard", "nota_geral", "temperamento", "star_analysis", "swot", "recomendacao", "justificativa"]
};

export const SCHEMA_LIDERANCA = {
    type: "object",
    properties: {
        ...metaSchemaAttributes,
        scorecard: {
            type: "object",
            properties: {
                tomada_decisao: { type: "number", minimum: 1, maximum: 5 },
                gestao_conflitos: { type: "number", minimum: 1, maximum: 5 },
                mentoria_delegacao: { type: "number", minimum: 1, maximum: 5 },
                visao_estrategica: { type: "number", minimum: 1, maximum: 5 }
            },
            required: ["tomada_decisao", "gestao_conflitos", "mentoria_delegacao", "visao_estrategica"]
        },
        red_flags: { type: "array", items: { type: "string" } }
    },
    required: ["nome", "resumo", "perfilNivel", "scorecard", "nota_geral", "temperamento", "star_analysis", "swot", "recomendacao", "justificativa"]
};
