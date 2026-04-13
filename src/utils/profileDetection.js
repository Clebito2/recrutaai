/**
 * profileDetection.js
 * Detecção automática leve de nível de perfil (Técnico vs Liderança)
 * baseada em sinais semânticos no texto do currículo/transcrição.
 *
 * Skill aplicada: ai-engineer (sem LLM — análise local para reduzir latência e custo)
 */

const LEADERSHIP_SIGNALS = [
    // Verbos de gestão
    'gerenciei', 'gerenciava', 'gerenciar', 'liderava', 'liderei', 'liderar',
    'coordenei', 'coordenava', 'coordenei', 'supervisei', 'supervisionei',
    'administrei', 'dirigi', 'conduzi',
    // Títulos
    'gerente', 'gestor', 'gestora', 'diretor', 'diretora', 'coordenador',
    'coordenadora', 'supervisor', 'supervisora', 'head of', 'head de',
    'líder de', 'lider de', 'vp de', 'ceo', 'coo', 'cto', 'cfo',
    // Contexto de equipe
    'equipe de', 'time de', 'liderava um time', 'reportavam para mim',
    'minha equipe', 'headcount', 'contratei', 'demiti',
    // Resultados estratégicos
    'budget', 'orçamento', 'p&l', 'ebitda', 'kpis do time',
    'desenvolvimento de pessoas', 'turnover', 'metas da equipe',
    'planejamento estratégico', 'reunião de liderança',
];

const TECHNICAL_SIGNALS = [
    // Verbos de execução
    'implementei', 'desenvolvi', 'configurei', 'operava', 'operei',
    'executei', 'codifiquei', 'programei', 'automatizei', 'criei',
    'construí', 'instalei', 'monitorei', 'analisei', 'diagnostiquei',
    // Títulos
    'analista', 'especialista', 'técnico', 'técnica', 'engenheiro',
    'engenheira', 'desenvolvedor', 'desenvolvedora', 'programador',
    'programadora', 'operador', 'operadora', 'auxiliar técnico',
    // Contexto técnico
    'infraestrutura', 'sistemas', 'banco de dados', 'servidor',
    'código', 'script', 'deploy', 'pipeline', 'ferramenta',
    'plataforma técnica', 'suporte técnico', 'manutenção de sistemas',
    // Resultados individuais
    'reduzi o tempo', 'otimizei', 'automatizei o processo',
    'resolvi o problema', 'corrigi o bug', 'eficiência técnica',
];

/**
 * Analisa o texto e retorna sugestão de nível de perfil.
 *
 * @param {string} text - Texto extraído do currículo ou transcrição
 * @returns {{ suggested: 'tecnico'|'lideranca', confidence: number, leaderSignals: number, techSignals: number }}
 */
export function detectProfileLevel(text) {
    if (!text || text.length < 50) {
        return { suggested: 'tecnico', confidence: 0, leaderSignals: 0, techSignals: 0 };
    }

    const lower = text.toLowerCase();

    const leaderCount = LEADERSHIP_SIGNALS.filter(signal => lower.includes(signal)).length;
    const techCount = TECHNICAL_SIGNALS.filter(signal => lower.includes(signal)).length;

    const diff = leaderCount - techCount;
    const suggested = diff > 0 ? 'lideranca' : 'tecnico';
    const confidence = Math.abs(diff);

    return {
        suggested,
        confidence,
        leaderSignals: leaderCount,
        techSignals: techCount,
    };
}

/**
 * Retorna mensagem amigável sobre a detecção automática.
 *
 * @param {{ suggested: string, confidence: number }} detection
 * @returns {string|null}
 */
export function getDetectionMessage(detection) {
    if (detection.confidence < 2) return null; // Não suficientemente confiante

    const label = detection.suggested === 'lideranca' ? 'Liderança/Gestão' : 'Técnico/Especialista';
    return `Perfil sugerido automaticamente: ${label} (${detection.leaderSignals} sinais de liderança vs ${detection.techSignals} técnicos)`;
}
