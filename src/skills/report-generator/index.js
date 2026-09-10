/**
 * Report Generator Skill — Protocolo Elite (Live Consultoria)
 * Gera relatórios executivos em HTML autônomos e responsivos com o Design System Live
 */

export function generateReport(analysis, options = {}) {
  const opts = typeof options === "string" ? { companyName: options } : (options || {});
  const { 
    companyName = "Live Consultoria", 
    repositoryUrl = "",
    vagaTitulo = "" 
  } = opts;


  const {
    nome = "Candidato",
    vaga_titulo = vagaTitulo || "Processo Seletivo",
    familia_vaga = "Técnico / Especialista",
    gate_check = { status: "OK", motivo: "Requisitos obrigatórios atendidos" },
    resumo = "",
    diagnostico_narrativo = "",
    star_analysis = [],
    swot = { forcas: [], fraquezas: [], oportunidades: [], ameacas: [] },
    temperamento = { perfil_estimado: "Analítico", leitura_fit: "Equilibrado", pontos_atencao: "Nenhum" },
    competencias = [],
    scorecard = null,
    informacoes_faltantes = [],
    recomendacao = "RECOMENDADO",
    justificativa = "",
    plano_imersao = []
  } = analysis;

  // Normalização de Scorecard
  const compNota = scorecard?.comportamental?.nota ?? 3.5;
  const compPeso = scorecard?.comportamental?.peso ?? 40;
  const tecNota = scorecard?.tecnica?.nota ?? 3.5;
  const tecPeso = scorecard?.tecnica?.peso ?? 20;
  const pratNota = scorecard?.pratica?.nota ?? 3.5;
  const pratPeso = scorecard?.pratica?.peso ?? 30;
  const alinNota = scorecard?.alinhamento?.nota ?? 3.5;
  const alinPeso = scorecard?.alinhamento?.peso ?? 10;

  const scoreFinal5 = scorecard?.score_final_5 ?? +(
    (compNota * (compPeso / 100)) +
    (tecNota * (tecPeso / 100)) +
    (pratNota * (pratPeso / 100)) +
    (alinNota * (alinPeso / 100))
  ).toFixed(2);

  const scoreFinal100 = scorecard?.score_final_100 ?? Math.round(scoreFinal5 * 20);

  const formulaCalculo = scorecard?.formula_calculo || 
    `(${compNota} × ${compPeso}%) + (${tecNota} × ${tecPeso}%) + (${pratNota} × ${pratPeso}%) + (${alinNota} × ${alinPeso}%) = ${scoreFinal5}/5 (${scoreFinal100}/100)`;

  // Badge de Recomendação
  const getBadgeStyle = (rec) => {
    const text = (rec || "").toUpperCase();
    if (text.includes("NÃO") || text.includes("REPROV")) {
      return { bg: "rgba(239, 68, 68, 0.18)", border: "#EF4444", color: "#EF4444", label: "NÃO RECOMENDADO" };
    }
    if (text.includes("RESSALVA") || text.includes("APROFUNDAR")) {
      return { bg: "rgba(245, 158, 11, 0.18)", border: "#f59e0b", color: "#fbbf24", label: "RECOMENDADO COM RESSALVAS" };
    }
    return { bg: "rgba(16, 185, 129, 0.18)", border: "#10B981", color: "#10B981", label: "RECOMENDADO" };
  };

  const badge = getBadgeStyle(recomendacao);
  const isGateReprovado = (gate_check?.status || "").toUpperCase().includes("REPROV");
  const effectiveRepoUrl = repositoryUrl || analysis.repositoryUrl || "#";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parecer Técnico de Avaliação — ${nome}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --live-deep: #0B0F17;
      --live-glass: #131B2A;
      --live-glass-hover: #1E293B;
      --glass-blur: blur(20px) saturate(180%);
      --live-accent: #10B981;
      --live-accent-dim: rgba(16, 185, 129, 0.1);
      --live-danger: #EF4444;
      --live-warning: #F59E0B;
      --border-subtle: #1E293B;
      --border-active: #3B82F6;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: var(--live-deep);
      background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
      color: #e6edf3;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .report-wrapper {
      max-width: 1024px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .glass-panel {
      background: var(--live-glass);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
      position: relative;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 24px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .live-logo {
      background: #3B82F6;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 1.2rem;
      padding: 8px 16px;
      border-radius: 8px;
      letter-spacing: 1px;
    }

    .sub-brand {
      font-size: 0.85rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .badges-group {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .badge-status {
      padding: 8px 18px;
      border-radius: 24px;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid;
    }

    .badge-gate {
      padding: 8px 16px;
      border-radius: 24px;
      font-weight: 600;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
      background: ${isGateReprovado ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)'};
      border: 1px solid ${isGateReprovado ? '#EF4444' : '#10B981'};
      color: ${isGateReprovado ? '#EF4444' : '#10B981'};
    }

    .candidate-headline {
      margin-top: 20px;
    }

    .candidate-headline h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
    }

    .candidate-headline p {
      font-size: 1.05rem;
      color: #8b949e;
      margin-top: 4px;
    }

    .tldr-box {
      background: rgba(0, 232, 0, 0.06);
      border-left: 4px solid var(--live-accent);
      padding: 20px 24px;
      border-radius: 0 12px 12px 0;
      font-size: 1.05rem;
      color: #f0f6fc;
      line-height: 1.7;
    }

    .tldr-box strong {
      color: var(--live-accent);
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 6px;
    }

    .narrative-text {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 1.05rem;
      line-height: 1.85;
      color: #d1d5db;
    }

    .section-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 10px;
    }

    .score-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .score-pillar {
      background: rgba(6, 25, 42, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 18px;
      text-align: center;
    }

    .score-pillar h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8b949e;
      margin-bottom: 8px;
    }

    .score-pillar .number {
      font-size: 2rem;
      font-weight: 800;
      color: var(--live-accent);
    }

    .score-pillar .weight {
      font-size: 0.75rem;
      color: #6e7681;
    }

    .formula-banner {
      background: rgba(0, 0, 0, 0.35);
      border: 1px dashed var(--border-active);
      border-radius: 10px;
      padding: 16px 20px;
      font-family: monospace;
      font-size: 0.95rem;
      color: #7ee787;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .formula-banner strong {
      font-size: 1.2rem;
      color: #ffffff;
    }

    .star-card {
      background: rgba(6, 25, 42, 0.5);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 16px;
    }

    .star-row {
      display: grid;
      grid-template-columns: 40px 1fr;
      gap: 12px;
      margin-bottom: 10px;
    }

    .star-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
    }
    .badge-s { background: #1e3a8a; color: #93c5fd; }
    .badge-t { background: #3730a3; color: #c7d2fe; }
    .badge-a { background: #065f46; color: #6ee7b7; }
    .badge-r { background: #14532d; color: #86efac; }

    .star-content { font-size: 0.95rem; line-height: 1.6; }
    .star-content strong { color: #f0f6fc; }

    .swot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .swot-card {
      border-radius: 12px;
      padding: 20px;
      background: #131B2A;
      border: 1px solid #1E293B;
    }
    .swot-forcas { border-color: #10B981; }
    .swot-forcas h4 { color: #10B981; }
    .swot-fraquezas { border-color: #EF4444; }
    .swot-fraquezas h4 { color: #EF4444; }
    .swot-oportunidades { border-color: #38bdf8; }
    .swot-oportunidades h4 { color: #38bdf8; }
    .swot-ameacas { border-color: #f59e0b; }
    .swot-ameacas h4 { color: #f59e0b; }

    .swot-card h4 {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .swot-card ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .swot-card li {
      font-size: 0.88rem;
      line-height: 1.5;
      position: relative;
      padding-left: 14px;
    }

    .swot-card li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: inherit;
    }

    .skills-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .skill-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skill-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      font-weight: 600;
    }

    .skill-bar-track {
      height: 8px;
      background: #FFFFFF;
      border-radius: 4px;
      overflow: hidden;
    }

    .skill-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--purple-600), #3B82F6);
      border-radius: 4px;
    }

    .skill-evidence {
      font-size: 0.78rem;
      color: #8b949e;
      font-style: italic;
    }

    .timeline {
      position: relative;
      padding-left: 24px;
      border-left: 2px solid var(--live-accent);
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 10px;
    }

    .timeline-item {
      position: relative;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -31px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--live-accent);
      border: 3px solid var(--live-deep);
    }

    .timeline-item h5 {
      font-size: 0.95rem;
      color: #ffffff;
      font-weight: 700;
    }

    .timeline-item p {
      font-size: 0.88rem;
      color: #8b949e;
      margin-top: 2px;
    }

    .footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .cta-btn {
      background: #3B82F6;
      color: #FFFFFF;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .cta-btn:hover {
      background: var(--purple-600);
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }

    @media print {
      body { background: #ffffff; color: #111827; padding: 0; }
      .glass-panel { background: #ffffff; border: 1px solid #e5e7eb; box-shadow: none; color: #111827; }
      .narrative-text { color: #1f2937; }
      .cta-btn { display: none; }
    }
  </style>
</head>
<body>

<div class="report-wrapper">
  <!-- CABEÇALHO EXECUTIVO -->
  <div class="glass-panel">
    <div class="header">
      <div class="brand-group">
        <div class="live-logo">LIVE</div>
        <div>
          <div class="sub-brand">Consultoria Empresarial — R&S Científico</div>
          <div style="font-size: 0.75rem; color: #6e7681;">Cliente: ${companyName}</div>
        </div>
      </div>

      <div class="badges-group">
        <div class="badge-gate">
          <i data-lucide="${isGateReprovado ? 'alert-triangle' : 'check-circle'}" size="14"></i>
          Gate Check: ${gate_check.status}
        </div>
        <div class="badge-status" style="background: ${badge.bg}; border-color: ${badge.border}; color: ${badge.color};">
          ${badge.label}
        </div>
      </div>
    </div>

    <div class="candidate-headline">
      <h1>${nome}</h1>
      <p>Vaga: <strong>${vaga_titulo}</strong> • Família: <strong>${familia_vaga}</strong></p>
      ${isGateReprovado ? `<div style="margin-top: 10px; color: #ff6b6b; font-size: 0.88rem; font-weight: 600;">Motivo Reprovação Gate: ${gate_check.motivo}</div>` : ''}
    </div>
  </div>

  <!-- RESUMO (TL;DR 30 SEGUNDOS) -->
  <div class="glass-panel">
    <div class="tldr-box">
      <strong>Resumo Executivo (Leitura de 30 Segundos)</strong>
      ${resumo || "Candidato avaliado sob a metodologia científica da Live Consultoria com validação de consistência e alinhamento prático."}
    </div>
  </div>

  <!-- DIAGNÓSTICO NARRATIVO -->
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="compass"></i> 1. Trajetória e Diagnóstico de Maturidade</h3>
    <div class="narrative-text">
      ${diagnostico_narrativo || "Histórico com densidade de experiência e trajetória alinhada aos desafios do cliente."}
    </div>
  </div>

  <!-- SCORECARD DASHBOARD AUDITÁVEL -->
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="calculator"></i> 2. Scorecard Auditável dos 4 Pilares</h3>
    
    <div class="score-grid">
      <div class="score-pillar">
        <h4>Comportamental</h4>
        <div class="number">${compNota}</div>
        <div class="weight">Peso: ${compPeso}%</div>
      </div>
      <div class="score-pillar">
        <h4>Técnica</h4>
        <div class="number">${tecNota}</div>
        <div class="weight">Peso: ${tecPeso}%</div>
      </div>
      <div class="score-pillar">
        <h4>Prática / Testes</h4>
        <div class="number">${pratNota}</div>
        <div class="weight">Peso: ${pratPeso}%</div>
      </div>
      <div class="score-pillar">
        <h4>Alinhamento</h4>
        <div class="number">${alinNota}</div>
        <div class="weight">Peso: ${alinPeso}%</div>
      </div>
    </div>

    <div class="formula-banner">
      <div>Conta Explicada: ${formulaCalculo}</div>
      <div>Score Final: <strong>${scoreFinal100}/100</strong> (${scoreFinal5}/5)</div>
    </div>
  </div>

  <!-- ANÁLISE STAR -->
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="target"></i> 3. Análise Comportamental STAR (Evidências Individuais)</h3>
    ${star_analysis && star_analysis.length > 0 ? star_analysis.map(item => `
      <div class="star-card">
        <div class="star-row">
          <div class="star-badge badge-s">S</div>
          <div class="star-content"><strong>Situação:</strong> ${item.situacao}</div>
        </div>
        <div class="star-row">
          <div class="star-badge badge-t">T</div>
          <div class="star-content"><strong>Tarefa:</strong> ${item.tarefa}</div>
        </div>
        <div class="star-row">
          <div class="star-badge badge-a">A</div>
          <div class="star-content"><strong>Ação Individual:</strong> ${item.acao}</div>
        </div>
        <div class="star-row">
          <div class="star-badge badge-r">R</div>
          <div class="star-content"><strong>Resultado Mensurável:</strong> ${item.resultado}</div>
        </div>
        ${item.ponto_atencao ? `<div style="font-size: 0.8rem; color: #f59e0b; margin-top: 6px; padding-left: 52px;">Ponto de Atenção: ${item.ponto_atencao}</div>` : ''}
      </div>
    `).join('') : '<p style="color: #8b949e;">Nenhuma evidência STAR formal anexada.</p>'}
  </div>

  <!-- MATRIZ SWOT E TEMPERAMENTO -->
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="grid"></i> 4. Matriz SWOT e Temperamento Operacional</h3>
    
    <div class="swot-grid">
      <div class="swot-card swot-forcas">
        <h4>Forças (Evidenciadas)</h4>
        <ul>${(swot.forcas || []).map(f => `<li>${f}</li>`).join('')}</ul>
      </div>

      <div class="swot-card swot-fraquezas">
        <h4>Fraquezas / Gaps Reais</h4>
        <ul>${(swot.fraquezas || []).map(f => `<li>${f}</li>`).join('')}</ul>
      </div>

      <div class="swot-card swot-oportunidades">
        <h4>Oportunidades</h4>
        <ul>${(swot.oportunidades || []).map(o => `<li>${o}</li>`).join('')}</ul>
      </div>

      <div class="swot-card swot-ameacas">
        <h4>Ameaças / Riscos</h4>
        <ul>${(swot.ameacas || []).map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
    </div>

    <div style="margin-top: 24px; padding: 18px; background: rgba(6, 25, 42, 0.4); border-radius: 12px; border: 1px solid var(--border-subtle);">
      <h4 style="color: #ffffff; font-size: 0.95rem; margin-bottom: 6px;">
        <i data-lucide="user-check" size="16"></i> Heurística de Temperamento: <strong>${temperamento.perfil_estimado}</strong>
      </h4>
      <p style="font-size: 0.88rem; color: #8b949e; line-height: 1.6;">
        ${temperamento.leitura_fit} | <em>Atenção a:</em> ${temperamento.pontos_atencao}
      </p>
    </div>
  </div>

  <!-- COMPETÊNCIAS ESPECÍFICAS DA FAMÍLIA -->
  ${competencias && competencias.length > 0 ? `
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="award"></i> 5. Competências e Rastreabilidade de Evidências</h3>
    <div class="skills-container">
      ${competencias.map(c => `
        <div class="skill-row">
          <div class="skill-meta">
            <span>${c.nome} (${c.pilar})</span>
            <span>${c.nota}/5 • <span style="color: ${c.tipo_evidencia === 'explicita' ? '#10B981' : '#f59e0b'}">${c.tipo_evidencia === 'explicita' ? 'Evidência Literal' : 'Inferência'}</span></span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${(c.nota / 5) * 100}%;"></div>
          </div>
          <div class="skill-evidence">"${c.evidencia}"</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- PLANO DE IMERSÃO E TESTE -->
  ${plano_imersao && plano_imersao.length > 0 ? `
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="clock"></i> 6. Plano de Imersão e Validação Prática</h3>
    <div class="timeline">
      ${plano_imersao.map(step => `
        <div class="timeline-item">
          <h5>${step.periodo}: ${step.foco}</h5>
          <p>Ação / Teste de Validação: ${step.acao_validacao}</p>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- INFORMAÇÕES FALTANTES E PARECER DO CONSULTOR -->
  <div class="glass-panel">
    <h3 class="section-title"><i data-lucide="check-square"></i> 7. Parecer Conclusivo do Consultor</h3>
    
    ${informacoes_faltantes && informacoes_faltantes.length > 0 ? `
      <div style="margin-bottom: 20px; padding: 14px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3);">
        <strong style="color: #f59e0b; font-size: 0.85rem; text-transform: uppercase;">Honestidade Epistêmica — Informações Não Confirmadas no Material:</strong>
        <ul style="margin-top: 6px; padding-left: 20px; font-size: 0.85rem; color: #d1d5db;">
          ${informacoes_faltantes.map(inf => `<li>${inf}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="font-size: 1rem; color: #f0f6fc; line-height: 1.7; margin-bottom: 24px;">
      ${justificativa || "Parecer fundamentado na matriz de competências e aderência aos requisitos do cliente."}
    </div>

    <div class="footer-actions">
      <div style="font-size: 0.8rem; color: #6e7681;">
        Documento gerado sob o Protocolo Elite — Live Consultoria Empresarial.
      </div>
      <a href="${effectiveRepoUrl}" target="_blank" class="cta-btn">
        <i data-lucide="folder-open"></i> Acessar Repositório do Candidato
      </a>
    </div>
  </div>
</div>

<script>
  lucide.createIcons();
</script>
</body>
</html>`;
}

export const generateEliteReport = generateReport;
