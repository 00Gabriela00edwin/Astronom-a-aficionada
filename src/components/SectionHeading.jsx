import React from "react";

export default function SectionHeading({ icon: Icon, eyebrow, children }) {
  return (
    <div className="section-heading">
      <span className="section-icon"><Icon size={20} aria-hidden="true" /></span>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{children}</h2>
      </div>
    </div>
  );
}
