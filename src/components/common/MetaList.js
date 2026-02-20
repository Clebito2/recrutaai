"use client";

/**
 * Container for MetaItem components
 * 
 * @param {object} props
 * @param {string} props.title - Optional title for the list
 * @param {React.ReactNode} props.children - MetaItem components
 * @param {string} props.className - Extra classes
 */
export default function MetaList({ title, children, className = "" }) {
    return (
        <div className={`meta-list-container ${className}`}>
            {title && <h3>{title}</h3>}
            <div className="meta-items-wrapper">
                {children}
            </div>

            <style jsx>{`
        .meta-list-container h3 {
          font-size: 1rem;
          text-transform: uppercase;
          opacity: 0.5;
          margin-bottom: 20px;
          letter-spacing: 0.1em;
        }

        .meta-items-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      `}</style>
        </div>
    );
}
