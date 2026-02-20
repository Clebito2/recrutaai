"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Standardized Page Header for Dashboard
 * 
 * @param {object} props
 * @param {string} props.title - Main page title
 * @param {string} props.subtitle - Optional subtitle for the page
 * @param {string} props.backPath - URL for the back link
 * @param {string} props.backLabel - Label for the back link
 * @param {React.ReactNode} props.actions - Action buttons or components
 * @param {string} props.className - Optional extra classes
 */
export default function PageHeader({
    title,
    subtitle,
    backPath,
    backLabel = "Voltar",
    actions,
    className = ""
}) {
    return (
        <header className={`page-header ${className}`}>
            {backPath && (
                <Link href={backPath} className="back-link">
                    <ArrowLeft size={16} /> {backLabel}
                </Link>
            )}
            <div className="header-actions">
                <div className="header-info">
                    <h1>{title}</h1>
                    {subtitle && <p className="subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="actions-wrapper">{actions}</div>}
            </div>

            <style jsx>{`
        .page-header {
          margin-bottom: 30px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.9rem;
          margin-bottom: 20px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: white;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .header-info h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
        }

        .subtitle {
          margin: 8px 0 0 0;
          opacity: 0.7;
          font-size: 1.1rem;
        }

        .actions-wrapper {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        @media (max-width: 640px) {
          .header-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </header>
    );
}
