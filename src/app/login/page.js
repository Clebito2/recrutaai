"use client";

import { useState, useEffect } from "react";
import GlassCard from "../../components/common/GlassCard";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { signIn, signUp, user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect based on auth & payment status
  useEffect(() => {
    if (mounted && !authLoading && user) {
      const isMasterAdmin = 
        user.email === "cleber.ihs@gmail.com" || 
        user.email === "cleberdonato@ecossistemalive.com.br";

      if (!isMasterAdmin && (userProfile?.status === "pending_payment" || userProfile?.paymentApproved === false)) {
        router.push("/pending-approval");
        return;
      }

      if (userProfile?.companyName) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [mounted, authLoading, user, userProfile, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="login-container">
        <div className="loading">Carregando...</div>
        <style jsx>{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading {
            color: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <main className="login-main">
        <Link href="/" className="brand-link brand-underline" style={{ textDecoration: 'none' }}>
          <span className="text-brand-recruit">Recruit</span><span className="text-brand-ai">AI</span>
        </Link>

        <GlassCard className="login-card">
          <div className="card-header">
            <h1>{isLogin ? "Bem-vindo de volta" : "Criar conta"}</h1>
            <p>{isLogin ? "Entre com seu e-mail e senha para acessar" : "Preencha seus dados para solicitar liberação de acesso"}</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-indigo full-width" disabled={loading}>
              {loading ? (
                <><Loader2 className="spin" size={18} /> Processando...</>
              ) : (
                <>{isLogin ? "Entrar" : "Criar Conta e Solicitar Acesso"} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="toggle-mode">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </GlassCard>
      </main>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-main {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brand-link {
          font-size: 1.5rem;
          font-weight: 800;
          text-decoration: none;
          color: var(--text-primary);
          margin-bottom: 40px;
        }

        .text-accent {
          color: var(--action-primary);
        }

        .login-card {
          width: 100%;
          padding: 48px 40px;
        }

        .card-header {
          margin-bottom: 32px;
        }

        .card-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .card-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .error-message {
          background: rgba(196, 92, 75, 0.1);
          border: 1px solid rgba(196, 92, 75, 0.3);
          color: var(--status-danger);
          padding: 14px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .full-width {
          width: 100%;
          margin-top: 8px;
        }



        .toggle-mode {
          margin-top: 28px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .toggle-mode button {
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .toggle-mode button:hover {
          background: var(--action-primary) !important;
          color: white !important;
          transform: translateY(-2px);
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
