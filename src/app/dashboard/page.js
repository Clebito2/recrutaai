"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../components/common/GlassCard";
import StatCard from "../../components/common/StatCard";
import { Plus, TrendingUp, Users, Calendar, Briefcase, ArrowRight, Zap, Target } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "../../hooks/useSubscription";
import { db } from "../../lib/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export default function DashboardHome() {
  const { subscription, user } = useSubscription();
  const [interviewCount, setInterviewCount] = useState(0);

  useEffect(() => {
    async function fetchInterviews() {
      if (user?.uid) {
        try {
          const q = query(collection(db, "interviews"), where("userId", "==", user.uid), where("status", "==", "scheduled"));
          const snapshot = await getCountFromServer(q);
          setInterviewCount(snapshot.data().count);
        } catch (e) {
          console.error("Error fetching interviews:", e);
        }
      }
    }
    fetchInterviews();
  }, [user]);

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Olá, <span className="highlight">{subscription?.name || "Líder"}</span> 👋</h1>
          <p>Seu centro de comando para recrutamento inteligente</p>
        </div>
        <div className="quick-actions">
          <Link href="/dashboard/jobs/new" className="action-btn primary">
            <Plus size={20} />
            <span>Nova Vaga</span>
          </Link>
          <Link href="/dashboard/candidates" className="action-btn secondary">
            <Users size={20} />
            <span>Analisar CV</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          variant="briefcase"
          icon={<Briefcase size={24} />}
          value={subscription?.jobsCount || 0}
          label="Vagas Ativas"
          trend={0}
        />

        <StatCard
          variant="users"
          icon={<Users size={24} />}
          value={subscription?.cvCount || 0}
          label="Análises Realizadas"
          trend={0}
        />

        <StatCard
          variant="calendar"
          icon={<Calendar size={24} />}
          value={interviewCount}
          label="Entrevistas Agendadas"
        />

        <StatCard
          variant="target"
          icon={<Target size={24} />}
          value={subscription?.daysRemaining || 0}
          label="Dias Restantes (Trial)"
        />
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* AI Analysis Card */}
        <GlassCard className="feature-card ai-card">
          <div className="card-header">
            <div className="card-icon">
              <Zap size={28} />
            </div>
            <div className="status-badge active">
              <span className="pulse-dot"></span>
              Ativo
            </div>
          </div>
          <h3>Análise com IA</h3>
          <p>Sistema STAR/SWOT processando candidatos em tempo real com precisão cirúrgica.</p>
          <Link href="/dashboard/candidates" className="card-action">
            Iniciar Análise
            <ArrowRight size={18} />
          </Link>
        </GlassCard>

        {/* Job Architect Card */}
        <GlassCard className="feature-card job-card">
          <div className="card-header">
            <div className="card-icon">
              <Target size={28} />
            </div>
          </div>
          <h3>Arquiteto de Vagas</h3>
          <p>Crie descrições de vagas otimizadas para perfis Hunter, Farmer, Técnico ou Liderança.</p>
          <Link href="/dashboard/jobs/new" className="card-action">
            Criar Vaga
            <ArrowRight size={18} />
          </Link>
        </GlassCard>

        {/* Pipeline Card */}
        <GlassCard className="feature-card pipeline-card">
          <div className="card-header">
            <div className="card-icon">
              <Briefcase size={28} />
            </div>
          </div>
          <h3>Pipeline de Vagas</h3>
          <p>Gerencie todas as suas posições abertas e acompanhe o progresso de cada processo.</p>
          <Link href="/dashboard/jobs" className="card-action">
            Ver Pipeline
            <ArrowRight size={18} />
          </Link>
        </GlassCard>
      </div>

      <style jsx>{`
        .modern-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0;
        }

        /* Hero Section */
        .dashboard-hero {
          background: linear-gradient(135deg, rgba(244, 169, 0, 0.1) 0%, rgba(193, 102, 107, 0.1) 100%);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(244, 169, 0, 0.2);
        }

        .hero-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          color: #FFFFFF;
        }

        .hero-content .highlight {
          color: var(--action-primary);
        }

        .hero-content p {
          font-size: 1.1rem;
          opacity: 0.7;
          color: #FFFFFF;
        }

        .quick-actions {
          display: flex;
          gap: 16px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .action-btn.primary {
          background: var(--action-primary);
          color: #1A1614;
          box-shadow: 0 4px 20px rgba(244, 169, 0, 0.3);
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(244, 169, 0, 0.4);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          padding: 32px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          min-height: 280px;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(244, 169, 0, 0.2), rgba(244, 169, 0, 0.05));
          color: var(--action-primary);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: rgba(125, 155, 106, 0.2);
          color: var(--status-success);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-success);
          animation: pulse 2s infinite;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #FFFFFF;
        }

        .feature-card p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 24px;
          flex: 1;
        }

        .card-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--action-primary);
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .card-action:hover {
          gap: 12px;
          color: #FFFFFF;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .content-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
          }

          .quick-actions {
            width: 100%;
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .hero-content h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
