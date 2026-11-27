import React from "react";

export default function FocusSection({ id, children }) {
  return (
    <div id={id} className="focus-section">
      {children}
    </div>
  );
}
