"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { ShieldAlert, Rocket } from "lucide-react";
import GlassCard from "./GlassCard";

export default function SubscriptionGuard({ children, type = "job" }) {
    const { subscription, loading } = useSubscription();

    if (loading) return <div>Verificando permissões...</div>;

    const isBlocked = type === "job" ? subscription?.hasReachedJobLimit : subscription?.hasReachedCVLimit;
    const isExpired = subscription?.isExpired;

    if (isExpired || isBlocked) {
        return (
            <div className="guard-overlay">
                <GlassCard className="guard-modal animate-fade">
                    <ShieldAlert size={64} color="var(--live-danger)" />
                    <h2>Limite Atingido</h2>
                    <p>
                        {isExpired
                            ? "Seu período de teste de 7 dias expirou."
                            : `Você atingiu o limite de ${type === "job" ? "vagas" : "currículos"} do seu plano atual.`}
                    </p>

                    <div className="pricing-mini">
                        <div className="price-item">
                            <span>Plano Essencial</span>
                            <strong>R$ 99/mês</strong>
                            <small>Até 4 vagas e 20 currículos</small>
                        </div>
                        <div className="price-item highlighted">
                            <span>Plano Elite</span>
                            <strong>R$ 249/mês</strong>
                            <small>Ilimitado + Dashboard</small>
                        </div>
                    </div>

                    <button className="btn-elite full-width">
                        <Rocket size={20} />
                        Fazer Upgrade Agora
                    </button>
                </GlassCard>

                <style jsx>{`
          .guard-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(6, 25, 42, 0.9);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .guard-modal {
            max-width: 500px;
            padding: 40px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .pricing-mini {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            width: 100%;
            margin: 20px 0;
          }

          .price-item {
            padding: 16px;
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .price-item.highlighted {
            border-color: var(--live-accent);
            background: var(--live-accent-dim);
          }

          .price-item strong {
            font-size: 1.2rem;
            color: var(--live-accent);
          }

          .price-item small {
            font-size: 0.75rem;
            opacity: 0.6;
          }

          .full-width {
            width: 100%;
            justify-content: center;
          }
        `}</style>
            </div>
        );
    }

    return children;
}
