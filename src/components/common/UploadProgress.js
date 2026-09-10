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
            background: '#FFFFFF',
            border: '1px solid var(--line)',
            borderRadius: '14px',
            padding: '20px 24px',
            boxShadow: '0 4px 16px rgba(26, 16, 48, 0.06)',
            animation: 'fadeIn 0.3s ease-out forwards',
        }}>
            <p style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'var(--ink-500)',
                marginBottom: '14px',
                fontWeight: 700,
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
                            opacity: isCompleted || isActive ? 1 : 0.4,
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
                                ? 'rgba(0, 184, 124, 0.12)'
                                : isActive
                                    ? 'var(--purple-100)'
                                    : 'var(--canvas)',
                            border: `2px solid ${isCompleted ? 'var(--green-500, #00B87C)' : isActive ? 'var(--purple-600)' : 'var(--line)'}`,
                            boxShadow: isCompleted
                                ? '0 0 10px rgba(0, 184, 124, 0.2)'
                                : isActive
                                    ? '0 0 10px rgba(91, 42, 134, 0.2)'
                                    : 'none',
                        }}>
                            {isCompleted ? (
                                <span style={{ color: 'var(--green-500, #00B87C)' }}>✓</span>
                            ) : isActive ? (
                                <span style={{ color: 'var(--purple-600)', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                            ) : (
                                <span style={{ color: 'var(--ink-500)' }}>{i + 1}</span>
                            )}
                        </div>

                        {/* Label da etapa */}
                        <span style={{
                            fontSize: '0.92rem',
                            fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                            color: isCompleted
                                ? 'var(--green-500, #00B87C)'
                                : isActive
                                    ? 'var(--purple-600)'
                                    : 'var(--ink-500)',
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
                                background: 'var(--purple-600)',
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
