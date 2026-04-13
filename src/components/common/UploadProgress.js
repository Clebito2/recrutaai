"use client";

/**
 * UploadProgress — Componente de feedback visual por etapas
 * Design: Antigravity (glassmorphism, transições suaves 0.3s ease-out)
 * Skill: antigravity-design-expert
 */

const STEPS = [
    { key: 'reading',   label: 'Lendo arquivo...',      icon: '📄' },
    { key: 'analyzing', label: 'Analisando perfil...', icon: '🧠' },
    { key: 'saving',    label: 'Salvando resultado...', icon: '💾' },
    { key: 'done',      label: 'Análise concluída!',    icon: '✅' },
];

export default function UploadProgress({ step }) {
    if (!step || step === 'idle' || step === 'error') return null;

    const currentIndex = STEPS.findIndex(s => s.key === step);
    const isDone = step === 'done';

    return (
        <div style={{
            marginTop: '20px',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px 24px',
            animation: 'fadeIn 0.3s ease-out forwards',
        }}>
            <p style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: '14px',
                fontWeight: 600,
            }}>
                Processamento em Andamento
            </p>

            {STEPS.map((s, i) => {
                const isCompleted = i < currentIndex || isDone;
                const isActive = s.key === step && !isDone;

                return (
                    <div
                        key={s.key}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '9px 0',
                            opacity: isCompleted || isActive ? 1 : 0.25,
                            transition: 'opacity 0.35s ease-out',
                        }}
                    >
                        {/* Indicador circular */}
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            transition: 'all 0.35s ease-out',
                            background: isCompleted
                                ? 'rgba(0, 200, 150, 0.2)'
                                : isActive
                                    ? 'rgba(108, 99, 255, 0.25)'
                                    : 'rgba(255,255,255,0.05)',
                            border: `2px solid ${isCompleted ? '#00C896' : isActive ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: isCompleted
                                ? '0 0 12px rgba(0,200,150,0.3)'
                                : isActive
                                    ? '0 0 12px rgba(108,99,255,0.4)'
                                    : 'none',
                        }}>
                            {isCompleted ? (
                                <span style={{ color: '#00C896' }}>✓</span>
                            ) : isActive ? (
                                <span style={{ color: '#6C63FF', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                            ) : (
                                <span style={{ opacity: 0.4 }}>{i + 1}</span>
                            )}
                        </div>

                        {/* Label da etapa */}
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: isActive ? 700 : isCompleted ? 500 : 400,
                            color: isCompleted
                                ? '#00C896'
                                : isActive
                                    ? '#ffffff'
                                    : 'rgba(255,255,255,0.4)',
                            transition: 'color 0.35s ease-out',
                            letterSpacing: isActive ? '0.2px' : '0',
                        }}>
                            {s.label}
                        </span>

                        {/* Pulse dot para etapa ativa */}
                        {isActive && (
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#6C63FF',
                                animation: 'pulse 1.2s ease-in-out infinite',
                                marginLeft: 'auto',
                            }} />
                        )}
                    </div>
                );
            })}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }
            `}</style>
        </div>
    );
}
