"use client";

import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
      <style jsx>{`
        .glass-card {
          background: var(--canvas-card);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          overflow: hidden;
          position: relative;
        }

        .glass-card:hover {
          background: var(--canvas-card-hover);
          border-color: var(--border-active);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default GlassCard;
