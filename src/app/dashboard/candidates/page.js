"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import SubscriptionGuard from "../../../components/common/SubscriptionGuard";
import { Upload, FileText, Mic, Loader2, CheckCircle, AlertCircle, ChevronRight, User, History, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function CandidatesPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [profileLevel, setProfileLevel] = useState("tecnico");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef(null);
  const { user, userProfile } = useAuth();
  const { incrementUsage } = useSubscription();

  // Loading history logic when tab is active
  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "candidates"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      })).sort((a, b) => b.createdAt - a.createdAt); // Client side sort
      setHistory(data);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveAnalysisToHistory = async (analysisData) => {
    try {
      if (!user) return;
      await addDoc(collection(db, "candidates"), {
        userId: user.uid,
        name: analysisData.nome || "Candidato",
        role: profileLevel === 'lideranca' ? 'Liderança' : 'Técnico',
        analysis: analysisData,
        createdAt: serverTimestamp()
      });
      console.log("Analysis auto-saved");
    } catch (e) {
      console.error("Failed to auto-save analysis:", e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError("");

    try {
      let content = "";

      if (activeTab === "upload" && file) {
        // Read file content using server-side API
        const formData = new FormData();
        formData.append("file", file);

        const parseResponse = await fetch("/api/parse-file", {
          method: "POST",
          body: formData,
        });

        const parseData = await parseResponse.json();

        if (!parseResponse.ok) {
          throw new Error(parseData.error || "Erro ao ler arquivo");
        }

        content = parseData.text;

      } else if (activeTab === "transcript") {
        content = transcript;
      }

      if (!content || !content.trim()) {
        throw new Error("Nenhum conteúdo para analisar");
      }

      const companyName = userProfile?.companyName || "Empresa";

      const response = await fetch("/api/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          cvContent: content,
          jobContext: "", // Could be linked to a specific job
          profileLevel: "tecnico" // Default to tecnico since we removed the selector
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na análise");
      }

      setAnalysisResult(data.analysis);

      // Auto-save
      await saveAnalysisToHistory(data.analysis);

      await incrementUsage("cv");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const companyName = userProfile?.companyName || "Recruit-AI";

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: analysisResult,
          companyName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar relatório");
      }

      // Open HTML report in new tab
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(data.html);
        newWindow.document.close();
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <SubscriptionGuard type="cv">
      <div className="candidates-page animate-fade">
        <header className="page-header">
          <div className="header-info">
            <h1>Analista de Perfil <small>Modo 2</small></h1>
            <p>Analise candidatos com metodologia STAR e Matriz SWOT automatizada.</p>
          </div>
        </header>

        {!analysisResult ? (
          <GlassCard className="analysis-card">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <FileText size={18} /> Upload CV
              </button>
              <button
                className={`tab ${activeTab === 'transcript' ? 'active' : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                <Mic size={18} /> Transcrição
              </button>
              <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={18} /> Histórico
              </button>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {activeTab === "upload" && (
              <div className="upload-section animate-fade">

                <div
                  className={`drop-zone ${file ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.docx"
                    hidden
                  />
                  {file ? (
                    <>
                      <CheckCircle size={32} color="var(--action-secondary)" />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} color="var(--action-primary)" />
                      <span>Arraste o CV aqui ou clique para selecionar</span>
                      <small>Suporta .txt, .pdf, .docx</small>
                    </>
                  )}
                </div>

                <button
                  className="btn-indigo full-width"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !file}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={20} /> Analisando com IA...</>
                  ) : (
                    <>Iniciar Análise DO CV <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="transcript-section animate-fade">
                <textarea
                  placeholder="Cole aqui a transcrição da entrevista ou anotações sobre o candidato..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={12}
                />
                <button
                  className="btn-indigo full-width"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !transcript.trim()}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={20} /> Analisando com IA...</>
                  ) : (
                    <>Iniciar Análise da Transcrição <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            )}

            {activeTab === "history" && (
              <div className="history-section animate-fade">
                {loadingHistory ? (
                  <div className="loading-state"><Loader2 className="spin" /> Carregando histórico...</div>
                ) : history.length === 0 ? (
                  <div className="empty-history">
                    <History size={48} opacity={0.2} />
                    <p>Nenhuma análise salva ainda.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map(item => (
                      <div key={item.id} className="history-item" onClick={() => setAnalysisResult(item.analysis)}>
                        <div className="history-avatar"><User size={20} /></div>
                        <div className="history-info">
                          <strong>{item.name}</strong>
                          <span>{item.role}</span>
                        </div>
                        <div className="history-date">
                          <Calendar size={14} />
                          {item.createdAt.toLocaleDateString('pt-BR')}
                        </div>
                        <ChevronRight size={16} opacity={0.5} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </GlassCard>
        ) : (
          <div className="result-section animate-fade-right">
            <GlassCard className="result-header-card">
              <div className="candidate-info">
                <div className="avatar">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="narrative-text">{analysisResult.nome || "Candidato"}</h2>
                  <p>{analysisResult.resumo}</p>
                </div>
              </div>
              <div className={`recommendation ${analysisResult.recomendacao?.toLowerCase().includes('aprov') ? 'approved' : 'review'}`}>
                {analysisResult.recomendacao}
              </div>
            </GlassCard>

            <div className="scores-grid">
              {analysisResult.scorecard && Object.entries(analysisResult.scorecard).map(([key, value]) => (
                <GlassCard key={key} className="score-card">
                  <span className="score-label">{formatScoreLabel(key)}</span>
                  <div className="score-ring">
                    <span className="score-value">{value}</span>
                    <span className="score-max">/5</span>
                  </div>
                </GlassCard>
              ))}
            </div>

            {analysisResult.temperamento && (
              <GlassCard className="temperament-card">
                <h3>Temperamento Identificado</h3>
                <p className="temperament-value">{analysisResult.temperamento}</p>
              </GlassCard>
            )}

            {analysisResult.justificativa && (
              <GlassCard className="justification-card">
                <h3>Justificativa da Recomendação</h3>
                <p>{analysisResult.justificativa}</p>
              </GlassCard>
            )}

            <div className="result-actions">
              <button onClick={() => setAnalysisResult(null)} className="btn-secondary">
                <ArrowLeft size={16} /> Voltar
              </button>
              <button
                className="btn-indigo"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <><Loader2 className="spin" size={18} /> Gerando...</>
                ) : (
                  <>Gerar Relatório Elite (PDF)</>
                )}
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          .candidates-page {
            max-width: 900px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 40px;
          }

          .header-info h1 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 8px;
          }

          .header-info small {
            color: var(--action-secondary);
            font-weight: 400;
            font-size: 1rem;
            margin-left: 8px;
            text-transform: uppercase;
          }

          .header-info p {
            opacity: 0.6;
          }

          .analysis-card {
            padding: 40px;
          }

          .tabs {
            display: flex;
            gap: 8px;
            background: rgba(0, 0, 0, 0.2);
            padding: 4px;
            border-radius: 10px;
            margin-bottom: 32px;
          }

          .tab {
            flex: 1;
            padding: 14px;
            border: none;
            background: transparent;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
          }

          .tab.active {
            background: var(--action-primary);
            color: white;
          }

          .error-banner {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #FCA5A5;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .profile-selector {
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .selector-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.6);
          }

          .selector-buttons {
            display: flex;
            gap: 8px;
          }

          .selector-btn {
            padding: 10px 18px;
            border: 1px solid var(--border-glass);
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .selector-btn:hover {
            border-color: rgba(79, 70, 229, 0.5);
            color: white;
          }

          .selector-btn.active {
            background: var(--action-primary);
            border-color: var(--action-primary);
            color: white;
          }

          .drop-zone {
            border: 2px dashed var(--border-glass);
            border-radius: 12px;
            padding: 60px 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 32px;
          }

          .drop-zone:hover {
            border-color: var(--action-primary);
            background: rgba(79, 70, 229, 0.05);
          }

          .drop-zone.has-file {
            border-color: var(--action-secondary);
            background: rgba(0, 240, 255, 0.05);
          }

          .drop-zone small {
            opacity: 0.5;
            font-size: 0.85rem;
          }

          .file-name {
            font-weight: 600;
            color: var(--action-secondary);
          }

          .file-size {
            opacity: 0.5;
            font-size: 0.85rem;
          }

          .transcript-section textarea {
            width: 100%;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border-glass);
            padding: 20px;
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            font-family: var(--font-ui);
            resize: vertical;
            margin-bottom: 32px;
            line-height: 1.6;
          }

          .transcript-section textarea:focus {
            outline: none;
            border-color: var(--action-primary);
          }

          .full-width {
            width: 100%;
            justify-content: center;
            padding: 16px;
          }

          /* History Section */
          .history-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .history-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .history-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--action-primary);
          }

          .history-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .history-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .history-info strong {
            font-size: 1rem;
            color: white;
          }

          .history-info span {
             font-size: 0.85rem;
             opacity: 0.6;
          }

          .history-date {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            opacity: 0.5;
            margin-right: 12px;
          }

          .loading-state, .empty-history {
             padding: 40px;
             text-align: center;
             display: flex;
             flex-direction: column;
             align-items: center;
             gap: 16px;
             opacity: 0.6;
          }

          /* Result Section */
          .result-section {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .result-header-card {
            padding: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .candidate-info {
            display: flex;
            gap: 20px;
            align-items: center;
          }

          .avatar {
            width: 64px;
            height: 64px;
            background: var(--action-primary);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .candidate-info h2 {
            font-size: 1.5rem;
            margin-bottom: 4px;
          }

          .candidate-info p {
            opacity: 0.7;
            font-size: 0.95rem;
          }

          .recommendation {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.85rem;
          }

          .recommendation.approved {
            background: rgba(0, 240, 255, 0.1);
            color: var(--action-secondary);
          }

          .recommendation.review {
            background: rgba(139, 92, 246, 0.1);
            color: var(--action-accent);
          }

          .scores-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }

          .score-card {
            padding: 24px;
            text-align: center;
          }

          .score-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            opacity: 0.6;
            letter-spacing: 0.5px;
          }

          .score-ring {
            margin-top: 12px;
          }

          .score-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--action-primary);
          }

          .score-max {
            font-size: 1rem;
            opacity: 0.4;
          }

          .temperament-card, .justification-card {
            padding: 24px;
          }

          .temperament-card h3, .justification-card h3 {
            font-size: 0.85rem;
            text-transform: uppercase;
            opacity: 0.6;
            margin-bottom: 12px;
          }

          .temperament-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--action-accent);
          }

          .justification-card p {
            line-height: 1.7;
            opacity: 0.8;
          }

          .result-actions {
            display: flex;
            gap: 16px;
            justify-content: flex-end;
          }

          .btn-secondary {
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid var(--border-glass);
            padding: 14px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-secondary:hover {
            color: white;
            background: rgba(255, 255, 255, 0.05);
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
             animation: fadeInRight 0.4s ease-out forwards;
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
            .scores-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}

function formatScoreLabel(key) {
  const labels = {
    comportamental: "Comportamental",
    tecnico: "Técnico",
    comunicacao: "Comunicação",
    alinhamento: "Alinhamento",
    dominio_hardskills: "Hard Skills",
    resolucao_problemas: "Resolução",
    qualidade_entrega: "Qualidade",
    profundidade_tecnica: "Técnica",
    tomada_decisao: "Decisão",
    gestao_conflitos: "Conflitos",
    mentoria_delegacao: "Mentoria",
    visao_estrategica: "Estratégia"
  };
  return labels[key] || key;
}
