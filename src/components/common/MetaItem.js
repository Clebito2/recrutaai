"use client";

/**
 * Metadata Item for displaying key-value pairs with an icon
 * 
 * @param {object} props
 * @param {React.ReactNode} props.icon - Lucide icon component
 * @param {string} props.label - Field label
 * @param {string|React.ReactNode} props.children - Field value
 */
export default function MetaItem({ icon, label, children }) {
    return (
        <div className="meta-item">
            {icon && <div className="meta-icon">{icon}</div>}
            <div className="meta-content">
                <label>{label}</label>
                <span>{children}</span>
            </div>

            <style jsx>{`
        .meta-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .meta-icon {
          color: rgba(255, 255, 255, 0.5);
          margin-top: 2px;
        }

        .meta-content label {
          display: block;
          font-size: 0.75rem;
          opacity: 0.5;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .meta-content span {
          font-weight: 600;
          color: white;
          font-size: 0.95rem;
        }
      `}</style>
        </div>
    );
}
