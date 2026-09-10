"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "../../../components/common/GlassCard";
import UploadProgress from "../../../components/common/UploadProgress";
import SubscriptionGuard from "../../../components/common/SubscriptionGuard";
import { Upload, FileText, Mic, Loader2, CheckCircle, AlertCircle, ChevronRight, User, History, Calendar, ArrowLeft, Zap, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { detectProfileLevel, getDetectionMessage } from "../../../utils/profileDetection";

// Limites de validação no cliente
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function CandidatesPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [profileLevel, setProfileLevel] = useState("tecnico");
  const [selectedFamily, setSelectedFamily] = useState("comercial");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobs, setJobs] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estados do pipeline de upload (Fase 2)
  const [uploadStep, setUploadStep] = useState('idle');
  // 'idle' | 'reading' | 'analyzing' | 'saving' | 'done' | 'error'

  // Detecção automática de nível (Fase 4)
  const [levelSuggestion, setLevelSuggestion] = useState(null);

  const fileInputRef = useRef(null);
  const { user, userProfile } = useAuth();
  const { incrementUsage } = useSubscription();

  // Carrega vagas do usuário e sincroniza com a URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jId = params.get("jobId");
      if (jId) setSelectedJobId(jId);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUserJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(data);
      } catch (err) {
        console.error("Error loading user jobs:", err);
      }
    };
    fetchUserJobs();
  }, [user]);

  useEffect(() => {
    if (selectedJobId && jobs.length > 0) {
      const found = jobs.find(j => j.id === selectedJobId);
      if (found?.family) {
        setSelectedFamily(found.family);
      }
    }
  }, [selectedJobId, jobs]);

  // Carrega histórico quando aba fica ativa
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
      })).sort((a, b) => b.createdAt - a.createdAt);
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
      const selectedJob = jobs.find(j => j.id === selectedJobId);
      await addDoc(collection(db, "candidates"), {
        userId: user.uid,
        jobId: selectedJobId || null,
        name: analysisData.nome || "Candidato",
        role: analysisData.vaga_titulo || selectedJob?.title || selectedFamily,
        jobFamily: selectedFamily,
        analysis: analysisData,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to auto-save analysis:", e);
    }
  };


  // --- FASE 1.2: Validação de arquivo no cliente ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validação de tipo por MIME e extensão
    const name = selectedFile.name.toLowerCase();
    const isAllowed = ALLOWED_TYPES.includes(selectedFile.type)
      || name.endsWith('.pdf')
      || name.endsWith('.docx')
      || name.endsWith('.txt');

    if (!isAllowed) {
      setError('Formato inválido. Use PDF, DOCX ou TXT.');
      return;
    }

    // Validação de tamanho
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`Arquivo muito grande (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Limite: 10MB.`);
      return;
    }

    setFile(selectedFile);
    setError('');
    setLevelSuggestion(null);
    setUploadStep('idle');
  };

  // --- FASES 1.1 + 2: Pipeline separado em 2 etapas com estados de progresso ---
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    setUploadStep('idle');

    try {
      let content = '';

      // ── ETAPA 1: Parse do arquivo ──────────────────────────
      if (file && (activeTab === 'upload' || activeTab === 'transcript')) {
        setUploadStep('reading');

        const formData = new FormData();
        formData.append('file', file);

        const parseResponse = await fetch('/api/parse-file', {
          method: 'POST',
          body: formData,
        });

        // Verifica se a resposta é JSON antes de parsear
        const contentType = parseResponse.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const rawBody = await parseResponse.text();
          console.error('[candidates] parse-file não retornou JSON:', rawBody);
          throw new Error(`Erro na leitura do arquivo (Status ${parseResponse.status}). Tente novamente.`);
        }

        const parseData = await parseResponse.json();

        if (!parseResponse.ok) {
          throw new Error(parseData.error || 'Erro ao ler arquivo.');
        }

        content = parseData.text;

        if (parseData.truncated) {
          console.warn(`[candidates] Texto truncado: ${parseData.charCount} chars → 15.000`);
        }

        // --- FASE 4.1: Detecção automática de nível após parse ---
        const detection = detectProfileLevel(content);
        const suggestion = getDetectionMessage(detection);
        if (suggestion) {
          setLevelSuggestion({ message: suggestion, suggested: detection.suggested });
          // Aplica automaticamente se confiança alta (≥3 sinais de diferença)
          if (detection.confidence >= 3) {
            setProfileLevel(detection.suggested);
          }
        }

      } else if (activeTab === 'transcript' && transcript.trim()) {
        content = transcript;

        // Detecção no texto colado também
        const detection = detectProfileLevel(content);
        const suggestion = getDetectionMessage(detection);
        if (suggestion) {
          setLevelSuggestion({ message: suggestion, suggested: detection.suggested });
          if (detection.confidence >= 3) {
            setProfileLevel(detection.suggested);
          }
        }
      }

      if (!content?.trim()) {
        throw new Error('Nenhum conteúdo para analisar. Selecione um arquivo ou cole uma transcrição.');
      }

      // ── ETAPA 2: Análise com IA ────────────────────────────
      setUploadStep('analyzing');

      const currentJob = jobs.find(j => j.id === selectedJobId);
      const companyName = currentJob?.companyName || userProfile?.companyName || 'Empresa';

      const response = await fetch('/api/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          cvContent: content,
          jobContext: '',
          jobId: selectedJobId || undefined,
          jobFamily: selectedFamily,
          profileLevel: selectedFamily === 'lideranca' ? 'lideranca' : 'tecnico'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na análise de perfil.');
      }

      setAnalysisResult(data.analysis);

      // ── ETAPA 3: Salvar no Firestore ───────────────────────
      setUploadStep('saving');
      await saveAnalysisToHistory(data.analysis);
      await incrementUsage('cv');

      setUploadStep('done');

    } catch (err) {
      console.error('[candidates] handleAnalyze error:', err);
      setUploadStep('error');
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const currentJob = jobs.find(j => j.id === (analysisResult?.jobId || selectedJobId));
      const companyName = currentJob?.companyName || userProfile?.companyName || 'Recruit-AI';

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: analysisResult,
          companyName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar relatório');
      }

      const newWindow = window.open('', '_blank');
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

  // ─── RENDER ──────────────────────────────────────────────────────
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

            {/* Seletor de Vaga Vinculada e Família de Vaga */}
            {activeTab !== 'history' && (
              <div className="job-family-selectors" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="selector-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#e2e8f0' }}>
                    Vaga de Referência (Aplica Gate Check Eliminatório):
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => {
                      const jId = e.target.value;
                      setSelectedJobId(jId);
                      const foundJob = jobs.find(j => j.id === jId);
                      if (foundJob?.family) {
                        setSelectedFamily(foundJob.family);
                        setProfileLevel(foundJob.family === 'lideranca' ? 'lideranca' : 'tecnico');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#131B2A',
                      border: '1px solid #1E293B',
                      color: '#F8FAFC'
                    }}
                  >
                    <option value="">-- Sem vaga vinculada (Triagem Avulsa por Família) --</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.family || 'Geral'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px', color: '#F8FAFC' }}>
                    Família da Vaga (Determina pesos e critérios do arquétipo):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {[
                      { id: 'comercial', label: 'Comercial' },
                      { id: 'atendimento', label: 'Atendimento/CS' },
                      { id: 'operacoes', label: 'Operações' },
                      { id: 'tecnico', label: 'Técnico' },
                      { id: 'lideranca', label: 'Liderança' },
                      { id: 'outro', label: 'Outro' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFamily(f.id);
                          setProfileLevel(f.id === 'lideranca' ? 'lideranca' : 'tecnico');
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: selectedFamily === f.id ? '1px solid #3B82F6' : '1px solid #1E293B',
                          background: selectedFamily === f.id ? '#3B82F6' : '#131B2A',
                          color: selectedFamily === f.id ? '#FFFFFF' : '#94A3B8',
                          fontWeight: '600',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sugestão automática de nível */}
                {levelSuggestion && (
                  <div className="level-suggestion" style={{ marginTop: '8px' }}>
                    <Zap size={12} />
                    {levelSuggestion.message}
                    {levelSuggestion.suggested !== profileLevel && (
                      <button
                        className="suggestion-apply"
                        onClick={() => {
                          setProfileLevel(levelSuggestion.suggested);
                          if (levelSuggestion.suggested === 'lideranca') setSelectedFamily('lideranca');
                        }}
                      >
                        Aplicar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Banner de erro */}
            {error && (
              <div className="error-banner">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* ── ABA: Upload ── */}
            {activeTab === 'upload' && (
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
                      <small>Suporta .pdf, .docx, .txt — máx. 10MB</small>
                    </>
                  )}
                </div>

                {/* Confirmação de suporte a PDF e OCR */}
                {file && (file.name.endsWith('.pdf') || file.type === 'application/pdf') && (
                  <p style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#60A5FA',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} color="#3B82F6" />
                    PDF pronto para análise com OCR inteligente (lê texto nativo e documentos escaneados).
                  </p>
                )}

                {/* Componente de progresso por etapas (Fase 3) */}
                <UploadProgress step={uploadStep} />

                <button
                  className="btn-indigo full-width"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !file}
                  style={{ marginTop: '20px' }}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={20} /> Processando...</>
                  ) : (
                    <>Iniciar Análise do CV <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            )}

            {/* ── ABA: Transcrição ── */}
            {activeTab === 'transcript' && (
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
                        className="btn-text"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setLevelSuggestion(null); }}
                        style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.8 }}
                      >
                        Remover arquivo
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={32} color="var(--action-primary)" />
                      <span>Upload de arquivo de transcrição</span>
                      <small>Suporta .pdf, .docx, .txt — máx. 10MB</small>
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

                {/* Progresso também na aba de transcrição */}
                <UploadProgress step={uploadStep} />

                <button
                  className="btn-indigo full-width"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (!transcript.trim() && !file)}
                  style={{ marginTop: '20px' }}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={20} /> Processando...</>
                  ) : (
                    <>Iniciar Análise da Transcrição <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            )}

            {/* ── ABA: Histórico & Comparador ── */}
            {activeTab === 'history' && (
              <div className="history-section animate-fade">
                {loadingHistory ? (
                  <div className="loading-state"><Loader2 className="spin" /> Carregando histórico...</div>
                ) : history.length === 0 ? (
                  <div className="empty-history">
                    <History size={48} opacity={0.2} />
                    <p>Nenhuma análise salva ainda.</p>
                  </div>
                ) : (
                  <div className="history-container">
                    {/* Tabela Comparativa Multi-Candidatos */}
                    {history.length > 1 && (
                      <div className="comparison-box" style={{ marginBottom: '32px', background: '#131B2A', padding: '20px', borderRadius: '12px', border: '1px solid #1E293B' }}>
                        <h3 style={{ fontSize: '1.05rem', color: '#60A5FA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={18} /> Comparador de Candidatos (Matriz de Decisão)
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #1E293B', textAlign: 'left', color: '#94A3B8' }}>
                                <th style={{ padding: '8px' }}>Candidato</th>
                                <th style={{ padding: '8px' }}>Vaga / Perfil</th>
                                <th style={{ padding: '8px' }}>Gate Check</th>
                                <th style={{ padding: '8px' }}>Score Final</th>
                                <th style={{ padding: '8px' }}>Principal Força</th>
                                <th style={{ padding: '8px' }}>Principal Risco</th>
                                <th style={{ padding: '8px' }}>Recomendação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {history.map(item => {
                                const ana = item.analysis || {};
                                const isGateReprov = (ana.gate_check?.status || "").toUpperCase().includes("REPROV");
                                return (
                                  <tr 
                                    key={item.id} 
                                    onClick={() => setAnalysisResult(ana)}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="comparison-row"
                                  >
                                    <td style={{ padding: '10px 8px', fontWeight: '700', color: '#ffffff' }}>{item.name}</td>
                                    <td style={{ padding: '10px 8px', color: '#94a3b8' }}>{item.role}</td>
                                    <td style={{ padding: '10px 8px' }}>
                                      <span style={{ 
                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700',
                                        background: isGateReprov ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                                        color: isGateReprov ? '#EF4444' : '#10B981'
                                      }}>
                                        {ana.gate_check?.status || "OK"}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 8px', fontWeight: '800', color: '#10B981' }}>
                                      {ana.scorecard?.score_final_100 ? `${ana.scorecard.score_final_100}/100` : (ana.nota_geral ? `${ana.nota_geral}/5` : '—')}
                                    </td>
                                    <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>
                                      {ana.swot?.forcas?.[0] || '—'}
                                    </td>
                                    <td style={{ padding: '10px 8px', color: '#fca5a5' }}>
                                      {ana.swot?.ameacas?.[0] || ana.swot?.fraquezas?.[0] || '—'}
                                    </td>
                                    <td style={{ padding: '10px 8px' }}>
                                      <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: (ana.recomendacao || "").toUpperCase().includes("NÃO") ? '#EF4444' : '#10B981' }}>
                                        {ana.recomendacao || "AVALIADO"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

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
                  </div>
                )}
              </div>
            )}

          </GlassCard>
        ) : (
          /* ── RESULTADO DA ANÁLISE (PADRÃO LIVE CONSULTORIA) ── */
          <div className="result-section animate-fade-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Alerta de Gate Reprovado */}
            {analysisResult.gate_check?.status === "REPROVADO" && (
              <div style={{ background: 'rgba(255, 59, 59, 0.15)', border: '1px solid #ff3b3b', padding: '16px 20px', borderRadius: '12px', color: '#ff6b6b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>
                  <ShieldAlert size={20} /> REPROVADO NO GATE CHECK ELIMINATÓRIO
                </div>
                <div style={{ fontSize: '0.9rem', color: '#fecaca' }}>
                  {analysisResult.gate_check.motivo}
                </div>
              </div>
            )}

            {/* Cabeçalho do Candidato */}
            <GlassCard className="result-header-card">
              <div className="candidate-info">
                <div className="avatar">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="narrative-text" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
                    {analysisResult.nome || 'Candidato'}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '2px' }}>
                    Vaga: {analysisResult.vaga_titulo || 'Avaliação Direta'} • Família: {analysisResult.familia_vaga || selectedFamily}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                  background: analysisResult.gate_check?.status === 'REPROVADO' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  color: analysisResult.gate_check?.status === 'REPROVADO' ? '#EF4444' : '#10B981',
                  border: `1px solid ${analysisResult.gate_check?.status === 'REPROVADO' ? '#EF4444' : '#10B981'}`
                }}>
                  Gate: {analysisResult.gate_check?.status || 'OK'}
                </div>
                <div className={`recommendation ${(analysisResult.recomendacao || '').toUpperCase().includes('NÃO') ? 'rejected' : 'approved'}`}>
                  {analysisResult.recomendacao}
                </div>
              </div>
            </GlassCard>

            {/* TL;DR Resumo Executivo */}
            <GlassCard style={{ borderLeft: '4px solid #3B82F6', padding: '18px 22px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#60A5FA', letterSpacing: '0.5px' }}>
                Resumo Executivo (Leitura de 30 Segundos)
              </span>
              <p style={{ marginTop: '6px', fontSize: '0.95rem', lineHeight: '1.6', color: '#f1f5f9' }}>
                {analysisResult.resumo}
              </p>
            </GlassCard>

            {/* Scorecard dos 4 Pilares */}
            {analysisResult.scorecard && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="scores-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <GlassCard className="score-card">
                    <span className="score-label">Comportamental ({analysisResult.scorecard.comportamental?.peso || 40}%)</span>
                    <div className="score-ring">
                      <span className="score-value" style={{ color: '#3B82F6' }}>{analysisResult.scorecard.comportamental?.nota ?? 3.5}</span>
                      <span className="score-max">/5</span>
                    </div>
                  </GlassCard>
                  <GlassCard className="score-card">
                    <span className="score-label">Técnica ({analysisResult.scorecard.tecnica?.peso || 20}%)</span>
                    <div className="score-ring">
                      <span className="score-value" style={{ color: '#3B82F6' }}>{analysisResult.scorecard.tecnica?.nota ?? 3.5}</span>
                      <span className="score-max">/5</span>
                    </div>
                  </GlassCard>
                  <GlassCard className="score-card">
                    <span className="score-label">Prática ({analysisResult.scorecard.pratica?.peso || 30}%)</span>
                    <div className="score-ring">
                      <span className="score-value" style={{ color: '#3B82F6' }}>{analysisResult.scorecard.pratica?.nota ?? 3.5}</span>
                      <span className="score-max">/5</span>
                    </div>
                  </GlassCard>
                  <GlassCard className="score-card">
                    <span className="score-label">Alinhamento ({analysisResult.scorecard.alinhamento?.peso || 10}%)</span>
                    <div className="score-ring">
                      <span className="score-value" style={{ color: '#3B82F6' }}>{analysisResult.scorecard.alinhamento?.nota ?? 3.5}</span>
                      <span className="score-max">/5</span>
                    </div>
                  </GlassCard>
                </div>

                {/* Banner de Auditoria Matemática */}
                <div style={{ background: '#131B2A', border: '1px dashed #3B82F6', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontFamily: 'monospace' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {analysisResult.scorecard.formula_calculo || 'Conta de score auditável calculada.'}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>
                    Score Final: {analysisResult.scorecard.score_final_100 || Math.round((analysisResult.nota_geral || 3.5) * 20)}/100
                  </span>
                </div>
              </div>
            )}

            {/* Análise STAR com Evidências Concretas */}
            {analysisResult.star_analysis && analysisResult.star_analysis.length > 0 && (
              <GlassCard>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', color: '#ffffff' }}>
                  Evidências STAR (Situação, Tarefa, Ação Individual, Resultado)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.star_analysis.map((star, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                      <p><strong>[S] Situação:</strong> {star.situacao}</p>
                      <p><strong>[T] Tarefa:</strong> {star.tarefa}</p>
                      <p><strong>[A] Ação Individual:</strong> {star.acao}</p>
                      <p><strong>[R] Resultado:</strong> <span style={{ color: '#10B981' }}>{star.resultado}</span></p>
                      {star.ponto_atencao && (
                        <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '4px' }}>⚠️ Ponto de Atenção: {star.ponto_atencao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Matriz SWOT */}
            {analysisResult.swot && (
              <GlassCard>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', color: '#ffffff' }}>
                  Matriz SWOT do Candidato
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ borderLeft: '3px solid #10B981', padding: '10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '4px' }}>
                    <h5 style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: '700' }}>FORÇAS</h5>
                    <ul style={{ fontSize: '0.8rem', paddingLeft: '14px', marginTop: '6px' }}>
                      {(analysisResult.swot.forcas || []).map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                  <div style={{ borderLeft: '3px solid #ff3b3b', padding: '10px', background: 'rgba(255, 59, 59, 0.05)', borderRadius: '4px' }}>
                    <h5 style={{ color: '#ff3b3b', fontSize: '0.85rem', fontWeight: '700' }}>FRAQUEZAS</h5>
                    <ul style={{ fontSize: '0.8rem', paddingLeft: '14px', marginTop: '6px' }}>
                      {(analysisResult.swot.fraquezas || []).map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                  <div style={{ borderLeft: '3px solid #38bdf8', padding: '10px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '4px' }}>
                    <h5 style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '700' }}>OPORTUNIDADES</h5>
                    <ul style={{ fontSize: '0.8rem', paddingLeft: '14px', marginTop: '6px' }}>
                      {(analysisResult.swot.oportunidades || []).map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                  <div style={{ borderLeft: '3px solid #f59e0b', padding: '10px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '4px' }}>
                    <h5 style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '700' }}>AMEAÇAS</h5>
                    <ul style={{ fontSize: '0.8rem', paddingLeft: '14px', marginTop: '6px' }}>
                      {(analysisResult.swot.ameacas || []).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Temperamento */}
            {analysisResult.temperamento && (
              <GlassCard className="temperament-card">
                <h3 style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Temperamento Operacional</h3>
                <p className="temperament-value" style={{ color: '#3B82F6', fontWeight: '700' }}>
                  {typeof analysisResult.temperamento === 'string' 
                    ? analysisResult.temperamento 
                    : `${analysisResult.temperamento.perfil_estimado || ''} — ${analysisResult.temperamento.leitura_fit || ''}`}
                </p>
              </GlassCard>
            )}

            {/* Informações Faltantes */}
            {analysisResult.informacoes_faltantes && analysisResult.informacoes_faltantes.length > 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' }}>
                  Honestidade Epistêmica — Critérios sem Dado Suficiente no Material:
                </span>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {analysisResult.informacoes_faltantes.map((inf, i) => <li key={i}>{inf}</li>)}
                </ul>
              </div>
            )}

            {/* Justificativa */}
            {analysisResult.justificativa && (
              <GlassCard className="justification-card">
                <h3 style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '8px' }}>Parecer Técnico Conclusivo</h3>
                <p style={{ lineHeight: '1.7', color: '#e2e8f0' }}>{analysisResult.justificativa}</p>
              </GlassCard>
            )}

            {/* Ações */}
            <div className="result-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setUploadStep('idle');
                  setLevelSuggestion(null);
                }}
                className="btn-secondary"
              >
                <ArrowLeft size={16} /> Nova Análise
              </button>
              <button
                className="btn-indigo"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <><Loader2 className="spin" size={18} /> Gerando Parecer...</>
                ) : (
                  <>Visualizar Parecer Protocolo Elite (HTML Live)</>
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
            margin-bottom: 24px;
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

          /* Seletor de perfil */
          .profile-selector {
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
          }

          .selector-label {
            font-size: 0.82rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .selector-buttons {
            display: flex;
            gap: 8px;
          }

          .selector-btn {
            padding: 9px 18px;
            border: 1px solid var(--border-glass);
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s ease-out;
          }

          .selector-btn:hover {
            border-color: rgba(79, 70, 229, 0.5);
            color: white;
          }

          .selector-btn.active {
            background: var(--action-primary);
            border-color: var(--action-primary);
            color: white;
            box-shadow: 0 0 16px rgba(79, 70, 229, 0.3);
          }

          /* Sugestão automática de nível */
          .level-suggestion {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            color: rgba(0, 212, 255, 0.85);
            background: rgba(0, 212, 255, 0.06);
            border: 1px solid rgba(0, 212, 255, 0.15);
            border-radius: 6px;
            padding: 6px 12px;
            animation: fadeIn 0.35s ease-out forwards;
          }

          .suggestion-apply {
            margin-left: 6px;
            background: rgba(0, 212, 255, 0.15);
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: #00d4ff;
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease-out;
          }

          .suggestion-apply:hover {
            background: rgba(0, 212, 255, 0.25);
          }

          /* Banner de erro */
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
            animation: fadeIn 0.3s ease-out;
          }

          /* Aviso PDF escaneado */
          .pdf-warning {
            font-size: 0.78rem;
            color: rgba(255, 149, 0, 0.85);
            background: rgba(255, 149, 0, 0.06);
            border: 1px solid rgba(255, 149, 0, 0.15);
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: -20px;
            margin-bottom: 4px;
          }

          /* Drop zone */
          .drop-zone {
            border: 2px dashed var(--border-glass);
            border-radius: 12px;
            padding: 60px 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease-out;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .drop-zone:hover {
            border-color: var(--action-primary);
            background: rgba(79, 70, 229, 0.05);
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(79, 70, 229, 0.1);
          }

          .drop-zone.has-file {
            border-color: var(--action-secondary);
            background: rgba(0, 240, 255, 0.04);
          }

          .drop-zone small {
            opacity: 0.5;
            font-size: 0.82rem;
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
            margin-bottom: 16px;
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

          /* Histórico */
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
            transition: all 0.2s ease-out;
          }

          .history-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--action-primary);
            transform: translateX(3px);
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
            flex-shrink: 0;
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
            white-space: nowrap;
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

          /* Resultado */
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
            flex-shrink: 0;
            box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
          }

          .candidate-info h2 {
            font-size: 1.5rem;
            margin-bottom: 4px;
          }

          .candidate-info p {
            opacity: 0.7;
            font-size: 0.95rem;
            line-height: 1.5;
          }

          .recommendation {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.85rem;
            white-space: nowrap;
          }

          .recommendation.approved {
            background: rgba(0, 240, 255, 0.1);
            color: var(--action-secondary);
            border: 1px solid rgba(0, 240, 255, 0.2);
          }

          .recommendation.review {
            background: rgba(139, 92, 246, 0.1);
            color: var(--action-accent);
            border: 1px solid rgba(139, 92, 246, 0.2);
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
            transition: all 0.2s ease-out;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-secondary:hover {
            color: white;
            background: rgba(255, 255, 255, 0.05);
          }

          /* Animações (Antigravity: mínimo 0.3s ease-out) */
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
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @media (max-width: 768px) {
            .scores-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .result-header-card {
              flex-direction: column;
              gap: 16px;
              align-items: flex-start;
            }
            .profile-selector {
              flex-wrap: wrap;
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
