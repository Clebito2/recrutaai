"use client";

import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
      <style jsx>{`
        .glass-card {
          background: #FFFFFF;
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
        }

        ${!props.noHover ? `
          .glass-card:hover {
            border-color: var(--purple-600);
            box-shadow: 0 4px 12px rgba(91, 42, 134, 0.1);
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default GlassCard;
