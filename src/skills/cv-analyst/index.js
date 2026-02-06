/**
 * CV Analyst Skill - Mode 2
 * Analyzes candidates using STAR methodology and SWOT matrix
 * Supports both Technical and Leadership profiles
 */

import { callGemini, parseJsonResponse } from '../gemini-client';

/**
 * System prompt for Technical profile analysis
 */
const PROMPT_TECNICO = `Você é um Analista de Perfil Senior do Protocolo Elite V6.0 - MODO PERFIL TÉCNICO.

METODOLOGIA STAR para TÉCNICOS:
- Na análise do "R" (Resultado), busque:
  * Qual foi o ganho de eficiência técnica (ex: redução de tempo de execução em X%)?
  * Houve economia de recursos ou mitigação de erros graves?
  * Métricas quantificáveis de entrega individual

COMPETÊNCIAS ESPECÍFICAS PARA PERFIL TÉCNICO (Peso 30%):
1. Domínio de Hard Skills: Proficiência nas ferramentas e métodos específicos
2. Resolução de Problemas: Velocidade e precisão técnica no diagnóstico
3. Qualidade de Entrega: Atenção aos detalhes e conformidade técnica
4. Profundidade Técnica: Domínio especializado na área

TEMPERAMENTOS TÉCNICOS:
- Melancólico: O "Ouro" da execução técnica; precisão absoluta
- Fleumático: Excelente para suporte e manutenção de sistemas estáveis

OUTPUT OBRIGATÓRIO (JSON):
{
  "nome": "Nome do Candidato",
  "resumo": "Síntese de 2-3 linhas",
  "perfilNivel": "Técnico",
  "scorecard": {
    "dominio_hardskills": 1-5,
    "resolucao_problemas": 1-5,
    "qualidade_entrega": 1-5,
    "profundidade_tecnica": 1-5
  },
  "nota_geral": 1-5,
  "temperamento": "Tipo predominante e análise",
  "star_analysis": [{"situacao":"...","tarefa":"...","acao":"...","resultado":"..."}],
  "swot": {"forcas":[],"fraquezas":[],"oportunidades":[],"ameacas":[]},
  "adherence": {
    "score": 0-100,
    "matchedSkills": ["lista de habilidades que o candidato possui e a vaga requer"],
    "missingSkills": ["lista de habilidades que a vaga requer mas o candidato não demonstra"],
    "culturalFit": "alto|médio|baixo",
    "recommendation": "Texto explicando o fit geral"
  } | null,
  "recomendacao": "Aprovado/Reprovado/Aprofundar",
  "justificativa": "Razão detalhada da recomendação"
}

NOTA: O campo "adherence" deve ser null se nenhuma vaga específica foi fornecida. Se uma vaga foi fornecida, calcule o score de aderência baseado em:
- Match de hard skills (40%)
- Experiência relevante (30%)
- Fit cultural e motivacional (30%)`;

/**
 * System prompt for Leadership profile analysis
 */
const PROMPT_LIDERANCA = `Você é um Analista de Perfil Senior do Protocolo Elite V6.0 - MODO PERFIL LIDERANÇA.

METODOLOGIA STAR para LÍDERES:
- Na análise do "R" (Resultado), busque RESULTADOS DE EQUIPE:
  * O resultado foi uma melhoria no processo ou no faturamento do setor?
  * Houve diminuição de Turnover ou aumento de produtividade do time?
  * RED FLAG: Se o líder fala apenas "Eu fiz" sem mencionar equipe = centralização

COMPETÊNCIAS ESPECÍFICAS PARA PERFIL LIDERANÇA (Peso 30%):
1. Tomada de Decisão: Capacidade de decidir sob pressão e assumir riscos
2. Gestão de Conflitos: Habilidade em mediar crises e manter o clima organizacional
3. Mentoria/Delegar: Capacidade de desenvolver o time e não centralizar tarefas
4. Visão Estratégica: Alinhamento com objetivos macro da organização

TEMPERAMENTOS DE LIDERANÇA:
- Colérico: Excelente para turnarounds (empresas em crise), mas risco de clima pesado
- Sanguíneo: Excelente para engajamento e cultura, mas risco de falta de processos

OUTPUT OBRIGATÓRIO (JSON):
{
  "nome": "Nome do Candidato",
  "resumo": "Síntese de 2-3 linhas",
  "perfilNivel": "Liderança",
  "scorecard": {
    "tomada_decisao": 1-5,
    "gestao_conflitos": 1-5,
    "mentoria_delegacao": 1-5,
    "visao_estrategica": 1-5
  },
  "nota_geral": 1-5,
  "temperamento": "Tipo predominante e análise",
  "star_analysis": [{"situacao":"...","tarefa":"...","acao":"...","resultado":"..."}],
  "swot": {"forcas":[],"fraquezas":[],"oportunidades":[],"ameacas":[]},
  "red_flags": ["Lista de alertas se houver centralização ou problemas"],
  "adherence": {
    "score": 0-100,
    "matchedSkills": ["lista de competências de liderança que o candidato possui e a vaga requer"],
    "missingSkills": ["lista de competências que a vaga requer mas o candidato não demonstra"],
    "culturalFit": "alto|médio|baixo",
    "recommendation": "Texto explicando o fit geral para a posição de liderança"
  } | null,
  "recomendacao": "Aprovado/Reprovado/Aprofundar",
  "justificativa": "Razão detalhada da recomendação"
}

NOTA: O campo "adherence" deve ser null se nenhuma vaga específica foi fornecida. Se uma vaga foi fornecida, calcule o score de aderência baseado em:
- Match de competências de liderança (40%)
- Experiência em contextos similares (30%)
- Fit de temperamento e estilo de gestão (30%)`;

