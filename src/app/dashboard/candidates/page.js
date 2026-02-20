"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import SubscriptionGuard from "../../../components/common/SubscriptionGuard";
import { Upload, FileText, Mic, Loader2, CheckCircle, AlertCircle, ChevronRight, User, History, Calendar, ArrowLeft, Clock, X, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { db, storage } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useJobStore } from "../../../store/useJobStore";
import PageHeader from "../../../components/common/PageHeader";

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
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', location: '', notes: '' });
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Transcript States
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  // Job matching states
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fileInputRef = useRef(null);
  const { user, userProfile } = useAuth();
  const { incrementUsage } = useSubscription();
  const { activeJobId, setActiveJob } = useJobStore();

  // Sync state with store if needed
  useEffect(() => {
    if (activeJobId && !selectedJobId) {
      setSelectedJobId(activeJobId);
    }
  }, [activeJobId, selectedJobId]);

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

  const saveAnalysisToHistory = async (analysisData, analysisType = 'cv') => {
    try {
      if (!user) return null;

      // If analyzing transcript for existing candidate, UPDATE the document
      if (analysisType === 'transcript' && selectedCandidateId) {
        const { doc, updateDoc, serverTimestamp: serverTs } = await import('firebase/firestore');
        await updateDoc(doc(db, "candidates", selectedCandidateId), {
          transcriptAnalysis: {
            ...analysisData,
            analyzedAt: serverTs(),
            linkedToCv: true
          },
          updatedAt: serverTs()
        });
        console.log("Transcript analysis added to existing candidate");
        return selectedCandidateId;
      }

      // Otherwise, CREATE new document
      const docRef = await addDoc(collection(db, "candidates"), {
        userId: user.uid,
        name: analysisData.nome || "Candidato",
        role: profileLevel === 'lideranca' ? 'Liderança' : 'Técnico',
        jobId: selectedJobId || null,

        // Store in appropriate field based on type
        ...(analysisType === 'cv' ? {
          cvAnalysis: {
            ...analysisData,
            analyzedAt: serverTimestamp()
          },
          transcriptAnalysis: null
        } : {
          cvAnalysis: null,
          transcriptAnalysis: {
            ...analysisData,
            analyzedAt: serverTimestamp(),
            linkedToCv: false
          }
        }),

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`${analysisType === 'cv' ? 'CV' : 'Transcript'} analysis saved as new candidate`);
      return docRef.id;
    } catch (e) {
      console.error("Failed to auto-save analysis:", e);
      return null;
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

        const MAX_PROXY_SIZE = 4.5 * 1024 * 1024; // 4.5MB

        if (file.size > MAX_PROXY_SIZE) {
          console.log("Large file detected (>4.5MB). Using direct Storage upload...");
          setLoadingText("Fazendo upload do arquivo...");

          const storageRef = ref(storage, `uploads/${user?.uid || 'guest'}/${Date.now()}_${file.name}`);
          const uploadResult = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(uploadResult.ref);

          content = {
            type: 'url',
            url: downloadURL,
            mimeType: file.type || 'application/octet-stream'
          };

          setLoadingText("Analisando com IA...");

        } else {
          const formData = new FormData();
          formData.append("file", file);

          const parseResponse = await fetch("/api/parse-file", {
            method: "POST",
            body: formData,
          });

          const contentType = parseResponse.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const textBody = await parseResponse.text();
            throw new Error(`Erro (${parseResponse.status}): ${textBody.substring(0, 150)}...`);
          }

          const parseData = await parseResponse.json();

          if (!parseResponse.ok) {
            throw new Error(parseData.error || "Erro ao ler arquivo");
          }

          if ((parseData.type === 'pdf' || parseData.type === 'audio') && parseData.inlineData) {
            content = parseData;
          } else {
            content = parseData.text;
          }
        }
      } else if (activeTab === "transcript" && transcript.trim()) {
        content = transcript;
      }

      if (!content) {
        throw new Error("Nenhum conteúdo para analisar");
      }

      const companyName = userProfile?.companyName || "Empresa";

      let previousAnalysis = null;
      if (activeTab === "transcript" && selectedCandidateId) {
        const candidate = history.find(c => c.id === selectedCandidateId);
        if (candidate?.cvAnalysis || candidate?.analysis) {
          previousAnalysis = candidate.cvAnalysis || candidate.analysis;
        }
      }

      const response = await fetch("/api/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          cvContent: content,
          jobContext: "",
          profileLevel,
          jobId: selectedJobId || null,
          previousAnalysis
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textBody = await response.text();
        throw new Error("Erro no servidor. Verifique os logs.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na análise");
      }

      setAnalysisResult(data.analysis);

      const analysisType = activeTab === 'transcript' ? 'transcript' : 'cv';
      await saveAnalysisToHistory(data.analysis, analysisType);
      await fetchHistory();
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
        candidateId: selectedCandidateId || analysisResult.id || null,
        candidateName: analysisResult.nome || "Candidato",
        scheduledAt: new Date(`${scheduleData.date}T${scheduleData.time}`),
        location: scheduleData.location,
        status: "scheduled",
        notes: scheduleData.notes,
        createdAt: serverTimestamp()
      });

      const candidateIdToUpdate = selectedCandidateId || analysisResult.id;

      if (candidateIdToUpdate) {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, "candidates", candidateIdToUpdate), {
          interviewStatus: 'scheduled',
          interviewDate: new Date(`${scheduleData.date}T${scheduleData.time}`),
          interviewLocation: scheduleData.location,
          updatedAt: serverTimestamp()
        });
      }

      setScheduleSuccess(true);
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleSuccess(false);
        setScheduleData({ date: '', time: '', location: '', notes: '' });
        fetchHistory();
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
        <PageHeader
          title="Analista de Perfil"
          subtitle="Analise candidatos com metodologia STAR e Matriz SWOT automatizada."
        />

        {!analysisResult ? (
          <>
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

                  <div className="candidate-selector-section" style={{ marginBottom: 16 }}>
                    <label htmlFor="candidate-select">Vincular a candidato existente (Opcional)</label>
                    <select
                      id="candidate-select"
                      value={selectedCandidateId}
                      onChange={(e) => {
                        setSelectedCandidateId(e.target.value);
                        const candidate = history.find(c => c.id === e.target.value);
                        if (candidate?.jobId) {
                          setSelectedJobId(candidate.jobId);
                        }
                      }}
                      disabled={loadingHistory}
                      className="input-glass"
                      style={{ width: '100%' }}
                    >
                      <option value="">Nova Análise (Sem vínculo)</option>
                      {history.map(candidate => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} - {new Date(candidate.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

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
            </GlassCard>

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
                  {history.map(item => {
                    const hasCv = item.cvAnalysis || item.analysis;
                    const hasTranscript = item.transcriptAnalysis;
                    const displayAnalysis = item.cvAnalysis || item.transcriptAnalysis || item.analysis;

                    return (
                      <div key={item.id} className="history-card-item" onClick={() => setAnalysisResult(displayAnalysis)}>
                        <div className="history-card-header">
                          <div className="history-avatar"><User size={20} /></div>
                          <button
                            className="btn-delete-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCandidate(item.id, item.name);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="history-info">
                          <strong>{item.name}</strong>
                          <span className="role-badge">{item.role}</span>
                        </div>
                        <div className="analysis-indicators" style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          {hasCv && <span className="indicator-badge"><FileText size={12} /> CV</span>}
                          {hasTranscript && <span className="indicator-badge"><Mic size={12} /> Entrevista</span>}
                        </div>
                        <div className="history-footer">
                          <div className="history-date">
                            <Calendar size={14} />
                            {item.createdAt.toLocaleDateString('pt-BR')}
                          </div>
                          <ChevronRight size={16} opacity={0.5} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="result-section animate-fade-right">
            <GlassCard className="result-header-card">
              <div className="candidate-info">
                <div className="avatar"><User size={32} /></div>
                <div>
                  <h2>{analysisResult.nome || "Candidato"}</h2>
                  <p>{analysisResult.resumo}</p>
                </div>
              </div>
              <div className={`recommendation ${(analysisResult.recomendacao || '').toLowerCase().includes('aprov') ? 'approved' : 'review'}`}>
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

            {analysisResult.adherence && (
              <GlassCard className="adherence-card">
                <h3>Aderência à Vaga</h3>
                <div className="adherence-score">
                  <div className="score-circle"><span className="score-number">{analysisResult.adherence.score}%</span></div>
                  <div className="score-bar"><div className="score-fill" style={{ width: `${analysisResult.adherence.score}%` }} /></div>
                </div>
                <div className="skills-match">
                  {analysisResult.adherence.matchedSkills?.length > 0 && (
                    <div className="matched-skills">
                      <h4><CheckCircle size={16} /> Habilidades Compatíveis</h4>
                      <ul>{analysisResult.adherence.matchedSkills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                  )}
                  {analysisResult.adherence.missingSkills?.length > 0 && (
                    <div className="missing-skills">
                      <h4><AlertCircle size={16} /> Gaps Identificados</h4>
                      <ul>{analysisResult.adherence.missingSkills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            <div className="result-actions">
              <button onClick={() => setAnalysisResult(null)} className="btn-secondary"><ArrowLeft size={16} /> Voltar</button>
              <button className="btn-indigo" onClick={() => setShowScheduleModal(true)}><Calendar size={18} /> Agendar</button>
              <button className="btn-purple" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                {isGeneratingReport ? "Gerando..." : "Relatório Elite"}
              </button>
            </div>
          </div>
        )}

        {showScheduleModal && (
          <div className="modal-overlay">
            <GlassCard className="modal-content">
              <div className="modal-header">
                <h3>Agendar Entrevista</h3>
                <button onClick={() => setShowScheduleModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Data</label>
                  <input type="date" className="input-glass" value={scheduleData.date} onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" className="input-glass" value={scheduleData.time} onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })} />
                </div>
                <button className="btn-indigo full-width" onClick={handleScheduleInterview} disabled={isScheduling}>
                  {isScheduling ? "Agendando..." : "Confirmar"}
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        <style jsx>{`
          .candidates-page { max-width: 900px; margin: 0 auto; }
          .analysis-card { padding: 40px; }
          .tabs { display: flex; gap: 8px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px; margin-bottom: 32px; }
          .tab { flex: 1; padding: 14px; border: none; background: transparent; color: rgba(255,255,255,0.5); cursor: pointer; border-radius: 8px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .tab.active { background: var(--action-primary); color: white; }
          .drop-zone { border: 2px dashed var(--border-glass); border-radius: 12px; padding: 60px 40px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 32px; }
          .drop-zone.has-file { border-color: var(--action-secondary); }
          .job-selector-section { margin-bottom: 24px; }
          .job-selector-section select { width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); color: white; }
          .scores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .score-card { padding: 20px; text-align: center; }
          .score-value { font-size: 2rem; font-weight: 800; color: var(--action-primary); }
          .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
          .history-card-item { background: var(--canvas-card); border: 1px solid var(--border-glass); border-radius: 12px; padding: 16px; cursor: pointer; }
          .indicator-badge { font-size: 0.75rem; padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 4px; }
          .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { width: 400px; padding: 24px; }
          .input-glass { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-glass); border-radius: 8px; color: white; }
          .btn-indigo { background: var(--action-primary); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; items-center: center; gap: 8px; }
          .btn-indigo:disabled { opacity: 0.5; cursor: not-allowed; }
          .full-width { width: 100%; justify-content: center; }
        `}</style>
      </div>
    </SubscriptionGuard>
  );
}

function formatScoreLabel(key) {
  const labels = {
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
