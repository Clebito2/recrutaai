"use client";

import { useState } from "react";
import GlassCard from "@/components/common/GlassCard";
import SubscriptionGuard from "@/components/common/SubscriptionGuard";
import { 
  Briefcase, Target, Brain, ListChecks, DollarSign, MapPin, Zap, 
  Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, ShieldAlert,
  FolderGit2, Users, HelpCircle
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import { ARCHETYPE_MAP, MOTIVATOR_MAP } from "@/skills/job-architect";
import { FAMILY_DEFAULT_WEIGHTS } from "@/lib/validation";

const FAMILIES = [
  { id: "comercial", label: "Comercial / Vendas", weights: "40% Comp / 20% Téc / 30% Prát / 10% Alin" },
  { id: "atendimento", label: "Atendimento / CS", weights: "40% Comp / 20% Téc / 20% Prát / 20% Alin" },
  { id: "operacoes", label: "Operações / Administrativo", weights: "30% Comp / 30% Téc / 10% Prát / 30% Alin" },
  { id: "tecnico", label: "Técnico / Especialista", weights: "20% Comp / 40% Téc / 30% Prát / 10% Alin" },
  { id: "lideranca", label: "Liderança / Gestão", weights: "40% Comp / 10% Téc / 10% Prát / 40% Alin" },
  { id: "outro", label: "Outra Família", weights: "25% Comp / 25% Téc / 25% Prát / 25% Alin" }
];

export default function NewJobPage() {
  const [step, setStep] = useState(1);
  const [activePreviewTab, setActivePreviewTab] = useState("ad"); // 'ad' | 'interview'
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [generatedGuide, setGeneratedGuide] = useState("");
  const [error, setError] = useState("");
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    family: "comercial",
    archetype: "hunter",
    motivator: "financeiro",
    mustHaves: "",
    niceToHaves: "",
    salary: "",
    workModel: "Híbrido",
    benefits: "",
    repositoryUrl: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Se trocou a família, reseta o arquétipo para o primeiro da lista
      if (name === "family" && ARCHETYPE_MAP[value]) {
        updated.archetype = Object.keys(ARCHETYPE_MAP[value])[0];
      }
      return updated;
    });
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAd(true);
    setGeneratedDesc("");
    setError("");

    const companyName = userProfile?.companyName || "Live Consultoria";

    try {
      // 1. Gerar Anúncio de Vaga
      const response = await fetch("/api/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          diagnosticData: {
            ...formData,
            profileType: formData.family === "lideranca" ? "lideranca" : "tecnico"
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao gerar anúncio");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        setGeneratedDesc(prev => prev + chunk);
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGeneratingAd(false);
    }
  };

  const handleGenerateInterviewGuide = async () => {
    if (generatedGuide) return; // Já gerado
    setIsGeneratingGuide(true);
    const companyName = userProfile?.companyName || "Live Consultoria";

    try {
      const response = await fetch("/api/generate-interview-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          diagnosticData: formData
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao gerar roteiro");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setGeneratedGuide(prev => prev + chunk);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        description: generatedDesc,
        interviewGuide: generatedGuide || null,
        customWeights: FAMILY_DEFAULT_WEIGHTS[formData.family] || FAMILY_DEFAULT_WEIGHTS.tecnico,
        userId: user.uid,
        status: "active",
        createdAt: serverTimestamp()
      });
      window.location.href = "/dashboard/jobs";
    } catch (err) {
      setError("Erro ao salvar vaga no banco de dados");
    }
  };

  const currentArchetypes = ARCHETYPE_MAP[formData.family] || ARCHETYPE_MAP.outro;

  return (
    <SubscriptionGuard type="jobs">
      <div className="new-job-page animate-fade">
        <PageHeader
          title="Engenharia de Vagas & Seleção"
          subtitle="Metodologia Científica Live Consultoria: Funil de Atração, Gate Check e Roteiro de Entrevista Socrática."
        />

        {step === 1 ? (
          <GlassCard className="form-card">
            <div className="form-grid">
              {/* Título da Vaga */}
              <div className="form-group full-width">
                <label><Briefcase size={16} /> Título da Vaga</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Executivo de Vendas B2B, Tech Lead, Especialista Financeiro..."
                />
              </div>

              {/* Família de Vaga */}
              <div className="form-group">
                <label><Brain size={16} /> Família de Vaga</label>
                <select name="family" value={formData.family} onChange={handleInputChange}>
                  {FAMILIES.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <span className="helper-text">
                  Pesos Scorecard: {FAMILIES.find(f => f.id === formData.family)?.weights}
                </span>
              </div>

              {/* Arquétipo de Atuação Adaptativo */}
              <div className="form-group">
                <label><Users size={16} /> Arquétipo de Atuação</label>
                <select name="archetype" value={formData.archetype} onChange={handleInputChange}>
                  {Object.entries(currentArchetypes).map(([key, desc]) => (
                    <option key={key} value={key}>{desc}</option>
                  ))}
                </select>
                <span className="helper-text">Adaptado dinamicamente para {formData.family === 'outro' ? 'perfil customizado' : formData.family}</span>
              </div>

              {/* Se o arquétipo for customizado/outro, permitir especificar */}
              {(formData.archetype === 'outro' || formData.archetype === 'custom') && (
                <div className="form-group full-width animate-fade">
                  <label><HelpCircle size={16} /> Especificação do Arquétipo Personalizado</label>
                  <input
                    name="customArchetypeDetail"
                    value={formData.customArchetypeDetail || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Closer Consultivo, Líder Técnico de Transição, Especialista em Licitações..."
                  />
                  <span className="helper-text">Descreva a postura, estilo de trabalho e foco que este profissional deve ter.</span>
                </div>
              )}

              {/* Se a família for "Outro", permitir customizar nome específico */}
              {formData.family === 'outro' && (
                <div className="form-group full-width animate-fade">
                  <label><HelpCircle size={16} /> Descrição / Detalhe da Família de Cargo</label>
                  <input
                    name="customFamilyDetail"
                    value={formData.customFamilyDetail || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Recursos Humanos, Jurídico, Engenharia Civil, Logística..."
                  />
                  <span className="helper-text">Informe a área de atuação para a IA calibrar a redação e competências.</span>
                </div>
              )}

              {/* Motivador Principal */}
              <div className="form-group full-width">
                <label><Zap size={16} /> Motivador Principal do Candidato Ideal</label>
                <select name="motivator" value={formData.motivator} onChange={handleInputChange}>
                  {Object.entries(MOTIVATOR_MAP).map(([key, desc]) => (
                    <option key={key} value={key}>{desc}</option>
                  ))}
                </select>
              </div>

              {/* Se o motivador for "Outro", permitir customizar */}
              {formData.motivator === 'outro' && (
                <div className="form-group full-width animate-fade">
                  <label><HelpCircle size={16} /> Especificação do Motivador Personalizado</label>
                  <input
                    name="customMotivatorDetail"
                    value={formData.customMotivatorDetail || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Flexibilidade geográfica, projetos de alta relevância social, etc..."
                  />
                </div>
              )}

              {/* Requisitos Obrigatórios (Gate Check) */}
              <div className="form-group">
                <label className="label-warning">
                  <ShieldAlert size={16} /> Requisitos Obrigatórios (Eliminatórios — Gate Check)
                </label>
                <textarea
                  name="mustHaves"
                  rows={4}
                  value={formData.mustHaves}
                  onChange={handleInputChange}
                  placeholder="Ex: 3+ anos em vendas B2B complexas, CRM HubSpot, inglês avançado... (A IA reprovará no Gate quem não comprovar)"
                />
                <span className="helper-text warning">Candidatos sem estes requisitos serão marcados como Gate Reprovado.</span>
              </div>

              {/* Requisitos Desejáveis */}
              <div className="form-group">
                <label><Target size={16} /> Diferenciais Desejáveis (Pontos Extras)</label>
                <textarea
                  name="niceToHaves"
                  rows={4}
                  value={formData.niceToHaves}
                  onChange={handleInputChange}
                  placeholder="Ex: Pós-graduação, certificação específica, carteira de clientes ativos..."
                />
                <span className="helper-text">Elevam a pontuação no Scorecard mas não eliminam.</span>
              </div>

              {/* Faixa Salarial */}
              <div className="form-group">
                <label><DollarSign size={16} /> Remuneração / Faixa Salarial</label>
                <input 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleInputChange} 
                  placeholder="Ex: R$ 6.000 a R$ 9.000 + Comissão Agressiva" 
                />
              </div>

              {/* Modelo de Trabalho */}
              <div className="form-group">
                <label><MapPin size={16} /> Modelo de Trabalho</label>
                <select name="workModel" value={formData.workModel} onChange={handleInputChange}>
                  <option value="Híbrido">Híbrido</option>
                  <option value="100% Remoto">100% Remoto</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </div>

              {/* Benefícios */}
              <div className="form-group">
                <label><Sparkles size={16} /> Benefícios e Atrativos</label>
                <input 
                  name="benefits" 
                  value={formData.benefits} 
                  onChange={handleInputChange} 
                  placeholder="Ex: VR/VA, Plano de Saúde, Bonificação Trimestral, Stock Options..." 
                />
              </div>

              {/* Repositório de Currículos */}
              <div className="form-group">
                <label><FolderGit2 size={16} /> Repositório de Currículos (Drive / ATS / SharePoint)</label>
                <input 
                  name="repositoryUrl" 
                  value={formData.repositoryUrl} 
                  onChange={handleInputChange} 
                  placeholder="Link da pasta do Drive, SharePoint ou ATS do cliente" 
                />
              </div>
            </div>

            {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}

            <button className="btn-indigo full-width" onClick={handleGenerateAll} disabled={isGeneratingAd}>
              {isGeneratingAd ? (
                <><Loader2 className="spin" size={20} /> Redigindo Anúncio com Sobriedade Live...</>
              ) : (
                <>Gerar Descritivo de Vaga & Funil Live <Sparkles size={18} /></>
              )}
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="preview-card animate-fade">
            <div className="preview-header">
              <div className="preview-tabs">
                <button 
                  className={`tab-btn ${activePreviewTab === 'ad' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('ad')}
                >
                  <FileText size={16} /> Anúncio Oficial da Vaga
                </button>
                <button 
                  className={`tab-btn ${activePreviewTab === 'interview' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePreviewTab('interview');
                    if (!generatedGuide && !isGeneratingGuide) handleGenerateInterviewGuide();
                  }}
                >
                  <Brain size={16} /> Guia de Entrevista Socrática & Role Play
                </button>
              </div>

              <div className="preview-actions">
                <button onClick={() => setStep(1)} className="btn-secondary">Editar Diagnóstico</button>
                <button onClick={handleSave} className="btn-indigo">
                  <CheckCircle2 size={16} /> Salvar e Ativar Vaga
                </button>
              </div>
            </div>

            {activePreviewTab === 'ad' ? (
              <div className="preview-content whitespace-pre-wrap font-mono">
                {generatedDesc}
              </div>
            ) : (
              <div className="preview-content whitespace-pre-wrap">
                {isGeneratingGuide ? (
                  <div className="loading-box">
                    <Loader2 className="spin" size={24} />
                    <p>Estruturando Roteiro Socrático com STAR, Cenas A/B de Role Play e Teste de Coachability...</p>
                  </div>
                ) : (
                  generatedGuide || "Clique na aba acima para gerar o Roteiro de Entrevista."
                )}
              </div>
            )}
          </GlassCard>
        )}

        <style jsx>{`
          .new-job-page { max-width: 900px; margin: 0 auto; }
          .form-card { padding: 32px; }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
          .full-width { grid-column: span 2; }
          .form-group label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; opacity: 0.9; }
          .label-warning { color: #f59e0b; }
          .helper-text { display: block; font-size: 0.75rem; opacity: 0.6; margin-top: 4px; }
          .helper-text.warning { color: #f59e0b; opacity: 0.85; }
          .form-group input, .form-group select, .form-group textarea { 
            width: 100%; 
            padding: 12px; 
            border-radius: 8px; 
            background: rgba(10, 36, 61, 0.4); 
            border: 1px solid rgba(255, 255, 255, 0.12); 
            color: white; 
            font-size: 0.95rem;
          }
          .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: #3B82F6;
          }
          .btn-indigo { 
            background: #3B82F6; 
            color: #FFFFFF; 
            border: none; 
            padding: 16px; 
            border-radius: 10px; 
            font-weight: 700; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            gap: 10px; 
            transition: all 0.2s ease;
          }
          .btn-indigo:hover {
            background: #2563EB;
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #F8FAFC;
            border: 1px solid #1E293B;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          .preview-card { padding: 32px; }
          .preview-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1E293B; padding-bottom: 16px; margin-bottom: 20px; }
          .preview-tabs { display: flex; gap: 10px; }
          .tab-btn { background: #131B2A; border: 1px solid #1E293B; color: #94A3B8; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.2s; }
          .tab-btn.active { background: #3B82F6; border-color: #3B82F6; color: #FFFFFF; }
          .preview-actions { display: flex; gap: 12px; }
          .preview-content { background: #131B2A; padding: 28px; border-radius: 12px; border: 1px solid #1E293B; line-height: 1.8; color: #F8FAFC; }
          .loading-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #3B82F6; }
          .error-msg { display: flex; align-items: center; gap: 8px; color: #ff4d4d; background: rgba(255, 77, 77, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 20px; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}

