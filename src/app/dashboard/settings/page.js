"use client";

import { useState } from "react";
import GlassCard from "../../../components/common/GlassCard";
import { User, Building2, CreditCard, Bell, Shield, Save, Loader2, CheckCircle, Lock, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useSubscription } from "../../../hooks/useSubscription";

export default function SettingsPage() {
    const { user, userProfile, updateCompanyName, changePassword, sendResetPasswordEmail } = useAuth();
    const { subscription } = useSubscription();
    
    // Empresa states
    const [companyName, setCompanyName] = useState(userProfile?.companyName || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [resetEmailSending, setResetEmailSending] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const handleSaveCompany = async () => {
        setSaving(true);
        try {
            await updateCompanyName(companyName);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        if (e) e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!newPassword || newPassword.length < 6) {
            setPasswordError("A nova senha deve possuir no mínimo 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("A confirmação não confere com a nova senha digitada.");
            return;
        }

        setChangingPassword(true);
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordSuccess("Sua senha foi alterada com sucesso!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordSuccess(""), 4000);
        } catch (err) {
            console.error("[Settings] Erro ao alterar senha:", err);
            let msg = err.message || "Erro ao alterar a senha. Verifique seus dados.";
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                msg = "A senha atual informada está incorreta.";
            } else if (err.code === "auth/weak-password") {
                msg = "A nova senha informada é fraca. Utilize letras, números e caracteres especiais.";
            } else if (err.code === "auth/requires-recent-login") {
                msg = "Por segurança, informe sua senha atual para autorizar a modificação.";
            }
            setPasswordError(msg);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSendResetEmail = async () => {
        setPasswordError("");
        setResetEmailSending(true);
        try {
            const email = user?.email || userProfile?.email;
            await sendResetPasswordEmail(email);
            setResetEmailSent(true);
            setTimeout(() => setResetEmailSent(false), 5000);
        } catch (err) {
            console.error("[Settings] Erro ao enviar link de redefinição:", err);
            setPasswordError("Falha ao enviar e-mail de redefinição: " + (err.message || "Tente novamente mais tarde."));
        } finally {
            setResetEmailSending(false);
        }
    };

    const planDetails = {
        trial: { name: "Trial", price: "Grátis", color: "var(--action-secondary, #10B981)" },
        tier1: { name: "Essencial", price: "R$ 99/mês", color: "var(--action-primary, #7C3AED)" },
        tier2: { name: "Elite", price: "R$ 249/mês", color: "var(--action-accent, #3B82F6)" }
    };

    const currentPlan = planDetails[subscription?.plan] || planDetails.trial;

    return (
        <div className="settings-page animate-fade">
            <header className="page-header">
                <h1>Configurações</h1>
                <p>Gerencie seu perfil, assinatura, preferências e credenciais de acesso.</p>
            </header>

            <div className="settings-grid">
                {/* Security Section (Alterar Senha) */}
                <GlassCard className="settings-card security-card" style={{ gridColumn: "1 / -1" }}>
                    <div className="card-header">
                        <Shield size={24} color="var(--action-primary, #7C3AED)" />
                        <h3>Segurança da Conta & Alteração de Senha</h3>
                    </div>
                    <div className="card-content">
                        <p className="card-description">
                            Atualize sua senha de acesso ao sistema com segurança. Caso tenha esquecido a senha atual, utilize o envio do link seguro por e-mail.
                        </p>

                        {passwordSuccess && (
                            <div className="alert-banner alert-success">
                                <CheckCircle size={18} />
                                <span>{passwordSuccess}</span>
                            </div>
                        )}

                        {passwordError && (
                            <div className="alert-banner alert-error">
                                <AlertCircle size={18} />
                                <span>{passwordError}</span>
                            </div>
                        )}

                        {resetEmailSent && (
                            <div className="alert-banner alert-success">
                                <Mail size={18} />
                                <span>Link de redefinição enviado com sucesso para <strong>{user?.email || userProfile?.email}</strong>! Verifique sua caixa de entrada.</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="password-grid-form">
                            <div className="input-group">
                                <label>Senha Atual</label>
                                <div className="input-password-wrapper">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Sua senha atual"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="eye-toggle-btn"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        tabIndex="-1"
                                        aria-label={showCurrentPassword ? "Ocultar senha" : "Ver senha"}
                                    >
                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Nova Senha</label>
                                <div className="input-password-wrapper">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="eye-toggle-btn"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        tabIndex="-1"
                                        aria-label={showNewPassword ? "Ocultar senha" : "Ver senha"}
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Confirmar Nova Senha</label>
                                <div className="input-password-wrapper">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirme a nova senha"
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="security-actions">
                                <button
                                    type="submit"
                                    className="btn-indigo"
                                    disabled={changingPassword || !newPassword || !confirmPassword}
                                >
                                    {changingPassword ? (
                                        <><Loader2 className="spin" size={18} /> Salvando Nova Senha...</>
                                    ) : (
                                        <><Lock size={18} /> Salvar Nova Senha</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn-text-action"
                                    onClick={handleSendResetEmail}
                                    disabled={resetEmailSending}
                                    title="Receber link oficial do Firebase para redefinição no seu e-mail cadastrado"
                                >
                                    {resetEmailSending ? (
                                        <><Loader2 className="spin" size={16} /> Enviando e-mail...</>
                                    ) : (
                                        <><Mail size={16} /> Esqueci a senha / Enviar link por e-mail</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </GlassCard>

                {/* Profile Section */}
                <GlassCard className="settings-card">
                    <div className="card-header">
                        <Building2 size={24} color="var(--action-primary, #7C3AED)" />
                        <h3>Empresa</h3>
                    </div>
                    <div className="card-content">
                        <div className="input-group">
                            <label>Nome da Organização</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Nome da empresa"
                            />
                        </div>
                        <button
                            className="btn-indigo"
                            onClick={handleSaveCompany}
                            disabled={saving || !companyName.trim()}
                        >
                            {saving ? (
                                <><Loader2 className="spin" size={18} /> Salvando...</>
                            ) : saved ? (
                                <><CheckCircle size={18} /> Salvo!</>
                            ) : (
                                <><Save size={18} /> Salvar Alterações</>
                            )}
                        </button>
                    </div>
                </GlassCard>

                {/* Subscription Section */}
                <GlassCard className="settings-card subscription-card">
                    <div className="card-header">
                        <CreditCard size={24} color={currentPlan.color} />
                        <h3>Assinatura</h3>
                    </div>
                    <div className="card-content">
                        <div className="plan-display">
                            <div className="plan-badge" style={{ background: `${currentPlan.color}20`, color: currentPlan.color }}>
                                {currentPlan.name}
                            </div>
                            <span className="plan-price">{currentPlan.price}</span>
                        </div>

                        <div className="usage-section">
                            <div className="usage-item">
                                <span className="usage-label">Vagas criadas</span>
                                <span className="usage-value">
                                    {subscription?.jobsCount || 0} / {subscription?.currentLimits?.jobs === Infinity ? '∞' : subscription?.currentLimits?.jobs}
                                </span>
                            </div>
                            <div className="usage-item">
                                <span className="usage-label">Análises realizadas</span>
                                <span className="usage-value">
                                    {subscription?.cvCount || 0} / {subscription?.currentLimits?.cvs === Infinity ? '∞' : subscription?.currentLimits?.cvs}
                                </span>
                            </div>
                            <div className="usage-item">
                                <span className="usage-label">Dias restantes</span>
                                <span className="usage-value">{subscription?.daysRemaining || 0}</span>
                            </div>
                        </div>

                        {subscription?.plan === 'trial' && (
                            <button className="btn-upgrade">
                                Fazer Upgrade
                            </button>
                        )}
                    </div>
                </GlassCard>

                {/* Account Section */}
                <GlassCard className="settings-card">
                    <div className="card-header">
                        <User size={24} color="var(--action-accent, #3B82F6)" />
                        <h3>Conta</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Email</span>
                            <span className="info-value">{userProfile?.email || user?.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Membro desde</span>
                            <span className="info-value">
                                {userProfile?.createdAt?.toDate?.()?.toLocaleDateString("pt-BR") || "—"}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status da Conta</span>
                            <span className="info-value" style={{ color: "var(--green-600, #16A34A)", fontWeight: 700 }}>
                                {userProfile?.status === "active" ? "Ativa" : "Regular"}
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* Notifications Section */}
                <GlassCard className="settings-card">
                    <div className="card-header">
                        <Bell size={24} color="var(--action-secondary, #10B981)" />
                        <h3>Notificações</h3>
                    </div>
                    <div className="card-content">
                        <label className="toggle-row">
                            <span>Alertas de limite</span>
                            <input type="checkbox" defaultChecked />
                        </label>
                        <label className="toggle-row">
                            <span>Novidades do produto</span>
                            <input type="checkbox" />
                        </label>
                    </div>
                </GlassCard>
            </div>

            <style jsx>{`
        .settings-page {
          max-width: 1040px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--ink-900, #0F172A);
          margin-bottom: 8px;
        }

        .page-header p {
          color: var(--ink-700, #475569);
          font-size: 1rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .settings-card {
          padding: 28px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--line, #E2E8F0);
        }

        .card-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--ink-900, #0F172A);
          margin: 0;
        }

        .card-description {
          font-size: 0.9rem;
          color: var(--ink-700, #475569);
          line-height: 1.5;
          margin-bottom: 18px;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--ink-700, #334155);
          letter-spacing: 0.5px;
        }

        input[type="text"],
        input[type="password"] {
          width: 100%;
          background: #F8FAFC;
          border: 1.5px solid var(--line, #CBD5E1);
          padding: 12px 14px;
          border-radius: 8px;
          color: var(--ink-900, #0F172A);
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
          outline: none;
          border-color: var(--action-primary, #7C3AED);
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        .input-password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-password-wrapper input {
          padding-right: 42px;
        }

        .eye-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--ink-500, #64748B);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .eye-toggle-btn:hover {
          color: var(--ink-900, #0F172A);
        }

        .password-grid-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .security-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .btn-text-action {
          background: none;
          border: none;
          color: var(--purple-700, #6D28D9);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .btn-text-action:hover {
          background: rgba(124, 58, 237, 0.08);
        }

        .alert-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.92rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .alert-success {
          background: #ECFDF5;
          border: 1px solid #10B981;
          color: #065F46;
        }

        .alert-error {
          background: #FEF2F2;
          border: 1px solid #EF4444;
          color: #991B1B;
        }

        .plan-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plan-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .plan-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--ink-900, #0F172A);
        }

        .usage-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .usage-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.92rem;
        }

        .usage-label {
          color: var(--ink-700, #475569);
          font-weight: 500;
        }

        .usage-value {
          font-weight: 700;
          color: var(--ink-900, #0F172A);
        }

        .btn-upgrade {
          background: linear-gradient(135deg, var(--action-primary, #7C3AED) 0%, var(--action-accent, #3B82F6) 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-upgrade:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--line, #F1F5F9);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: var(--ink-700, #475569);
          font-weight: 600;
        }

        .info-value {
          font-weight: 700;
          color: var(--ink-900, #0F172A);
        }

        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--ink-800, #1E293B);
        }

        .toggle-row input[type="checkbox"] {
          width: 44px;
          height: 24px;
          appearance: none;
          background: var(--line, #CBD5E1);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }

        .toggle-row input[type="checkbox"]::before {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
        }

        .toggle-row input[type="checkbox"]:checked {
          background: var(--action-primary, #7C3AED);
        }

        .toggle-row input[type="checkbox"]:checked::before {
          transform: translateX(20px);
        }

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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
          .security-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
        </div>
    );
}
