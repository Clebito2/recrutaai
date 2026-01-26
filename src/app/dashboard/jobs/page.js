"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import { Plus, Briefcase, Calendar, MapPin, ChevronRight, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;

            try {
                // For now, we'll show placeholder data
                // In production, this would fetch from Firestore
                setJobs([
                    {
                        id: "1",
                        title: "Senior Account Executive",
                        type: "Hunter",
                        workModel: "Híbrido",
                        createdAt: new Date(),
                        status: "active",
                        applicants: 12
                    },
                    {
                        id: "2",
                        title: "Customer Success Manager",
                        type: "Farmer",
                        workModel: "Remoto",
                        createdAt: new Date(Date.now() - 86400000 * 2),
                        status: "active",
                        applicants: 8
                    }
                ]);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user]);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="jobs-page animate-fade">
            <header className="page-header">
                <div className="header-info">
                    <h1>Pipeline de Vagas</h1>
                    <p>Gerencie suas posições abertas e acompanhe candidatos.</p>
                </div>
                <Link href="/dashboard/jobs/new" className="btn-indigo">
                    <Plus size={20} /> Nova Vaga
                </Link>
            </header>

            <div className="jobs-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar vagas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-filter">
                    <Filter size={18} /> Filtros
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Carregando vagas...</div>
            ) : filteredJobs.length === 0 ? (
                <GlassCard className="empty-state">
                    <Briefcase size={48} color="var(--action-primary)" />
                    <h3>Nenhuma vaga encontrada</h3>
                    <p>Crie sua primeira vaga usando o Arquiteto de Vagas com IA.</p>
                    <Link href="/dashboard/jobs/new" className="btn-indigo">
                        <Plus size={20} /> Criar Primeira Vaga
                    </Link>
                </GlassCard>
            ) : (
                <div className="jobs-grid">
                    {filteredJobs.map((job) => (
                        <GlassCard key={job.id} className="job-card">
                            <div className="job-header">
                                <div className="job-badge">{job.type}</div>
                                <span className={`status-dot ${job.status}`} />
                            </div>

                            <h3 className="job-title">{job.title}</h3>

                            <div className="job-meta">
                                <span><MapPin size={14} /> {job.workModel}</span>
                                <span><Calendar size={14} /> {formatDate(job.createdAt)}</span>
                            </div>

                            <div className="job-stats">
                                <div className="stat">
                                    <span className="stat-value">{job.applicants}</span>
                                    <span className="stat-label">Candidatos</span>
                                </div>
                            </div>

                            <Link href={`/dashboard/jobs/${job.id}`} className="job-action">
                                Ver Detalhes <ChevronRight size={16} />
                            </Link>
                        </GlassCard>
                    ))}
                </div>
            )}

            <style jsx>{`
        .jobs-page {
          max-width: 1200px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .header-info h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .header-info p {
          opacity: 0.6;
        }

        .jobs-toolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
        }

        .search-box input {
          width: 100%;
          background: var(--canvas-card);
          border: 1px solid var(--border-glass);
          padding: 14px 16px 14px 48px;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--action-primary);
        }

        .btn-filter {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--canvas-card);
          border: 1px solid var(--border-glass);
          padding: 14px 20px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-filter:hover {
          border-color: var(--action-primary);
          color: white;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .job-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .job-badge {
          background: rgba(79, 70, 229, 0.1);
          color: var(--action-primary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--action-secondary);
        }

        .status-dot.active {
          box-shadow: 0 0 8px var(--action-secondary);
        }

        .job-title {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.3;
        }

        .job-meta {
          display: flex;
          gap: 16px;
          font-size: 0.85rem;
          opacity: 0.6;
        }

        .job-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .job-stats {
          display: flex;
          gap: 24px;
          padding: 16px 0;
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--action-secondary);
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.5;
          text-transform: uppercase;
        }

        .job-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--action-accent);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          margin-top: auto;
        }

        .job-action:hover {
          color: white;
        }

        .empty-state {
          padding: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin-top: 8px;
        }

        .empty-state p {
          opacity: 0.6;
          margin-bottom: 16px;
        }

        .loading-state {
          text-align: center;
          padding: 60px;
          opacity: 0.5;
        }

        .animate-fade {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString("pt-BR");
}
