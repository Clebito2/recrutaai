"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Statistic Card for Dashboard
 * 
 * @param {object} props
 * @param {React.ReactNode} props.icon - Lucide icon
 * @param {string|number} props.value - Main value to display
 * @param {string} props.label - Description of the value
 * @param {number} props.trend - Optional trend percentage (positive or negative)
 * @param {string} props.variant - Color variant (briefcase, users, calendar, target)
 */
export default function StatCard({ icon, value, label, trend, variant = "briefcase" }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${variant}`}>
                {icon}
            </div>
            <div className="stat-info">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
            {trend !== undefined && (
                <div className={`stat-trend ${trend >= 0 ? "positive" : "negative"}`}>
                    {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {trend !== 0 && <span>{Math.abs(trend)}%</span>}
                </div>
            )}

            <style jsx>{`
        .stat-card {
          background: var(--canvas-card);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          flex: 1;
        }

        .stat-card:hover {
          border-color: var(--action-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.briefcase {
          background: linear-gradient(135deg, rgba(244, 169, 0, 0.2), rgba(244, 169, 0, 0.1));
          color: var(--action-primary);
        }

        .stat-icon.users {
          background: linear-gradient(135deg, rgba(193, 102, 107, 0.2), rgba(193, 102, 107, 0.1));
          color: var(--action-secondary);
        }

        .stat-icon.calendar {
          background: linear-gradient(135deg, rgba(212, 184, 150, 0.2), rgba(212, 184, 150, 0.1));
          color: var(--action-accent);
        }

        .stat-icon.target {
          background: linear-gradient(135deg, rgba(125, 155, 106, 0.2), rgba(125, 155, 106, 0.1));
          color: var(--status-success);
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stat-trend.positive {
          background: rgba(125, 155, 106, 0.2);
          color: var(--status-success);
        }

        .stat-trend.negative {
          background: rgba(193, 102, 107, 0.2);
          color: var(--status-error);
        }

        @media (max-width: 640px) {
          .stat-card {
            padding: 16px;
          }
          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
}
