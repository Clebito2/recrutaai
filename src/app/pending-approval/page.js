"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/common/GlassCard";
import { Clock, Check, Copy, MessageSquare, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PendingApprovalPage() {
  const { user, userProfile, loading, logout, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");

  const pixKey = "cleberdonato@ecossistemalive.com.br";
  const whatsappNumber = "5561996993134";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && userProfile) {
      const isApproved = userProfile.paymentApproved === true || userProfile.status === "active";
      if (isApproved) {
        if (userProfile.companyName) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    }
  }, [loading, userProfile, router]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setCheckMessage("");
    try {
      const updated = await refreshUserProfile();
      if (updated?.paymentApproved === true || updated?.status === "active") {
        setCheckMessage("Pagamento confirmado! Redirecionando...");
        setTimeout(() => {
          if (updated.companyName) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        }, 1200);
      } else {
        setCheckMessage("Seu pagamento ainda está em análise pelo nosso time. Caso já tenha enviado o comprovante no WhatsApp, aguarde a ativação.");
      }
    } catch (err) {
      setCheckMessage("Erro ao consultar status. Tente novamente.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const whatsappMessage = encodeURIComponent(
    "Olá Cléber! Criei minha conta no RecruitAI com o e-mail " + (user?.email || "") + ". Segue em anexo o meu comprovante de pagamento para liberação do acesso."
  );
  const whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + whatsappMessage;

  if (loading) {
    return (
      <div className="pending-container">
        <div className="loading">Carregando...</div>
        <style jsx>{`
          .pending-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0B0F17;
            color: #94A3B8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pending-container">
      <main className="pending-main">
        <Link href="/" className="brand-link">
          <span className="text-brand-recruit">Recruit</span><span className="text-brand-ai">AI</span>
        </Link>

        <GlassCard className="pending-card">
          <div className="icon-wrapper">
            <Clock size={36} color="#F59E0B" />
          </div>

          <span className="status-pill">Acesso Condicionado a Pagamento</span>

          <h1>Conta Criada com Sucesso</h1>
          <p className="description">
            A ativação da sua conta está condicionada à comprovação do pagamento. Para ter seu acesso liberado de imediato, siga os passos abaixo:
          </p>

          <div className="user-box">
            <span className="label">E-mail Cadastrado:</span>
            <span className="email">{user?.email}</span>
            <span className="status-dot">
              <span className="dot"></span> Aguardando comprovação
            </span>
          </div>

          <div className="steps-card">
            <div className="step-item">
              <div className="step-num">1</div>
              <div className="step-content">
                <strong>Realize o Pagamento via PIX</strong>
                <p>Efetue a transferência usando a chave oficial abaixo:</p>
                <div className="pix-box">
                  <code>{pixKey}</code>
                  <button type="button" onClick={handleCopyPix} className="btn-copy">
                    {copied ? <span><Check size={16} /> Copiado</span> : <span><Copy size={16} /> Copiar PIX</span>}
                  </button>
                </div>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num">2</div>
              <div className="step-content">
                <strong>Envie o Comprovante no WhatsApp</strong>
                <p>Clique no botão abaixo para enviar o comprovante diretamente para a nossa equipe de liberação:</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <MessageSquare size={18} /> Enviar Comprovante no WhatsApp
                </a>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num">3</div>
              <div className="step-content">
                <strong>Liberação Imediata</strong>
                <p>Após a conferência, sua conta será ativada e você terá acesso total à plataforma.</p>
              </div>
            </div>
          </div>

          {checkMessage && (
            <div className={"check-alert " + (checkMessage.includes("confirmado") ? "success" : "info")}>
              {checkMessage}
            </div>
          )}

          <div className="actions-footer">
            <button
              type="button"
              onClick={handleCheckStatus}
              className="btn-indigo full-width"
              disabled={checking}
            >
              <RefreshCw size={18} className={checking ? "spin" : ""} />
              {checking ? "Consultando Liberação..." : "Já Enviei / Verificar Liberação"}
            </button>

            <button type="button" onClick={handleLogout} className="btn-secondary full-width">
              <LogOut size={16} /> Sair da Conta
            </button>
          </div>
        </GlassCard>
      </main>

      <style jsx>{`
        .pending-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: #0B0F17;
        }

        .pending-main {
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brand-link {
          font-size: 1.6rem;
          font-weight: 800;
          text-decoration: none;
          color: #F8FAFC;
          margin-bottom: 28px;
        }

        .pending-card {
          width: 100%;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #131B2A;
          border: 1px solid #1E293B;
        }

        .icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .status-pill {
          padding: 4px 14px;
          border-radius: 20px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #F59E0B;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #F8FAFC;
          margin-bottom: 10px;
        }

        .description {
          color: #94A3B8;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .user-box {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #1E293B;
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          text-align: left;
        }

        .user-box .label {
          font-size: 0.8rem;
          color: #64748B;
          text-transform: uppercase;
          font-weight: 600;
        }

        .user-box .email {
          color: #F8FAFC;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .status-dot {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #F59E0B;
          font-weight: 600;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F59E0B;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .steps-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
          text-align: left;
        }

        .step-item {
          display: flex;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #1E293B;
          padding: 18px;
          border-radius: 10px;
        }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #3B82F6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-content strong {
          display: block;
          color: #F8FAFC;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }

        .step-content p {
          color: #94A3B8;
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .pix-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0B0F17;
          border: 1px solid #1E293B;
          padding: 8px 12px;
          border-radius: 6px;
          margin-top: 6px;
        }

        .pix-box code {
          font-size: 0.85rem;
          color: #60A5FA;
          flex: 1;
          word-break: break-all;
          font-family: monospace;
        }

        .btn-copy {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60A5FA;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-copy:hover {
          background: #3B82F6;
          color: white;
        }

        .btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #10B981;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          margin-top: 6px;
        }

        .btn-whatsapp:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .check-alert {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.88rem;
          margin-bottom: 20px;
          text-align: left;
        }

        .check-alert.info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93C5FD;
        }

        .check-alert.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6EE7B7;
        }

        .actions-footer {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-indigo {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .btn-indigo:hover {
          background: #2563EB;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #1E293B;
          color: #94A3B8;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .full-width {
          width: 100%;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
