"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../../../components/common/GlassCard";
import SubscriptionGuard from "../../../../components/common/SubscriptionGuard";
import PageHeader from "../../../../components/common/PageHeader";
import MetaList from "../../../../components/common/MetaList";
import MetaItem from "../../../../components/common/MetaItem";
import { Copy, Check, MapPin, Calendar, Briefcase, Award, Sliders, ExternalLink, MessageSquareQuote, FileText, Building2, Edit3, Save, X, ListChecks } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { JOB_FAMILIES, FAMILY_DEFAULT_WEIGHTS } from "../../../../lib/validation";

export default function JobDetails() {
  const { id } = useParams();
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("ad"); // "ad" | "guide"
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [saving, setSaving] = useState(false);

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
    const textToCopy = activeTab === "guide" 
      ? (job?.interviewGuide || "") 
      : (job?.jobDescription || job?.description || "");
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    const currentText = activeTab === "guide"
      ? (job?.interviewGuide || "")
      : (job?.jobDescription || job?.description || "");
    setEditedText(currentText);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "jobs", id);
      const updateData = activeTab === "guide"
        ? { interviewGuide: editedText }
        : { jobDescription: editedText, description: editedText };

      await updateDoc(docRef, updateData);
      setJob(prev => ({ ...prev, ...updateData }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Erro ao salvar alterações no texto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Carregando inteligência da vaga...</div>;
  if (!job) return null;

  const familyLabel = JOB_FAMILIES.find(f => f.id === job.family)?.label || job.family || "Padrão Live";
  const weights = job.customWeights || FAMILY_DEFAULT_WEIGHTS[job.family] || FAMILY_DEFAULT_WEIGHTS.comercial;
  const companyName = job.companyName || userProfile?.companyName || "Empresa";

  const actions = (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {!isEditing ? (
        <>
          <button onClick={handleStartEdit} className="btn-secondary">
            <Edit3 size={16} /> Editar Texto
          </button>
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
        </>
      ) : (
        <>
          <button onClick={() => setIsEditing(false)} className="btn-secondary" disabled={saving}>
            <X size={16} /> Cancelar
          </button>
          <button onClick={handleSaveEdit} className="btn-indigo" disabled={saving}>
            <Save size={16} /> {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </>
      )}
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
            onClick={() => { setActiveTab('ad'); setIsEditing(false); }}
          >
            <FileText size={16} /> Anúncio Oficial
          </button>
          <button 
            className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => { setActiveTab('guide'); setIsEditing(false); }}
          >
            <MessageSquareQuote size={16} /> Roteiro Socrático de Entrevista
          </button>
        </div>

        <div className="job-grid">
          <div className="main-content">
            <GlassCard className="content-card">
              {isEditing ? (
                <div className="editor-wrapper">
                  <div className="editor-info">
                    <span>Editando: {activeTab === "ad" ? "Anúncio Oficial" : "Roteiro Socrático de Entrevista"}</span>
                  </div>
                  <textarea
                    className="job-textarea"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={22}
                    placeholder="Edite o conteúdo..."
                  />
                </div>
              ) : activeTab === "ad" ? (
                <pre className="job-text">{job.jobDescription || job.description || "Nenhuma descrição de anúncio salva para esta vaga."}</pre>
              ) : (
                <pre className="job-text guide-text">{job.interviewGuide || "Nenhum roteiro de entrevista estruturado foi gerado para esta vaga. Você pode gerar através do Arquiteto de Vagas."}</pre>
              )}
            </GlassCard>
          </div>

          <div className="sidebar">
            <GlassCard className="meta-card">
              <MetaList title="Arquitetura de Vaga (Live)">
                <MetaItem icon={<Building2 size={16} />} label="Empresa Contratante">
                  {companyName}
                </MetaItem>
                {job.companyDescription && (
                  <MetaItem icon={<Building2 size={16} />} label="Sobre a Empresa">
                    <span style={{ fontSize: "0.82rem", color: "#CBD5E1", lineHeight: "1.5" }}>
                      {job.companyDescription}
                    </span>
                  </MetaItem>
                )}
                {job.responsibilities && (
                  <MetaItem icon={<ListChecks size={16} />} label="Atribuições / Rotina">
                    <span style={{ fontSize: "0.82rem", color: "#CBD5E1", lineHeight: "1.5" }}>
                      {job.responsibilities}
                    </span>
                  </MetaItem>
                )}
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

          .editor-wrapper {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .editor-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            color: #60A5FA;
            font-weight: 600;
          }

          .job-textarea {
            width: 100%;
            min-height: 480px;
            background: #0B0F17;
            border: 1px solid #1E293B;
            border-radius: 8px;
            padding: 18px;
            color: #F8FAFC;
            font-family: inherit;
            font-size: 0.95rem;
            line-height: 1.7;
            white-space: pre-wrap;
            resize: vertical;
          }

          .job-textarea:focus {
            outline: none;
            border-color: #3B82F6;
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
