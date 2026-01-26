/**
 * AI Service - Recruit-AI (Protocolo Elite V6.0)
 * Handles all LLM interactions for job generation and candidate analysis
 * With differentiated competencies for Technical vs Leadership profiles
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// System prompts for different modes
const SYSTEM_PROMPTS = {
    mode1_architect: `Você é um Consultor Sênior de Recrutamento e Seleção do Protocolo Elite V6.0.

REGRAS ABSOLUTAS:
1. PROIBIDO usar emojis em qualquer circunstância
2. Tom corporativo, profissional e direto
3. Sem linguagem informal ou coloquial
4. Foco em atrair o perfil correto, não em quantidade

ESTRUTURA OBRIGATÓRIA DO ANÚNCIO:
1. TÍTULO DA VAGA (claro e objetivo)
2. SOBRE A EMPRESA (2-3 frases sobre cultura e missão)
3. O DESAFIO (o que a pessoa vai fazer no dia a dia)
4. RESPONSABILIDADES PRINCIPAIS (adaptadas ao nível de atuação)
5. REQUISITOS OBRIGATÓRIOS (bullets claros)
6. DIFERENCIAIS (nice to have)
7. O QUE OFERECEMOS (benefícios e cultura)
8. DIVERSIDADE (declaração de inclusão)

ADAPTAÇÃO POR NÍVEL DE ATUAÇÃO:
- LIDERANÇA: Responsabilidades devem usar verbos como: Disseminar, Treinar, Auditar, Planejar, Reportar, Gerir, Desenvolver equipe
- TÉCNICO: Responsabilidades devem usar verbos como: Executar, Analisar, Solucionar, Operar, Implementar, Documentar

Use linguagem que ressoe com o perfil identificado (Hunter vs Farmer, Técnico vs Liderança).`,

    mode2_analyst_tecnico: `Você é um Analista de Perfil Senior do Protocolo Elite V6.0 - MODO PERFIL TÉCNICO.

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
  "recomendacao": "Aprovado/Reprovado/Aprofundar",
  "justificativa": "Razão detalhada da recomendação"
}`,

    mode2_analyst_lideranca: `Você é um Analista de Perfil Senior do Protocolo Elite V6.0 - MODO PERFIL LIDERANÇA.

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
  "recomendacao": "Aprovado/Reprovado/Aprofundar",
  "justificativa": "Razão detalhada da recomendação"
}`
};

/**
 * Generate job advertisement using Mode 1 (Architect)
 */
export async function generateJobAd(companyName, diagnosticData) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("--- DEBUG AI SERVICE ---");
    console.log("API Key configurada?", apiKey ? "SIM (Começa com " + apiKey.substring(0, 5) + "...)" : "NÃO (Undefined/Empty)");

    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is missing in process.env");
        throw new Error("GEMINI_API_KEY não configurada no servidor (Verifique .env.local ou Variáveis de Ambiente do Deploy)");
    }

    const userPrompt = buildJobPrompt(companyName, diagnosticData);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: SYSTEM_PROMPTS.mode1_architect },
                        { text: userPrompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("--- GEMINI API ERROR ---");
        console.error("Status:", response.status);
        console.error("Error Detail:", JSON.stringify(error, null, 2));

        if (response.status === 400 && error.error?.status === 'INVALID_ARGUMENT') {
            throw new Error("Chave de API inválida ou rejeitada pelo Google. (Verifique se a chave está ativa)");
        }
        throw new Error(error.error?.message || "Erro na API Gemini");
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
        throw new Error("Resposta vazia da IA");
    }

    // Validate: no emojis allowed
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const cleanedText = generatedText.replace(emojiRegex, "");

    return cleanedText;
}

/**
 * Analyze candidate profile using Mode 2 (Analyst)
 * Now with differentiated analysis for Técnico vs Liderança
 */
export async function analyzeCandidate(companyName, cvContent, jobContext, profileLevel = 'tecnico') {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada");
    }

    // Select appropriate prompt based on profile level
    const systemPrompt = profileLevel === 'lideranca'
        ? SYSTEM_PROMPTS.mode2_analyst_lideranca
        : SYSTEM_PROMPTS.mode2_analyst_tecnico;

    const profileName = profileLevel === 'lideranca' ? 'Liderança/Gestão' : 'Técnico/Especialista';

    const userPrompt = `
Empresa: ${companyName}
Contexto da Vaga: ${jobContext || "Não especificado"}
Perfil Buscado: ${profileName}

CURRÍCULO/TRANSCRIÇÃO DO CANDIDATO:
${cvContent}

Analise este candidato seguindo a metodologia STAR adaptada para perfil ${profileName} e SWOT. Retorne APENAS o JSON estruturado conforme especificado.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        { text: userPrompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.3,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 4096,
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro na API Gemini");
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
        throw new Error("Resposta vazia da IA");
    }

    // Try to parse JSON from response
    try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
    }

    return { raw: generatedText };
}

/**
 * Build the prompt for job generation based on diagnostic data
 * Now with profile level differentiation
 */
function buildJobPrompt(companyName, data) {
    const profileMap = {
        'hunter': 'Hunter (agressividade comercial, foco em abertura, prospecção e vendas)',
        'farmer': 'Farmer (relacionamento, gestão de carteira, manutenção e LTV)',
        'tecnico': 'Técnico/Especialista (profundidade técnica, execução, qualidade de entrega)',
        'lideranca': 'Liderança/Gestão (gestão de KPIs, desenvolvimento de pessoas, estratégia)'
    };

    const motivators = {
        'a': 'Ambição Financeira (comissões, bônus, ganho variável)',
        'b': 'Competição e Desafio (superar metas, ser o #1)',
        'c': 'Estabilidade e Propósito (segurança, carreira longa, missão)'
    };

    const profileDescription = profileMap[data.profileType] || profileMap['hunter'];
    const isLeadership = data.profileType === 'lideranca';
    const isTechnical = data.profileType === 'tecnico';

    return `
EMPRESA CLIENTE: ${companyName}

DIAGNÓSTICO DA VAGA:
- Título: ${data.title}
- Arquetipo Mental: ${profileDescription}
- Motivador Principal: ${motivators[data.motivator] || 'Não especificado'}
- Modelo de Trabalho: ${data.workModel}
- Faixa Salarial: ${data.salary || 'A combinar'}

REQUISITOS OBRIGATÓRIOS (eliminatórios):
${data.mustHaves || 'Não especificados'}

DIFERENCIAIS DESEJÁVEIS:
${data.niceToHaves || 'Não especificados'}

BENEFÍCIOS:
${data.benefits || 'Não especificados'}

Gere o anúncio completo seguindo a estrutura obrigatória e as regras do Protocolo Elite V6.0:
1. Adapte totalmente o tom para o arquétipo: ${profileDescription}
2. As RESPONSABILIDADES devem ser específicas para nível ${isLeadership ? 'LIDERANÇA (verbos: gerir, liderar, desenvolver)' : 'EXECUÇÃO (verbos: executar, operar, criar)'}.
3. Foque no motivador ${motivators[data.motivator]?.split(' ')[0] || 'identificado'}.`;
}
// Force Deploy Fix: 2026-01-26_0105
