import React from "react";

export default function StatCard({ label, value, hint }) {
  return (
    <div className="rc-stat">
      <span className="rc-stat__label">{label}</span>
      <strong className="rc-stat__value">{value}</strong>
      {hint && <span className="rc-stat__hint">{hint}</span>}
    </div>
  );
}
