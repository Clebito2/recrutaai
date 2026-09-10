"use client";

import { useState } from "react";
import GlassCard from "../common/GlassCard";
import { 
  MessageCircle, Instagram, Copy, Check, Share2, Lightbulb, 
  ExternalLink, Layers, Smartphone, Sparkles, Send, Info 
} from "lucide-react";
import { 
  generateWhatsAppJobPost, 
  generateInstagramFeedPost, 
  generateInstagramStoriesScript, 
  DISSEMINATION_STRATEGIES 
} from "../../lib/jobDissemination";

export default function JobDisseminationHub({ job }) {
  const [activeChannel, setActiveChannel] = useState("whatsapp"); // "whatsapp" | "instagram"
  const [instaFormat, setInstaFormat] = useState("feed"); // "feed" | "stories"
  const [copiedType, setCopiedType] = useState("");

  const whatsAppText = generateWhatsAppJobPost(job);
  const instaFeedText = generateInstagramFeedPost(job);
  const storiesScript = generateInstagramStoriesScript(job);

  const handleCopy = async (text, type) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(""), 2200);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="dissemination-hub animate-fade">
      {/* Header Informativo */}
      <div className="hub-intro-card">
        <div className="intro-icon">
          <Sparkles size={24} color="var(--purple-600, #7C3AED)" />
        </div>
        <div className="intro-content">
          <h3>Kit de Atração & Divulgação Multicanal</h3>
          <p>
            Anúncios formais não funcionam do mesmo jeito em redes sociais. Utilize os modelos abaixo otimizados com técnicas de copywriting da Live Consultoria para atrair candidatos qualificados pelo WhatsApp e Instagram.
          </p>
        </div>
      </div>

      {/* Seletor de Canal */}
      <div className="channel-tabs">
        <button
          className={`channel-btn whatsapp ${activeChannel === "whatsapp" ? "active" : ""}`}
          onClick={() => setActiveChannel("whatsapp")}
        >
          <MessageCircle size={18} />
          <span>Grupos de WhatsApp</span>
        </button>

        <button
          className={`channel-btn instagram ${activeChannel === "instagram" ? "active" : ""}`}
          onClick={() => setActiveChannel("instagram")}
        >
          <Instagram size={18} />
          <span>Instagram (Feed & Stories)</span>
        </button>
      </div>

      {/* Conteúdo: WHATSAPP */}
      {activeChannel === "whatsapp" && (
        <div className="channel-content animate-fade">
          <GlassCard className="preview-card-social">
            <div className="social-card-header">
              <div className="header-info">
                <span className="badge-social whatsapp">WhatsApp Format</span>
                <h4>Texto Pronto para Grupos & Listas</h4>
                <p>Formatado com marcadores nativos (*negrito*, marcadores e emojis profissionais).</p>
              </div>
              <div className="social-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleCopy(whatsAppText, "whatsapp")}
                >
                  {copiedType === "whatsapp" ? (
                    <><Check size={16} color="#10B981" /> Copiado!</>
                  ) : (
                    <><Copy size={16} /> Copiar Mensagem</>
                  )}
                </button>
                <button
                  className="btn-whatsapp-action"
                  onClick={handleShareWhatsApp}
                  title="Abrir WhatsApp e escolher contato ou grupo"
                >
                  <Send size={16} /> Enviar no WhatsApp
                </button>
              </div>
            </div>

            <div className="text-display-box whatsapp-box">
              <pre>{whatsAppText}</pre>
            </div>
          </GlassCard>

          {/* Dicas Estratégicas WhatsApp */}
          <div className="strategy-grid">
            {DISSEMINATION_STRATEGIES.whatsapp.map((item, idx) => (
              <div key={idx} className="strategy-card">
                <div className="strategy-icon">
                  <Lightbulb size={18} color="var(--purple-600, #7C3AED)" />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo: INSTAGRAM */}
      {activeChannel === "instagram" && (
        <div className="channel-content animate-fade">
          {/* Sub-tabs: Feed vs Stories */}
          <div className="format-selector">
            <button
              className={`format-btn ${instaFormat === "feed" ? "active" : ""}`}
              onClick={() => setInstaFormat("feed")}
            >
              <Layers size={16} /> Legenda para Feed / Carrossel
            </button>
            <button
              className={`format-btn ${instaFormat === "stories" ? "active" : ""}`}
              onClick={() => setInstaFormat("stories")}
            >
              <Smartphone size={16} /> Roteiro de Stories (3 Lâminas)
            </button>
          </div>

          {instaFormat === "feed" ? (
            <GlassCard className="preview-card-social">
              <div className="social-card-header">
                <div className="header-info">
                  <span className="badge-social instagram">Feed & Carrossel</span>
                  <h4>Legenda Estruturada com Gancho & Hashtags</h4>
                  <p>Texto com quebra de linhas para leitura rápida, CTA claro e hashtags de alcance.</p>
                </div>
                <div className="social-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => handleCopy(instaFeedText, "feed")}
                  >
                    {copiedType === "feed" ? (
                      <><Check size={16} color="#10B981" /> Copiado!</>
                    ) : (
                      <><Copy size={16} /> Copiar Legenda</>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-display-box instagram-box">
                <pre>{instaFeedText}</pre>
              </div>
            </GlassCard>
          ) : (
            <div className="stories-container">
              {storiesScript.map((slide, idx) => (
                <GlassCard key={idx} className="story-slide-card">
                  <div className="slide-header">
                    <span className="slide-badge">{slide.badge}</span>
                    <h5>{slide.slide}</h5>
                    <button
                      className="btn-copy-small"
                      onClick={() => handleCopy(slide.copy, `story-${idx}`)}
                    >
                      {copiedType === `story-${idx}` ? (
                        <><Check size={14} color="#10B981" /> Copiado</>
                      ) : (
                        <><Copy size={14} /> Copiar Texto</>
                      )}
                    </button>
                  </div>

                  <div className="slide-instruction">
                    <Info size={15} color="var(--purple-600, #7C3AED)" />
                    <span><strong>Dica Visual:</strong> {slide.instruction}</span>
                  </div>

                  <div className="slide-copy-box">
                    <pre>{slide.copy}</pre>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Dicas Estratégicas Instagram */}
          <div className="strategy-grid">
            {DISSEMINATION_STRATEGIES.instagram.map((item, idx) => (
              <div key={idx} className="strategy-card">
                <div className="strategy-icon">
                  <Lightbulb size={18} color="#E1306C" />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .dissemination-hub {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hub-intro-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #F8FAFC;
          border: 1.5px solid var(--line, #E2E8F0);
          padding: 18px 22px;
          border-radius: 12px;
        }

        .intro-icon {
          background: rgba(124, 58, 237, 0.1);
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .intro-content h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--ink-900, #0F172A);
          margin-bottom: 4px;
        }

        .intro-content p {
          font-size: 0.92rem;
          color: var(--ink-700, #475569);
          line-height: 1.5;
          margin: 0;
        }

        .channel-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1.5px solid var(--line, #E2E8F0);
          padding-bottom: 12px;
        }

        .channel-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          border: 1.5px solid var(--line, #CBD5E1);
          background: #FFFFFF;
          color: var(--ink-700, #334155);
          transition: all 0.2s;
        }

        .channel-btn:hover {
          border-color: var(--purple-600, #7C3AED);
          color: var(--purple-600, #7C3AED);
        }

        .channel-btn.active.whatsapp {
          background: #25D366;
          border-color: #25D366;
          color: #FFFFFF;
        }

        .channel-btn.active.instagram {
          background: linear-gradient(45deg, #F58529, #DD2A7B, #8134AF);
          border-color: transparent;
          color: #FFFFFF;
        }

        .channel-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preview-card-social {
          padding: 24px;
          background: #FFFFFF;
        }

        .social-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--line, #F1F5F9);
          flex-wrap: wrap;
        }

        .header-info h4 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--ink-900, #0F172A);
          margin: 6px 0 2px 0;
        }

        .header-info p {
          font-size: 0.85rem;
          color: var(--ink-700, #64748B);
          margin: 0;
        }

        .badge-social {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .badge-social.whatsapp {
          background: #DCFCE7;
          color: #166534;
        }

        .badge-social.instagram {
          background: #FCE7F3;
          color: #9D174D;
        }

        .social-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-whatsapp-action {
          background: #25D366;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .btn-whatsapp-action:hover {
          background: #1EBE5D;
        }

        .text-display-box {
          background: #F8FAFC;
          border: 1.5px solid var(--line, #CBD5E1);
          border-radius: 10px;
          padding: 20px;
          max-height: 420px;
          overflow-y: auto;
        }

        .text-display-box pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--ink-900, #0F172A);
        }

        .format-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 4px;
        }

        .format-btn {
          background: #FFFFFF;
          border: 1.5px solid var(--line, #CBD5E1);
          color: var(--ink-700, #334155);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .format-btn.active {
          background: var(--purple-600, #7C3AED);
          border-color: var(--purple-600, #7C3AED);
          color: #FFFFFF;
        }

        .stories-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .story-slide-card {
          padding: 18px;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .slide-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .slide-header h5 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--ink-900, #0F172A);
          margin: 0;
        }

        .slide-badge {
          align-self: flex-start;
          background: #EDE9FE;
          color: #6D28D9;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .btn-copy-small {
          position: absolute;
          right: 0;
          top: 0;
          background: #F1F5F9;
          border: 1px solid var(--line, #CBD5E1);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--ink-800, #1E293B);
          padding: 4px 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .slide-instruction {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #F8FAFC;
          border: 1px solid var(--line, #E2E8F0);
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          color: var(--ink-700, #475569);
          line-height: 1.4;
        }

        .slide-copy-box {
          background: #0F172A;
          border-radius: 8px;
          padding: 14px;
          flex-grow: 1;
        }

        .slide-copy-box pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #F8FAFC;
        }

        .strategy-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .strategy-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #FFFFFF;
          border: 1.5px solid var(--line, #E2E8F0);
          border-radius: 10px;
          padding: 16px;
        }

        .strategy-icon {
          padding: 8px;
          background: #F8FAFC;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .strategy-card strong {
          display: block;
          font-size: 0.9rem;
          color: var(--ink-900, #0F172A);
          margin-bottom: 4px;
        }

        .strategy-card p {
          font-size: 0.82rem;
          color: var(--ink-700, #475569);
          line-height: 1.4;
          margin: 0;
        }

        @media (max-width: 900px) {
          .stories-container,
          .strategy-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
