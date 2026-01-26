"use client";

import GlassCard from "../components/common/GlassCard";
import { Command, ArrowRight, Sparkles, Target, MessageCircle, Shield, Zap, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-brand">
          <Command size={28} color="var(--action-secondary)" />
          <span>Recruit<span className="text-gradient">AI</span></span>
        </div>
        <div className="nav-links">
          <Link href="/login" className="nav-link">Entrar</Link>
          <Link href="/login" className="btn-indigo">
            Começar Grátis <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-eyebrow">Humanidade Sintética</p>
          <h1 className="hero-title">
            Contrate a <span className="text-gradient-pulse">alma</span>,<br />
            não apenas o arquivo.
          </h1>
          <p className="hero-subtitle">
            Transforme o recrutamento burocrático em uma experiência de curadoria de elite.
            Nossa IA não apenas filtra candidatos; ela entende histórias, prevê fit cultural
            e prepara você para a melhor entrevista da sua vida.
          </p>
          <div className="hero-cta">
            <Link href="/login" className="btn-primary-large">
              <Sparkles size={20} /> Experimente a Nova Era
            </Link>
            <span className="hero-disclaimer">7 dias grátis. Sem cartão de crédito.</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card glass-card">
            <div className="card-glow" />
            <div className="mock-dashboard">
              <div className="mock-header">
                <div className="mock-dot" />
                <div className="mock-dot" />
                <div className="mock-dot" />
              </div>
              <div className="mock-content">
                <div className="mock-score">
                  <span className="score-value">4.8</span>
                  <span className="score-label">Match Score</span>
                </div>
                <div className="mock-bars">
                  <div className="bar" style={{ width: "95%" }} />
                  <div className="bar" style={{ width: "88%" }} />
                  <div className="bar" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="contrast-section">
        <div className="contrast-grid">
          <GlassCard className="contrast-card old">
            <div className="contrast-badge">O Velho R&S</div>
            <p>"Tabelas intermináveis, cinzas deprimentes e decisões baseadas em palpites."</p>
          </GlassCard>
          <div className="contrast-arrow">→</div>
          <GlassCard className="contrast-card new">
            <div className="contrast-badge">Neo-Clean</div>
            <p>"Interface tátil, dados que ganham vida e uma IA que atua como seu Co-Piloto de Talentos."</p>
          </GlassCard>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="pillars-section">
        <div className="section-header">
          <h2 className="narrative-text">Os Três Pilares da<br /><span className="text-gradient">Humanidade Sintética</span></h2>
        </div>
        <div className="pillars-grid">
          <GlassCard className="pillar-card">
            <div className="pillar-icon">
              <Sparkles size={32} />
            </div>
            <h3>Anúncios Magnéticos</h3>
            <p>A IA não apenas escreve; ela seduz. Gere anúncios otimizados para o cérebro humano e para os algoritmos das redes profissionais em segundos.</p>
          </GlassCard>

          <GlassCard className="pillar-card featured">
            <div className="pillar-icon">
              <Target size={32} />
            </div>
            <h3>Triagem por Holograma</h3>
            <p>Esqueça o PDF estático. Visualizamos o potencial de cada candidato através de um Match Score proprietário que analisa competências, valores e trajetória.</p>
          </GlassCard>

          <GlassCard className="pillar-card">
            <div className="pillar-icon">
              <MessageCircle size={32} />
            </div>
            <h3>Entrevistas Guiadas</h3>
            <p>Chegue na entrevista com um roteiro personalizado baseado nos pontos cegos do currículo. Nossa IA analisa o pós-conversa e entrega o veredito final.</p>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{"<"}100ms</span>
            <span className="stat-label">Tempo de Resposta</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">4.8/5</span>
            <span className="stat-label">Precisão do Match</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">73%</span>
            <span className="stat-label">Redução no Tempo de Contratação</span>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <GlassCard className="trust-card">
          <div className="trust-icons">
            <Shield size={24} color="var(--action-secondary)" />
            <Users size={24} color="var(--action-accent)" />
            <Zap size={24} color="var(--action-primary)" />
          </div>
          <p className="trust-text">
            "Para empresas que não buscam apenas preencher vagas, mas construir legados.
            O sistema de curadoria escolhido por líderes que valorizam o tempo e o talento humano."
          </p>
        </GlassCard>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>Pronto para revolucionar<br />seu recrutamento?</h2>
        <Link href="/login" className="btn-primary-large">
          Começar Agora <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <Command size={20} color="var(--action-secondary)" />
          <span>RecruitAI</span>
        </div>
        <div className="footer-links">
          <Link href="/terms">Termos de Uso</Link>
          <Link href="/privacy">Privacidade</Link>
          <Link href="/contact">Contato</Link>
        </div>
        <p className="footer-copy">© 2026 Live Consultoria. Todos os direitos reservados.</p>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Navigation */
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 5%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: white;
        }

        /* Hero */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          padding: 80px 5% 120px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-eyebrow {
          color: var(--action-secondary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 16px;
        }

        .hero-title {
          font-family: var(--font-narrative, 'Merriweather', serif);
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--action-secondary), var(--action-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-gradient-pulse {
          background: linear-gradient(135deg, var(--action-primary) 0%, var(--action-secondary) 50%, var(--action-accent) 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientPulse 3s ease-in-out infinite;
        }

        @keyframes gradientPulse {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle {
          font-size: 1.2rem;
          line-height: 1.7;
          opacity: 0.8;
          margin-bottom: 40px;
          max-width: 560px;
        }

        .hero-cta {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-primary-large {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--action-primary), var(--action-accent));
          color: white;
          padding: 18px 36px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.3s var(--spring-bounce);
          box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
          width: fit-content;
        }

        .btn-primary-large:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(79, 70, 229, 0.4);
        }

        .hero-disclaimer {
          font-size: 0.85rem;
          opacity: 0.5;
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
        }

        .hero-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          padding: 0;
          overflow: hidden;
        }

        .card-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .mock-dashboard {
          position: relative;
          z-index: 1;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          overflow: hidden;
        }

        .mock-header {
          display: flex;
          gap: 6px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
        }

        .mock-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
        }

        .mock-content {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mock-score {
          text-align: center;
        }

        .score-value {
          display: block;
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--action-secondary), var(--action-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .score-label {
          font-size: 0.9rem;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .mock-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bar {
          height: 8px;
          background: linear-gradient(90deg, var(--action-primary), var(--action-secondary));
          border-radius: 4px;
          animation: barLoad 1.5s ease-out forwards;
        }

        @keyframes barLoad {
          from { width: 0 !important; }
        }

        /* Contrast Section */
        .contrast-section {
          padding: 80px 5%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .contrast-grid {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .contrast-card {
          flex: 1;
          padding: 40px;
        }

        .contrast-card.old {
          opacity: 0.6;
          border-left: 3px solid rgba(255, 255, 255, 0.1);
        }

        .contrast-card.new {
          border-left: 3px solid var(--action-secondary);
        }

        .contrast-badge {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .contrast-card p {
          font-size: 1.1rem;
          line-height: 1.6;
          font-style: italic;
        }

        .contrast-arrow {
          font-size: 2rem;
          color: var(--action-secondary);
          flex-shrink: 0;
        }

        /* Pillars Section */
        .pillars-section {
          padding: 120px 5%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .pillar-card {
          padding: 40px 32px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .pillar-card:hover {
          transform: translateY(-8px);
        }

        .pillar-card.featured {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(139, 92, 246, 0.1));
          border-color: var(--action-primary);
        }

        .pillar-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, var(--action-primary), var(--action-accent));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .pillar-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .pillar-card p {
          font-size: 0.95rem;
          line-height: 1.6;
          opacity: 0.7;
        }

        /* Stats Section */
        .stats-section {
          padding: 80px 5%;
          background: linear-gradient(180deg, transparent, rgba(79, 70, 229, 0.05), transparent);
        }

        .stats-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 60px;
          max-width: 900px;
          margin: 0 auto;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 3rem;
          font-weight: 800;
          color: var(--action-secondary);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-divider {
          width: 1px;
          height: 60px;
          background: var(--border-glass);
        }

        /* Trust Section */
        .trust-section {
          padding: 60px 5%;
          max-width: 900px;
          margin: 0 auto;
        }

        .trust-card {
          padding: 40px;
          text-align: center;
        }

        .trust-icons {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .trust-text {
          font-size: 1.1rem;
          line-height: 1.7;
          font-style: italic;
          opacity: 0.8;
        }

        /* Final CTA */
        .final-cta-section {
          padding: 120px 5%;
          text-align: center;
        }

        .final-cta-section h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 32px;
          line-height: 1.2;
        }

        /* Footer */
        .landing-footer {
          padding: 40px 5%;
          border-top: 1px solid var(--border-glass);
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-copy {
          font-size: 0.85rem;
          opacity: 0.4;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 60px 5% 80px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            max-width: 100%;
          }

          .hero-cta {
            align-items: center;
          }

          .hero-visual {
            order: -1;
          }

          .hero-card {
            max-width: 320px;
          }

          .pillars-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            flex-direction: column;
            gap: 40px;
          }

          .stat-divider {
            width: 60px;
            height: 1px;
          }

          .contrast-grid {
            flex-direction: column;
          }

          .contrast-arrow {
            transform: rotate(90deg);
          }
        }

        @media (max-width: 640px) {
          .nav-bar {
            flex-direction: column;
            gap: 16px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section-header h2 {
            font-size: 1.75rem;
          }

          .final-cta-section h2 {
            font-size: 1.75rem;
          }

          .landing-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
