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

  const { user, userProfile, loading: authLoading, addCompany, switchCompany } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        const isMasterAdmin = 
          user.email === "cleber.ihs@gmail.com" || 
          user.email === "cleberdonato@ecossistemalive.com.br";

        if (!isMasterAdmin && (userProfile?.status === "pending_payment" || userProfile?.paymentApproved === false)) {
          router.push("/pending-approval");
        }
      }
    }
  }, [mounted, authLoading, user, userProfile, router]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    try {
      await addCompany(companyName);
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

  const existingCompanies = Array.isArray(userProfile?.companies) 
    ? userProfile.companies 
    : (userProfile?.companyName ? [userProfile.companyName] : []);

  return (
    <div className="onboarding-container">
      <main className="onboarding-main">
        <GlassCard className="onboarding-card">
          <div className="card-header">
            <span className="step-badge">Empresas & Clientes</span>
            <h1>Gestão de Empresas</h1>
            <p>Selecione uma empresa já cadastrada ou adicione uma nova para gerenciar seus processos seletivos.</p>
          </div>

          {existingCompanies.length > 0 && (
            <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--line)" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--ink-700)", marginBottom: "10px" }}>
                Acessar empresa já cadastrada:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {existingCompanies.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={async () => {
                      await switchCompany(comp);
                      router.push("/dashboard");
                    }}
                    style={{
                      background: userProfile?.companyName === comp ? "var(--purple-600)" : "#FFFFFF",
                      color: userProfile?.companyName === comp ? "#FFFFFF" : "var(--purple-600)",
                      border: "1px solid var(--purple-600)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontWeight: "700",
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    🏢 {comp}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleStart} className="onboarding-form">
            <div className="input-group">
              <label htmlFor="company">
                {existingCompanies.length > 0 ? "Ou Cadastrar Nova Empresa" : "Nome da Empresa"}
              </label>
              <input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: TechFlow Systems"
                required
                autoFocus={existingCompanies.length === 0}
              />
            </div>

            <button type="submit" className="btn-indigo full-width" disabled={loading || !companyName.trim()}>
              {loading ? (
                <>
                  <Loader2 className="spin" size={18} /> Salvando...
                </>
              ) : (
                <>
                  Cadastrar e Acessar <ArrowRight size={18} />
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
