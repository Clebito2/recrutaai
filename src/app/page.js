"use client";

import GlassCard from "../components/common/GlassCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-brand">
          <span className="brand-text">Recruit<span className="text-accent">AI</span></span>
        </div>
        <div className="nav-links">
          <Link href="/login" className="btn-secondary">Entrar</Link>
          <Link href="/login" className="btn-indigo">
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-eyebrow">Plataforma de Recrutamento Inteligente</p>
          <h1 className="hero-title">
            Contrate a <span className="text-gradient">alma</span>,<br />
            não apenas o arquivo.
          </h1>
          <p className="hero-subtitle">
            Transforme o recrutamento burocrático em uma experiência de curadoria de elite.
            Nossa IA entende histórias, prevê fit cultural e prepara você para a melhor
            entrevista da sua vida.
          </p>
          <div className="hero-cta">
            <Link href="/login" className="btn-primary-large">
              Experimente a Nova Era <ArrowRight size={18} />
            </Link>
            <span className="hero-disclaimer">7 dias grátis • Sem cartão de crédito</span>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="contrast-section">
        <div className="contrast-grid">
          <GlassCard className="contrast-card old">
            <span className="contrast-label">O Velho R&S</span>
            <p>"Tabelas intermináveis, decisões baseadas em palpites e processos que consomem semanas."</p>
          </GlassCard>
          <GlassCard className="contrast-card new">
            <span className="contrast-label">A Nova Era</span>
            <p>"Interface inteligente, dados acionáveis e uma IA que atua como seu Co-Piloto de Talentos."</p>
          </GlassCard>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="pillars-section">
        <div className="section-header">
          <h2>Como Funciona</h2>
          <p>Três módulos integrados para revolucionar seu processo seletivo</p>
        </div>
        <div className="pillars-grid">
          <GlassCard className="pillar-card">
            <span className="pillar-number">01</span>
            <h3>Anúncios Inteligentes</h3>
            <p>Gere descrições de vagas otimizadas para atrair os melhores talentos. Nossa IA cria textos persuasivos baseados no perfil ideal do candidato.</p>
          </GlassCard>

          <GlassCard className="pillar-card">
            <span className="pillar-number">02</span>
            <h3>Triagem Automatizada</h3>
            <p>Analise currículos e transcrições de entrevistas com precisão. Receba um scorecard detalhado com recomendações claras.</p>
          </GlassCard>

          <GlassCard className="pillar-card">
            <span className="pillar-number">03</span>
            <h3>Relatórios Executivos</h3>
            <p>Exporte análises profissionais em PDF para compartilhar com stakeholders. Dados estruturados para decisões embasadas.</p>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">73%</span>
            <span className="stat-label">Redução no tempo de contratação</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.8</span>
            <span className="stat-label">Precisão do Match Score</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">&lt;2min</span>
            <span className="stat-label">Para gerar análise completa</span>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <GlassCard className="trust-card">
          <p className="trust-text">
            "Para empresas que não buscam apenas preencher vagas, mas construir legados.
            O sistema de curadoria escolhido por líderes que valorizam o tempo e o talento humano."
          </p>
        </GlassCard>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>Pronto para transformar<br />seu recrutamento?</h2>
        <Link href="/login" className="btn-primary-large">
          Começar Agora <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">RecruitAI</div>
        <div className="footer-links">
          <Link href="/terms">Termos</Link>
          <Link href="/privacy">Privacidade</Link>
          <Link href="/contact">Contato</Link>
        </div>
        <p className="footer-copy">© 2026 RecruitAI. Todos os direitos reservados.</p>
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
          padding: 24px 6%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .brand-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .text-accent {
          color: var(--action-primary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: white;
        }

        /* Hero */
        .hero-section {
          padding: 100px 6% 140px;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-eyebrow {
          color: var(--action-primary);
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 28px;
          letter-spacing: -0.03em;
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--action-primary) 0%, var(--action-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 48px;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .btn-primary-large {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 40px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1.05rem;
          transition: all 0.2s;
        }

        .btn-primary-large:hover {
          background: var(--action-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.5);
        }

        .hero-disclaimer {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Contrast Section */
        .contrast-section {
          padding: 80px 6%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .contrast-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .contrast-card {
          padding: 40px;
          background: linear-gradient(180deg, rgba(30, 32, 45, 0.9) 0%, rgba(20, 22, 35, 0.8) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .contrast-card.old {
          opacity: 0.7;
          border-left: 3px solid rgba(255, 255, 255, 0.1);
        }

        .contrast-card.new {
          border-left: 3px solid var(--action-primary);
        }

        .contrast-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .contrast-card p {
          font-size: 1.1rem;
          line-height: 1.6;
          font-style: italic;
        }

        /* Pillars Section */
        .pillars-section {
          padding: 120px 6%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-header h2 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .section-header p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .pillar-card {
          padding: 48px 36px;
          background: linear-gradient(180deg, rgba(30, 32, 45, 0.9) 0%, rgba(20, 22, 35, 0.8) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .pillar-number {
          display: block;
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--action-primary);
          margin-bottom: 24px;
          letter-spacing: 1px;
        }

        .pillar-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .pillar-card p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Stats Section */
        .stats-section {
          padding: 100px 6%;
          background: linear-gradient(180deg, transparent, rgba(79, 70, 229, 0.03), transparent);
        }

        .stats-grid {
          display: flex;
          justify-content: center;
          gap: 80px;
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
          color: var(--action-primary);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        /* Trust Section */
        .trust-section {
          padding: 60px 6%;
          max-width: 800px;
          margin: 0 auto;
        }

        .trust-card {
          padding: 48px;
          text-align: center;
        }

        .trust-text {
          font-size: 1.15rem;
          line-height: 1.8;
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Final CTA */
        .final-cta-section {
          padding: 140px 6%;
          text-align: center;
        }

        .final-cta-section h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 40px;
          line-height: 1.2;
        }

        /* Footer */
        .landing-footer {
          padding: 48px 6%;
          border-top: 1px solid var(--border-glass);
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          flex-wrap: wrap;
          gap: 24px;
        }

        .footer-brand {
          font-weight: 800;
          font-size: 1.1rem;
        }

        .footer-links {
          display: flex;
          gap: 32px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-copy {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.3);
        }

        /* Mobile */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .pillars-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            flex-direction: column;
            gap: 48px;
          }

          .contrast-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .nav-bar {
            flex-direction: column;
            gap: 20px;
          }

          .hero-section {
            padding: 60px 6% 80px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
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
