"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../../components/common/GlassCard";
import SubscriptionGuard from "../../../../components/common/SubscriptionGuard";
import { ArrowLeft, Copy, Check, MapPin, Calendar, Briefcase, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function JobDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!user || !id) return;

            try {
                const docRef = doc(db, "jobs", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setJob({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such job!");
                    router.push("/dashboard/jobs");
                }
            } catch (error) {
                console.error("Error getting job:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [user, id, router]);

    const handleCopy = async () => {
        if (!job?.jobDescription) return;
        await navigator.clipboard.writeText(job.jobDescription);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="loading">Carregando dados da vaga...</div>;
    if (!job) return null;

    return (
        <SubscriptionGuard type="job">
            <div className="job-details-container animate-fade">
                <header className="page-header">
                    <Link href="/dashboard/jobs" className="back-link">
                        <ArrowLeft size={16} /> Voltar para Vagas
                    </Link>
                    <div className="header-actions">
                        <h1>{job.title}</h1>
                        <button onClick={handleCopy} className="btn-secondary">
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? "Copiado" : "Copiar Texto"}
                        </button>
                    </div>
                </header>

                <div className="job-grid">
                    <div className="main-content">
                        <GlassCard className="content-card">
                            <pre className="job-text">{job.jobDescription}</pre>
                        </GlassCard>
                    </div>

                    <div className="sidebar">
                        <GlassCard className="meta-card">
                            <h3>Detalhes Estruturais</h3>
                            <div className="meta-list">
                                <div className="meta-item">
                                    <Briefcase size={16} />
                                    <div>
                                        <label>Perfil</label>
                                        <span>{job.type || "Não definido"}</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <MapPin size={16} />
                                    <div>
                                        <label>Modelo</label>
                                        <span>{job.jobData?.workModel || job.workModel || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <div>
                                        <label>Criado em</label>
                                        <span>{job.createdAt?.toDate?.().toLocaleDateString("pt-BR") || "Hoje"}</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                <style jsx>{`
          .job-details-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 30px;
          }

          .back-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            font-size: 0.9rem;
            margin-bottom: 20px;
          }

          .header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-actions h1 {
            font-size: 2rem;
            font-weight: 800;
          }

          .job-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
          }

          .content-card {
            padding: 30px;
            min-height: 60vh;
          }

          .job-text {
            white-space: pre-wrap;
            font-family: var(--font-ui);
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
          }

          .meta-card {
            padding: 24px;
          }

          .meta-card h3 {
            font-size: 1rem;
            text-transform: uppercase;
            opacity: 0.5;
            margin-bottom: 20px;
          }

          .meta-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .meta-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }

          .meta-item label {
            display: block;
            font-size: 0.75rem;
            opacity: 0.5;
            text-transform: uppercase;
          }

          .meta-item span {
            font-weight: 600;
            text-transform: capitalize;
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-glass);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .loading {
            text-align: center;
            padding: 60px;
            opacity: 0.5;
          }

          @media (max-width: 768px) {
            .job-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
            </div>
        </SubscriptionGuard>
    );
}
