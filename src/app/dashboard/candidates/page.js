"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import SubscriptionGuard from "../../../components/common/SubscriptionGuard";
import { Upload, FileText, Mic, Loader2, CheckCircle, AlertCircle, ChevronRight, User, History, Calendar, ArrowLeft, Clock, X, Check } from "lucide-react";
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
  const [loadingText, setLoadingText] = useState("Analisando com IA...");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', notes: '' });
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Job matching states
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fileInputRef = useRef(null);
  const { user, userProfile } = useAuth();
  const { incrementUsage } = useSubscription();

  // Loading history logic
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Fetch jobs for job selector
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      setLoadingJobs(true);
      try {
        const q = query(
          collection(db, "jobs"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsData);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [user]);

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
        jobId: selectedJobId || null,
        createdAt: serverTimestamp()
      });
      console.log("Analysis auto-saved");
    } catch (e) {
      console.error("Failed to auto-save analysis:", e);
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    if (!confirm(`Excluir análise de "${candidateName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "candidates", candidateId));
      setHistory(history.filter(c => c.id !== candidateId));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Erro ao excluir candidato. Tente novamente.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  // Animated loading text
  useEffect(() => {
    if (!isAnalyzing) return;

    const messages = [
      "Analisando com IA...",
      "Processando currículo...",
      "Aplicando metodologia STAR...",
      "Gerando matriz SWOT...",
      "Calculando scores...",
      "Finalizando análise..."
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError("");

    try {
      let content = "";

      // Handle File Upload (for both tabs)
      if (file && (activeTab === "upload" || activeTab === "transcript")) {
        const formData = new FormData();
        formData.append("file", file);

        const parseResponse = await fetch("/api/parse-file", {
          method: "POST",
          body: formData,
        });

        // Debug: Check if response is JSON
        const contentType = parseResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textBody = await parseResponse.text();
          console.error("API Error Response (Not JSON):", textBody);
          throw new Error(`Erro na leitura do arquivo (Status ${parseResponse.status}). Verifique o console.`);
        }

        const parseData = await parseResponse.json();

        if (!parseResponse.ok) {
          throw new Error(parseData.error || "Erro ao ler arquivo");
        }

        // Handle both Text and Multimodal (PDF) responses
        if (parseData.type === 'pdf' && parseData.inlineData) {
          content = parseData; // Pass structure: { type: 'pdf', inlineData: {...} }
        } else {
          content = parseData.text; // Text string
        }

        // Handle Text Paste (Transcript only)
      } else if (activeTab === "transcript" && transcript.trim()) {
        content = transcript;
      }

      if (!content) {
        throw new Error("Nenhum conteúdo para analisar");
      }

      const companyName = userProfile?.companyName || "Empresa";

      const response = await fetch("/api/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          cvContent: content,
          jobContext: "", // Legacy field, now using jobId
          profileLevel: profileLevel, // Use the state value
          jobId: selectedJobId || null // Pass selected job ID
        })
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textBody = await response.text();
        console.error("API returned non-JSON:", textBody.substring(0, 200));
        throw new Error("Erro no servidor. Verifique os logs.");
      }

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

  const handleScheduleInterview = async () => {
    if (!scheduleData.date || !scheduleData.time) {
      alert("Por favor, selecione data e hora.");
      return;
    }

    setIsScheduling(true);
    try {
      await addDoc(collection(db, "interviews"), {
        userId: user.uid,
        candidateName: analysisResult.nome || "Candidato",
        scheduledAt: new Date(`${scheduleData.date}T${scheduleData.time}`),
        status: "scheduled",
        notes: scheduleData.notes,
        createdAt: serverTimestamp()
      });
      setScheduleSuccess(true);
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleSuccess(false);
        setScheduleData({ date: '', time: '', notes: '' });
      }, 2000);
    } catch (e) {
      console.error("Error scheduling interview:", e);
      alert("Erro ao agendar entrevista. Tente novamente.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <SubscriptionGuard type="cv">
      <div className="candidates-page animate-fade">
        <header className="page-header">
          <div className="header-info">
            <h1>Analista de Perfil</h1>
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

                {/* Job Selector */}
                <div className="job-selector-section">
                  <label htmlFor="job-select">Vincular à vaga (opcional)</label>
                  <select
                    id="job-select"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    disabled={loadingJobs}
                  >
                    <option value="">Análise geral (sem vaga específica)</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.workModel || 'Remoto'}
                      </option>
                    ))}
                  </select>
                  {selectedJobId && (
                    <small className="job-hint">✓ Análise incluirá ranking de aderência à vaga</small>
                  )}
                </div>

                <button
                  className="btn-indigo full-width"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !file}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={20} /> {loadingText}</>
                  ) : (
                    <>Iniciar Análise DO CV <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="transcript-section animate-fade">
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
                      <button
                        className="btn-remove-file"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      >
                        <X size={16} />
                        Remover arquivo
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={32} color="var(--action-primary)" />
                      <span>Upload de arquivo de transcrição</span>
                      <small>Suporta .txt, .pdf, .docx</small>
                    </>
                  )}
                </div>

                <div className="divider"><span>OU COLE O TEXTO</span></div>

                <textarea
                  placeholder="Cole aqui a transcrição da entrevista ou anotações sobre o candidato..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={8}
                />

                {/* Job Selector */}
                <div className="job-selector-section">
                  <label htmlFor="job-select-transcript">Vincular à vaga (opcional)</label>
                  <select
                    id="job-select-transcript"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    disabled={loadingJobs}
                  >
                    <option value="">Análise geral (sem vaga específica)</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.workModel || 'Remoto'}
                      </option>
                    ))}
                  </select>
                  {selectedJobId && (
                    <small className="job-hint">✓ Análise incluirá ranking de aderência à vaga</small>
                  )}
                </div>

                <button
                  className="btn-indigo full-width"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (!transcript.trim() && !file)}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={20} /> {loadingText}</>
                  ) : (
                    <>Iniciar Análise da Transcrição <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            )}

          </div>
        )}
      </GlassCard>

      {/* Separate History Section */}
      <div className="history-wrapper animate-fade">
        <h3 className="section-title">
          <History size={20} /> Histórico de Análises
        </h3>

        {loadingHistory ? (
          <div className="loading-state"><Loader2 className="spin" /> Carregando histórico...</div>
        ) : history.length === 0 ? (
          <GlassCard className="empty-history-card">
            <History size={48} opacity={0.2} />
            <p>Nenhuma análise salva ainda.</p>
          </GlassCard>
        ) : (
          <div className="history-grid">
            {history.map(item => (
              <div key={item.id} className="history-card-item" onClick={() => setAnalysisResult(item.analysis)}>
                <div className="history-card-header">
                  <div className="history-avatar"><User size={20} /></div>
                  <button
                    className="btn-delete-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCandidate(item.id, item.name);
                    }}
                    title="Excluir análise"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="history-info">
                  <strong>{item.name}</strong>
                  <span className="role-badge">{item.role}</span>
                </div>
                <div className="history-footer">
                  <div className="history-date">
                    <Calendar size={14} />
                    {item.createdAt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                  </div>
                  <ChevronRight size={16} opacity={0.5} />
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .history-wrapper {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 1px solid var(--border-glass);
          }
          
          .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            font-size: 1.25rem;
            opacity: 0.9;
          }
          
          .history-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          
          .history-card-item {
            background: var(--canvas-card);
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .history-card-item:hover {
            transform: translateY(-4px);
            border-color: var(--action-primary);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          }
          
          .history-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .history-info strong {
            display: block;
            font-size: 1.1rem;
            margin-bottom: 4px;
          }
          
          .role-badge {
            font-size: 0.8rem;
            padding: 4px 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: var(--text-muted);
          }
          
          .history-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.05);
          }

          .empty-history-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 40px;
            text-align: center;
            opacity: 0.6;
          }
        `}</style>
      </div>
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

        {analysisResult.adherence && (
          <GlassCard className="adherence-card">
            <h3>Aderência à Vaga</h3>
            <div className="adherence-score">
              <div className="score-circle">
                <span className="score-number">{analysisResult.adherence.score}%</span>
              </div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{ width: `${analysisResult.adherence.score}%` }}
                />
              </div>
            </div>

            <div className="skills-match">
              {analysisResult.adherence.matchedSkills?.length > 0 && (
                <div className="matched-skills">
                  <h4><CheckCircle size={16} /> Habilidades Compatíveis</h4>
                  <ul>
                    {analysisResult.adherence.matchedSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.adherence.missingSkills?.length > 0 && (
                <div className="missing-skills">
                  <h4><AlertCircle size={16} /> Gaps Identificados</h4>
                  <ul>
                    {analysisResult.adherence.missingSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {analysisResult.adherence.culturalFit && (
              <div className={`cultural-fit fit-${analysisResult.adherence.culturalFit}`}>
                <strong>Fit Cultural:</strong> {analysisResult.adherence.culturalFit}
              </div>
            )}

            {analysisResult.adherence.recommendation && (
              <p className="adherence-recommendation">{analysisResult.adherence.recommendation}</p>
            )}
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
            onClick={() => setShowScheduleModal(true)}
          >
            <Calendar size={18} /> Agendar Entrevista
          </button>
          <button
            className="btn-purple"
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

      {showScheduleModal && (
        <div className="modal-overlay">
          <GlassCard className="modal-content animate-fade">
            <div className="modal-header">
              <h3>Agendar Entrevista</h3>
              <button onClick={() => setShowScheduleModal(false)} className="close-btn"><X size={20} /></button>
            </div>
            {scheduleSuccess ? (
              <div className="success-state">
                <CheckCircle size={48} color="var(--success)" />
                <p>Entrevista agendada com sucesso!</p>
              </div>
            ) : (
              <div className="modal-body">
                <div className="form-group">
                  <label>Candidato</label>
                  <input type="text" value={analysisResult?.nome || "Candidato"} disabled className="input-glass" />
                </div>
                <div className="row-inputs">
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      className="input-glass"
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora</label>
                    <input
                      type="time"
                      className="input-glass"
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notas / Pauta</label>
                  <textarea
                    className="input-glass"
                    rows={3}
                    placeholder="Ex: Validar fit cultural, teste técnico..."
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  />
                </div>
                <button
                  className="btn-indigo full-width"
                  onClick={handleScheduleInterview}
                  disabled={isScheduling}
                >
                  {isScheduling ? <Loader2 className="spin" size={18} /> : "Confirmar Agendamento"}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-content {
            width: 100%;
            max-width: 450px;
            padding: 24px;
            border: 1px solid var(--border-glass);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .close-btn {
            background: transparent;
            border: none;
            color: white;
            opacity: 0.6;
            cursor: pointer;
            padding: 4px;
          }
          
          .close-btn:hover { opacity: 1; }

          .form-group {
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 0.85rem;
            opacity: 0.7;
          }

          .input-glass {
            background: rgba(0,0,0,0.2);
            border: 1px solid var(--border-glass);
            padding: 12px;
            border-radius: 8px;
            color: white;
            font-family: var(--font-ui);
          }

          .input-glass:focus {
             outline: none;
             border-color: var(--action-primary);
          }

          .row-inputs {
            display: flex;
            gap: 12px;
          }
          
          .row-inputs .form-group { flex: 1; }

          .success-state {
            text-align: center;
            padding: 40px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .btn-purple {
             background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
             color: white;
             border: none;
             padding: 14px 24px;
             border-radius: 10px;
             font-weight: 600;
             cursor: pointer;
             display: flex;
             align-items: center;
             gap: 8px;
             transition: all 0.2s;
             box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
          }
          .btn-purple:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
          }
        `}</style>

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
            from {transform: rotate(0deg); }
          to {transform: rotate(360deg); }
          }

          .animate-fade {
            animation: fadeIn 0.4s ease-out forwards;
          }

          .animate-fade-right {
            animation: fadeInRight 0.4s ease-out forwards;
          }

          @keyframes fadeIn {
            from {opacity: 0; }
          to {opacity: 1; }
          }

          @keyframes fadeInRight {
            from {opacity: 0; transform: translateX(20px); }
          to {opacity: 1; transform: translateX(0); }
          }

          /* Adherence Card */
          .adherence-card {
            padding: 28px;
          }

          .adherence-score {
            display: flex;
            align-items: center;
            gap: 24px;
            margin: 20px 0;
          }

          .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: conic-gradient(
              var(--action-primary) 0deg,
              var(--action-secondary) 180deg,
              rgba(255,255,255,0.1) 360deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .score-circle::before {
            content: '';
            position: absolute;
            width: 80px;
            height: 80px;
            background: var(--canvas-card);
            border-radius: 50%;
          }

          .score-number {
            position: relative;
            z-index: 1;
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--action-primary);
          }

          .score-bar {
            flex: 1;
            height: 12px;
            background: rgba(255,255,255,0.1);
            border-radius: 6px;
            overflow: hidden;
          }

          .score-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--action-secondary), var(--action-primary));
            transition: width 0.8s ease;
          }

          .skills-match {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }

          .matched-skills, .missing-skills {
            padding: 16px;
            border-radius: 8px;
          }

          .matched-skills {
            background: rgba(125, 155, 106, 0.1);
            border: 1px solid rgba(125, 155, 106, 0.3);
          }

          .missing-skills {
            background: rgba(232, 168, 56, 0.1);
            border: 1px solid rgba(232, 168, 56, 0.3);
          }

          .matched-skills h4, .missing-skills h4 {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            margin-bottom: 12px;
            opacity: 0.9;
          }

          .matched-skills ul, .missing-skills ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .matched-skills li, .missing-skills li {
            padding: 6px 0;
            font-size: 0.85rem;
            opacity: 0.8;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }

          .matched-skills li:last-child, .missing-skills li:last-child {
            border-bottom: none;
          }

          .cultural-fit {
            padding: 12px 16px;
            border-radius: 6px;
            margin: 16px 0;
            font-size: 0.9rem;
          }

          .cultural-fit.fit-alto {
            background: rgba(125, 155, 106, 0.15);
            color: #7D9B6A;
          }

          .cultural-fit.fit-médio {
            background: rgba(232, 168, 56, 0.15);
            color: #E8A838;
          }

          .cultural-fit.fit-baixo {
            background: rgba(196, 92, 75, 0.15);
            color: #C45C4B;
          }

          .adherence-recommendation {
            margin-top: 16px;
            padding: 16px;
            background: rgba(0,0,0,0.2);
            border-radius: 6px;
            font-size: 0.9rem;
            line-height: 1.6;
          }

          /* Remove File Button */
          .btn-remove-file {
            margin-top: 16px;
            padding: 10px 20px;
            background: rgba(196, 92, 75, 0.1);
            border: 1px solid rgba(196, 92, 75, 0.3);
            border-radius: 8px;
            color: var(--status-danger);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .btn-remove-file:hover {
            background: rgba(196, 92, 75, 0.2);
            border-color: var(--status-danger);
            transform: translateY(-1px);
          }

          /* Job Selector Section */
          .job-selector-section {
            margin: 20px 0;
            padding: 16px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border: 1px solid var(--border-glass);
          }

          .job-selector-section label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 8px;
          }

          .job-selector-section select {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-glass);
            padding: 12px;
            border-radius: 6px;
            color: white;
            font-size: 0.95rem;
          }

          .job-selector-section select:focus {
            outline: none;
            border-color: var(--action-primary);
          }

          .job-hint {
            display: block;
            margin-top: 8px;
            font-size: 0.8rem;
            color: var(--action-secondary);
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .scores-grid {
            grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
    </div>
    </SubscriptionGuard >
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
