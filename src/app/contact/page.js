"use client";

import GlassCard from "../../components/common/GlassCard";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="contact-page">
      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} /> Voltar para Home
        </Link>

        <div className="content-grid">
          <div className="info-column">
            <h1>Fale Conosco</h1>
            <p className="subtitle">Estamos aqui para ajudar você a transformar seu processo de recrutamento.</p>

            <div className="contact-details">
              <div className="detail-item">
                <div className="icon-box"><Mail size={20} /></div>
                <div>
                  <h3>Email</h3>
                  <p>suporte@recruteai.com</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-box"><Phone size={20} /></div>
                <div>
                  <h3>Telefone</h3>
                  <p>+55 (11) 99999-9999</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-box"><MapPin size={20} /></div>
                <div>
                  <h3>Localização</h3>
                  <p>São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
          </div>

          <GlassCard className="form-card">
            <h2>Envie uma mensagem</h2>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <label>Nome</label>
                <input type="text" placeholder="Seu nome" />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="seu@email.com" />
              </div>

              <div className="input-group">
                <label>Mensagem</label>
                <textarea rows={4} placeholder="Como podemos ajudar?" />
              </div>

              <button className="btn-indigo full-width">Enviar Mensagem</button>
            </form>
          </GlassCard>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          padding: 40px 24px;
          background-color: var(--canvas-bg);
          color: var(--text-primary);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 40px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--action-primary);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 16px;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 48px;
          line-height: 1.6;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          background: rgba(244, 169, 0, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--action-primary);
        }

        .detail-item h3 {
          font-size: 1rem;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .detail-item p {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-card {
          padding: 40px;
        }

        .form-card h2 {
          margin-bottom: 24px;
          font-size: 1.5rem;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        input, textarea {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          padding: 12px 16px;
          border-radius: 8px;
          color: white;
          font-family: inherit;
          width: 100%;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--action-primary);
        }

        .full-width {
          width: 100%;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </div>
  );
}
