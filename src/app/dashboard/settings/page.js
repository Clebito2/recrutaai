"use client";

import { useState } from "react";
import GlassCard from "../../../components/common/GlassCard";
import { User, Building2, CreditCard, Bell, Shield, Save, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useSubscription } from "../../../hooks/useSubscription";

export default function SettingsPage() {
    const { userProfile, updateCompanyName } = useAuth();
    const { subscription } = useSubscription();
    const [companyName, setCompanyName] = useState(userProfile?.companyName || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
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

    const planDetails = {
        trial: { name: "Trial", price: "Grátis", color: "var(--action-secondary)" },
        tier1: { name: "Essencial", price: "R$ 99/mês", color: "var(--action-primary)" },
        tier2: { name: "Elite", price: "R$ 249/mês", color: "var(--action-accent)" }
    };

    const currentPlan = planDetails[subscription?.plan] || planDetails.trial;

    return (
        <div className="settings-page animate-fade">
            <header className="page-header">
                <h1>Configurações</h1>
                <p>Gerencie seu perfil, assinatura e preferências.</p>
            </header>

            <div className="settings-grid">
                {/* Profile Section */}
                <GlassCard className="settings-card">
                    <div className="card-header">
                        <Building2 size={24} color="var(--action-primary)" />
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
                            onClick={handleSave}
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
                        <User size={24} color="var(--action-accent)" />
                        <h3>Conta</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Email</span>
                            <span className="info-value">{userProfile?.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Membro desde</span>
                            <span className="info-value">
                                {userProfile?.createdAt?.toDate?.()?.toLocaleDateString("pt-BR") || "—"}
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* Notifications Section */}
                <GlassCard className="settings-card">
                    <div className="card-header">
                        <Bell size={24} color="var(--action-secondary)" />
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
          max-width: 1000px;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .page-header p {
          opacity: 0.6;
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
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-glass);
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .card-content {
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
          font-size: 0.8rem;
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 0.5px;
        }

        input[type="text"] {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          padding: 14px;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        input[type="text"]:focus {
          outline: none;
          border-color: var(--action-primary);
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
        }

        .usage-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .usage-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .usage-label {
          opacity: 0.6;
        }

        .usage-value {
          font-weight: 600;
        }

        .btn-upgrade {
          background: linear-gradient(135deg, var(--action-primary) 0%, var(--action-accent) 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-upgrade:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .info-label {
          opacity: 0.6;
        }

        .info-value {
          font-weight: 500;
        }

        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .toggle-row input[type="checkbox"] {
          width: 44px;
          height: 24px;
          appearance: none;
          background: rgba(255, 255, 255, 0.1);
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
          background: var(--action-primary);
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
        }
      `}</style>
        </div>
    );
}
