/**
 * Job Architect Skill - Mode 1
 * Generates strategic job advertisements for LinkedIn
 */

import { callGemini, removeEmojis } from '../gemini-client/index.js';

/**
 * System prompt for job generation
 */
export const SYSTEM_PROMPT = `Você é um Consultor Sênior de Recrutamento e Seleção do Protocolo Elite V6.0.
Sua missão é gerar anúncios de vagas que atraiam o 'A-Player' e afastem o candidato errado.

REGRAS DE COPYWRITING (AIDA):
1. **ATTENTION (HOOK)**: Comece com uma frase que doa na ferida ou que desperte um desejo imediato.
2. **INTEREST**: Conecte o desafio da vaga com a cultura e o momento da empresa.
3. **DESIRE**: Use verbos de ação e descreva o futuro do candidato na empresa.
4. **ACTION (CTA)**: Comando claro e direto de como se candidatar.

DIRETRIZES DO PROTOCOLO ELITE:
- **REJEIÇÃO ALTERNATIVA**: Inclua uma seção "ESTA VAGA NÃO É PARA VOCÊ SE:" identificando comportamentos ou faltas de habilidades que não toleramos.
- **LINGUAGEM ARQUETÍPICA**: Use o tom de voz correto para o perfil (Hunter vs. Farmer, etc).
- **SEM CLICHÊS**: Proibido "procuramos profissional dinâmico", "empresa líder de mercado" (sem provas), etc.

ESTRUTURA OBRIGATÓRIA:
1. [NOME DA VAGA] + HOOK
2. SOBRE O DESAFIO
3. RESPONSABILIDADES (Specific Action Verbs)
4. REQUISITOS (Must-haves)
5. ESTA VAGA NÃO É PARA QUEM: (Rejeição Alternativa)
6. O QUE OFERECEMOS (Benefícios/Impacto)
7. CALL TO ACTION`;

/**
 * Get system prompt for job generation
 */
export function getSystemPrompt() {
    return SYSTEM_PROMPT;
}

/**
 * Profile type descriptions
 */
const PROFILE_MAP = {
    'hunter': 'Hunter (agressividade comercial, foco em abertura, prospecção e vendas)',
    'farmer': 'Farmer (relacionamento, gestão de carteira, manutenção e LTV)',
    'tecnico': 'Técnico/Especialista (profundidade técnica, execução, qualidade de entrega)',
    'lideranca': 'Liderança/Gestão (gestão de KPIs, desenvolvimento de pessoas, estratégia)'
};

/**
 * Motivator descriptions
 */
const MOTIVATORS = {
    'a': 'Ambição Financeira (comissões, bônus, ganho variável)',
    'b': 'Competição e Desafio (superar metas, ser o #1)',
    'c': 'Estabilidade e Propósito (segurança, carreira longa, missão)'
};

/**
 * Build user prompt for job generation
 * 
 * @param {string} companyName
 * @param {object} data - Diagnostic data from form
 * @returns {string}
 */
export function buildUserPrompt(companyName, data) {
    const profileDescription = PROFILE_MAP[data.profileType] || PROFILE_MAP['hunter'];
    const isLeadership = data.profileType === 'lideranca';

    return `
EMPRESA CLIENTE: ${companyName}

DIAGNÓSTICO DA VAGA:
- Título: ${data.title}
- Arquetipo Mental: ${profileDescription}
- Motivador Principal: ${MOTIVATORS[data.motivator] || 'Não especificado'}
- Modelo de Trabalho: ${data.workModel}
- Faixa Salarial: ${data.salary || 'A combinar'}

REQUISITOS OBRIGATÓRIOS(eliminatórios):
${data.mustHaves || 'Não especificados'}

DIFERENCIAIS DESEJÁVEIS:
${data.niceToHaves || 'Não especificados'}

BENEFÍCIOS:
${data.benefits || 'Não especificados'}

Gere o anúncio completo seguindo a estrutura obrigatória e as regras do Protocolo Elite V6.0:
1. Adapte totalmente o tom para o arquétipo: ${profileDescription}
2. As RESPONSABILIDADES devem ser específicas para nível ${isLeadership ? 'LIDERANÇA (verbos: gerir, liderar, desenvolver)' : 'EXECUÇÃO (verbos: executar, operar, criar)'}.
3. Foque no motivador ${MOTIVATORS[data.motivator]?.split(' ')[0] || 'identificado'}.`;
}

/**
 * Validate input data for job generation
 * 
 * @param {object} data
 * @throws {Error} if validation fails
 */
export function validateInput(data) {
    if (!data) {
        throw new Error("Dados do diagnóstico não fornecidos");
    }

    if (!data.title || data.title.trim().length < 3) {
        throw new Error("Título da vaga inválido");
    }

    const validProfiles = ['hunter', 'farmer', 'tecnico', 'lideranca'];
    if (!validProfiles.includes(data.profileType)) {
        throw new Error("Tipo de perfil inválido");
    }
}

/**
 * Generate a job advertisement
 * 
 * @param {string} companyName
 * @param {object} diagnosticData
 * @returns {Promise<string>} Generated job text
 */
export async function generateJobAd(companyName, diagnosticData) {
    validateInput(diagnosticData);

    const userPrompt = buildUserPrompt(companyName, diagnosticData);

    const result = await callGemini({
        systemPrompt: SYSTEM_PROMPT,
        userContent: userPrompt,
        config: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096
        }
    });

    // Clean emojis from output
    return removeEmojis(result);
}
