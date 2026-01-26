"use client";

import GlassCard from "../../components/common/GlassCard";
import { Plus, Search, ChevronRight, Activity, Target, FileSearch } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "../../hooks/useSubscription";

export default function DashboardHome() {
  const { subscription } = useSubscription();

  return (
    <div className="bento-dashboard animate-fade">
      <header className="dashboard-header">
        <h1 className="welcome-text">
          Bem-vindo, <span className="narrative-text">{subscription?.name || "Líder"}</span>
        </h1>
        <p className="subtitle">Seu cockpit de recrutamento de alta performance está pronto.</p>
      </header>

      <div className="bento-grid">
        {/* Main Action Block - Hero */}
        <GlassCard className="bento-cell hero-cell">
          <div className="hero-content">
            <span className="badge-new">Novo Ciclo</span>
            <h2>Inicie uma arquitetura de vaga estratégica</h2>
            <p>Use o Modo 1 para desenhar perfis Hunter ou Farmer com precisão cirúrgica sem viés.</p>
            <Link href="/dashboard/jobs/new" className="btn-indigo">
              <Plus size={18} />
              Criar Nova Vaga
            </Link>
          </div>
          <div className="hero-visual">
            <Target size={120} color="var(--action-primary)" style={{ opacity: 0.2 }} />
          </div>
        </GlassCard>

        {/* Quick Stats - Vertical Stack */}
        <div className="bento-column">
          <GlassCard className="bento-cell stat-cell">
            <div className="stat-icon-wrapper">
              <Activity size={24} color="var(--action-secondary)" />
            </div>
            <div className="stat-data">
              <span className="stat-val">{subscription?.jobsCount || 0}</span>
              <span className="stat-label">Vagas Ativas</span>
            </div>
          </GlassCard>

          <GlassCard className="bento-cell stat-cell">
            <div className="stat-icon-wrapper">
              <FileSearch size={24} color="var(--action-accent)" />
            </div>
            <div className="stat-data">
              <span className="stat-val">{subscription?.cvCount || 0}</span>
              <span className="stat-label">Análises Realizadas</span>
            </div>
          </GlassCard>
        </div>

        {/* Secondary Action - Analysis */}
        <GlassCard className="bento-cell analysis-cell">
          <div className="cell-header">
            <h3>Inteligência Artificial</h3>
            <span className="status-dot pulsing"></span>
          </div>
          <p>O Modo 2 está aguardando inputs para análise STAR/SWOT.</p>
          <div className="action-row">
            <Link href="/dashboard/candidates" className="link-arrow">
              Ir para Análise <ChevronRight size={16} />
            </Link>
          </div>
        </GlassCard>

        {/* Alerts / Notifications */}
        <GlassCard className="bento-cell alerts-cell">
          <h3>Alertas do Sistema</h3>
          <div className="alert-list">
            <div className="alert-item">
              <div className="alert-dot info"></div>
              <span>Ambiente seguro configurado.</span>
            </div>
            <div className="alert-item">
              <div className="alert-dot warning"></div>
              <span>Trial expira em {subscription?.daysRemaining} dias.</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <style jsx>{`
        .dashboard-header {
          margin-bottom: 30px;
        }

        .welcome-text {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .narrative-text {
          color: var(--action-primary);
          font-style: italic;
        }

        .subtitle {
          opacity: 0.6;
          font-size: 1rem;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 240px 180px;
          gap: 20px;
        }

        /* Hero Cell */
        .hero-cell {
          grid-column: span 1;
          grid-row: span 2;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          z-index: 2;
          max-width: 60%;
        }

        .badge-new {
          background: rgba(0, 240, 255, 0.1);
          color: var(--action-secondary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: inline-block;
        }

        .hero-content h2 {
          font-size: 1.8rem;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .hero-content p {
          opacity: 0.7;
          margin-bottom: 24px;
          font-size: 0.95rem;
        }

        .hero-visual {
          position: absolute;
          right: -20px;
          bottom: -20px;
          opacity: 0.5;
        }

        /* Stats Column */
        .bento-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stat-cell {
          flex: 1;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-data {
          display: flex;
          flex-direction: column;
        }

        .stat-val {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.6;
        }

        /* Analysis Cell */
        .analysis-cell {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--action-secondary);
          box-shadow: 0 0 10px var(--action-secondary);
        }

        .pulsing {
          animation: pulse 2s infinite;
        }

        .analysis-cell p {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 20px;
        }

        .link-arrow {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--action-accent);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: gap 0.2s ease;
        }

        .link-arrow:hover {
          gap: 8px;
        }

        /* Alerts Cell */
        .alerts-cell {
          grid-column: span 2;
          padding: 24px;
        }

        .alerts-cell h3 {
          font-size: 1rem;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
        }

        .alert-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .alert-dot.info { background: var(--action-secondary); }
        .alert-dot.warning { background: var(--status-danger); }

        .animate-fade {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .hero-cell, .alerts-cell {
            grid-column: span 1;
            grid-row: auto;
          }
        }
      `}</style>
    </div>
  );
}
