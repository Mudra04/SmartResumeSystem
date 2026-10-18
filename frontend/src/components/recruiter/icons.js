import React from "react";

const PATHS = {
  dashboard: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z",
  jobs: "M3 8h18v12H3zM9 8V5h6v3M3 13h18",
  candidates: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1.5a4 4 0 0 0-3-3.9M16 4.2a3.5 3.5 0 0 1 0 6.6",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  analytics: "M5 20V10M12 20V4M19 20v-7",
  logout: "M9 20H5V4h4M16 16l4-4-4-4M20 12H9",
  plus: "M12 5v14M5 12h14",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  close: "M6 6l12 12M18 6L6 18",
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
