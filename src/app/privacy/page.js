import GlassCard from "../../components/common/GlassCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
    return (
        <div className="legal-page">
            <div className="container">
                <Link href="/" className="back-link">
                    <ArrowLeft size={20} /> Voltar para Home
                </Link>

                <GlassCard className="legal-card">
                    <h1>Política de Privacidade</h1>
                    <p className="last-updated">Última atualização: 26 de Janeiro de 2026</p>

                    <div className="content">
                        <section>
                            <h2>1. Coleta de Dados</h2>
                            <p>Coletamos informações que você nos fornece diretamente, como dados de registro, currículos enviados para análise e transcrições.</p>
                        </section>

                        <section>
                            <h2>2. Uso das Informações</h2>
                            <p>Utilizamos os dados para fornecer, manter e melhorar nossos serviços de análise via IA. Não vendemos seus dados pessoais a terceiros.</p>
                        </section>

                        <section>
                            <h2>3. Segurança</h2>
                            <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados. Utilizamos criptografia e protocolos seguros.</p>
                        </section>

                        <section>
                            <h2>4. Seus Direitos (LGPD)</h2>
                            <p>Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Entre em contato conosco para exercer esses direitos.</p>
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