/**
 * Get appropriate system prompt based on profile level
 * 
 * @param {'tecnico' | 'lideranca'} profileLevel
 * @returns {string}
 */
export function getSystemPrompt(profileLevel) {
    return profileLevel === 'lideranca' ? PROMPT_LIDERANCA : PROMPT_TECNICO;
}

/**
 * Build user prompt for candidate analysis
 * 
 * @param {string} companyName
 * @param {string|object} cvContent - Text or { inlineData: {...} }
 * @param {string} jobContext
 * @param {string} profileLevel
 * @returns {string|array}
 */
export function buildUserPrompt(companyName, cvContent, jobContext, profileLevel, jobData = null) {
    const profileName = profileLevel === 'lideranca' ? 'Liderança/Gestão' : 'Técnico/Especialista';

    let basePrompt = `
Empresa: ${companyName}
Perfil Buscado: ${profileName}
`;

    // Add job context if provided
    if (jobData) {
        basePrompt += `
## VAGA DE REFERÊNCIA
Título: ${jobData.title}
Modelo: ${jobData.workModel || 'Não especificado'}
Arquétipo: ${jobData.archetype || 'Não especificado'}
Requisitos: ${jobData.requirements || 'Não especificados'}

IMPORTANTE: Avalie a aderência do candidato a esta vaga específica e preencha o campo "adherence" com score de 0-100.
`;
    } else if (jobContext) {
        basePrompt += `
Contexto da Vaga: ${jobContext}
`;
    }

    basePrompt += `
`;

    // If string content (text), return as single prompt
    if (typeof cvContent === 'string') {
        return basePrompt + `CURRÍCULO/TRANSCRIÇÃO DO CANDIDATO:
${cvContent}

Analise este candidato seguindo a metodologia STAR adaptada para perfil ${profileName} e SWOT. Retorne APENAS o JSON estruturado conforme especificado.`;
    }

    // If object with inlineData (PDF), return parts array for multimodal
    if (cvContent && cvContent.inlineData) {
        return [
            {
                inlineData: {
                    mimeType: cvContent.inlineData.mimeType,
                    data: cvContent.inlineData.data
                }
            },
            {
                text: basePrompt + `Analise o currículo em anexo (PDF).

Analise este candidato seguindo a metodologia STAR adaptada para perfil ${profileName} e SWOT. Retorne APENAS o JSON estruturado conforme especificado.`
            }
        ];
    }

    throw new Error("Formato de CV inválido");
}

/**
 * Analyze a candidate profile
 * 
 * @param {string} companyName
 * @param {string|object} cvContent
 * @param {object} options
 * @param {string} options.jobContext
 * @param {string} options.profileLevel - 'tecnico' or 'lideranca'
 * @returns {Promise<object>} Analysis result
 */
export async function analyzeCandidate(companyName, cvContent, options = {}) {
    const { jobContext = '', profileLevel = 'tecnico', jobData = null } = options;

    if (!cvContent) {
        throw new Error("Conteúdo do CV não fornecido");
    }

    const systemPrompt = getSystemPrompt(profileLevel);
    const userContent = buildUserPrompt(companyName, cvContent, jobContext, profileLevel, jobData);

    const result = await callGemini({
        systemPrompt,
        userContent,
        config: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 8192
        }
    });

    // Try to parse JSON from response
    const parsed = parseJsonResponse(result);

    if (parsed) {
        return parsed;
    }

    // Return raw text if parsing fails
    return { raw: result };
}
