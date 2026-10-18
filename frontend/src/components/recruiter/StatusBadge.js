import React from "react";
import { statusOf } from "./recruiterApi";

export default function StatusBadge({ status }) {
  const s = statusOf(status);
  return <span className={`rc-badge rc-badge--${s.tone}`}>{s.label}</span>;
}
