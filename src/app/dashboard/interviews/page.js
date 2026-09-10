"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import { Calendar, Clock, User, MapPin, FileText, Trash2, Plus, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  const fetchInterviews = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "interviews"),
        where("userId", "==", user.uid),
        orderBy("scheduledAt", "asc")
      );

      const snapshot = await getDocs(q);
      const interviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate ? doc.data().scheduledAt.toDate() : new Date(doc.data().scheduledAt)
      }));

      setInterviews(interviewsData);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interviewId) => {
    if (!confirm("Excluir esta entrevista agendada?")) return;

    try {
      await deleteDoc(doc(db, "interviews", interviewId));
      setInterviews(interviews.filter(i => i.id !== interviewId));
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Erro ao excluir entrevista");
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPast = (date) => {
    return date < new Date();
  };

  const upcomingInterviews = interviews.filter(i => !isPast(i.scheduledAt));
  const pastInterviews = interviews.filter(i => isPast(i.scheduledAt));

  return (
    <div className="interviews-page">
      <header className="page-header">
        <div>
          <h1>Entrevistas Agendadas</h1>
          <p>Gerencie seus agendamentos de entrevistas</p>
        </div>
        <Link href="/dashboard/candidates" className="btn-indigo">
          <Plus size={18} />
          Agendar Nova
        </Link>
      </header>

      {/* Guia de Instruções da Ferramenta */}
      <div className="tool-guide-card animate-fade">
        <div className="guide-icon">
          <Info size={22} color="var(--purple-600)" />
        </div>
        <div className="guide-text">
          <strong>Instruções de Condução de Entrevistas Live:</strong>
          <p>
            1. <strong>Agendamento:</strong> Vincule as datas de entrevistas diretamente a partir da triagem de candidatos.
            <br />
            2. <strong>Roteiro Socrático Personalizado:</strong> Antes da sessão, acesse a aba <strong>Candidatos</strong> e gere o <em>Roteiro Socrático & Role Play</em> específico para investigar as fragilidades deste candidato.
            <br />
            3. <strong>Condução & Simulação:</strong> Aplique o caso prático proposto e dê o feedback corretivo para mensurar a <em>Coachability</em> com o scorecard da vaga.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando entrevistas...</p>
        </div>
      ) : (
        <>
          {/* Upcoming Interviews */}
          <section className="interviews-section">
            <h2>Próximas Entrevistas ({upcomingInterviews.length})</h2>
            {upcomingInterviews.length === 0 ? (
              <GlassCard className="empty-state">
                <Calendar size={48} color="var(--action-accent)" />
                <h3>Nenhuma entrevista agendada</h3>
                <p>Agende entrevistas a partir da análise de candidatos</p>
              </GlassCard>
            ) : (
              <div className="interviews-grid">
                {upcomingInterviews.map(interview => (
                  <GlassCard key={interview.id} className="interview-card upcoming">
                    <div className="interview-header">
                      <div className="candidate-info">
                        <User size={20} />
                        <h3>{interview.candidateName}</h3>
                      </div>
                      <span className="status-badge upcoming">Agendada</span>
                    </div>

                    <div className="interview-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{formatDateTime(interview.scheduledAt)}</span>
                      </div>
                      {interview.location && (
                        <div className="detail-item location">
                          <MapPin size={16} />
                          <span>{interview.location}</span>
                        </div>
                      )}
                      {interview.notes && (
                        <div className="detail-item notes">
                          <FileText size={16} />
                          <span>{interview.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="interview-actions">
                      <button
                        className="btn-delete-small"
                        onClick={() => handleDelete(interview.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>

          {/* Past Interviews */}
          {pastInterviews.length > 0 && (
            <section className="interviews-section">
              <h2>Entrevistas Passadas ({pastInterviews.length})</h2>
              <div className="interviews-grid">
                {pastInterviews.map(interview => (
                  <GlassCard key={interview.id} className="interview-card past">
                    <div className="interview-header">
                      <div className="candidate-info">
                        <User size={20} />
                        <h3>{interview.candidateName}</h3>
                      </div>
                      <span className="status-badge past">Realizada</span>
                    </div>

                    <div className="interview-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{formatDateTime(interview.scheduledAt)}</span>
                      </div>
                      {interview.notes && (
                        <div className="detail-item notes">
                          <FileText size={16} />
                          <span>{interview.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="interview-actions">
                      <button
                        className="btn-delete-small"
                        onClick={() => handleDelete(interview.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          )}
        </>
      )
      }

      <style jsx>{`
        .interviews-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .page-header p {
          opacity: 0.7;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(244, 169, 0, 0.2);
          border-top-color: var(--action-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .interviews-section {
          margin-bottom: 48px;
        }

        .interviews-section h2 {
          font-size: 1.25rem;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .interviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .interview-card {
          padding: 24px;
          position: relative;
        }

        .interview-card.upcoming {
          border-left: 3px solid var(--action-primary);
        }

        .interview-card.past {
          border-left: 3px solid rgba(255, 255, 255, 0.2);
          opacity: 0.7;
        }

        .interview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .candidate-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .candidate-info h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.upcoming {
          background: rgba(244, 169, 0, 0.2);
          color: var(--action-primary);
        }

        .status-badge.past {
          background: var(--line);
          color: var(--ink-500);
        }

        .interview-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .detail-item.notes {
          opacity: 0.7;
          font-style: italic;
        }

        .interview-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 12px;
          border-top: 1px solid var(--border-glass);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state h3 {
          margin: 16px 0 8px;
        }

        .empty-state p {
          opacity: 0.6;
        }

        .tool-guide-card {
          display: flex;
          background: var(--ink-900);
          border: 1px solid var(--line);
          border-left: 4px solid var(--purple-600);
          padding: 16px 20px;
          border-radius: 10px;
          gap: 14px;
          margin-bottom: 24px;
          align-items: flex-start;
        }
        .guide-icon { flex-shrink: 0; margin-top: 2px; }
        .guide-text { font-size: 0.88rem; line-height: 1.6; color: #E2E8F0; }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .interviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div >
  );
}
