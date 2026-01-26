/**
 * AI Service - Recruit-AI
 * Handles all LLM interactions for job generation and candidate analysis
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// System prompts for different modes
const SYSTEM_PROMPTS = {
    mode1_architect: `Você é um Consultor Sênior de Recrutamento e Seleção especializado em criar anúncios de vagas estratégicos.

REGRAS ABSOLUTAS:
1. PROIBIDO usar emojis em qualquer circunstância
2. Tom corporativo, profissional e direto
3. Sem linguagem informal ou coloquial
4. Foco em atrair o perfil correto, não em quantidade

ESTRUTURA OBRIGATÓRIA DO ANÚNCIO:
1. TÍTULO DA VAGA (claro e objetivo)
2. SOBRE A EMPRESA (2-3 frases sobre cultura e missão)
3. O DESAFIO (o que a pessoa vai fazer no dia a dia)
4. REQUISITOS OBRIGATÓRIOS (bullets claros)
5. DIFERENCIAIS (nice to have)
6. O QUE OFERECEMOS (benefícios e cultura)
7. DIVERSIDADE (declaração de inclusão)

Use linguagem que ressoe com o perfil identificado (Hunter vs Farmer, motivadores).`,

    mode2_analyst: `Você é um Analista de Perfil especializado em avaliação comportamental e técnica de candidatos.

METODOLOGIA:
1. Análise STAR (Situação, Tarefa, Ação, Resultado) para cada experiência relevante
2. Matriz SWOT do candidato (Forças, Fraquezas, Oportunidades, Ameaças)
3. Identificação de Temperamento (Analítico, Expressivo, Condutor, Amigável)

OUTPUT ESTRUTURADO (JSON):
{
  "nome": "Nome do Candidato",
  "resumo": "Síntese de 2-3 linhas",
  "scorecard": {
    "comportamental": 1-5,
    "tecnico": 1-5,
    "comunicacao": 1-5,
    "alinhamento": 1-5
  },
  "temperamento": "Tipo predominante",
  "star_analysis": [...],
  "swot": {...},
  "recomendacao": "Aprovado/Reprovado/Mais análise",
  "justificativa": "Razão da recomendação"
}`
};

/**
 * Generate job advertisement using Mode 1 (Architect)
 */
export async function generateJobAd(companyName, diagnosticData) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada");
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
 */
export async function analyzeCandidate(companyName, cvContent, jobContext) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada");
    }

    const userPrompt = `
Empresa: ${companyName}
Contexto da Vaga: ${jobContext || "Não especificado"}

CURRÍCULO/TRANSCRIÇÃO DO CANDIDATO:
${cvContent}

Analise este candidato seguindo a metodologia STAR e SWOT. Retorne APENAS o JSON estruturado.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: SYSTEM_PROMPTS.mode2_analyst },
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
 */
function buildJobPrompt(companyName, data) {
    const profileType = data.type === 'a' ? 'Hunter (agressivo, prospector, abre mercado)' : 'Farmer (relacionamento, manutenção, LTV)';

    const motivators = {
        'a': 'Ambição Financeira (comissões, bônus, ganho variável)',
        'b': 'Competição e Desafio (superar metas, ser o #1)',
        'c': 'Estabilidade e Propósito (segurança, carreira longa, missão)'
    };

    return `
EMPRESA CLIENTE: ${companyName}

DIAGNÓSTICO DA VAGA:
- Título: ${data.title}
- Perfil Psicológico: ${profileType}
- Motivador Principal: ${motivators[data.motivator] || 'Não especificado'}
- Modelo de Trabalho: ${data.workModel}
- Faixa Salarial: ${data.salary || 'A combinar'}

REQUISITOS OBRIGATÓRIOS (eliminatórios):
${data.mustHaves || 'Não especificados'}

DIFERENCIAIS DESEJÁVEIS:
${data.niceToHaves || 'Não especificados'}

BENEFÍCIOS:
${data.benefits || 'Não especificados'}

Gere o anúncio completo seguindo a estrutura obrigatória. Adapte o tom para atrair o perfil ${data.type === 'a' ? 'Hunter' : 'Farmer'} com foco no motivador ${motivators[data.motivator]?.split(' ')[0] || 'identificado'}.`;
}
