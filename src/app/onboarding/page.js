"use client";

import { useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, updateCompanyName } = useAuth();
  const router = useRouter();

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

  // Redirect if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="onboarding-container">
      <main className="onboarding-main animate-fade">
        <GlassCard className="onboarding-card">
          <div className="card-header">
            <div className="icon-wrapper">
              <Building2 size={32} color="var(--action-primary)" />
            </div>
            <h1 className="narrative-text">Identificação Corporativa</h1>
            <p>Para carregar os parâmetros de análise, precisamos identificar o ambiente cliente.</p>
          </div>

          <form onSubmit={handleStart} className="onboarding-form">
            <div className="input-group">
              <label htmlFor="company">Nome da Organização</label>
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
                  <Loader2 className="spin" size={20} /> Carregando Módulos...
                </>
              ) : (
                <>
                  Inicializar Cockpit <ArrowRight size={20} />
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
          padding: 20px;
        }

        .onboarding-card {
          width: 100%;
          max-width: 480px;
          padding: 50px;
        }

        .card-header {
          text-align: center;
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: rgba(79, 70, 229, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .card-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .card-header p {
          opacity: 0.6;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          padding: 16px;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          font-family: var(--font-ui);
          transition: all 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: var(--action-primary);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .full-width {
          width: 100%;
          justify-content: center;
          padding: 16px;
          font-size: 1rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
