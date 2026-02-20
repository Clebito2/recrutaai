"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import SubscriptionGuard from "../../../components/common/SubscriptionGuard";
import { Briefcase, Target, Brain, ListChecks, DollarSign, MapPin, Zap, ChevronRight, Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import PageHeader from "../../../components/common/PageHeader";

export default function NewJobPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    profileType: "tecnico",
    motivator: "a",
    mustHaves: "",
    niceToHaves: "",
    salary: "",
    workModel: "Híbrido",
    benefits: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedDesc("");
    setError("");

    try {
      const response = await fetch("/api/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: "Sua Empresa",
          diagnosticData: formData
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao gerar vaga");
      }

      const reader = response.body.getReader();
      const decoder = new TextEncoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        setGeneratedDesc(prev => prev + chunk);
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        description: generatedDesc,
        userId: user.uid,
        status: "active",
        createdAt: serverTimestamp()
      });
      window.location.href = "/dashboard/jobs";
    } catch (err) {
      setError("Erro ao salvar vaga");
    }
  };

  return (
    <SubscriptionGuard type="jobs">
      <div className="new-job-page animate-fade">
        <PageHeader
          title="Nova Vaga"
          subtitle="Utilize a IA para criar anúncios de vaga baseados no Protocolo Elite V6.0."
        />

        {step === 1 ? (
          <GlassCard className="form-card">
            <div className="form-grid">
              <div className="form-group full-width">
                <label><Briefcase size={16} /> Título da Vaga</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Desenvolvedor Fullstack Sênior"
                />
              </div>

              <div className="form-group">
                <label><Brain size={16} /> Tipo de Perfil</label>
                <select name="profileType" value={formData.profileType} onChange={handleInputChange}>
                  <option value="tecnico">Técnico/Especialista</option>
                  <option value="lideranca">Liderança/Gestão</option>
                  <option value="hunter">Hunter (Comercial)</option>
                  <option value="farmer">Farmer (Retenção)</option>
                </select>
              </div>

              <div className="form-group">
                <label><Zap size={16} /> Motivador da Vaga</label>
                <select name="motivator" value={formData.motivator} onChange={handleInputChange}>
                  <option value="a">Crescimento / Expansão</option>
                  <option value="b">Substituição</option>
                  <option value="c">Nova Unidade / Projeto</option>
                </select>
              </div>

              <div className="form-group">
                <label><ListChecks size={16} /> Requisitos Obrigatórios</label>
                <textarea
                  name="mustHaves"
                  value={formData.mustHaves}
                  onChange={handleInputChange}
                  placeholder="O que o candidato PRECISA ter..."
                />
              </div>

              <div className="form-group">
                <label><Target size={16} /> Diferenciais</label>
                <textarea
                  name="niceToHaves"
                  value={formData.niceToHaves}
                  onChange={handleInputChange}
                  placeholder="O que seria um bônus..."
                />
              </div>

              <div className="form-group">
                <label><DollarSign size={16} /> Budget Salarial</label>
                <input name="salary" value={formData.salary} onChange={handleInputChange} placeholder="Ex: R$ 8.000,00 - R$ 12.000,00" />
              </div>

              <div className="form-group">
                <label><MapPin size={16} /> Modelo de Trabalho</label>
                <select name="workModel" value={formData.workModel} onChange={handleInputChange}>
                  <option value="Remoto">100% Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </div>
            </div>

            {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}

            <button className="btn-indigo full-width" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <><Loader2 className="spin" size={20} /> Gerando Anúncio...</> : <>Gerar Anúncio com IA <Sparkles size={18} /></>}
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="preview-card animate-fade">
            <div className="preview-header">
              <h3>Anúncio Gerado</h3>
              <div className="preview-actions">
                <button onClick={() => setStep(1)} className="btn-secondary">Editar Diagnóstico</button>
                <button onClick={handleSave} className="btn-indigo">Publicar Vaga</button>
              </div>
            </div>
            <div className="preview-content whitespace-pre-wrap">
              {generatedDesc}
            </div>
          </GlassCard>
        )}

        <style jsx>{`
          .new-job-page { max-width: 800px; margin: 0 auto; }
          .form-card { padding: 32px; }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .full-width { grid-column: span 2; }
          .form-group label { display: flex; items-center: center; gap: 8px; font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; opacity: 0.8; }
          .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; }
          .btn-indigo { background: var(--action-primary); color: white; border: none; padding: 16px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; items-center: center; gap: 10px; }
          .preview-content { background: rgba(0,0,0,0.2); padding: 32px; border-radius: 12px; margin-top: 24px; line-height: 1.8; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}
