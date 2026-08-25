export function NetworkGlobe() {
  const dots = [
    [62, 28], [70, 34], [78, 30], [84, 38], [58, 42], [66, 48], [74, 44],
    [80, 52], [54, 36], [88, 46], [72, 58], [64, 54], [82, 28], [90, 36],
    [60, 22], [76, 22], [68, 18], [86, 24], [52, 48], [58, 58],
  ];
  return (
    <div className="pointer-events-none relative h-full min-h-[180px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent_62%)]" />
      <svg viewBox="0 0 420 240" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="g-sphere" cx="58%" cy="42%" r="48%">
            <stop offset="0%" stopColor="#3b2a9e" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#1a1548" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="g-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0" />
            <stop offset="50%" stopColor="#9b7dff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="268" cy="108" rx="132" ry="108" fill="url(#g-sphere)" />
        {[-50, -25, 0, 25, 50].map((off) => (
          <ellipse
            key={off}
            cx="268"
            cy="108"
            rx={Math.max(18, 118 - Math.abs(off) * 0.55)}
            ry={22}
            transform={`translate(0 ${off})`}
            fill="none"
            stroke="#7c5cff"
            strokeOpacity="0.22"
            strokeWidth="0.8"
          />
        ))}
        {[-70, -35, 0, 35, 70].map((off) => (
          <ellipse
            key={`m${off}`}
            cx={268 + off * 0.15}
            cy="108"
            rx={28}
            ry="104"
            fill="none"
            stroke="#7c5cff"
            strokeOpacity="0.18"
            strokeWidth="0.8"
          />
        ))}
        <path d="M140 70 C 190 40, 240 90, 300 50" fill="none" stroke="url(#g-arc)" strokeWidth="1.4" />
        <path d="M160 150 C 210 110, 250 170, 330 120" fill="none" stroke="url(#g-arc)" strokeWidth="1.2" />
        <path d="M200 40 C 240 80, 280 20, 340 70" fill="none" stroke="url(#g-arc)" strokeWidth="1.1" />
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x * 3.2} cy={y * 2.4} r={i % 4 === 0 ? 2.6 : 1.6} fill="#c4b5fd" opacity={0.85} />
        ))}
      </svg>
    </div>
  );
}
