"use client";

import { useState } from "react";
import GlassCard from "../../components/common/GlassCard";
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            router.push("/onboarding");
        } catch (err) {
            console.error(err);
            setError(
                err.code === "auth/user-not-found" ? "Usuário não encontrado." :
                    err.code === "auth/wrong-password" ? "Senha incorreta." :
                        err.code === "auth/email-already-in-use" ? "Email já cadastrado." :
                            "Erro na autenticação. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push("/onboarding");
        } catch (err) {
            console.error(err);
            setError("Erro ao entrar com Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-content">
                <GlassCard className="auth-card animate-fade">
                    <div className="auth-header">
                        <div className="auth-tabs">
                            <button
                                className={`tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                <LogIn size={18} /> Entrar
                            </button>
                            <button
                                className={`tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                <UserPlus size={18} /> Criar Conta
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="email">Email Corporativo</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nome@empresa.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Senha</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-indigo full-width" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="spin" size={20} /> Processando...</>
                            ) : (
                                <>{isLogin ? "Acessar Sistema" : "Criar Conta"} <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>ou continue com</span>
                    </div>

                    <button onClick={handleGoogleSignIn} className="btn-google" disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Entrar com Google
                    </button>

                    <p className="auth-footer">
                        Ao continuar, você concorda com os <Link href="/terms">Termos de Uso</Link> e <Link href="/privacy">Política de Privacidade</Link>.
                    </p>
                </GlassCard>
            </div>

            <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
        }

        .auth-header {
          margin-bottom: 32px;
        }

        .auth-tabs {
          display: flex;
          gap: 8px;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 10px;
        }

        .tab {
          flex: 1;
          padding: 12px;
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

        .tab:hover:not(.active) {
          color: white;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #FCA5A5;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
        }

        input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          padding: 14px 16px 14px 48px;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: var(--action-primary);
          background: rgba(0, 0, 0, 0.4);
        }

        .full-width {
          width: 100%;
          justify-content: center;
          padding: 16px;
          margin-top: 8px;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.85rem;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border-glass);
        }

        .divider span {
          padding: 0 16px;
        }

        .btn-google {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid var(--border-glass);
          background: rgba(255, 255, 255, 0.02);
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .btn-google:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .auth-footer {
          margin-top: 24px;
          font-size: 0.8rem;
          text-align: center;
          opacity: 0.5;
        }

        .auth-footer a {
          color: var(--action-secondary);
          text-decoration: none;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
