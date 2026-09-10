"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import SubscriptionGuard from "../../../components/common/SubscriptionGuard";
import { Plus, Search, MapPin, Clock, ArrowRight, User, Briefcase, Trash2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useJobStore } from "../../../store/useJobStore";
import PageHeader from "../../../components/common/PageHeader";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { setActiveJob } = useJobStore();

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "jobs"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));
        setJobs(data.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleDelete = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Excluir esta vaga permanentemente?")) return;

    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir vaga");
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SubscriptionGuard type="jobs">
      <div className="jobs-page animate-fade">
        <PageHeader
          title="Minhas Vagas"
          subtitle="Gerencie suas oportunidades e analise candidatos vinculados."
          action={
            <Link href="/dashboard/jobs/new" className="btn-indigo">
              <Plus size={20} /> Nova Vaga
            </Link>
          }
        />

        <div className="search-bar animate-fade">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por título da vaga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="loading-state"><Loader2 className="spin" size={32} /></div>
        ) : filteredJobs.length === 0 ? (
          <GlassCard className="empty-state">
            <Briefcase size={48} opacity={0.2} />
            <p>{searchTerm ? "Nenhuma vaga encontrada para sua busca." : "Nenhuma vaga criada ainda."}</p>
            {!searchTerm && <Link href="/dashboard/jobs/new" className="btn-secondary">Criar minha primeira vaga</Link>}
          </GlassCard>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <GlassCard key={job.id} className="job-card">
                <Link href={`/dashboard/jobs/${job.id}`} onClick={() => setActiveJob(job)}>
                  <div className="job-content">
                    <div className="job-header">
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div className="job-status-badge">Ativa</div>
                        {job.family && (
                          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "12px", textTransform: "capitalize", color: "#94a3b8" }}>
                            {job.family}
                          </span>
                        )}
                      </div>
                      <button className="delete-btn" onClick={(e) => handleDelete(e, job.id)}><Trash2 size={16} /></button>
                    </div>

                    <h3 className="job-title">{job.title}</h3>

                    <div className="job-meta">
                      <span><MapPin size={14} /> {job.workModel || "Presencial"}</span>
                      <span><Clock size={14} /> {formatDate(job.createdAt)}</span>
                    </div>

                    <div className="job-footer">
                      <div className="candidate-count">
                        <User size={16} /> 0 Candidatos
                      </div>
                      <div className="view-more">Ver Detalhes <ArrowRight size={16} /></div>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}

        <style jsx>{`
          .jobs-page { max-width: 1000px; margin: 0 auto; }
          .search-bar { background: var(--purple-100); border: 1px solid var(--border-glass); border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
          .search-icon { color: var(--ink-500); }
          .search-bar input { background: transparent; border: none; color: white; width: 100%; font-size: 1rem; }
          .search-bar input:focus { outline: none; }
          .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
          .job-card { padding: 0; overflow: hidden; height: 100%; border: 1px solid rgba(255, 255, 255, 0.08); background: var(--ink-900); }
          .job-card :global(a) { text-decoration: none; color: var(--ink-900) !important; }
          .job-content { padding: 24px; display: flex; flex-direction: column; height: 100%; }
          .job-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .job-status-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: rgba(16, 185, 129, 0.15); color: var(--status-success); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.3); }
          .delete-btn { background: transparent; border: none; color: #EF4444; opacity: 0.6; cursor: pointer; transition: opacity 0.2s; }
          .delete-btn:hover { opacity: 1; }
          .job-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; color: var(--ink-900) !important; }
          .job-meta { display: flex; gap: 16px; font-size: 0.88rem; color: var(--ink-500) !important; margin-bottom: 24px; }
          .job-meta span { display: flex; align-items: center; gap: 6px; color: var(--ink-500) !important; }
          .job-meta :global(svg) { color: var(--purple-600) !important; }
          .job-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
          .candidate-count { font-size: 0.88rem; color: var(--ink-500) !important; display: flex; align-items: center; gap: 6px; }
          .candidate-count :global(svg) { color: var(--purple-600) !important; }
          .view-more { color: var(--purple-600) !important; font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
          .job-card:hover .view-more { gap: 8px; color: var(--purple-600) !important; }
          .loading-state { display: flex; justify-content: center; padding: 60px; }
          .empty-state { padding: 60px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}

function formatDate(date) {
  if (!date) return "";
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}
