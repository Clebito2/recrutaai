"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/common/GlassCard";
import SubscriptionGuard from "@/components/common/SubscriptionGuard";
import { 
  Briefcase, Target, Brain, ListChecks, DollarSign, MapPin, Zap, 
  Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, ShieldAlert,
  FolderGit2, Users, HelpCircle, Building2, Copy, Check, Info
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import { ARCHETYPE_MAP, MOTIVATOR_MAP } from "@/skills/job-architect";
import { FAMILY_DEFAULT_WEIGHTS } from "@/lib/validation";
import { cleanJobAdText } from "@/lib/formatters";

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
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    companyName: userProfile?.companyName || "",
    companyDescription: "",
    title: "",
    family: "comercial",
    archetype: "hunter",
    responsibilities: "",
    motivator: "financeiro",
    mustHaves: "",
    niceToHaves: "",
    salary: "",
    workModel: "Híbrido",
    benefits: "",
    repositoryUrl: ""
  });

  useEffect(() => {
    if (userProfile?.companyName && !formData.companyName) {
      setFormData(prev => ({ ...prev, companyName: userProfile.companyName }));
    }
  }, [userProfile, formData.companyName]);

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

    const targetCompany = formData.companyName?.trim() || userProfile?.companyName || "Empresa Contratante";

    try {
      // 1. Gerar Anúncio de Vaga
      const response = await fetch("/api/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: targetCompany,
          diagnosticData: {
            ...formData,
            companyName: targetCompany,
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

  const handleCopyAd = async () => {
    const text = cleanJobAdText(generatedDesc);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      const targetCompany = formData.companyName?.trim() || userProfile?.companyName || "Empresa Contratante";
      const cleanDesc = cleanJobAdText(generatedDesc);
      await addDoc(collection(db, "jobs"), {
        ...formData,
        companyName: targetCompany,
        description: cleanDesc,
        jobDescription: cleanDesc,
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

        {/* Guia de Instruções da Ferramenta */}
        <div className="tool-guide-card animate-fade">
          <div className="guide-icon">
            <Info size={22} color="#3B82F6" />
          </div>
          <div className="guide-text">
            <strong>Instruções do Arquiteto de Vagas:</strong>
            <p>
              1. Defina a <strong>Empresa Contratante</strong> e os critérios eliminatórios no <strong>Gate Check</strong>.
              <br />
              2. A IA redigirá o <strong>Anúncio Oficial sem clichês</strong>, formatado com quebras de linha e pronto para copiar e publicar.
              <br />
              3. <em>Metodologia Live:</em> O <strong>Roteiro Socrático de Entrevista & Role Play</strong> é gerado de forma <strong>personalizada para cada candidato</strong> após a triagem e ranqueamento dos currículos na aba <strong>Candidatos</strong>.
            </p>
          </div>
        </div>

        {step === 1 ? (
          <GlassCard className="form-card">
            <div className="form-grid">
              {/* Empresa Contratante / Cliente */}
              <div className="form-group full-width">
                <label><Building2 size={16} /> Empresa Contratante / Cliente</label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Ex: Visual work, TechCorp, Padaria Central..."
                  required
                />
                <span className="helper-text">
                  Nome da empresa onde a vaga será aberta (constará no anúncio oficial e no roteiro de entrevista).
                </span>
              </div>

              {/* Sobre a Empresa / Contexto do Negócio */}
              <div className="form-group full-width">
                <label><Building2 size={16} /> Sobre a Empresa (Segmento, Cultura, Momento & Diferenciais)</label>
                <textarea
                  name="companyDescription"
                  rows={3}
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  placeholder="Ex: Empresa de tecnologia B2B líder em soluções logísticas, com mais de 500 clientes corporativos. Estamos em fase de expansão acelerada após rodada de investimento Série A, com cultura orientada a dados, autonomia e alta velocidade..."
                />
                <span className="helper-text">
                  Apresente o segmento, momento e diferencial para a IA redigir um 'Sobre a Empresa' autêntico e sem clichês.
                </span>
              </div>

              {/* Título da Vaga */}
              <div className="form-group full-width">
                <label><Briefcase size={16} /> Título da Vaga</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Executivo de Vendas B2B, Tech Lead, Mecânico, Especialista Financeiro..."
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

              {/* Principais Atribuições e Responsabilidades */}
              <div className="form-group full-width">
                <label><ListChecks size={16} /> Principais Atribuições & Responsabilidades (Dia a Dia e Metas)</label>
                <textarea
                  name="responsibilities"
                  rows={4}
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  placeholder="Ex: Prospecção ativa de contas enterprise (ticket médio R$ 50k); Negociação direta com C-levels; Alimentar e gerenciar pipeline no CRM HubSpot; Conduzir demonstrações técnicas do produto; Atingir metas trimestrais de novas vendas..."
                />
                <span className="helper-text">
                  Descreva as rotinas, entregas prioritárias e metas reais para que o anúncio reflita a prática do cargo.
                </span>
              </div>

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
                <>Gerar Anúncio Oficial da Vaga <Sparkles size={18} /></>
              )}
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="preview-card animate-fade">
            <div className="preview-header">
              <div className="preview-info-col">
                <span className="step-pill">Anúncio Formatado</span>
                <h2>{formData.title}</h2>
                <span className="client-subtitle">Empresa Contratante: <strong>{formData.companyName || userProfile?.companyName}</strong></span>
              </div>

              <div className="preview-actions">
                <button onClick={handleCopyAd} className="btn-secondary">
                  {copied ? <><Check size={16} color="#10B981" /> Copiado</> : <><Copy size={16} /> Copiar Anúncio</>}
                </button>
                <button onClick={() => setStep(1)} className="btn-secondary">Editar Critérios</button>
                <button onClick={handleSave} className="btn-indigo">
                  <CheckCircle2 size={16} /> Salvar e Ativar Vaga
                </button>
              </div>
            </div>

            {/* Aviso da metodologia sobre a personalização do roteiro socrático */}
            <div className="socratic-callout">
              <div className="callout-icon">
                <Brain size={22} color="#3B82F6" />
              </div>
              <div className="callout-content">
                <strong>Roteiro Socrático de Entrevista & Role Play Personalizado:</strong>
                <p>
                  O roteiro com perguntas socráticas, simulação de role play e teste de coachability é gerado <strong>sob medida para cada candidato</strong> após a triagem dos currículos na aba <strong>Candidatos</strong>.
                </p>
              </div>
            </div>

            <div className="clean-ad-wrapper">
              <pre className="clean-ad-text">{cleanJobAdText(generatedDesc)}</pre>
            </div>
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
          .tool-guide-card {
            display: flex;
            background: #131B2A;
            border: 1px solid #1E293B;
            border-left: 4px solid #3B82F6;
            padding: 16px 20px;
            border-radius: 10px;
            gap: 14px;
            margin-bottom: 24px;
            align-items: flex-start;
          }
          .guide-icon { flex-shrink: 0; margin-top: 2px; }
          .guide-text { font-size: 0.88rem; line-height: 1.6; color: #E2E8F0; }
          .step-pill {
            display: inline-block;
            background: rgba(59, 130, 246, 0.15);
            color: #60A5FA;
            border: 1px solid rgba(59, 130, 246, 0.3);
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .client-subtitle { font-size: 0.85rem; color: #94A3B8; display: block; margin-top: 4px; }
          .socratic-callout {
            display: flex;
            background: rgba(59, 130, 246, 0.08);
            border: 1px dashed rgba(59, 130, 246, 0.3);
            padding: 14px 18px;
            border-radius: 8px;
            gap: 12px;
            margin-bottom: 20px;
            align-items: flex-start;
          }
          .callout-icon { flex-shrink: 0; margin-top: 2px; }
          .callout-content { font-size: 0.85rem; color: #CBD5E1; line-height: 1.5; }
          .clean-ad-wrapper {
            background: #131B2A;
            padding: 28px;
            border-radius: 12px;
            border: 1px solid #1E293B;
            overflow-x: auto;
          }
          .clean-ad-text {
            white-space: pre-wrap;
            font-family: inherit;
            font-size: 0.95rem;
            line-height: 1.8;
            color: #F8FAFC;
            margin: 0;
          }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}

