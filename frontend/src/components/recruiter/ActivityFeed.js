import React from "react";
import { ago } from "./dates";

export default function ActivityFeed({ items }) {
  if (items.length === 0) {
    return <p className="rc-muted">Moving candidates, scheduling interviews and uploading resumes will show up here.</p>;
  }
  return (
    <ul className="rc-feed">
      {items.slice(0, 4).map((a) => (
        <li key={a.id}>
          <div className="rc-feed__top"><span className="rc-feed__tag">Update</span><span>{ago(a.at)}</span></div>
          <strong>{a.text}</strong>
          {a.detail && <p>{a.detail}</p>}
        </li>
      ))}
    </ul>
  );
}
