"use client";

import { useState } from "react";
import GlassCard from "../../../../components/common/GlassCard";
import SubscriptionGuard from "../../../../components/common/SubscriptionGuard";
import { ArrowLeft, ArrowRight, Wand2, Target, Crosshair, Shield, DollarSign, Copy, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../../../hooks/useSubscription";
import { useAuth } from "../../../../context/AuthContext";

export default function NewJob() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    type: "a",
    motivator: "a",
    mustHaves: "",
    niceToHaves: "",
    salary: "",
    workModel: "Presencial",
    benefits: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { subscription, incrementUsage } = useSubscription();
  const { userProfile } = useAuth();

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");

    try {
      const companyName = userProfile?.companyName || subscription?.name || "Empresa";

      const response = await fetch("/api/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          diagnosticData: formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar vaga");
      }

      setGeneratedText(data.jobText);
      await incrementUsage("job");
      setStep(5); // Go to result step

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SubscriptionGuard type="job">
      <div className="new-job-container animate-fade">
        <header className="page-header">
          <Link href="/dashboard" className="back-link">
            <ArrowLeft size={16} /> Voltar ao Cockpit
          </Link>
          <div className="header-title">
            <Target className="title-icon" size={32} color="var(--action-primary)" />
            <div>
              <h2>Arquiteto de Vagas <small>Modo 1</small></h2>
              <p>{step <= 4 ? "Defina os parâmetros estratégicos para o algoritmo." : "Anúncio gerado com sucesso."}</p>
            </div>
          </div>
        </header>

        <GlassCard className="form-card">
          {step <= 4 && (
            <div className="stepper">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`step-segment ${step >= s ? 'active' : ''}`} />
              ))}
            </div>
          )}

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="step-content animate-fade-right">
                <h3 className="narrative-text">Arquétipo Mental</h3>
                <p className="step-desc">Qual a estrutura psicológica predominante para esta posição?</p>
                <div className="selection-grid">
                  <label className={`selection-card ${formData.type === 'a' ? 'selected' : ''}`}>
                    <input type="radio" value="a" checked={formData.type === 'a'} onChange={e => setFormData({ ...formData, type: e.target.value })} />
                    <div className="card-icon"><Crosshair size={24} /></div>
                    <strong>(a) Hunter</strong>
                    <span>Agressividade comercial, foco em abertura e prospecção.</span>
                  </label>
                  <label className={`selection-card ${formData.type === 'b' ? 'selected' : ''}`}>
                    <input type="radio" value="b" checked={formData.type === 'b'} onChange={e => setFormData({ ...formData, type: e.target.value })} />
                    <div className="card-icon"><Shield size={24} /></div>
                    <strong>(b) Farmer</strong>
                    <span>Relacionamento, gestão de carteira e resiliência.</span>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content animate-fade-right">
                <h3 className="narrative-text">Driver Motivacional</h3>
                <p className="step-desc">Qual "combustível" mantém este profissional em alta performance?</p>
                <div className="selection-grid three-col">
                  <label className={`selection-card ${formData.motivator === 'a' ? 'selected' : ''}`}>
                    <input type="radio" value="a" checked={formData.motivator === 'a'} onChange={e => setFormData({ ...formData, motivator: e.target.value })} />
                    <div className="card-icon"><DollarSign size={24} /></div>
                    <strong>(a) Ambição Financeira</strong>
                    <span>Comissões agressivas, bônus e ganho variável.</span>
                  </label>
                  <label className={`selection-card ${formData.motivator === 'b' ? 'selected' : ''}`}>
                    <input type="radio" value="b" checked={formData.motivator === 'b'} onChange={e => setFormData({ ...formData, motivator: e.target.value })} />
                    <div className="card-icon"><Target size={24} /></div>
                    <strong>(b) Competição / Desafio</strong>
                    <span>Superar metas inalcançáveis, ser o #1.</span>
                  </label>
                  <label className={`selection-card ${formData.motivator === 'c' ? 'selected' : ''}`}>
                    <input type="radio" value="c" checked={formData.motivator === 'c'} onChange={e => setFormData({ ...formData, motivator: e.target.value })} />
                    <div className="card-icon"><Shield size={24} /></div>
                    <strong>(c) Estabilidade / Propósito</strong>
                    <span>Segurança, carreira de longo prazo e missão.</span>
                  </label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content animate-fade-right">
                <h3 className="narrative-text">Requisitos Técnicos</h3>
                <div className="input-group">
                  <label>Nomenclatura da Posição</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Senior Account Executive" required />
                </div>
                <div className="input-group">
                  <label>Hard Skills (Eliminatórios)</label>
                  <textarea rows="3" value={formData.mustHaves} onChange={e => setFormData({ ...formData, mustHaves: e.target.value })} placeholder="Ex: Inglês C1, Certificação AWS..." />
                </div>
                <div className="input-group">
                  <label>Soft Skills & Diferenciais</label>
                  <textarea rows="3" value={formData.niceToHaves} onChange={e => setFormData({ ...formData, niceToHaves: e.target.value })} placeholder="Ex: Comunicação não-violenta, Liderança..." />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step-content animate-fade-right">
                <h3 className="narrative-text">Dados Estruturais</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Budget Salarial (R$)</label>
                    <input type="text" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} placeholder="Ex: 8.000 - 12.000" />
                  </div>
                  <div className="input-group">
                    <label>Modelo Operacional</label>
                    <select value={formData.workModel} onChange={e => setFormData({ ...formData, workModel: e.target.value })}>
                      <option>Presencial</option>
                      <option>Híbrido</option>
                      <option>Remoto (Global)</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Pacote de Benefícios</label>
                  <textarea rows="3" value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} placeholder="Ex: Equity, Gympass, Plano de Saúde Top Tier..." />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="step-content result-content animate-fade-right">
                <div className="result-header">
                  <h3 className="narrative-text">Anúncio Gerado</h3>
                  <button type="button" onClick={handleCopy} className="btn-copy">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <div className="result-text">
                  <pre>{generatedText}</pre>
                </div>
                <div className="result-actions">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Nova Vaga
                  </button>
                  <Link href="/dashboard/jobs" className="btn-indigo">
                    Ver Minhas Vagas <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}

            {step <= 4 && (
              <div className="form-actions">
                {step > 1 && (
                  <button type="button" onClick={handlePrev} className="btn-secondary">
                    <ArrowLeft size={16} /> Anterior
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" onClick={handleNext} className="btn-indigo">
                    Continuar <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="submit" className="btn-indigo" disabled={isGenerating || !formData.title}>
                    {isGenerating ? (
                      <><Loader2 className="spin" size={18} /> Gerando...</>
                    ) : (
                      <>Gerar Vaga Elite <Wand2 size={18} /></>
                    )}
                  </button>
                )}
              </div>
            )}
          </form>
        </GlassCard>

        <style jsx>{`
          .new-job-container {
            max-width: 900px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 40px;
          }

          .back-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            font-size: 0.9rem;
            margin-bottom: 20px;
            transition: color 0.2s;
          }
          
          .back-link:hover { color: white; }

          .header-title {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .header-title h2 {
            font-size: 2rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 4px;
          }

          .header-title small {
            font-weight: 400;
            color: var(--action-secondary);
            font-size: 1rem;
            margin-left: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .header-title p {
            opacity: 0.6;
          }

          .form-card {
            padding: 50px;
          }

          .stepper {
            display: flex;
            gap: 8px;
            margin-bottom: 40px;
          }

          .step-segment {
            flex: 1;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }

          .step-segment.active {
            background: var(--action-primary);
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
          }

          .error-banner {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #FCA5A5;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .step-content {
            min-height: 400px;
          }

          .step-content h3 {
            font-size: 1.5rem;
            margin-bottom: 8px;
            color: white;
          }

          .step-desc {
            opacity: 0.6;
            margin-bottom: 30px;
          }

          .selection-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .selection-grid.three-col {
            grid-template-columns: repeat(3, 1fr);
          }

          .selection-card {
            display: flex;
            flex-direction: column;
            padding: 24px;
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(255, 255, 255, 0.02);
          }

          .selection-card:hover {
            border-color: rgba(79, 70, 229, 0.5);
            transform: translateY(-2px);
          }

          .selection-card.selected {
            border-color: var(--action-primary);
            background: rgba(79, 70, 229, 0.1);
            box-shadow: 0 0 20px rgba(79, 70, 229, 0.1);
          }

          .selection-card input { display: none; }

          .card-icon {
            margin-bottom: 16px;
            color: var(--action-secondary);
          }

          .selection-card strong {
            font-size: 1.1rem;
            margin-bottom: 8px;
          }

          .selection-card span {
            font-size: 0.9rem;
            opacity: 0.6;
            line-height: 1.4;
          }

          .input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 24px;
          }

          .input-group label {
            font-size: 0.85rem;
            font-weight: 700;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          input, textarea, select {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-glass);
            padding: 16px;
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            font-family: var(--font-ui);
            transition: border 0.2s;
          }

          input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: var(--action-primary);
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .form-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid var(--border-glass);
          }

          .btn-secondary {
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid var(--border-glass);
            padding: 0.8rem 1.5rem;
            border-radius: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            text-decoration: none;
          }

          .btn-secondary:hover {
            color: white;
            background: rgba(255, 255, 255, 0.05);
          }

          /* Result Section */
          .result-content {
            min-height: auto;
          }

          .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .btn-copy {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-glass);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
          }

          .btn-copy:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .result-text {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            padding: 24px;
            max-height: 500px;
            overflow-y: auto;
            margin-bottom: 32px;
          }

          .result-text pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: var(--font-ui);
            font-size: 0.95rem;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.9);
          }

          .result-actions {
            display: flex;
            justify-content: space-between;
            gap: 16px;
          }

          .spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-fade {
            animation: fadeIn 0.4s ease-out forwards;
          }
          
          .animate-fade-right {
            animation: fadeInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInRight {
             from { opacity: 0; transform: translateX(20px); }
             to { opacity: 1; transform: translateX(0); }
          }

          @media (max-width: 768px) {
            .selection-grid, .selection-grid.three-col {
              grid-template-columns: 1fr;
            }
            .form-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}
