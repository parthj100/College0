// Shared UI primitives

const { useState, useEffect, useRef, useMemo } = React;

const Stars = ({ value, max = 5, showVal = true }) => {
  const full = Math.round(value);
  return (
    <span className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < full ? "" : "dim"}>★</span>
      ))}
      {showVal && <span className="val">{value.toFixed(1)}</span>}
    </span>
  );
};

const Avatar = ({ name, size }) => {
  const initials = name.split(/[\s-]/).map(p => p[0]).slice(0,2).join("").toUpperCase();
  return <span className={"avatar" + (size === "lg" ? " lg" : "")}>{initials}</span>;
};

const Chip = ({ children, tone }) => <span className={"chip" + (tone ? " " + tone : "")}>{children}</span>;

const Eyebrow = ({ children }) => <div className="eyebrow">{children}</div>;

const Phases = ({ phases, compact }) => (
  <div className="phases" style={compact ? { marginBottom: 0 } : {}}>
    {phases.map(p => (
      <div key={p.num} className={"phase " + (p.state === "done" ? "done" : p.state === "active" ? "active" : "")}>
        <div className="phase-num">Period {String(p.num).padStart(2, "0")}</div>
        <div className="phase-name">{p.name}</div>
        <div className="phase-dates">{p.dates}</div>
      </div>
    ))}
  </div>
);

const Crest = ({ size = 44 }) => (
  <span className="crest" aria-hidden="true">
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="21" stroke="currentColor" strokeWidth="1"/>
      <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="0.5"/>
      <path d="M22 7 L22 37 M7 22 L37 22" stroke="currentColor" strokeWidth="0.5"/>
      <text x="22" y="26" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="14" fill="currentColor">C0</text>
    </svg>
  </span>
);

// Placeholder image
const Placeholder = ({ label, h = 120 }) => (
  <div className="placeholder" style={{ height: h }}>{label}</div>
);

Object.assign(window, { Stars, Avatar, Chip, Eyebrow, Phases, Crest, Placeholder });
