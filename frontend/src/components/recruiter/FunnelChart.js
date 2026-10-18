import React, { useState } from "react";

/* Recruitment progress: one column per stage, hatched slopes show the drop between stages. */
export default function FunnelChart({ stages }) {
  const [active, setActive] = useState(1);
  const n = stages.length;
  const W = 600, H = 190, base = H - 6;
  const max = Math.max(1, ...stages.map((s) => s.value));
  const y = (v) => base - (v / max) * (H - 34);
  const colW = W / n, barW = colW * 0.46;
  const bx = (i) => i * colW + (colW - barW) / 2;
  const a = stages[active] || stages[0];
  const prev = active > 0 ? stages[active - 1].value : null;
  const conv = prev ? Math.round((a.value / prev) * 100) : null;

  return (
    <div>
      <div className="rc-funnel__labels" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {stages.map((s, i) => (
          <button key={s.label} className={i === active ? "is-on" : ""} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true" className="rc-funnel__svg">
        <defs>
          <pattern id="rc-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="#eef3fe" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#c4d6f8" strokeWidth="3" />
          </pattern>
        </defs>
        {stages.slice(0, -1).map((s, i) => (
          <polygon key={i} fill="url(#rc-hatch)" points={`${bx(i) + barW},${y(s.value)} ${bx(i + 1)},${y(stages[i + 1].value)} ${bx(i + 1)},${base} ${bx(i) + barW},${base}`} />
        ))}
        {stages.map((s, i) => {
          const top = Math.min(y(s.value), base - 3);
          return (
            <g key={s.label}>
              <rect x={bx(i)} y={top} width={barW} height={base - top} rx="6" fill={i === active ? "#1f4fb4" : "#cfe0fb"} />
              <rect x={bx(i)} y={top - 6} width={barW} height="4" rx="2" fill="#1f4fb4" />
            </g>
          );
        })}
        <line x1="0" y1={base} x2={W} y2={base} stroke="#dbe3f2" />
      </svg>
      <p className="rc-funnel__tip">
        <strong>{a.value} {a.label.toLowerCase()}</strong>
        {conv !== null ? <> · Conversion {conv}% · Drop-off {prev - a.value}</> : <> · Where every candidate starts</>}
      </p>
    </div>
  );
}
