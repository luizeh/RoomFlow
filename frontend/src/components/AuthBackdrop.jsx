// Fundo decorativo da tela de login: grade, anéis e ilustrações em traço (calendário, relógio, sala, agenda)
export default function AuthBackdrop() {
    const stroke = 'rgba(255, 255, 255, 0.18)';
    const strokeSoft = 'rgba(255, 255, 255, 0.08)';

    return (
        <svg className="auth-backdrop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
                <pattern id="auth-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M48 0H0V48" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
                <radialGradient id="auth-fade" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <mask id="auth-grid-mask">
                    <rect width="1440" height="900" fill="url(#auth-fade)" />
                </mask>
                <filter id="auth-blur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="60" />
                </filter>
            </defs>

            {/* Grade com fade nas bordas */}
            <rect width="1440" height="900" fill="url(#auth-grid)" mask="url(#auth-grid-mask)" />

            {/* Brilhos difusos */}
            <circle cx="260" cy="180" r="180" fill="rgba(255, 255, 255, 0.06)" filter="url(#auth-blur)" />
            <circle cx="1200" cy="740" r="200" fill="rgba(255, 255, 255, 0.05)" filter="url(#auth-blur)" />

            {/* Anéis concêntricos atrás do card */}
            <g fill="none">
                <circle cx="720" cy="450" r="330" stroke={strokeSoft} />
                <circle cx="720" cy="450" r="450" stroke={strokeSoft} strokeDasharray="2 10" className="spin-slow" />
                <circle cx="720" cy="450" r="580" stroke="rgba(255, 255, 255, 0.05)" />
            </g>

            {/* Calendário (canto superior esquerdo) */}
            <g className="float-slow" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="150" y="150" width="150" height="136" rx="14" />
                <path d="M150 190h150M190 136v28M260 136v28" />
                {[0, 1, 2, 3].map((col) =>
                    [0, 1, 2].map((row) => (
                        <rect key={`${col}-${row}`} x={170 + col * 30} y={204 + row * 26} width="18" height="14" rx="3" stroke={strokeSoft} />
                    ))
                )}
                <rect x="230" y="230" width="18" height="14" rx="3" fill="rgba(255, 255, 255, 0.85)" stroke="none" />
            </g>

            {/* Blocos de agenda (canto superior direito) */}
            <g className="float-fast" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
                <path d="M1080 150v170" stroke={strokeSoft} />
                {[
                    { y: 160, w: 190 },
                    { y: 214, w: 130, filled: true },
                    { y: 268, w: 230 },
                ].map((slot) => (
                    <g key={slot.y}>
                        <circle cx="1080" cy={slot.y + 14} r="4" fill={slot.filled ? '#fff' : '#0b0b0c'} />
                        <rect
                            x="1104"
                            y={slot.y}
                            width={slot.w}
                            height="28"
                            rx="8"
                            fill={slot.filled ? 'rgba(255, 255, 255, 0.08)' : 'none'}
                        />
                        <path d={`M1118 ${slot.y + 14}h${slot.w * 0.4}`} stroke={strokeSoft} strokeWidth="4" />
                    </g>
                ))}
            </g>

            {/* Sala de reunião vista de cima (canto inferior esquerdo) */}
            <g className="float-fast" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round">
                <rect x="170" y="640" width="200" height="80" rx="16" />
                {[195, 245, 295].map((x) => (
                    <g key={x}>
                        <rect x={x} y="612" width="40" height="18" rx="6" stroke={strokeSoft} />
                        <rect x={x} y="730" width="40" height="18" rx="6" stroke={strokeSoft} />
                    </g>
                ))}
                <rect x="140" y="666" width="18" height="28" rx="6" stroke={strokeSoft} />
                <rect x="382" y="666" width="18" height="28" rx="6" stroke={strokeSoft} />
                <circle cx="270" cy="680" r="10" stroke={strokeSoft} />
            </g>

            {/* Relógio (canto inferior direito) */}
            <g className="float-slow" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
                <circle cx="1220" cy="680" r="62" />
                <circle cx="1220" cy="680" r="48" stroke={strokeSoft} strokeDasharray="1 11.5" strokeWidth="3" />
                <path d="M1220 680v-34M1220 680l22 14" strokeWidth="2" />
                <circle cx="1220" cy="680" r="3" fill="#fff" stroke="none" />
            </g>

            {/* Detalhes soltos */}
            <g fill="rgba(255, 255, 255, 0.35)">
                <circle cx="470" cy="120" r="2" />
                <circle cx="980" cy="90" r="2" />
                <circle cx="1340" cy="420" r="2" />
                <circle cx="90" cy="470" r="2" />
                <circle cx="560" cy="810" r="2" />
                <circle cx="930" cy="820" r="2" />
            </g>
            <g stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M420 300v12M414 306h12" />
                <path d="M1010 560v12M1004 566h12" />
                <path d="M1350 230v12M1344 236h12" />
            </g>
        </svg>
    );
}
