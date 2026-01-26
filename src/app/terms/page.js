"use client";

import GlassCard from "../../components/common/GlassCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} /> Voltar para Home
        </Link>

        <GlassCard className="legal-card">
          <h1>Termos de Uso</h1>
          <p className="last-updated">Última atualização: 26 de Janeiro de 2026</p>

          <div className="content">
            <section>
              <h2>1. Aceitação dos Termos</h2>
              <p>Ao acessar e usar a plataforma RecruitAI, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.</p>
            </section>

            <section>
              <h2>2. Descrição do Serviço</h2>
              <p>O RecruitAI é uma ferramenta de auxílio ao recrutamento e seleção baseada em inteligência artificial. O serviço é fornecido "como está" e destina-se a apoiar, não substituir, o julgamento humano.</p>
            </section>

            <section>
              <h2>3. Uso Responsável</h2>
              <p>Você concorda em não usar o serviço para qualquer finalidade ilegal ou proibida por estes termos. O uso de IA para discriminação ou viés intencional é estritamente proibido.</p>
            </section>

            <section>
              <h2>4. Propriedade Intelectual</h2>
              <p>Todo o conteúdo, logotipos e tecnologia da plataforma são propriedade exclusiva do RecruitAI.</p>
            </section>
          </div>
        </GlassCard>
      </div>

      <style jsx>{`
        .legal-page {
          min-height: 100vh;
          padding: 40px 24px;
          background-color: var(--canvas-bg);
          color: var(--text-primary);
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--action-primary);
        }

        .legal-card {
          padding: 48px;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .last-updated {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 40px;
        }

        section {
          margin-bottom: 32px;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 16px;
          color: var(--action-primary);
        }

        p {
          line-height: 1.7;
          opacity: 0.8;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
