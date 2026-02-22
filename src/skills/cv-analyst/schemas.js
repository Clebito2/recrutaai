/**
 * JSON Schemas for Candidate Analysis
 * Based on Protocolo Elite V6.0
 */

const metaSchemaAttributes = {
    nome: { type: "string", description: "Nome completo do candidato" },
    resumo: { type: "string", description: "Resumo executivo de 2-3 linhas focado em impacto e senioridade" },
    perfilNivel: { type: "string", enum: ["Técnico", "Liderança"] },
    nota_geral: { type: "number", description: "Score de 1 a 5 baseado no match com o perfil", minimum: 1, maximum: 5 },
    consistencia_dados: { type: "number", description: "Score de 1 a 5 de consistência entre currículo e entrevista (ou claims internos)", minimum: 1, maximum: 5 },
    temperamento: { type: "string", description: "Análise baseada em arquétipos (DISC ou temperamentos clássicos: Colérico, Sanguíneo, Fleumático, Melancólico)" },
    star_analysis: {
        type: "array",
        description: "Análise baseada no método STAR. EXIJA dados quantitativos (%, R$, prazos).",
        items: {
            type: "object",
            properties: {
                situacao: { type: "string" },
                tarefa: { type: "string" },
                acao: { type: "string" },
                resultado: { type: "string", description: "DEVE conter métricas ou resultados tangíveis." }
            },
            required: ["situacao", "tarefa", "acao", "resultado"]
        }
    },
    swot: {
        type: "object",
        description: "Análise SWOT estratégica",
        properties: {
            forcas: { type: "array", items: { type: "string" } },
            fraquezas: { type: "array", items: { type: "string" }, description: "Seja brutalmente honesto sobre as lacunas técnicas ou comportamentais." },
            oportunidades: { type: "array", items: { type: "string" } },
            ameacas: { type: "array", items: { type: "string" }, description: "Riscos de turnover, falta de fit cultural ou obsolescência técnica." }
        },
        required: ["forcas", "fraquezas", "oportunidades", "ameacas"]
    },
    red_flags: {
        type: "array",
        items: { type: "string" },
        description: "Sinais de alerta: contradições, falta de clareza, 'enrolação' em temas técnicos ou comportamentais."
    },
    adherence: {
        type: "object",
        description: "Aderência à vaga (Calculada se jobData estiver presente)",
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
    justificativa: { type: "string", description: "Mínimo 300 caracteres de justificativa técnica e comportamental densa." }
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
                profundidade_tecnica: { type: "number", minimum: 1, maximum: 5 },
                comunicacao_influencia: { type: "number", minimum: 1, maximum: 5 }
            },
            required: ["dominio_hardskills", "resolucao_problemas", "qualidade_entrega", "profundidade_tecnica", "comunicacao_influencia"]
        }
    },
    required: ["nome", "resumo", "perfilNivel", "scorecard", "nota_geral", "consistencia_dados", "temperamento", "star_analysis", "swot", "red_flags", "recomendacao", "justificativa"]
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
                visao_estrategica: { type: "number", minimum: 1, maximum: 5 },
                comunicacao_influencia: { type: "number", minimum: 1, maximum: 5 }
            },
            required: ["tomada_decisao", "gestao_conflitos", "mentoria_delegacao", "visao_estrategica", "comunicacao_influencia"]
        }
    },
    required: ["nome", "resumo", "perfilNivel", "scorecard", "nota_geral", "consistencia_dados", "temperamento", "star_analysis", "swot", "red_flags", "recomendacao", "justificativa"]
};
