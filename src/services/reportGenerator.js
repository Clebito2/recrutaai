/**
 * Elite Report Generator
 * Generates a standalone HTML report for candidate analysis
 */

export function generateEliteReport(analysis, companyName) {
    const { nome, resumo, scorecard, temperamento, star_analysis, swot, recomendacao, justificativa } = analysis;

    const overallScore = scorecard
        ? ((scorecard.comportamental + scorecard.tecnico + scorecard.comunicacao + scorecard.alinhamento) / 4).toFixed(1)
        : "N/A";

    const getScoreColor = (score) => {
        if (score >= 4) return "#00F0FF";
        if (score >= 3) return "#8B5CF6";
        return "#EF4444";
    };

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Elite - ${nome || "Candidato"}</title>
  <style>
    :root {
      --canvas-bg: #05050A;
      --card-bg: rgba(20, 20, 25, 0.9);
      --primary: #4F46E5;
      --secondary: #00F0FF;
      --accent: #8B5CF6;
      --text: #F5F5F7;
      --text-muted: rgba(245, 245, 247, 0.6);
      --border: rgba(255, 255, 255, 0.08);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 20mm;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--canvas-bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
      padding: 40px;
    }

    @media print {
      body {
        padding: 0;
        background: white;
        color: #1a1a1a;
      }
      .card {
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
      }
      .no-print {
        display: none !important;
      }
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .company-info {
      font-size: 0.85rem;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .report-title {
      font-size: 0.75rem;
      background: var(--primary);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
    }

    .candidate-section {
      display: flex;
      gap: 32px;
      margin-bottom: 40px;
    }

    .avatar {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
    }

    .candidate-info {
      flex: 1;
    }

    .candidate-name {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 8px;
      line-height: 1.1;
    }

    .candidate-summary {
      font-size: 1.1rem;
      opacity: 0.8;
      margin-bottom: 16px;
    }

    .recommendation-badge {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .recommendation-badge.approved {
      background: rgba(0, 240, 255, 0.15);
      color: var(--secondary);
      border: 1px solid rgba(0, 240, 255, 0.3);
    }

    .recommendation-badge.review {
      background: rgba(139, 92, 246, 0.15);
      color: var(--accent);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .recommendation-badge.rejected {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.5;
      margin-bottom: 20px;
    }

    .scores-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .score-item {
      text-align: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }

    .score-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      opacity: 0.5;
      margin-bottom: 8px;
    }

    .score-value {
      font-size: 2.5rem;
      font-weight: 800;
    }

    .score-max {
      font-size: 0.9rem;
      opacity: 0.4;
    }

    .overall-score {
      text-align: center;
      padding: 32px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(139, 92, 246, 0.1));
      border-radius: 16px;
    }

    .overall-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      opacity: 0.6;
      margin-bottom: 8px;
    }

    .overall-value {
      font-size: 4rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--secondary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .temperament-display {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent);
    }

    .swot-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .swot-item {
      padding: 20px;
      border-radius: 12px;
    }

    .swot-item.strengths {
      background: rgba(0, 240, 255, 0.1);
      border-left: 3px solid var(--secondary);
    }

    .swot-item.weaknesses {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid #EF4444;
    }

    .swot-item.opportunities {
      background: rgba(139, 92, 246, 0.1);
      border-left: 3px solid var(--accent);
    }

    .swot-item.threats {
      background: rgba(251, 191, 36, 0.1);
      border-left: 3px solid #FBBF24;
    }

    .swot-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 12px;
      opacity: 0.8;
    }

    .swot-content {
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .justification {
      font-size: 1rem;
      line-height: 1.8;
      padding: 24px;
      background: rgba(79, 70, 229, 0.05);
      border-left: 3px solid var(--primary);
      border-radius: 0 12px 12px 0;
    }

    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      opacity: 0.5;
    }

    .print-button {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(79, 70, 229, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(79, 70, 229, 0.5);
    }

    .print-button svg {
      width: 20px;
      height: 20px;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <header class="header">
      <div class="company-info">${companyName || "Recruit-AI"}</div>
      <div class="report-title">Relatório Elite</div>
    </header>

    <section class="candidate-section">
      <div class="avatar">${(nome || "C").charAt(0).toUpperCase()}</div>
      <div class="candidate-info">
        <h1 class="candidate-name">${nome || "Candidato"}</h1>
        <p class="candidate-summary">${resumo || "Análise de perfil profissional realizada com metodologia STAR e Matriz SWOT."}</p>
        <div class="recommendation-badge ${getRecommendationClass(recomendacao)}">${recomendacao || "Em Análise"}</div>
      </div>
    </section>

    <div class="card">
      <div class="card-title">Scorecard de Competências</div>
      <div class="scores-grid">
        ${scorecard ? Object.entries(scorecard).map(([key, value]) => `
          <div class="score-item">
            <div class="score-label">${formatLabel(key)}</div>
            <div class="score-value" style="color: ${getScoreColor(value)}">${value}<span class="score-max">/5</span></div>
          </div>
        `).join('') : '<p>Scorecard não disponível</p>'}
      </div>
      <div class="overall-score">
        <div class="overall-label">Score Geral</div>
        <div class="overall-value">${overallScore}</div>
      </div>
    </div>

    ${temperamento ? `
    <div class="card">
      <div class="card-title">Temperamento Identificado</div>
      <div class="temperament-display">${temperamento}</div>
    </div>
    ` : ''}

    ${swot ? `
    <div class="card">
      <div class="card-title">Matriz SWOT</div>
      <div class="swot-grid">
        <div class="swot-item strengths">
          <div class="swot-title">Forças</div>
          <div class="swot-content">${swot.forcas || swot.strengths || "—"}</div>
        </div>
        <div class="swot-item weaknesses">
          <div class="swot-title">Fraquezas</div>
          <div class="swot-content">${swot.fraquezas || swot.weaknesses || "—"}</div>
        </div>
        <div class="swot-item opportunities">
          <div class="swot-title">Oportunidades</div>
          <div class="swot-content">${swot.oportunidades || swot.opportunities || "—"}</div>
        </div>
        <div class="swot-item threats">
          <div class="swot-title">Ameaças</div>
          <div class="swot-content">${swot.ameacas || swot.threats || "—"}</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${justificativa ? `
    <div class="card">
      <div class="card-title">Justificativa da Recomendação</div>
      <div class="justification">${justificativa}</div>
    </div>
    ` : ''}

    <footer class="footer">
      <span>Gerado por Recruit-AI | Humanidade Sintética</span>
      <span>${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
    </footer>
  </div>

  <button class="print-button no-print" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
    Salvar como PDF
  </button>
</body>
</html>`;

    return html;
}

function getRecommendationClass(rec) {
    if (!rec) return "review";
    const lower = rec.toLowerCase();
    if (lower.includes("aprov")) return "approved";
    if (lower.includes("reprov") || lower.includes("rejeit")) return "rejected";
    return "review";
}

function formatLabel(key) {
    const labels = {
        comportamental: "Comportamental",
        tecnico: "Técnico",
        comunicacao: "Comunicação",
        alinhamento: "Alinhamento"
    };
    return labels[key] || key;
}
