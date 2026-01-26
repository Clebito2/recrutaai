"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../components/common/GlassCard";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, loading: authLoading, updateCompanyName } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login");
    }
  }, [mounted, authLoading, user, router]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    try {
      await updateCompanyName(companyName);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Erro ao configurar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="onboarding-container">
        <div className="loading-screen">Carregando...</div>
        <style jsx>{`
          .onboarding-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-screen {
            color: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="onboarding-container">
      <main className="onboarding-main">
        <GlassCard className="onboarding-card">
          <div className="card-header">
            <span className="step-badge">Passo 1 de 1</span>
            <h1>Identificação Corporativa</h1>
            <p>Para configurar sua conta, precisamos identificar sua empresa.</p>
          </div>

          <form onSubmit={handleStart} className="onboarding-form">
            <div className="input-group">
              <label htmlFor="company">Nome da Empresa</label>
              <input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: TechFlow Systems"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-indigo full-width" disabled={loading || !companyName.trim()}>
              {loading ? (
                <>
                  <Loader2 className="spin" size={18} /> Configurando...
                </>
              ) : (
                <>
                  Acessar Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </main>

      <style jsx>{`
        .onboarding-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .onboarding-card {
          width: 100%;
          max-width: 480px;
          padding: 56px 48px;
        }

        .card-header {
          margin-bottom: 40px;
        }

        .step-badge {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--action-primary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .card-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .card-header p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1rem;
          line-height: 1.6;
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
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
