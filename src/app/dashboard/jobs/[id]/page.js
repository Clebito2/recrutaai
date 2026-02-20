"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../../components/common/GlassCard";
import SubscriptionGuard from "../../../../components/common/SubscriptionGuard";
import PageHeader from "../../../../components/common/PageHeader";
import MetaList from "../../../../components/common/MetaList";
import MetaItem from "../../../../components/common/MetaItem";
import { Copy, Check, MapPin, Calendar, Briefcase } from "lucide-react";
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

  const actions = (
    <button onClick={handleCopy} className="btn-secondary">
      {copied ? <Check size={18} /> : <Copy size={18} />}
      {copied ? "Copiado" : "Copiar Texto"}
    </button>
  );

  return (
    <SubscriptionGuard type="job">
      <div className="job-details-container animate-fade">
        <PageHeader
          title={job.title}
          backPath="/dashboard/jobs"
          backLabel="Voltar para Vagas"
          actions={actions}
        />

        <div className="job-grid">
          <div className="main-content">
            <GlassCard className="content-card">
              <pre className="job-text">{job.jobDescription}</pre>
            </GlassCard>
          </div>

          <div className="sidebar">
            <GlassCard className="meta-card">
              <MetaList title="Detalhes Estruturais">
                <MetaItem icon={<Briefcase size={16} />} label="Perfil">
                  {job.type || "Não definido"}
                </MetaItem>
                <MetaItem icon={<MapPin size={16} />} label="Modelo">
                  {job.jobData?.workModel || job.workModel || "N/A"}
                </MetaItem>
                <MetaItem icon={<Calendar size={16} />} label="Criado em">
                  {job.createdAt?.toDate?.().toLocaleDateString("pt-BR") || "Hoje"}
                </MetaItem>
              </MetaList>
            </GlassCard>
          </div>
        </div>

        <style jsx>{`
          .job-details-container {
            max-width: 1200px;
            margin: 0 auto;
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
