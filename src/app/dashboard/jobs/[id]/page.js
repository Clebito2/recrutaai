"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../../components/common/GlassCard";
import SubscriptionGuard from "../../../../components/common/SubscriptionGuard";
import PageHeader from "../../../../components/common/PageHeader";
import MetaList from "../../../../components/common/MetaList";
import MetaItem from "../../../../components/common/MetaItem";
import { Copy, Check, MapPin, Calendar, Briefcase, Award, Sliders, ExternalLink, MessageSquareQuote, FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { JOB_FAMILIES, FAMILY_DEFAULT_WEIGHTS } from "../../../../lib/validation";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("ad"); // "ad" | "guide"

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
    const textToCopy = activeTab === "guide" ? (job?.interviewGuide || "") : (job?.jobDescription || "");
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="loading">Carregando inteligência da vaga...</div>;
  if (!job) return null;

  const familyLabel = JOB_FAMILIES.find(f => f.id === job.family)?.label || job.family || "Padrão Live";
  const weights = job.customWeights || FAMILY_DEFAULT_WEIGHTS[job.family] || FAMILY_DEFAULT_WEIGHTS.comercial;

  const actions = (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={handleCopy} className="btn-secondary">
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "Copiado" : activeTab === "guide" ? "Copiar Roteiro" : "Copiar Anúncio"}
      </button>
      <button 
        onClick={() => router.push(`/dashboard/candidates?jobId=${job.id}`)}
        className="btn-indigo"
      >
        Analisar Candidatos
      </button>
    </div>
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

        {/* Tab Switcher */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'ad' ? 'active' : ''}`}
            onClick={() => setActiveTab('ad')}
          >
            <FileText size={16} /> Anúncio Oficial
          </button>
          <button 
            className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <MessageSquareQuote size={16} /> Roteiro Socrático de Entrevista
          </button>
        </div>

        <div className="job-grid">
          <div className="main-content">
            <GlassCard className="content-card">
              {activeTab === "ad" ? (
                <pre className="job-text">{job.jobDescription || "Nenhuma descrição de anúncio salva para esta vaga."}</pre>
              ) : (
                <pre className="job-text guide-text">{job.interviewGuide || "Nenhum roteiro de entrevista estruturado foi gerado para esta vaga. Você pode gerar através do Arquiteto de Vagas."}</pre>
              )}
            </GlassCard>
          </div>

          <div className="sidebar">
            <GlassCard className="meta-card">
              <MetaList title="Arquitetura de Vaga (Live)">
                <MetaItem icon={<Briefcase size={16} />} label="Família Funcional">
                  {familyLabel}
                </MetaItem>
                {job.archetype && (
                  <MetaItem icon={<Award size={16} />} label="Arquétipo">
                    {job.archetype}
                  </MetaItem>
                )}
                <MetaItem icon={<MapPin size={16} />} label="Modelo de Trabalho">
                  {job.workModel || job.jobData?.workModel || "Não especificado"}
                </MetaItem>
                {job.salary && (
                  <MetaItem icon={<Sliders size={16} />} label="Faixa Salarial / OTE">
                    {job.salary}
                  </MetaItem>
                )}
                <MetaItem icon={<Calendar size={16} />} label="Criado em">
                  {job.createdAt?.toDate?.().toLocaleDateString("pt-BR") || "Hoje"}
                </MetaItem>
              </MetaList>

              <div className="weights-section">
                <h4>Pesos de Scorecard da Vaga</h4>
                <div className="weights-grid">
                  <div className="weight-item">
                    <span>Comportamental:</span>
                    <strong>{weights.comportamental}%</strong>
                  </div>
                  <div className="weight-item">
                    <span>Técnica:</span>
                    <strong>{weights.tecnica}%</strong>
                  </div>
                  <div className="weight-item">
                    <span>Prática:</span>
                    <strong>{weights.pratica}%</strong>
                  </div>
                  <div className="weight-item">
                    <span>Alinhamento:</span>
                    <strong>{weights.alinhamento}%</strong>
                  </div>
                </div>
              </div>

              {job.repositoryUrl && (
                <div className="repo-section">
                  <a href={job.repositoryUrl} target="_blank" rel="noopener noreferrer" className="repo-link">
                    <ExternalLink size={14} /> Acessar Repositório Drive/ATS
                  </a>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        <style jsx>{`
          .job-details-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .tab-container {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }

          .tab-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
          }

          .tab-btn.active {
            background: #3B82F6;
            border-color: #3B82F6;
            color: #FFFFFF;
            font-weight: 600;
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
            color: #F8FAFC;
            font-size: 1rem;
          }

          .guide-text {
            color: #F8FAFC;
            background: #131B2A;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #3B82F6;
          }

          .meta-card {
            padding: 24px;
          }

          .weights-section {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #1E293B;
          }

          .weights-section h4 {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #60A5FA;
            margin-bottom: 12px;
          }

          .weights-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .weight-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            background: rgba(255, 255, 255, 0.03);
            padding: 6px 10px;
            border-radius: 6px;
          }

          .weight-item strong {
            color: #fff;
          }

          .repo-section {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #1E293B;
          }

          .repo-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #3B82F6;
            font-size: 0.85rem;
            text-decoration: none;
          }

          .repo-link:hover {
            text-decoration: underline;
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #1E293B;
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            font-size: 0.9rem;
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .btn-indigo {
            background: #3B82F6;
            color: #FFFFFF;
            font-weight: 600;
            padding: 10px 18px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
          }

          .btn-indigo:hover {
            opacity: 0.9;
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
